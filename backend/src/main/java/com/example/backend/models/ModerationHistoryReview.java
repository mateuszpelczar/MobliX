package com.example.backend.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;



@Entity
@Table(name="moderation_history_review")
public class ModerationHistoryReview {


  @NotNull
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  
  private Long id;

 
  @NotNull
  @ManyToOne
  @JoinColumn(name="moderator_id")
  private User moderator;


  @NotNull
  @ManyToOne
  @JoinColumn(name="review_id")
  private Review review;



  @NotNull
  private String reason;


  @NotNull
  private LocalDateTime date;

  public ModerationHistoryReview() {
  }

  //getters and setters
  public Long getId(){
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public User getModerator() {
    return moderator;
  }
  public void setModerator(User moderator) {
    this.moderator = moderator;
  }
  public Review getReview() {
    return review;
  }
  public void setReview(Review review) {
    this.review = review;
  }
  public String getReason() {
    return reason;
  }
  public void setReason(String reason) {
    this.reason = reason;
  }
  public LocalDateTime getDate() {
    return date;
  }
  public void setDate(LocalDateTime date) {
    this.date = date;
  }



}
