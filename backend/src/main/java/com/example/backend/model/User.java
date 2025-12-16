package com.example.backend.model;

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
import jakarta.persistence.PrePersist;

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
  @Column(unique = true)
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

  // pola do blokowania konta
  @Column(name="is_blocked", nullable= false)
  private Boolean isBlocked = false;
  private LocalDateTime blockedUntil;
  private String blockReason;

  //ostatnia aktywnosc
  private LocalDateTime lastActivity;

  // Data utworzenie konta
  private LocalDateTime createdAt;
  @PrePersist
  protected void onCreate(){
    if(createdAt==null){
      createdAt=LocalDateTime.now();
    }
    if(isBlocked==null){
      isBlocked=false;
    }
  }

  



  @OneToMany(mappedBy = "receiver")
  private List<Message> receivedMessages;

  @OneToMany(mappedBy = "user")
  private List<Advertisement> advertisements;

  @OneToMany(mappedBy = "user")
  private List<FavoriteAd> favoriteAds;


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
              List<FavoriteAd> favoriteAds, 
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

  public Boolean isBlocked(){
    return isBlocked;
  }

  public void setBlocked(Boolean blocked){
    this.isBlocked=blocked;
  }

  public LocalDateTime getBlockedUntil(){
    return blockedUntil;
  }

  public void setBlockedUntil(LocalDateTime blockedUntil){
    this.blockedUntil=blockedUntil;
  }

  public String getBlockReason(){
    return blockReason;
  }

  public void setBlockReason(String blockReason){
    this.blockReason=blockReason;
  }

  public LocalDateTime getLastActivity() {
    return lastActivity;
  }

  public void setLastActivity(LocalDateTime lastActivity) {
    this.lastActivity = lastActivity;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  
}