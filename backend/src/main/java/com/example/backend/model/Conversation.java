package com.example.backend.model;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
 

@Entity
@Table(name="conversations")
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String topic;


    @ManyToOne
    @JoinColumn(name = "user1_id")
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id")
    private User user2;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "conversation")
    private List<Message> messages;


    public Conversation() {}

    public Conversation(Long id, String topic, User user1, User user2, 
                       LocalDateTime createdAt, LocalDateTime updatedAt, List<Message> messages) {
        this.id = id;
        this.topic = topic;
        this.user1 = user1;
        this.user2 = user2;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.messages = messages;
    }

    public Long getId() { return id; }
    public String getTopic() { return topic; }
 
    public User getUser1() { return user1; }
    public User getUser2() { return user2; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<Message> getMessages() { return messages; }

    public void setId(Long id) { this.id = id; }
    public void setTopic(String topic) { this.topic = topic; }
    
    public void setUser1(User user1) { this.user1 = user1; }
    public void setUser2(User user2) { this.user2 = user2; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setMessages(List<Message> messages) { this.messages = messages; }
}