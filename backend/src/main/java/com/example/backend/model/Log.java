package com.example.backend.model;

import java.time.LocalDateTime;
import jakarta.persistence.*;
//klasa reprezentujaca logi dzialan uzytkownikow
@Entity

@Table(name = "logs")
public class Log {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 50)
    private String level;

    @Column(nullable=false, length = 100)
    private String category;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(length=2000)
    private String details;

    @Column(length = 100)
    private String source;

    @Column(length = 255)
    private String userEmail;

    @Column(length = 50)
    private String ipAddress;


    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    public Log(){
        this.timestamp=LocalDateTime.now();
    }

     public Log(String level, String category, String message, String details, String source, User user, String ipAddress) {
        this.timestamp = LocalDateTime.now();
        this.level = level;
        this.category = category;
        this.message = message;
        this.details = details;
        this.source = source;
        this.user = user;
        this.userEmail = user != null ? user.getEmail() : null; // Automatycznie ustaw email z User
        this.ipAddress = ipAddress;
    }

    //gettery i settery
    public Long getId(){
        return id;
    }

    public void setId(Long id){
        this.id=id;
    }

    public LocalDateTime getTimestamp(){
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
        // Automatycznie aktualizuj userEmail gdy ustawiasz User
        this.userEmail = user != null ? user.getEmail() : null;
    }
}