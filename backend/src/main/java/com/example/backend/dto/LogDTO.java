package com.example.backend.dto;

import java.time.LocalDateTime;

public class LogDTO {

  private Long id;
  private LocalDateTime timestamp;
  private String level; // INFO, WARN, ERROR
    private String category; // authentication, advertisement, opinion, profile, admin, system
    private String message;
    private String details;
    private String source;
    private String userEmail;
    private String ipAddress;

    public LogDTO(){

    }

    public LogDTO(Long id, LocalDateTime timestamp, String level, String category, 
                  String message, String details, String source, String userEmail, String ipAddress){
                   this.id=id;
                   this.timestamp=timestamp;
                   this.level=level;
                   this.category=category;
                   this.message=message;
                   this.details=details;
                   this.source=source;
                   this.userEmail=userEmail;
                   this.ipAddress=ipAddress;
                  }

  
                //gettery i settery

                public Long getId(){
                  return id;
                }

                public void setId(Long id){
                  this.id=id;
                }

                public LocalDateTime getTimestamp(){
                  return timestamp;
                }

                public void setTimestamp(LocalDateTime timestamp){
                  this.timestamp=timestamp;
                }

                public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }
  
}
