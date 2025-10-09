package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RejectOpinionDTO {
    
    @NotBlank(message = "Rejection reason is required")
    @Size(max = 500, message = "Rejection reason must be at most 500 characters")
    private String rejectionReason;

    // Constructors
    public RejectOpinionDTO() {
    }

    public RejectOpinionDTO(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    // Getter and Setter
    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }
}
