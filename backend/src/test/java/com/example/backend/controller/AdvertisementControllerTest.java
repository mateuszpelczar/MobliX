package com.example.backend.controller;

import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Testy integracyjne dla AdvertisementController
 * Używają bazy H2 w trybie PostgreSQL compatibility
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AdvertisementControllerTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    private MockMvc mockMvc;
    private User testUser;
    private User staffUser;
    private User adminUser;
    private String userToken;
    private String staffToken;
    private String adminToken;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        
        testUser = createUser("test@example.com", "testuser", Role.USER);
        userToken = jwtService.generateToken(testUser);

        
        staffUser = createUser("staff@example.com", "staffuser", Role.STAFF);
        staffToken = jwtService.generateToken(staffUser);

        
        adminUser = createUser("admin@example.com", "adminuser", Role.ADMIN);
        adminToken = jwtService.generateToken(adminUser);
    }

    private User createUser(String email, String username, Role role) {
        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole(role);
        user.setAccountType("personal");
        user.setFirstName("Test");
        user.setLastName("User");
        user.setBlocked(false);
        return userRepository.save(user);
    }

    @Test
    @DisplayName("Powinien utworzyć ogłoszenie dla zalogowanego użytkownika")
    void shouldCreateAdvertisement() throws Exception {
        
        Category category = new Category();
        category.setName("Smartfony");
        categoryRepository.save(category);

        Location location = new Location();
        location.setCity("Warszawa");
        location.setRegion("Mazowieckie");
        locationRepository.save(location);

        CreateAdvertisementDTO dto = new CreateAdvertisementDTO();
        dto.setTitle("iPhone 15 Pro");
        dto.setDescription("Nowy iPhone w bardzo dobrym stanie");
        dto.setPrice(4500.0);
        dto.setBrand("Apple");
        dto.setModel("iPhone 15 Pro");
        dto.setColor("Biały");
        dto.setOsType("iOS");
        dto.setStorage("256GB");
        dto.setRam("8GB");
        dto.setCategoryId(category.getId());
        dto.setLocationId(location.getId());

        
        mockMvc.perform(post("/api/advertisements")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("iPhone 15 Pro"))
                .andExpect(jsonPath("$.price").value(4500.0))
                .andExpect(jsonPath("$.specification.brand").value("Apple"));
    }

    @Test
    @DisplayName("Powinien pobrać publiczne ogłoszenia bez autoryzacji")
    void shouldGetPublicAdvertisements() throws Exception {
        
        mockMvc.perform(get("/api/advertisements"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Powinien pobrać najnowsze ogłoszenia")
    void shouldGetLatestAdvertisements() throws Exception {
       
        mockMvc.perform(get("/api/advertisements/latest"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Staff powinien mieć dostęp do oczekujących ogłoszeń")
    void shouldGetPendingAdvertisementsAsStaff() throws Exception {
        
        mockMvc.perform(get("/api/advertisements/pending")
                .header("Authorization", "Bearer " + staffToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Admin powinien mieć dostęp do wszystkich ogłoszeń")
    void shouldGetAllAdvertisementsAsAdmin() throws Exception {
        
        mockMvc.perform(get("/api/advertisements/all")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @DisplayName("Użytkownik bez autoryzacji nie powinien móc utworzyć ogłoszenia")
    void shouldRejectCreateWithoutAuth() throws Exception {
        
        CreateAdvertisementDTO dto = new CreateAdvertisementDTO();
        dto.setTitle("Test");
        dto.setDescription("Test description");

        
        mockMvc.perform(post("/api/advertisements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isForbidden());
    }
}
