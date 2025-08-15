package com.example.backend.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileRequest {
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
    private String preferredContactMethod; // "email" lub "phone"
    private Boolean newsletterSubscription;
}