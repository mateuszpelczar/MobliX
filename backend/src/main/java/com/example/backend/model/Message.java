package com.example.backend.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;

//klasa reprezentujaca wiadomosci miedzy uzytkownikami
@Entity
@Table(name="messages")
public class Message {
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  
  private String content;
  
  private LocalDateTime timestamp;

  @ManyToOne
  private User sender;

  @ManyToOne
  private User receiver;

  @ManyToOne
  private Conversation conversation;

  // Nowe pola do systemu moderacji
  @Column(name = "message_content", columnDefinition = "TEXT")
  private String messageContent;

  @Column(name = "message_type")
  private String messageType; // "REJECTION", "REGULAR"

  @Column(name = "advertisement_id")
  private Long advertisementId;

  @Column(name = "advertisement_title")
  private String advertisementTitle;

  @Column(name = "is_read")
  private Boolean isRead = false;

  @Column(name = "can_reply")
  private Boolean canReply = true;

  @Column(name = "created_at")
  private LocalDateTime createdAt;

  @PrePersist
  protected void onCreate() {
    if (timestamp == null) {
      timestamp = LocalDateTime.now();
    }
    if (createdAt == null) {
      createdAt = LocalDateTime.now();
    }
  }

  // Konstruktory
  public Message() {}

  public Message(Long id, String content, LocalDateTime timestamp, User sender, User receiver, 
                 Conversation conversation, String messageContent, String messageType, Long advertisementId, 
                 String advertisementTitle, Boolean isRead, Boolean canReply, LocalDateTime createdAt) {
    this.id = id;
    this.content = content;
    this.timestamp = timestamp;
    this.sender = sender;
    this.receiver = receiver;
    this.conversation = conversation;
    this.messageContent = messageContent;
    this.messageType = messageType;
    this.advertisementId = advertisementId;
    this.advertisementTitle = advertisementTitle;
    this.isRead = isRead;
    this.canReply = canReply;
    this.createdAt = createdAt;
  }

  // Gettery i Settery
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getContent() { return content; }
  public void setContent(String content) { this.content = content; }

  public LocalDateTime getTimestamp() { return timestamp; }
  public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

  public User getSender() { return sender; }
  public void setSender(User sender) { this.sender = sender; }

  public User getReceiver() { return receiver; }
  public void setReceiver(User receiver) { this.receiver = receiver; }

  public Conversation getConversation() { return conversation; }
  public void setConversation(Conversation conversation) { this.conversation = conversation; }

  public String getMessageContent() { return messageContent; }
  public void setMessageContent(String messageContent) { this.messageContent = messageContent; }

  public String getMessageType() { return messageType; }
  public void setMessageType(String messageType) { this.messageType = messageType; }

  public Long getAdvertisementId() { return advertisementId; }
  public void setAdvertisementId(Long advertisementId) { this.advertisementId = advertisementId; }

  public String getAdvertisementTitle() { return advertisementTitle; }
  public void setAdvertisementTitle(String advertisementTitle) { this.advertisementTitle = advertisementTitle; }

  public Boolean getIsRead() { return isRead; }
  public void setIsRead(Boolean isRead) { this.isRead = isRead; }

  public Boolean getCanReply() { return canReply; }
  public void setCanReply(Boolean canReply) { this.canReply = canReply; }

  public LocalDateTime getCreatedAt() { return createdAt; }
  public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
