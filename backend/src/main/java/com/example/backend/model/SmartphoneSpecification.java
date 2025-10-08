package com.example.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "smartphone_specifications")
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
    
    // Pola statusu i daty
    private String status; // PENDING, ACTIVE, SOLD, REJECTED
    private String condition; // NEW, VERY_GOOD, GOOD, FAIR, POOR
    private LocalDateTime dateAdded;

    // Konstruktory
    public SmartphoneSpecification() {}

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Advertisement getAdvertisement() { return advertisement; }
    public void setAdvertisement(Advertisement advertisement) { this.advertisement = advertisement; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getOsType() { return osType; }
    public void setOsType(String osType) { this.osType = osType; }

    public String getOsVersion() { return osVersion; }
    public void setOsVersion(String osVersion) { this.osVersion = osVersion; }

    public String getStorage() { return storage; }
    public void setStorage(String storage) { this.storage = storage; }

    public String getRam() { return ram; }
    public void setRam(String ram) { this.ram = ram; }

    public String getRearCameras() { return rearCameras; }
    public void setRearCameras(String rearCameras) { this.rearCameras = rearCameras; }

    public String getFrontCamera() { return frontCamera; }
    public void setFrontCamera(String frontCamera) { this.frontCamera = frontCamera; }

    public String getBatteryCapacity() { return batteryCapacity; }
    public void setBatteryCapacity(String batteryCapacity) { this.batteryCapacity = batteryCapacity; }

    public String getDisplaySize() { return displaySize; }
    public void setDisplaySize(String displaySize) { this.displaySize = displaySize; }

    public String getDisplayTech() { return displayTech; }
    public void setDisplayTech(String displayTech) { this.displayTech = displayTech; }

    public String getWifi() { return wifi; }
    public void setWifi(String wifi) { this.wifi = wifi; }

    public String getBluetooth() { return bluetooth; }
    public void setBluetooth(String bluetooth) { this.bluetooth = bluetooth; }

    public String getIpRating() { return ipRating; }
    public void setIpRating(String ipRating) { this.ipRating = ipRating; }

    public String getFastCharging() { return fastCharging; }
    public void setFastCharging(String fastCharging) { this.fastCharging = fastCharging; }

    public String getWirelessCharging() { return wirelessCharging; }
    public void setWirelessCharging(String wirelessCharging) { this.wirelessCharging = wirelessCharging; }

    public String getProcessor() { return processor; }
    public void setProcessor(String processor) { this.processor = processor; }

    public String getGpu() { return gpu; }
    public void setGpu(String gpu) { this.gpu = gpu; }

    public String getScreenResolution() { return screenResolution; }
    public void setScreenResolution(String screenResolution) { this.screenResolution = screenResolution; }

    public String getRefreshRate() { return refreshRate; }
    public void setRefreshRate(String refreshRate) { this.refreshRate = refreshRate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public LocalDateTime getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }
}
