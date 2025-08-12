package com.example.backend.model;

import java.util.List;

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
