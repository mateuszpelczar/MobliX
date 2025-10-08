package com.example.backend.dto;

public class UserRoleChangeRequest {
    private String role;

    // Konstruktory
    public UserRoleChangeRequest() {}

    public UserRoleChangeRequest(String role) {
        this.role = role;
    }

    // Gettery i Settery
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
