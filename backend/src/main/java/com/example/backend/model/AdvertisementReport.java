package com.example.backend.model;

import java.time.LocalDateTime;

import com.example.backend.others.ReportStatus;

import jakarta.persistence.*;


@Entity
@Table(name="zgloszone_ogloszenia")
public class AdvertisementReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name="advertisement_id",nullable=false)
    private Advertisement advertisement;
    
    @ManyToOne
    @JoinColumn(name="reporter_id",nullable=false)
    private User reporter; //kto zglosil

    @ManyToOne
    @JoinColumn(name="adveritsement_owner", nullable=false)
    private User advertisementOwner;

    @Column(nullable=false)
    private String reason; //powod zgloszenia

    @Column(length = 1000)
    private String comment; //opcjonalny komentarz do zgloszenia

    @Column(nullable=false)
    @Enumerated(EnumType.STRING)
    private ReportStatus status; //status zgloszenia

    @Column(length=1000)
    private String moderatorNote; //notatka dla moderatora(w przypadku ostrzezenia)

    @ManyToOne
    @JoinColumn(name="reviewed_by")
    private User reviewedBy; // Ktory moderator rozpatrzyl

    @Column
    private LocalDateTime createdAt;

    @Column LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() { 
        if(createdAt == null){
            createdAt = LocalDateTime.now();
        }
        if(status ==null){
            status = ReportStatus.PENDING;
        }
    }


    //get i set

    public Long getId() {
        return id;
    }

    public void setId(Long id){
        this.id=id;
    }

    public Advertisement getAdvertisement(){
        return advertisement;
    }

    public void setAdvertisement(Advertisement advertisement){
        this.advertisement=advertisement;
    }

    public User getReporter(){
        return reporter;
    }

    public void setReporter(User reporter){
        this.reporter = reporter;
    }

    public User getAdvertisementOwner(){
        return advertisementOwner;
    }
    
    public void setAdvertisementOwner(User advertisementOwner){
        this.advertisementOwner = advertisementOwner;
    }

    public String getReason(){
        return reason;
    }

    public void setReason(String reason){
        this.reason = reason;
    }

    public String getComment(){
        return comment;
    }

    public void setComment(String comment){
        this.comment = comment;
    }

    public ReportStatus getStatus(){
        return status;
    }

    public void setStatus(ReportStatus status){
        this.status = status;
    }

    public String getModeratorNote(){
        return moderatorNote;
    }

    public void setModeratorNote(String moderatorNote){
        this.moderatorNote = moderatorNote;
    }

    public User getReviewedBy(){
        return reviewedBy;
    }

    public void setReviewedBy(User reviewedBy){
        this.reviewedBy = reviewedBy;
    }

    public LocalDateTime getCreatedAt(){
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt = createdAt;
    }

    public LocalDateTime getReviewedAt(){
        return reviewedAt;
    }

    public void setReviewedAt(LocalDateTime reviewedAt){
        this.reviewedAt = reviewedAt;
    }

    



    
    


  
}
