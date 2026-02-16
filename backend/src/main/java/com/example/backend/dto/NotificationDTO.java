package com.example.backend.dto;

import java.time.LocalDateTime;

import com.example.backend.others.NotificationType;

public class NotificationDTO {
    
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long advertisementId;
    private String oldValue;
    private String newValue;

    
    public NotificationDTO() {}

    public NotificationDTO(Long id, NotificationType type, String title, String message, 
                          Boolean isRead, LocalDateTime createdAt, Long advertisementId,
                          String oldValue, String newValue) {
        this.id = id;
        this.type = type;
        this.title = title;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.advertisementId = advertisementId;
        this.oldValue = oldValue;
        this.newValue = newValue;
    }

    
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getAdvertisementId() {
        return advertisementId;
    }

    public void setAdvertisementId(Long advertisementId) {
        this.advertisementId = advertisementId;
    }

    public String getOldValue() {
        return oldValue;
    }

    public void setOldValue(String oldValue) {
        this.oldValue = oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public void setNewValue(String newValue) {
        this.newValue = newValue;
    }
}