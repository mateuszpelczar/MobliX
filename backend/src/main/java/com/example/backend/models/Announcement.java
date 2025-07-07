package com.example.backend.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "announcement")
public class Announcement {

  @NotNull
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotNull
  private String title;

  @NotNull
  @Column(columnDefinition = "TEXT")
  private String description;

  @NotNull
  @Column(precision = 10, scale = 2)
  private BigDecimal price;

  @NotNull
  private String condition;

  @NotNull
  private LocalDateTime dateCreation;

  @NotNull
  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @NotNull
  private boolean isActive;

  @NotNull
  @ManyToOne
  @JoinColumn(name = "model_id")
  private Model model;

  @OneToMany(mappedBy = "announcement")
  private List<Conversation> conversations;

  @OneToMany(mappedBy = "announcement")
  private List<Review> reviews;

  @OneToMany(mappedBy = "announcement")
  private List<Photo> photos;

  @OneToMany(mappedBy = "announcement")
  private List<ModerationHistory> moderationHistories;

  public Announcement() {
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public String getTitle() {
    return title;
  }
  public void setTitle(String title) {
    this.title = title;
  }
  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }
  public BigDecimal getPrice() {
    return price;
  }
  public void setPrice(BigDecimal price) {
    this.price = price;
  }
  public String getCondition() {
    return condition;
  }
  public void setCondition(String condition) {
    this.condition = condition;
  }
  public LocalDateTime getDateCreation() {
    return dateCreation;
  }
  public void setDateCreation(LocalDateTime dateCreation) {
    this.dateCreation = dateCreation;
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
  public Model getModel() {
    return model;
  }
  public void setModel(Model model) {
    this.model = model;
  }
  public List<Conversation> getConversations() {
    return conversations;
  }
  public void setConversations(List<Conversation> conversations) {
    this.conversations = conversations;
  }
  public List<Review> getReviews() {
    return reviews;
  }
  public void setReviews(List<Review> reviews) {
    this.reviews = reviews;
  }
  public List<Photo> getPhotos() {
    return photos;
  }
  public void setPhotos(List<Photo> photos) {
    this.photos = photos;
  }
  public List<ModerationHistory> getModerationHistories() {
    return moderationHistories;
  }
  public void setModerationHistories(List<ModerationHistory> moderationHistories) {
    this.moderationHistories = moderationHistories;
  }





}
