package com.example.backend.dto;

import java.time.LocalDateTime;

public class AdvertisementReportDTO {
  
    private Long id;
    private Long advertisementId;
    private String advertisementTitle;
    private String reporterName;
    private String reporterEmail;
    private String ownerName;
    private String ownerEmail;
    private String reason;
    private String reasonLabel;
    private String comment;
    private String status;
    private String moderatorNote;
    private String reviewedByName;
    private LocalDateTime createdAt;
    private LocalDateTime reviewedAt;

    public AdvertisementReportDTO(){}

    //gett i sett

    public Long getId(){
      return id;
    }

    public void setId(Long id){
      this.id=id;
    }

    public Long getAdvertisementId(){
      return advertisementId;
    }

    public void setAdvertisementId(Long advertisementId){
      this.advertisementId= advertisementId;
    }

    public String getAdvertisementTitle(){
      return advertisementTitle;
    }

    public void setAdvertisementTitle(String advertisementTitle){
      this.advertisementTitle = advertisementTitle;
    }

    public String getReporterName(){
      return reporterName;
    }

    public void setReporterName(String reporterName){
      this.reporterName = reporterName;
    }

    public String getReporterEmail(){
      return reporterEmail;
    }

    public void setReporterEmail(String reporterEmail){
      this.reporterEmail= reporterEmail;
    }

    public String getOwnerName(){
      return ownerName;
    }

    public void setOwnerName(String ownerName){
      this.ownerName = ownerName;
    }


    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReasonLabel() { return reasonLabel; }
    public void setReasonLabel(String reasonLabel) { this.reasonLabel = reasonLabel; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getModeratorNote() { return moderatorNote; }
    public void setModeratorNote(String moderatorNote) { this.moderatorNote = moderatorNote; }

    public String getReviewedByName() { return reviewedByName; }
    public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    
}
