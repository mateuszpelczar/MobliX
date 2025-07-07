package com.example.backend.models;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;



@Entity
@Table(name = "message")
public class Message {

  @NotNull
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;


  @NotNull
  @ManyToOne
  @JoinColumn(name = "sender_id")
  private User sender;

  @NotNull
  private String content;

  @NotNull
  private LocalDateTime dateSending;


  @NotNull
  @ManyToOne
  @JoinColumn(name="conversation_id")
  private Conversation conversation;

  @ManyToOne
  @JoinColumn(name="user_id")
  private User user;

  public Message() {
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public User getSender() {
    return sender;
  }
  public void setSender(User sender) {
    this.sender = sender;
  }
  public String getContent() {
    return content;
  }
  public void setContent(String content) {
    this.content = content;
  }
  public LocalDateTime getDateSending() {
    return dateSending;
  }
  public void setDateSending(LocalDateTime dateSending) {
    this.dateSending = dateSending;
  }
  public Conversation getConversation() {
    return conversation;
  }
  public void setConversation(Conversation conversation) {
    this.conversation = conversation;
  }


  
}
