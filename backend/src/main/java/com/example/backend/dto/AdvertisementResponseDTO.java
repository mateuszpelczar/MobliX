package com.example.backend.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AdvertisementResponseDTO {
    
    private Long id;
    private String title;
    private String description;
    private Double price;
    private String userName;
    private String categoryName;
    private String locationName;
    private String location; // pełna lokalizacja "Miasto, Województwo"
    private String voivodeship; // województwo
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime dateAdded;
    private String status; // status ogłoszenia
    private String condition; // stan urządzenia
    private String imageUrl;
    private Long imageId;
    
    // Dodatkowe informacje
    private Boolean includesCharger;
    private String warranty;
    
    // Specyfikacja smartfona
    private SmartphoneSpecificationDTO specification;

    // Konstruktory
    public AdvertisementResponseDTO() {}

    public AdvertisementResponseDTO(Long id, String title, String description, Double price, 
                                    String userName, String categoryName, String locationName, 
                                    String location, String voivodeship, List<String> imageUrls, 
                                    LocalDateTime createdAt, LocalDateTime updatedAt, LocalDateTime dateAdded, String status, 
                                    String condition, String imageUrl, Long imageId, Boolean includesCharger, 
                                    String warranty, SmartphoneSpecificationDTO specification) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.userName = userName;
        this.categoryName = categoryName;
        this.locationName = locationName;
        this.location = location;
        this.voivodeship = voivodeship;
        this.imageUrls = imageUrls;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.dateAdded = dateAdded;
        this.status = status;
        this.condition = condition;
        this.imageUrl = imageUrl;
        this.imageId = imageId;
        this.includesCharger = includesCharger;
        this.warranty = warranty;
        this.specification = specification;
    }

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getVoivodeship() { return voivodeship; }
    public void setVoivodeship(String voivodeship) { this.voivodeship = voivodeship; }

    public List<String> getImageUrls() { return imageUrls; }
    public void setImageUrls(List<String> imageUrls) { this.imageUrls = imageUrls; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public LocalDateTime getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Long getImageId() { return imageId; }
    public void setImageId(Long imageId) { this.imageId = imageId; }

    public Boolean getIncludesCharger() { return includesCharger; }
    public void setIncludesCharger(Boolean includesCharger) { this.includesCharger = includesCharger; }

    public String getWarranty() { return warranty; }
    public void setWarranty(String warranty) { this.warranty = warranty; }

    public SmartphoneSpecificationDTO getSpecification() { return specification; }
    public void setSpecification(SmartphoneSpecificationDTO specification) { this.specification = specification; }

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
        private String condition;
        private String status;
        private LocalDateTime dateAdded;

        // Konstruktory
        public SmartphoneSpecificationDTO() {}

        public SmartphoneSpecificationDTO(String brand, String model, String color, String osType, 
                                          String osVersion, String storage, String ram, String rearCameras, 
                                          String frontCamera, String batteryCapacity, String displaySize, 
                                          String displayTech, String wifi, String bluetooth, String ipRating, 
                                          String fastCharging, String wirelessCharging, String processor, 
                                          String gpu, String screenResolution, String refreshRate, 
                                          String condition, String status, LocalDateTime dateAdded) {
            this.brand = brand;
            this.model = model;
            this.color = color;
            this.osType = osType;
            this.osVersion = osVersion;
            this.storage = storage;
            this.ram = ram;
            this.rearCameras = rearCameras;
            this.frontCamera = frontCamera;
            this.batteryCapacity = batteryCapacity;
            this.displaySize = displaySize;
            this.displayTech = displayTech;
            this.wifi = wifi;
            this.bluetooth = bluetooth;
            this.ipRating = ipRating;
            this.fastCharging = fastCharging;
            this.wirelessCharging = wirelessCharging;
            this.processor = processor;
            this.gpu = gpu;
            this.screenResolution = screenResolution;
            this.refreshRate = refreshRate;
            this.condition = condition;
            this.status = status;
            this.dateAdded = dateAdded;
        }

        // Gettery i Settery
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

        public String getCondition() { return condition; }
        public void setCondition(String condition) { this.condition = condition; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public LocalDateTime getDateAdded() { return dateAdded; }
        public void setDateAdded(LocalDateTime dateAdded) { this.dateAdded = dateAdded; }
    }
}
