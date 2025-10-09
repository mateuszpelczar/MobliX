package com.example.backend.dto;

import com.example.backend.model.OpinionStatus;

import java.time.LocalDateTime;

public class OpinionResponseDTO {
    private Long id;
    private Long userId;
    private Long advertisementId;
    private String userName; // email użytkownika
    private Integer rating;
    private String comment;
    private OpinionStatus status;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String advertisementTitle; // Dodatkowe pole dla wygody w "Twoje opinie"
    private String advertisementStatus; // Status ogłoszenia (ACTIVE, SOLD, PAUSED, REJECTED, PENDING)

    // Constructors
    public OpinionResponseDTO() {
    }

    public OpinionResponseDTO(Long id, Long userId, Long advertisementId, String userName, 
                              Integer rating, String comment, OpinionStatus status, 
                              String rejectionReason, LocalDateTime createdAt, 
                              LocalDateTime updatedAt, String advertisementTitle, String advertisementStatus) {
        this.id = id;
        this.userId = userId;
        this.advertisementId = advertisementId;
        this.userName = userName;
        this.rating = rating;
        this.comment = comment;
        this.status = status;
        this.rejectionReason = rejectionReason;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.advertisementTitle = advertisementTitle;
        this.advertisementStatus = advertisementStatus;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getAdvertisementId() {
        return advertisementId;
    }

    public void setAdvertisementId(Long advertisementId) {
        this.advertisementId = advertisementId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public OpinionStatus getStatus() {
        return status;
    }

    public void setStatus(OpinionStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getAdvertisementTitle() {
        return advertisementTitle;
    }

    public void setAdvertisementTitle(String advertisementTitle) {
        this.advertisementTitle = advertisementTitle;
    }

    public String getAdvertisementStatus() {
        return advertisementStatus;
    }

    public void setAdvertisementStatus(String advertisementStatus) {
        this.advertisementStatus = advertisementStatus;
    }
}
