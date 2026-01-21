package com.example.backend.service;

import com.example.backend.model.Role;
import com.example.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla JwtService
 * Testują generowanie, walidację i ekstrakcję danych z tokenów JWT
 */
class JwtServiceTest {

    private JwtService jwtService;
    private static final String SECRET_KEY = "testSecretKeyForJwtServiceTestingPurposesOnly12345";
    private static final long EXPIRATION_MS = 3600000; // 1 godzina

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpirationInMs", EXPIRATION_MS);
    }

    @Test
    @DisplayName("Powinien wygenerować poprawny token JWT dla użytkownika")
    void shouldGenerateValidToken() {
        // Given
        User user = createTestUser();

        // When
        String token = jwtService.generateToken(user);

        // Then
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT ma 3 części
    }

    @Test
    @DisplayName("Powinien wyekstrahować email z tokenu")
    void shouldExtractUsernameFromToken() {
        // Given
        User user = createTestUser();
        String token = jwtService.generateToken(user);

        // When
        String extractedEmail = jwtService.extractUsername(token);

        // Then
        assertEquals(user.getEmail(), extractedEmail);
    }

    @Test
    @DisplayName("Powinien walidować poprawny token")
    void shouldValidateCorrectToken() {
        // Given
        User user = createTestUser();
        String token = jwtService.generateToken(user);
        
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn(user.getEmail());

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        assertTrue(isValid);
    }

    @Test
    @DisplayName("Powinien odrzucić token z innym emailem")
    void shouldRejectTokenWithDifferentEmail() {
        // Given
        User user = createTestUser();
        String token = jwtService.generateToken(user);
        
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("inny@email.com");

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        assertFalse(isValid);
    }

    @Test
    @DisplayName("Powinien zawierać rolę użytkownika w tokenie")
    void shouldContainUserRoleInToken() {
        // Given
        User user = createTestUser();
        user.setRole(Role.ADMIN);

        // When
        String token = jwtService.generateToken(user);

        // Then
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY.getBytes())
                .parseClaimsJws(token)
                .getBody();
        
        assertEquals("ADMIN", claims.get("role"));
    }

    @Test
    @DisplayName("Powinien zawierać username w tokenie")
    void shouldContainUsernameInToken() {
        // Given
        User user = createTestUser();

        // When
        String token = jwtService.generateToken(user);

        // Then
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY.getBytes())
                .parseClaimsJws(token)
                .getBody();
        
        assertEquals(user.getUsername(), claims.get("username"));
    }

    @Test
    @DisplayName("Token powinien mieć poprawną datę wygaśnięcia")
    void shouldHaveCorrectExpirationDate() {
        // Given
        User user = createTestUser();
        long beforeGeneration = System.currentTimeMillis();

        // When
        String token = jwtService.generateToken(user);

        // Then
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY.getBytes())
                .parseClaimsJws(token)
                .getBody();
        
        Date expiration = claims.getExpiration();
        long expectedExpiration = beforeGeneration + EXPIRATION_MS;
        
        // Tolerancja 5 sekund
        assertTrue(Math.abs(expiration.getTime() - expectedExpiration) < 5000);
    }

    private User createTestUser() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setUsername("testuser");
        user.setPassword("hashedPassword");
        user.setRole(Role.USER);
        return user;
    }
}
