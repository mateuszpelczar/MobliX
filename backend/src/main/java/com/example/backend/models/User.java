package com.example.backend.models;

import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "users")
public class User {

   
    @NotNull
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


   
    @NotNull
    private String userName;

  
    @NotNull
    private String password;
    


    @NotNull
    private String email;

 
    @NotNull
    @Enumerated(EnumType.STRING)
    private Role role;
    

    @NotNull
    private LocalDateTime dateCreation;

  

    //relationships

    @OneToMany(mappedBy="moderator")
    private List<ModerationHistoryReview> moderationHistorieReviews;

    @OneToMany(mappedBy = "user")
    private List<Review> reviews;

    @OneToMany(mappedBy="user1")
    private List<Conversation> conversationsUser1;

    @OneToMany(mappedBy = "user2")
    private List<Conversation> conversationsUser2;

    @OneToMany(mappedBy="user")
    private List<Message> messages;

    @OneToMany(mappedBy="user")
    private List<Announcement> announcements;

    @OneToMany(mappedBy="admin")
    private List<ModerationHistory> historyModerations;

    public User() {
    }


    //getters and setters
    public Long getId(){
      return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public String getPassword() {
        return password;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public String getEmail() {
        return email;
    }
    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }
    public void setRole(Role role) {
        this.role = role;
    }
    public LocalDateTime getDateCreation() {
        return dateCreation;
    }
    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }
    public List<ModerationHistoryReview> getModerationHistorieReviews() {
        return moderationHistorieReviews;
    }
    public void setModerationHistorieReviews(List<ModerationHistoryReview> moderationHistorieReviews) {
        this.moderationHistorieReviews = moderationHistorieReviews;
    }
    public List<Review> getReviews() {
        return reviews;
    }
    public void setReviews(List<Review> reviews) {
        this.reviews = reviews;
    }
    public List<Conversation> getConversationsUser1() {
        return conversationsUser1;
    }
    public void setConversationsUser1(List<Conversation> conversationsUser1) {
        this.conversationsUser1 = conversationsUser1;
    }
    public List<Conversation> getConversationsUser2() {
        return conversationsUser2;
    }
    public void setConversationsUser2(List<Conversation> conversationsUser2) {
        this.conversationsUser2 = conversationsUser2;
    }
    public List<Message> getMessages() {
        return messages;
    }
    public void setMessages(List<Message> messages) {
        this.messages = messages;
    }
    public List<Announcement> getAnnouncements() {
        return announcements;
    }
    public void setAnnouncements(List<Announcement> announcements) {
        this.announcements = announcements;
    }
    public List<ModerationHistory> getHistoryModerations() {
        return historyModerations;
    }
    public void setHistoryModerations(List<ModerationHistory> historyModerations) {
        this.historyModerations = historyModerations;
    }
    
  
    







}
