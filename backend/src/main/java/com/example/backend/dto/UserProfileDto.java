package com.example.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileDto {
    private Long id;
    private String username;
    private String email;
    
    // Dane osobowe / Personal data
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    
    // Dane adresowe / Address data
    private String street;
    private String city;
    private String postalCode;
    private String country;
    
    // Dane firmowe (opcjonalne) / Company data (optional)
    private String companyName;
    private String taxId;
    
    // Ustawienia prywatności i preferencji / Privacy and preference settings
    private Boolean profilePublic;
    private Boolean showContactInAds;
    private String preferredContactMethod;
    private Boolean newsletterSubscription;
    
    // Znaczniki czasowe / Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}