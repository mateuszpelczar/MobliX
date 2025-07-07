package com.example.backend.models;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;


@Entity
@Table(name = "photo")
public class Photo {

  @NotNull
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) 
  private Long id;

  @ManyToOne
  @JoinColumn(name = "announcement_id")
  private Announcement announcement;

  @NotNull
  private LocalDateTime dateAdd;

  @NotNull
  private String imageUrl;

  public Photo() {
  
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public Announcement getAnnouncement() {
    return announcement;
  }
  public void setAnnouncement(Announcement announcement) {
    this.announcement = announcement;
  }
  public LocalDateTime getDateAdd() {
    return dateAdd;
  }
  public void setDateAdd(LocalDateTime dateAdd) {
    this.dateAdd = dateAdd;
  }
  public String getImageUrl() {
    return imageUrl;
  }
  public void setImageUrl(String imageUrl) {
    this.imageUrl = imageUrl;
  }
  

  
}
