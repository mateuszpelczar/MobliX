package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "content_pages")
public class ContentPage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String slug; 

    @Column(nullable = false)
    private String title; 

    @Column(columnDefinition = "TEXT")
    private String content; 

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "updated_by")
    private String updatedBy; 

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

 
    public ContentPage() {
        this.lastUpdated = LocalDateTime.now();
    }

    public ContentPage(String slug, String title, String content) {
        this.slug = slug;
        this.title = title;
        this.content = content;
        this.lastUpdated = LocalDateTime.now();
    }

  
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDateTime lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public String getUpdatedBy() {
        return updatedBy;
    }

    public void setUpdatedBy(String updatedBy) {
        this.updatedBy = updatedBy;
    }
}