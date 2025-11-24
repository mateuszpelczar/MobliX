package com.example.backend.model;

import java.util.List;

import com.example.backend.others.AdvertisementStatus;

import jakarta.persistence.*;

@Entity
@Table(name="ogloszenia")
public class Advertisement {
//klasa reprezentujaca ogloszenia
   @Id
   @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title")
    private String title;
    
    @Column(name = "description", length = 2000)
    private String description;
    
    @Column(name = "price")
    private Double price;

    @ManyToOne
    private User user;

    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @ManyToOne
    private Location location;

    @OneToMany(mappedBy = "advertisement", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Image> images;

    @OneToMany(mappedBy = "advertisement")
    private List<Moderation> moderations;

    @OneToOne(mappedBy = "advertisement", cascade = CascadeType.ALL)
    private SmartphoneSpecification smartphoneSpecification;

    // Nowe pola do moderacji
    @Enumerated(EnumType.STRING)
    private AdvertisementStatus status = AdvertisementStatus.PENDING;

    @Column(name = "reject_reason", length = 1000)
    private String rejectReason;

    @Column(name = "rejected_at")
    private java.time.LocalDateTime rejectedAt;

    @Column(name = "rejected_by")
    private String rejectedBy;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    // Dodatkowe informacje
    @Column(name = "includes_charger")
    private Boolean includesCharger;

    @Column(name = "warranty", length = 500)
    private String warranty;

    @Column(name = "condition_description", length = 500)
    private String condition;

    // Pole określające czy ogłoszenie wystawione jako firma czy osoba prywatna
    @Column(name = "seller_type")
    private String sellerType; // "personal" lub "business"

    @Column(name="view_count", columnDefinition = "BIGINT DEFAULT 0")
    private Long viewCount = 0L;

    // Konstruktory
    public Advertisement() {
        this.viewCount = 0L;
    }

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public Location getLocation() { return location; }
    public void setLocation(Location location) { this.location = location; }

    public List<Image> getImages() { return images; }
    public void setImages(List<Image> images) { this.images = images; }

    public List<Moderation> getModerations() { return moderations; }
    public void setModerations(List<Moderation> moderations) { this.moderations = moderations; }

    public SmartphoneSpecification getSmartphoneSpecification() { return smartphoneSpecification; }
    public void setSmartphoneSpecification(SmartphoneSpecification smartphoneSpecification) { this.smartphoneSpecification = smartphoneSpecification; }

    public AdvertisementStatus getStatus() { return status; }
    public void setStatus(AdvertisementStatus status) { this.status = status; }

    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }

    public java.time.LocalDateTime getRejectedAt() { return rejectedAt; }
    public void setRejectedAt(java.time.LocalDateTime rejectedAt) { this.rejectedAt = rejectedAt; }

    public String getRejectedBy() { return rejectedBy; }
    public void setRejectedBy(String rejectedBy) { this.rejectedBy = rejectedBy; }

    public java.time.LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(java.time.LocalDateTime createdAt) { this.createdAt = createdAt; }

    public java.time.LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(java.time.LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Boolean getIncludesCharger() { return includesCharger; }
    public void setIncludesCharger(Boolean includesCharger) { this.includesCharger = includesCharger; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getSellerType() { return sellerType; }
    public void setSellerType(String sellerType) { this.sellerType = sellerType; }

    public Long getViewCount(){
        return viewCount;
    }

    public void setViewCount(Long viewCount){
        this.viewCount = viewCount;
    }


    //methods
    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }

    //metody do pobierania obrazow do ogloszen
    public String getMainImageUrl(){
        if(images != null && !images.isEmpty()){
            return images.get(0).getUrl(); 
        }
        return null;
       
    }

    public Long getMainImageId(){
        if(images != null && !images.isEmpty()){
            return images.get(0).getId();
        }
        return null;
    }
  
}