package com.example.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdvertisementResponseDTO {
    
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String userName;
    private String categoryName;
    private String locationName;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    
    // Specyfikacja smartfona
    private SmartphoneSpecificationDTO specification;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SmartphoneSpecificationDTO {
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
}
