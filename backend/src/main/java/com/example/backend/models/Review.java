package com.example.backend.models;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "review")
public class Review {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @NotNull
  private Long id;

  @NotNull
  @Column(columnDefinition = "TEXT")
  private String content;

  @NotNull
  private int rate;

  @NotNull
  private LocalDate dateAdd;

  @ManyToOne
  @JoinColumn(name="announcement_id")
  private Announcement announcement;

  @ManyToOne
  @JoinColumn(name="user_id")
  private User user;

  @NotNull
  private boolean isActive;

  // Usunięto @Column, oraz @NotNull jeśli pole może być null
  @ManyToOne
  @JoinColumn(name="approved_by_id", nullable = true)
  private User approvedBy;

  @NotNull
  private LocalDateTime dateModeration;

  public Review() {
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public String getContent() {
    return content;
  }
  public void setContent(String content) {
    this.content = content;
  }
  public int getRate() {
    return rate;
  }
  public void setRate(int rate) {
    this.rate = rate;
  }
  public LocalDate getDateAdd() {
    return dateAdd;
  }
  public void setDateAdd(LocalDate dateAdd) {
    this.dateAdd = dateAdd;
  }
  public Announcement getAnnouncement() {
    return announcement;
  }
  public void setAnnouncement(Announcement announcement) {
    this.announcement = announcement;
  }
  public User getUser() {
    return user;
  }
  public void setUser(User user) {
    this.user = user;
  }
  public boolean isActive() {
    return isActive;
  }
  public void setActive(boolean isActive) {
    this.isActive = isActive;
  }
  public User getApprovedBy() {
    return approvedBy;
  }
  public void setApprovedBy(User approvedBy) {
    this.approvedBy = approvedBy;
  }
  public LocalDateTime getDateModeration() {
    return dateModeration;
  }
  public void setDateModeration(LocalDateTime dateModeration) {
    this.dateModeration = dateModeration;
  }
}