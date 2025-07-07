package com.example.backend.models;

import java.time.LocalDate;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;



@Entity
@Table(name="conversation")
public class Conversation {


  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @NotNull
  private Long id;


  @NotNull
  @ManyToOne
  @JoinColumn(name="user1_id")
  
  private User user1;

 
  @NotNull
  @ManyToOne
  @JoinColumn(name="user2_id")
   
  private User user2;


  @NotNull
  @ManyToOne
  @JoinColumn(name="announcement_id")
   
  private Announcement announcement;


  @NotNull
  private LocalDate startDate;

  public Conversation() {
  }
  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public User getUser1() {
    return user1;
  }
  public void setUser1(User user1) {
    this.user1 = user1;
  }
  public User getUser2() {
    return user2;
  }
  public void setUser2(User user2) {
    this.user2 = user2;
  }
  public Announcement getAnnouncement() {
    return announcement;
  }
  public void setAnnouncement(Announcement announcement) {
    this.announcement = announcement;
  }
  public LocalDate getStartDate() {
    return startDate;
  }
  public void setStartDate(LocalDate startDate) {
    this.startDate = startDate;
  }



  
}
