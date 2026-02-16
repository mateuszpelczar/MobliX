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

    //Sprawdza czy serwis poprawnie generuje token JWT dla użytkownika
    @Test
    @DisplayName("Powinien wygenerować poprawny token JWT dla użytkownika")
    void shouldGenerateValidToken() {
       
        User user = createTestUser();

       
        String token = jwtService.generateToken(user);

       
        assertNotNull(token);
        assertFalse(token.isEmpty());
        assertTrue(token.split("\\.").length == 3); // JWT ma 3 części
    }
    //Sprawdza czy serwis poprawnie wyekstrahowuje email z tokenu
    @Test
    @DisplayName("Powinien wyekstrahować email z tokenu")
    void shouldExtractUsernameFromToken() {
        
        User user = createTestUser();
        String token = jwtService.generateToken(user);

       
        String extractedEmail = jwtService.extractUsername(token);

        
        assertEquals(user.getEmail(), extractedEmail);
    }

    //Sprawdza czy serwis poprawnie waliduje token
    @Test
    @DisplayName("Powinien walidować poprawny token")
    void shouldValidateCorrectToken() {
        
        User user = createTestUser();
        String token = jwtService.generateToken(user);
        
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn(user.getEmail());

        
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        
        assertTrue(isValid);
    }

    //Sprawdza czy serwis odrzuca token z innym emailem
    @Test
    @DisplayName("Powinien odrzucić token z innym emailem")
    void shouldRejectTokenWithDifferentEmail() {
        
        User user = createTestUser();
        String token = jwtService.generateToken(user);
        
        UserDetails userDetails = mock(UserDetails.class);
        when(userDetails.getUsername()).thenReturn("inny@email.com");

        
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        
        assertFalse(isValid);
    }

    //Sprawdza czy serwis poprawnie dodaje rolę użytkownika do tokenu
    @Test
    @DisplayName("Powinien zawierać rolę użytkownika w tokenie")
    void shouldContainUserRoleInToken() {
        
        User user = createTestUser();
        user.setRole(Role.ADMIN);

       
        String token = jwtService.generateToken(user);

       
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY.getBytes())
                .parseClaimsJws(token)
                .getBody();
        
        assertEquals("ADMIN", claims.get("role"));
    }

    //Sprawdza czy serwis poprawnie dodaje username do tokenu
    @Test
    @DisplayName("Powinien zawierać username w tokenie")
    void shouldContainUsernameInToken() {
       
        User user = createTestUser();

     
        String token = jwtService.generateToken(user);

     
        Claims claims = Jwts.parser()
                .setSigningKey(SECRET_KEY.getBytes())
                .parseClaimsJws(token)
                .getBody();
        
        assertEquals(user.getUsername(), claims.get("username"));
    }

    //Sprawdza czy serwis poprawnie ustawia datę wygaśnięcia tokenu
    @Test
    @DisplayName("Token powinien mieć poprawną datę wygaśnięcia")
    void shouldHaveCorrectExpirationDate() {
        
        User user = createTestUser();
        long beforeGeneration = System.currentTimeMillis();

        
        String token = jwtService.generateToken(user);

       
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
