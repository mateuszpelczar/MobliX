package com.example.backend.others;

public class BlockUserRequest {
    private int durationMinutes; // 15 lub 1440 (24h)
    private String reason;
    
    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}