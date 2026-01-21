package com.example.backend.service;

import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.User;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla PasswordResetService
 * Testują proces resetowania hasła, walidację tokenów i rate limiting
 */
@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
        testUser.setPassword("oldEncodedPassword");

        // Ustawienie wartości konfiguracyjnych
        ReflectionTestUtils.setField(passwordResetService, "tokenExpirationMs", 3600000L); // 1 hour
        ReflectionTestUtils.setField(passwordResetService, "maxAttempts", 3);
        ReflectionTestUtils.setField(passwordResetService, "lockoutDurationMs", 900000L); // 15 min
    }

    @Test
    @DisplayName("Powinien zainicjować reset hasła dla istniejącego użytkownika")
    void shouldInitiatePasswordResetForExistingUser() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.countRecentTokensByUser(any(), any())).thenReturn(0L);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        // When
        passwordResetService.initiatePasswordReset("test@example.com", "192.168.1.1", "Mozilla/5.0");

        // Then
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
    }

    @Test
    @DisplayName("Nie powinien ujawnić że email nie istnieje")
    void shouldNotRevealNonExistentEmail() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then - nie powinien rzucić wyjątku
        assertDoesNotThrow(() -> 
            passwordResetService.initiatePasswordReset("nonexistent@example.com", "192.168.1.1", "Mozilla/5.0")
        );
        
        // Nie powinien wysłać emaila
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    @DisplayName("Powinien zapisać zahashowany token w bazie")
    void shouldSaveHashedToken() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.countRecentTokensByUser(any(), any())).thenReturn(0L);
        
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        when(tokenRepository.save(tokenCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        // When
        passwordResetService.initiatePasswordReset("test@example.com", "192.168.1.1", "Mozilla/5.0");

        // Then
        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertNotNull(savedToken.getTokenHash());
        assertFalse(savedToken.getTokenHash().isEmpty());
        assertNotNull(savedToken.getExpiresAt());
        assertEquals(testUser, savedToken.getUser());
    }

    @Test
    @DisplayName("Powinien zresetować hasło z poprawnym tokenem")
    void shouldResetPasswordWithValidToken() {
        // Given
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        passwordResetService.resetPassword("validToken", "NewPassword123!", "192.168.1.1");

        // Then
        verify(userRepository).save(argThat(user -> 
            "newEncodedPassword".equals(user.getPassword())
        ));
        verify(tokenRepository).save(argThat(t -> t.isUsed()));
    }

    @Test
    @DisplayName("Powinien odrzucić wygasły token")
    void shouldRejectExpiredToken() {
        // Given
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().minusHours(1)); // Wygasły
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("expiredToken", "NewPassword123!", "192.168.1.1")
        );
    }

    @Test
    @DisplayName("Powinien odrzucić już użyty token")
    void shouldRejectUsedToken() {
        // Given
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(true); // Już użyty

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("usedToken", "NewPassword123!", "192.168.1.1")
        );
    }

    @Test
    @DisplayName("Powinien odrzucić nieistniejący token")
    void shouldRejectNonExistentToken() {
        // Given
        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("invalidToken", "NewPassword123!", "192.168.1.1")
        );
    }

    @Test
    @DisplayName("Powinien walidować siłę hasła")
    void shouldValidatePasswordStrength() {
        // Given
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        // When & Then - słabe hasło
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("validToken", "weak", "192.168.1.1")
        );
    }

    @Test
    @DisplayName("Powinien blokować po przekroczeniu limitu prób dla IP")
    void shouldRateLimitByIp() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.countRecentTokensByUser(any(), any())).thenReturn(0L);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        // When - wykonaj 4 żądania z tego samego IP
        String sameIp = "192.168.1.100";
        for (int i = 0; i < 4; i++) {
            passwordResetService.initiatePasswordReset("test@example.com", sameIp, "Mozilla/5.0");
        }

        // Then - po 3 próbach, kolejne nie powinny wysyłać emaila
        // Weryfikujemy że email został wysłany maksymalnie 3 razy
        verify(emailService, atMost(3)).sendPasswordResetEmail(anyString(), anyString());
    }

    @Test
    @DisplayName("Powinien unieważnić poprzednie tokeny użytkownika po resecie")
    void shouldInvalidatePreviousTokensAfterReset() {
        // Given
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        passwordResetService.resetPassword("validToken", "NewPassword123!", "192.168.1.1");

        // Then
        verify(tokenRepository).deleteByUser(testUser);
    }
}
