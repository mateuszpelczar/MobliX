package com.example.backend.model;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

//klasa reprezentujaca uzytkownika w systemie
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @NotBlank(message="Nazwa uzytkownika jest wymagana")
  private String username;
  @Email
  private String email;
 @NotBlank(message="Haslo jest wymagane")
  private String password;

  @Enumerated(EnumType.STRING)
  private Role role;

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
  @Column(name = "profile_public")
  private Boolean profilePublic = false;
  
  @Column(name = "show_contact_in_ads")
  private Boolean showContactInAds = true;
  
  @Column(name = "preferred_contact_method")
  private String preferredContactMethod = "email"; // "email" lub "phone"
  
  @Column(name = "newsletter_subscription")
  private Boolean newsletterSubscription = false;
  
  // Znaczniki czasowe / Timestamps
  @Column(name = "created_at")
  private LocalDateTime createdAt;
  
  @Column(name = "updated_at") 
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "receiver")
  private List<Message> receivedMessages;

  @OneToMany(mappedBy = "user")
  private List<Advertisement> advertisements;

  @OneToMany(mappedBy = "user")
  private List<FavoriteAd> favoriteAds;

  @OneToMany(mappedBy = "user")
  private List<Review> reviews;

  @OneToMany(mappedBy = "reporter")
  private List<Report> reports;

  @OneToMany(mappedBy = "user")
  private List<Log> logs;

  @OneToMany(mappedBy = "buyer")
  private List<Transaction> purchases;

  @OneToMany(mappedBy = "seller")
  private List<Transaction> sales;
  }
