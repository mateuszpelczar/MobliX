package com.example.backend.dto;

import lombok.Data;

@Data
public class AdvertisementRequest {
   
    private Long id;
    private String title;
    private String description;
    private String imageUrl;
    private String category;
    private String location;
    private Double price;
    private String contactEmail;
    private String contactPhone;
    private Long userId;
}
