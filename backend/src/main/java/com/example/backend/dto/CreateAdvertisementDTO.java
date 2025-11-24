package com.example.backend.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public class CreateAdvertisementDTO {
    
    // Podstawowe informacje
    @NotBlank(message = "Tytuł jest wymagany")
    private String title;
    
    @NotBlank(message = "Opis jest wymagany")
    private String description;
    
    @NotNull(message = "Cena jest wymagana")
    @DecimalMin(value = "0.01", message = "Cena musi być większa niż 0")
    private Double price;
    
    @NotNull(message = "Kategoria jest wymagana")
    private Long categoryId;
    
    private Long locationId;
    
    // Alternatywnie można podać region i miasto zamiast locationId
    private String region; // województwo
    private String city;   // miejscowość
    
    private List<String> imageUrls;
    
    // Specyfikacja smartfona - obowiązkowe
    @NotBlank(message = "Marka jest wymagana")
    private String brand;
    
    @NotBlank(message = "Model jest wymagany")
    private String model;
    
    @NotBlank(message = "Kolor jest wymagany")
    private String color;
    
    @NotBlank(message = "System operacyjny jest wymagany")
    private String osType;
    
    private String osVersion;
    
    @NotBlank(message = "Pamięć wewnętrzna jest wymagana")
    private String storage;
    
    @NotBlank(message = "Pamięć RAM jest wymagana")
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
    
    // Dodatkowe informacje
    private Boolean includesCharger;
    private String warranty;
    private String condition;

    // Typ sprzedawcy - czy ogłoszenie jako osoba prywatna czy firma
    private String sellerType; // "personal" lub "business"

    // Konstruktory
    public CreateAdvertisementDTO() {}

    // Gettery i Settery
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

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

    public Boolean getIncludesCharger() { return includesCharger; }
    public void setIncludesCharger(Boolean includesCharger) { this.includesCharger = includesCharger; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getSellerType() { return sellerType; }
    public void setSellerType(String sellerType) { this.sellerType = sellerType; }
}