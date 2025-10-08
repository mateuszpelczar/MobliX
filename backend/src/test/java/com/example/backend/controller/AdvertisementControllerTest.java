package com.example.backend.controller;

import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser(username = "testuser", roles = {"USER"})
    void shouldCreateAdvertisement() throws Exception {
        // Given
        User user = new User();
        user.setUsername("testuser");
        user.setEmail("test@example.com");
        user.setPassword("password");
        userRepository.save(user);

        Category category = new Category();
        category.setName("Telefony");
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

        // When & Then
        mockMvc.perform(post("/api/advertisements")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("iPhone 15 Pro"))
                .andExpect(jsonPath("$.description").value("Nowy iPhone w bardzo dobrym stanie"))
                .andExpect(jsonPath("$.price").value(4500.00))
                .andExpect(jsonPath("$.brand").value("Apple"))
                .andExpect(jsonPath("$.model").value("iPhone 15 Pro"));
    }

    @Test
    void shouldGetPublicAdvertisements() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/advertisements"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    void shouldGetLatestAdvertisements() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/advertisements/latest"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "staff", roles = {"STAFF"})
    void shouldGetPendingAdvertisements() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/advertisements/pending"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldGetAllAdvertisements() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/advertisements/all"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }
}