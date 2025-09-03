package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAdvertisementDTO {
    
    // Podstawowe informacje
    private String title;
    private String description;
    private Double price;
    private Long categoryId;
    private Long locationId;
    private List<String> imageUrls;
    
    // Specyfikacja smartfona - obowiązkowe
    private String brand;
    private String model;
    private String color;
    private String osType;
    private String osVersion;
    private String storage;
    private String ram;
    private String rearCameras;
    private String frontCamera;
    private String batteryCapacity;
    
    // Specyfikacja smartfona - opcjonalne
    private String displaySize;
    private String displayTech;
    private String wifi;
    private String bluetooth;
    private String ipRating;
    private String fastCharging;
    private String wirelessCharging;
    private String processor;
    private String gpu;
    private String screenResolution;
    private String refreshRate;
}
