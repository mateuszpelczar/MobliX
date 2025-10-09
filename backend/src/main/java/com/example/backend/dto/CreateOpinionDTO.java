package com.example.backend.dto;

import jakarta.validation.constraints.*;

public class CreateOpinionDTO {
    
    @NotNull(message = "Advertisement ID is required")
    private Long advertisementId;
    
    @NotNull(message = "Rating is required")
    @Min(value = 1, message = "Rating must be at least 1")
    @Max(value = 5, message = "Rating must be at most 5")
    private Integer rating;
    
    @NotBlank(message = "Comment is required")
    @Size(min = 10, max = 1000, message = "Comment must be between 10 and 1000 characters")
    private String comment;

    // Constructors
    public CreateOpinionDTO() {
    }

    public CreateOpinionDTO(Long advertisementId, Integer rating, String comment) {
        this.advertisementId = advertisementId;
        this.rating = rating;
        this.comment = comment;
    }

    // Getters and Setters
    public Long getAdvertisementId() {
        return advertisementId;
    }

    public void setAdvertisementId(Long advertisementId) {
        this.advertisementId = advertisementId;
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
}
