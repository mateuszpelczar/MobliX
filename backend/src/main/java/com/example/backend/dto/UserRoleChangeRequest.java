package com.example.backend.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UserRoleChangeRequest {
    private String role;

    public String getRole() {
        return role;
    }
}
