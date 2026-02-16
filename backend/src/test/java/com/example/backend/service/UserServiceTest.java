package com.example.backend.service;

import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.others.LoginRequest;
import com.example.backend.others.RegisterRequest;
import com.example.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla UserService
 * Testują rejestrację, logowanie, zarządzanie użytkownikami
 */
@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private LogRepository logRepository;

    @Mock
    private FavoriteAdRepository favoriteRepository;

    @Mock
    private AdvertisementRepository advertisementRepository;

    @Mock
    private MessageRepository messageRepository;

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setRole(Role.USER);
        testUser.setBlocked(false);

        registerRequest = new RegisterRequest();
        registerRequest.setEmail("new@example.com");
        registerRequest.setUsername("newuser");
        registerRequest.setPassword("password123");
        registerRequest.setAccountType("personal");
        registerRequest.setFirstName("Jan");
        registerRequest.setLastName("Kowalski");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");
    }

 
    // sprawdzanie rejestracji uzytkownika
    @Test
    @DisplayName("Powinien zarejestrować nowego użytkownika osobistego")
    void shouldRegisterPersonalUser() {
       
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.count()).thenReturn(1L); // Nie pierwszy użytkownik
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

      
        String token = userService.register(registerRequest);

        
        assertNotNull(token);
        assertEquals("jwt-token", token);
        verify(userRepository).save(any(User.class));
        verify(passwordEncoder).encode("password123");
    }

    // sprawdzanie czy pierwszy uzytkownik jest adminem
    @Test
    @DisplayName("Pierwszy użytkownik powinien otrzymać rolę ADMIN")
    void firstUserShouldBeAdmin() {
      
        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.count()).thenReturn(0L); // Pierwszy użytkownik
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            assertEquals(Role.ADMIN, saved.getRole());
            return saved;
        });
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

       
        userService.register(registerRequest);

       
        verify(userRepository).save(argThat(user -> user.getRole() == Role.ADMIN));
    }

    // sprawdzanie rejestracji uzytkownika firmowego
    @Test
    @DisplayName("Powinien zarejestrować użytkownika firmowego z danymi firmy")
    void shouldRegisterBusinessUser() {
        
        registerRequest.setAccountType("business");
        registerRequest.setCompanyName("Firma Sp. z o.o.");
        registerRequest.setNip("1234567890");
        registerRequest.setRegon("123456789");
        registerRequest.setAddress("ul. Testowa 1");
        registerRequest.setWebsite("https://firma.pl");

        when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        when(userRepository.count()).thenReturn(1L);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(jwtService.generateToken(any(User.class))).thenReturn("jwt-token");

       
        userService.register(registerRequest);

       
        verify(userRepository).save(argThat(user -> 
            "Firma Sp. z o.o.".equals(user.getCompanyName()) &&
            "1234567890".equals(user.getNip())
        ));
    }


    // sprawdzanie logowania uzytkownika
    @Test
    @DisplayName("Powinien zalogować użytkownika z poprawnymi danymi")
    void shouldLoginWithValidCredentials() {
       
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token");

      
        String token = userService.login(loginRequest);

    
        assertEquals("jwt-token", token);
    }

    // sprawdzanie logowania uzytkownika z błędnym hasłem
    @Test
    @DisplayName("Powinien odrzucić logowanie z błędnym hasłem")
    void shouldRejectLoginWithWrongPassword() {
     
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(false);

       
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> userService.login(loginRequest));
        assertEquals("Invalid credentials", exception.getMessage());
    }

    // sprawdzanie logowania uzytkownika z błędnym emailem
    @Test
    @DisplayName("Powinien odrzucić logowanie nieistniejącego użytkownika")
    void shouldRejectLoginForNonExistentUser() {
    
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.empty());

      
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> userService.login(loginRequest));
        assertEquals("Invalid credentials", exception.getMessage());
    }

    // sprawdzanie logowania zablokowanego uzytkownika
    @Test
    @DisplayName("Powinien odrzucić logowanie zablokowanego użytkownika")
    void shouldRejectLoginForBlockedUser() {
     
        testUser.setBlocked(true);
        testUser.setBlockedUntil(LocalDateTime.now().plusHours(1));
        testUser.setBlockReason("Naruszenie regulaminu");
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);

        
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> userService.login(loginRequest));
        assertTrue(exception.getMessage().contains("zablokowane"));
    }

    // sprawdzanie automatycznego odblokowania uzytkownika po wygaśnięciu blokady
    @Test
    @DisplayName("Powinien automatycznie odblokować użytkownika po wygaśnięciu blokady")
    void shouldAutoUnblockUserAfterBlockExpires() {
    
        testUser.setBlocked(true);
        testUser.setBlockedUntil(LocalDateTime.now().minusHours(1)); // Blokada wygasła
        testUser.setBlockReason("Naruszenie regulaminu");
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "encodedPassword")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(testUser)).thenReturn("jwt-token");

        String token = userService.login(loginRequest);

        assertEquals("jwt-token", token);
        verify(userRepository).save(argThat(user -> !user.isBlocked()));
    }

   
    // sprawdzanie wyszukiwania uzytkownika po emailu
    @Test
    @DisplayName("Powinien znaleźć użytkownika po emailu")
    void shouldFindUserByEmail() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

      
        User found = userService.findByEmail("test@example.com");

    
        assertEquals(testUser.getEmail(), found.getEmail());
    }
    // sprawdzanie wyszukiwania uzytkownika po emailu
    @Test
    @DisplayName("Powinien rzucić wyjątek dla nieistniejącego emaila")
    void shouldThrowForNonExistentEmail() {
     
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

     
        assertThrows(RuntimeException.class, 
            () -> userService.findByEmail("nonexistent@example.com"));
    }
    // sprawdzanie zmiany roli uzytkownika
    @Test
    @DisplayName("Powinien zmienić rolę użytkownika")
    void shouldChangeUserRole() {
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

   
        User updated = userService.changeUserRole(1L, "STAFF");

      
        assertEquals(Role.STAFF, updated.getRole());
    }
    // sprawdzanie blokowania uzytkownika
    @Test
    @DisplayName("Powinien zablokować użytkownika")
    void shouldBlockUser() {
     
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

      
        User blocked = userService.blockUser(1L, 60, "Spam");

      
        assertTrue(blocked.isBlocked());
        assertNotNull(blocked.getBlockedUntil());
        assertEquals("Spam", blocked.getBlockReason());
    }
    // sprawdzanie odblokowania uzytkownika
    @Test
    @DisplayName("Powinien odblokować użytkownika")
    void shouldUnblockUser() {
        
        testUser.setBlocked(true);
        testUser.setBlockedUntil(LocalDateTime.now().plusHours(1));
        testUser.setBlockReason("Test");
        
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

       
        User unblocked = userService.unblockUser(1L);

    
        assertFalse(unblocked.isBlocked());
        assertNull(unblocked.getBlockedUntil());
        assertNull(unblocked.getBlockReason());
    }
    // sprawdzanie usuwania uzytkownika
    @Test
    @DisplayName("Nie powinien usunąć ostatniego admina")
    void shouldNotDeleteLastAdmin() {
   
        testUser.setRole(Role.ADMIN);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

     
        RuntimeException exception = assertThrows(RuntimeException.class, 
            () -> userService.deleteUser(1L));
        assertTrue(exception.getMessage().contains("last admin"));
    }
}
