package com.example.backend.models;

import java.time.LocalDateTime;

import org.springframework.cglib.core.Local;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "moderation_history")
public class ModerationHistory {


  @NotNull
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "admin_id")
  private User admin;

  @ManyToOne
  @JoinColumn(name = "announcement_id")
  private Announcement announcement;

  @NotNull
  private String action;

  @NotNull
  private String reason;

  @NotNull
  private LocalDateTime dateModeration;

  public ModerationHistory() {
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public User getAdmin() {
    return admin;
  }
  public void setAdmin(User admin) {
    this.admin = admin;
  }
  public Announcement getAnnouncement() {
    return announcement;
  }
  public void setAnnouncement(Announcement announcement) {
    this.announcement = announcement;
  }
  public String getAction() {
    return action;
  }
  public void setAction(String action) {
    this.action = action;
  }
  public String getReason() {
    return reason;
  }
  public void setReason(String reason) {
    this.reason = reason;
  }
  public LocalDateTime getDateModeration() {
    return dateModeration;
  }
  public void setDateModeration(LocalDateTime dateModeration) {
    this.dateModeration = dateModeration;
  }


  
}
