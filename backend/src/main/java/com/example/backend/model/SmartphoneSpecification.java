package com.example.backend.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "smartphone_specifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SmartphoneSpecification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "advertisement_id")
    private Advertisement advertisement;
    
    // Obowiązkowe pola
    private String brand;
    private String model;
    private String color;
    private String osType; // Android lub iOS
    private String osVersion;
    private String storage; // pamięć wewnętrzna
    private String ram;
    private String rearCameras; // aparat główny
    private String frontCamera; // aparat przedni
    private String batteryCapacity;
    
    // Opcjonalne pola
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
