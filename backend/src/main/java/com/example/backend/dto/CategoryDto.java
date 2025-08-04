package com.example.backend.dto;

import lombok.*;
//import lombok.Builder;
//import lombok.Getter;
//import lombok.Setter;

@Getter
@Setter
@Builder
public class CategoryDto {
    private Long id;
    private String name;

    public String getName() {
        return name;
    }
}
