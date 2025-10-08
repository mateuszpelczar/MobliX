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

//klasa reprezentujaca uzytkownika w systemie
@Entity
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

  // Nowe pola dla kont prywatnych i firmowych
  private String accountType; // "personal" lub "business"
  private String firstName;
  private String lastName;
  private String phone;
  
  // Pola dla kont firmowych
  private String companyName;
  private String nip;
  private String regon;
  private String address;
  private String website;

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

  // Konstruktory
  public User() {}

  public User(Long id, String username, String email, String password, Role role,
              String accountType, String firstName, String lastName, String phone,
              String companyName, String nip, String regon, String address, String website,
              List<Message> receivedMessages, List<Advertisement> advertisements,
              List<FavoriteAd> favoriteAds, List<Review> reviews,
              List<Report> reports, List<Log> logs) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password = password;
    this.role = role;
    this.accountType = accountType;
    this.firstName = firstName;
    this.lastName = lastName;
    this.phone = phone;
    this.companyName = companyName;
    this.nip = nip;
    this.regon = regon;
    this.address = address;
    this.website = website;
    this.receivedMessages = receivedMessages;
    this.advertisements = advertisements;
    this.favoriteAds = favoriteAds;
    this.reviews = reviews;
    this.reports = reports;
    this.logs = logs;
  }

  // Gettery i Settery
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getUsername() { return username; }
  public void setUsername(String username) { this.username = username; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public Role getRole() { return role; }
  public void setRole(Role role) { this.role = role; }

  public List<Message> getReceivedMessages() { return receivedMessages; }
  public void setReceivedMessages(List<Message> receivedMessages) { this.receivedMessages = receivedMessages; }

  public List<Advertisement> getAdvertisements() { return advertisements; }
  public void setAdvertisements(List<Advertisement> advertisements) { this.advertisements = advertisements; }

  public List<FavoriteAd> getFavoriteAds() { return favoriteAds; }
  public void setFavoriteAds(List<FavoriteAd> favoriteAds) { this.favoriteAds = favoriteAds; }

  public List<Review> getReviews() { return reviews; }
  public void setReviews(List<Review> reviews) { this.reviews = reviews; }

  public List<Report> getReports() { return reports; }
  public void setReports(List<Report> reports) { this.reports = reports; }

  public List<Log> getLogs() { return logs; }
  public void setLogs(List<Log> logs) { this.logs = logs; }

  // Gettery i Settery dla nowych pól
  public String getAccountType() { return accountType; }
  public void setAccountType(String accountType) { this.accountType = accountType; }

  public String getFirstName() { return firstName; }
  public void setFirstName(String firstName) { this.firstName = firstName; }

  public String getLastName() { return lastName; }
  public void setLastName(String lastName) { this.lastName = lastName; }

  public String getPhone() { return phone; }
  public void setPhone(String phone) { this.phone = phone; }

  public String getCompanyName() { return companyName; }
  public void setCompanyName(String companyName) { this.companyName = companyName; }

  public String getNip() { return nip; }
  public void setNip(String nip) { this.nip = nip; }

  public String getRegon() { return regon; }
  public void setRegon(String regon) { this.regon = regon; }

  public String getAddress() { return address; }
  public void setAddress(String address) { this.address = address; }

  public String getWebsite() { return website; }
  public void setWebsite(String website) { this.website = website; }
}
