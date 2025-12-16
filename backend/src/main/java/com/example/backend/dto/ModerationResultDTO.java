package com.example.backend.dto;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO zawierające wynik moderacji ogłoszenia (zdjęć i tekstu)
 */
public class ModerationResultDTO {
    
    private boolean approved;
    private boolean imageApproved;
    private boolean textApproved;
    private List<String> imageIssues;
    private List<String> textIssues;
    private String rejectionReason;
    
    public ModerationResultDTO() {
        this.approved = true;
        this.imageApproved = true;
        this.textApproved = true;
        this.imageIssues = new ArrayList<>();
        this.textIssues = new ArrayList<>();
    }
    
    public static ModerationResultDTO approved() {
        return new ModerationResultDTO();
    }
    
    public static ModerationResultDTO rejected(String reason) {
        ModerationResultDTO result = new ModerationResultDTO();
        result.setApproved(false);
        result.setRejectionReason(reason);
        return result;
    }
    
    public void addImageIssue(String issue) {
        this.imageIssues.add(issue);
        this.imageApproved = false;
        this.approved = false;
    }
    
    public void addTextIssue(String issue) {
        this.textIssues.add(issue);
        this.textApproved = false;
        this.approved = false;
    }
    
    public String buildRejectionReason() {
        StringBuilder reason = new StringBuilder();
        
        if (!imageIssues.isEmpty()) {
            reason.append("Nieprawidłowe zdjęcie - wykryto: ");
            reason.append(String.join(", ", imageIssues));
        }
        
        if (!textIssues.isEmpty()) {
            if (reason.length() > 0) {
                reason.append("; ");
            }
            reason.append("Nieprawidłowa treść - ");
            reason.append(String.join(", ", textIssues));
        }
        
        this.rejectionReason = reason.toString();
        return this.rejectionReason;
    }

    // Getters and Setters
    public boolean isApproved() { return approved; }
    public void setApproved(boolean approved) { this.approved = approved; }
    
    public boolean isImageApproved() { return imageApproved; }
    public void setImageApproved(boolean imageApproved) { this.imageApproved = imageApproved; }
    
    public boolean isTextApproved() { return textApproved; }
    public void setTextApproved(boolean textApproved) { this.textApproved = textApproved; }
    
    public List<String> getImageIssues() { return imageIssues; }
    public void setImageIssues(List<String> imageIssues) { this.imageIssues = imageIssues; }
    
    public List<String> getTextIssues() { return textIssues; }
    public void setTextIssues(List<String> textIssues) { this.textIssues = textIssues; }
    
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
}
