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
        ReflectionTestUtils.setField(passwordResetService, "tokenExpirationMs", 3600000L); // 1 godzina
        ReflectionTestUtils.setField(passwordResetService, "maxAttempts", 3);
        ReflectionTestUtils.setField(passwordResetService, "lockoutDurationMs", 900000L); // 15 minut
    }

    //Sprawdza czy serwis poprawnie inicjuje reset hasła dla istniejącego użytkownika
    @Test
    @DisplayName("Powinien zainicjować reset hasła dla istniejącego użytkownika")
    void shouldInitiatePasswordResetForExistingUser() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.countRecentTokensByUser(any(), any())).thenReturn(0L);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

        
        passwordResetService.initiatePasswordReset("test@example.com", "192.168.1.1", "Mozilla/5.0");

        
        verify(tokenRepository).save(any(PasswordResetToken.class));
        verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
    }

    //Sprawdza czy serwis nie ujawnia że email nie istnieje
    @Test
    @DisplayName("Nie powinien ujawnić że email nie istnieje")
    void shouldNotRevealNonExistentEmail() {
       
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        
        assertDoesNotThrow(() -> 
            passwordResetService.initiatePasswordReset("nonexistent@example.com", "192.168.1.1", "Mozilla/5.0")
        );
        
        
        verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
    }

    //Sprawdza czy serwis poprawnie zapisuje zahashowany token w bazieW
    @Test
    @DisplayName("Powinien zapisać zahashowany token w bazie")
    void shouldSaveHashedToken() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.countRecentTokensByUser(any(), any())).thenReturn(0L);
        
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        when(tokenRepository.save(tokenCaptor.capture())).thenAnswer(inv -> inv.getArgument(0));

        
        passwordResetService.initiatePasswordReset("test@example.com", "192.168.1.1", "Mozilla/5.0");

       
        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertNotNull(savedToken.getTokenHash());
        assertFalse(savedToken.getTokenHash().isEmpty());
        assertNotNull(savedToken.getExpiresAt());
        assertEquals(testUser, savedToken.getUser());
    }

    //Sprawdza czy serwis poprawnie resetuje hasło z poprawnym tokenem
    @Test
    @DisplayName("Powinien zresetować hasło z poprawnym tokenem")
    void shouldResetPasswordWithValidToken() {
        
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        
        passwordResetService.resetPassword("validToken", "NewPassword123!", "192.168.1.1");

       
        verify(userRepository).save(argThat(user -> 
            "newEncodedPassword".equals(user.getPassword())
        ));
        verify(tokenRepository).save(argThat(t -> t.isUsed()));
    }

    //Sprawdza czy serwis odrzuca wygasły token
    @Test
    @DisplayName("Powinien odrzucić wygasły token")
    void shouldRejectExpiredToken() {
        
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().minusHours(1)); // Wygasły
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

       
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("expiredToken", "NewPassword123!", "192.168.1.1")
        );
    }

    
    //Sprawdza czy serwis odrzuca już użyty token
    @Test
    @DisplayName("Powinien odrzucić już użyty token")
    void shouldRejectUsedToken() {
        
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(true); 

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

       
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("usedToken", "NewPassword123!", "192.168.1.1")
        );
    }

    //Sprawdza czy serwis odrzuca nieistniejący token
    @Test
    @DisplayName("Powinien odrzucić nieistniejący token")
    void shouldRejectNonExistentToken() {
        
        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.empty());

       
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("invalidToken", "NewPassword123!", "192.168.1.1")
        );
    }

    //Sprawdza czy serwis waliduje siłę hasła
    @Test
    @DisplayName("Powinien walidować siłę hasła")
    void shouldValidatePasswordStrength() {
        
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        
        assertThrows(RuntimeException.class, () -> 
            passwordResetService.resetPassword("validToken", "weak", "192.168.1.1")
        );
    }

    //Sprawdza czy serwis blokuje po przekroczeniu limitu prób dla IP
    @Test
    @DisplayName("Powinien blokować po przekroczeniu limitu prób dla IP")
    void shouldRateLimitByIp() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(tokenRepository.countRecentTokensByUser(any(), any())).thenReturn(0L);
        when(tokenRepository.save(any(PasswordResetToken.class))).thenAnswer(inv -> inv.getArgument(0));

       
        String sameIp = "192.168.1.100";
        for (int i = 0; i < 4; i++) {
            passwordResetService.initiatePasswordReset("test@example.com", sameIp, "Mozilla/5.0");
        }

        
        verify(emailService, atMost(3)).sendPasswordResetEmail(anyString(), anyString());
    }

    //Sprawdza czy serwis unieważnia poprzednie tokeny użytkownika po resecie
    @Test
    @DisplayName("Powinien unieważnić poprzednie tokeny użytkownika po resecie")
    void shouldInvalidatePreviousTokensAfterReset() {
       
        PasswordResetToken token = new PasswordResetToken();
        token.setUser(testUser);
        token.setTokenHash("hashedToken");
        token.setExpiresAt(LocalDateTime.now().plusHours(1));
        token.setUsed(false);

        when(tokenRepository.findByTokenHash(anyString())).thenReturn(Optional.of(token));
        when(passwordEncoder.encode(anyString())).thenReturn("newEncodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        
        passwordResetService.resetPassword("validToken", "NewPassword123!", "192.168.1.1");

       
        verify(tokenRepository).deleteByUser(testUser);
    }
}
