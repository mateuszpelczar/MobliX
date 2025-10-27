package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.SellerInfoDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import com.example.backend.service.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;

import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdvertisementService {

    private final AdvertisementRepository advertisementRepository;
    private final UserService userService;
    private final CategoryRepository categoryRepository;
    private final LocationRepository locationRepository;
    private final ImageRepository imageRepository;
    private final MessageService messageService;
    private final LogService logService;
    private NotificationService notificationService;

    @Value("${file.upload-dir}")
    private String uploadDir;

    public AdvertisementService(AdvertisementRepository advertisementRepository,
                                UserService userService,
                                CategoryRepository categoryRepository,
                                LocationRepository locationRepository,
                                ImageRepository imageRepository,
                                MessageService messageService,
                                LogService logService) {
        this.advertisementRepository = advertisementRepository;
        this.userService = userService;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.imageRepository = imageRepository;
        this.messageService = messageService;
        this.logService = logService;
    }

    // Setter injection to avoid circular dependency
    @org.springframework.beans.factory.annotation.Autowired
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    public SellerInfoDTO getSellerInfo(Long advertisementId, boolean isAuthenticated) {
        Advertisement ad = advertisementRepository.findById(advertisementId)
            .orElseThrow(() -> new RuntimeException("Ogloszenie nie znalezione"));
        
        User user = ad.getUser();
        String sellerType = ad.getSellerType() != null ? ad.getSellerType() : "personal";
        
        List<Advertisement> userAds = advertisementRepository.findByUserOrderByCreatedAtAsc(user);
        Integer yearJoined = null;
        if (!userAds.isEmpty()) {
            yearJoined = userAds.get(0).getCreatedAt().getYear();
        }
        
        SellerInfoDTO sellerInfo = new SellerInfoDTO();
        sellerInfo.setSellerType(sellerType);
        sellerInfo.setYearJoined(yearJoined);
        
        if ("business".equals(sellerType)) {
            sellerInfo.setName(user.getCompanyName());
            sellerInfo.setCompanyName(user.getCompanyName());
            sellerInfo.setAddress(user.getAddress());
            sellerInfo.setWebsite(user.getWebsite());
            sellerInfo.setNip(user.getNip());
            sellerInfo.setRegon(user.getRegon());
        } else {
            String fullName = user.getFirstName() + " " + user.getLastName();
            sellerInfo.setName(fullName);
        }
        
        if (isAuthenticated) {
            sellerInfo.setPhone(user.getPhone());
            sellerInfo.setEmail(user.getEmail());
        } else {
            sellerInfo.setPhone(null);
            sellerInfo.setEmail(null);
        }
        
        return sellerInfo;
    }


    //zwiekszenie licznika wyswietlen dla ogloszen
   @Transactional
public void incrementViewCount(Long advertisementId, HttpServletRequest request) {
    Advertisement ad = advertisementRepository.findById(advertisementId)
        .orElseThrow(() -> new RuntimeException("Advertisement not found"));
    
    // Zwiększ licznik
    ad.setViewCount(ad.getViewCount() + 1);
    advertisementRepository.save(ad);
    
    // Zaloguj wyświetlenie
    User currentUser = null;
    String userEmail = null;
    try {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
            userEmail = auth.getName();
            try {
                currentUser = userService.findByEmail(userEmail);
            } catch (Exception e) {
                // jeśli użytkownik nie zostanie znaleziony, currentUser pozostanie null
            }
        }
    } catch (Exception e) {
        // Użytkownik niezalogowany lub brak kontekstu uwierzytelnienia
    }
    
    logService.saveLog(
        "INFO",
        "advertisement",
        "Wyświetlenie ogłoszenia: " + ad.getTitle(),
        "ID: " + advertisementId + ", Liczba wyświetleń: " + ad.getViewCount(),
        "AdvertisementService",
        currentUser,
        request != null ? request.getRemoteAddr() : null
    );
}

    public AdvertisementResponseDTO createAdvertisement(CreateAdvertisementDTO createDto, String userEmail) {
        User user = userService.findByEmail(userEmail);
        
        Category category = categoryRepository.findById(createDto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        Location location = null;
        if (createDto.getLocationId() != null) {
            location = locationRepository.findById(createDto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
        } else if (createDto.getRegion() != null && createDto.getCity() != null) {
            location = locationRepository.findByRegionAndCity(createDto.getRegion(), createDto.getCity())
                    .orElseGet(() -> {
                        Location newLocation = new Location();
                        newLocation.setRegion(createDto.getRegion());
                        newLocation.setCity(createDto.getCity());
                        return locationRepository.save(newLocation);
                    });
        }
        
        Advertisement advertisement = new Advertisement();
        advertisement.setTitle(createDto.getTitle());
        advertisement.setDescription(createDto.getDescription());
        advertisement.setPrice(createDto.getPrice());
        advertisement.setCondition(createDto.getCondition());
        advertisement.setUser(user);
        advertisement.setCategory(category);
        advertisement.setLocation(location);
        advertisement.setStatus(AdvertisementStatus.PENDING);
        advertisement.setCreatedAt(LocalDateTime.now());
        advertisement.setSellerType(createDto.getSellerType() != null ? createDto.getSellerType() : "personal");
        
        if ("Smartfony".equals(category.getName())) {
            SmartphoneSpecification spec = new SmartphoneSpecification();
            spec.setBrand(createDto.getBrand());
            spec.setModel(createDto.getModel());
            spec.setColor(createDto.getColor());
            spec.setOsType(createDto.getOsType());
            spec.setOsVersion(createDto.getOsVersion());
            spec.setStorage(createDto.getStorage());
            spec.setRam(createDto.getRam());
            spec.setRearCameras(createDto.getRearCameras());
            spec.setFrontCamera(createDto.getFrontCamera());
            spec.setBatteryCapacity(createDto.getBatteryCapacity());
            spec.setDisplaySize(createDto.getDisplaySize());
            spec.setDisplayTech(createDto.getDisplayTech());
            spec.setWifi(createDto.getWifi());
            spec.setBluetooth(createDto.getBluetooth());
            spec.setIpRating(createDto.getIpRating());
            spec.setFastCharging(createDto.getFastCharging());
            spec.setWirelessCharging(createDto.getWirelessCharging());
            spec.setProcessor(createDto.getProcessor());
            spec.setGpu(createDto.getGpu());
            spec.setScreenResolution(createDto.getScreenResolution());
            spec.setRefreshRate(createDto.getRefreshRate());
            spec.setAdvertisement(advertisement);
            advertisement.setSmartphoneSpecification(spec);
        }
        
        advertisement = advertisementRepository.save(advertisement);
        
        if (createDto.getImageUrls() != null && !createDto.getImageUrls().isEmpty()) {
            List<Image> images = new ArrayList<>();
            for (String imageUrl : createDto.getImageUrls()) {
                Image image = new Image();
                image.setUrl(imageUrl);
                image.setAdvertisement(advertisement);
                images.add(imageRepository.save(image));
            }
            advertisement.setImages(images);
        }
        
        return convertToResponseDTO(advertisement);
    }

    public List<AdvertisementResponseDTO> getAllActiveAdvertisements() {
        return advertisementRepository.findByStatus(AdvertisementStatus.ACTIVE)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdvertisementResponseDTO> getLatestAdvertisements(int limit) {
        return advertisementRepository.findByStatusOrderByCreatedAtDesc(AdvertisementStatus.ACTIVE)
                .stream()
                .limit(limit)
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdvertisementResponseDTO> getAdvertisementsByUser(String userEmail) {
        User user = userService.findByEmail(userEmail);
        return advertisementRepository.findByUser(user)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdvertisementResponseDTO> getAllAdvertisements() {
        return advertisementRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public List<AdvertisementResponseDTO> getAdvertisementsByStatus(String status) {
        AdvertisementStatus advStatus = AdvertisementStatus.valueOf(status);
        return advertisementRepository.findByStatus(advStatus)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public AdvertisementResponseDTO getAdvertisementById(Long id) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        return convertToResponseDTO(advertisement);
    }

    public AdvertisementResponseDTO updateAdvertisementStatus(Long id, String status, String rejectReason, String userEmail) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        User user = userService.findByEmail(userEmail);
        
        // Allow: owner, ADMIN, or STAFF to update status
        if (!advertisement.getUser().getId().equals(user.getId()) && 
            user.getRole() != Role.ADMIN && 
            user.getRole() != Role.STAFF) {
            throw new RuntimeException("Unauthorized to update this advertisement");
        }
        
        advertisement.setStatus(AdvertisementStatus.valueOf(status));
        
        // Jeśli status to REJECTED, ustaw powód odrzucenia
        if ("REJECTED".equals(status) && rejectReason != null && !rejectReason.trim().isEmpty()) {
            advertisement.setRejectReason(rejectReason);
        } else if (!"REJECTED".equals(status)) {
            // Jeśli status zmieniony na inny niż REJECTED, wyczyść powód odrzucenia
            advertisement.setRejectReason(null);
        }
        
        advertisement = advertisementRepository.save(advertisement);
        
        return convertToResponseDTO(advertisement);
    }

    public String saveImage(MultipartFile file) throws IOException {
        // Pobierz oryginalne rozszerzenie pliku
        String originalFilename = file.getOriginalFilename();
        String extension = ".png"; // domyślnie png
        
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        
        String fileName = UUID.randomUUID().toString() + extension;
        Path uploadPath = Paths.get(uploadDir);
        
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes());
        
        return "/uploads/images/" + fileName;
    }

    public List<String> saveImages(MultipartFile[] files) throws IOException {
        List<String> imageUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            String imageUrl = saveImage(file);
            imageUrls.add(imageUrl);
        }
        return imageUrls;
    }

    public List<Advertisement> findByStatus(AdvertisementStatus status) {
        return advertisementRepository.findByStatus(status);
    }

    public AdvertisementResponseDTO updateAdvertisement(Long id, CreateAdvertisementDTO updateDto, String userEmail) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        User user = userService.findByEmail(userEmail);
        
        // Only owner, ADMIN, or STAFF can update
        if (!advertisement.getUser().getId().equals(user.getId()) && 
            user.getRole() != Role.ADMIN && 
            user.getRole() != Role.STAFF) {
            throw new RuntimeException("Unauthorized to update this advertisement");
        }
        
        // Track changes for notifications
        boolean priceChanged = false;
        boolean imagesChanged = false;
        boolean descriptionChanged = false;
        Double oldPrice = advertisement.getPrice();
        int oldImageCount = advertisement.getImages() != null ? advertisement.getImages().size() : 0;
        
        // Check for price change
        if (!advertisement.getPrice().equals(updateDto.getPrice())) {
            priceChanged = true;
        }
        
        // Check for description change
        if (!advertisement.getDescription().equals(updateDto.getDescription())) {
            descriptionChanged = true;
        }
        
        // Update basic fields
        advertisement.setTitle(updateDto.getTitle());
        advertisement.setDescription(updateDto.getDescription());
        advertisement.setPrice(updateDto.getPrice());
        advertisement.setCondition(updateDto.getCondition());
        advertisement.setIncludesCharger(updateDto.getIncludesCharger());
        advertisement.setWarranty(updateDto.getWarranty());
        
        // Update category if changed
        if (updateDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(updateDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            advertisement.setCategory(category);
        }
        
        // Update location if changed
        if (updateDto.getLocationId() != null) {
            Location location = locationRepository.findById(updateDto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            advertisement.setLocation(location);
        }
        
        // Update smartphone specification
        SmartphoneSpecification spec = advertisement.getSmartphoneSpecification();
        if (spec == null) {
            spec = new SmartphoneSpecification();
        }
        spec.setBrand(updateDto.getBrand());
        spec.setModel(updateDto.getModel());
        spec.setColor(updateDto.getColor());
        spec.setOsType(updateDto.getOsType());
        spec.setOsVersion(updateDto.getOsVersion());
        spec.setStorage(updateDto.getStorage());
        spec.setRam(updateDto.getRam());
        spec.setRearCameras(updateDto.getRearCameras());
        spec.setFrontCamera(updateDto.getFrontCamera());
        spec.setBatteryCapacity(updateDto.getBatteryCapacity());
        spec.setDisplaySize(updateDto.getDisplaySize());
        spec.setDisplayTech(updateDto.getDisplayTech());
        spec.setWifi(updateDto.getWifi());
        spec.setBluetooth(updateDto.getBluetooth());
        spec.setIpRating(updateDto.getIpRating());
        spec.setFastCharging(updateDto.getFastCharging());
        spec.setWirelessCharging(updateDto.getWirelessCharging());
        spec.setProcessor(updateDto.getProcessor());
        spec.setGpu(updateDto.getGpu());
        spec.setScreenResolution(updateDto.getScreenResolution());
        spec.setRefreshRate(updateDto.getRefreshRate());
        spec.setAdvertisement(advertisement);
        advertisement.setSmartphoneSpecification(spec);
        
        // Update images if provided
        if (updateDto.getImageUrls() != null && !updateDto.getImageUrls().isEmpty()) {
            int newImageCount = updateDto.getImageUrls().size();
            if (oldImageCount != newImageCount) {
                imagesChanged = true;
            }
            
            // Remove old images
            if (advertisement.getImages() != null) {
                imageRepository.deleteAll(advertisement.getImages());
            }
            
            // Add new images
            List<Image> images = new ArrayList<>();
            for (String url : updateDto.getImageUrls()) {
                Image image = new Image();
                image.setUrl(url);
                image.setAdvertisement(advertisement);
                images.add(imageRepository.save(image));
            }
            advertisement.setImages(images);
        }
        
        advertisement = advertisementRepository.save(advertisement);
        
        // Create notifications for users who favorited this ad
        if (notificationService != null) {
            if (priceChanged) {
                notificationService.createPriceChangeNotification(advertisement, oldPrice, updateDto.getPrice());
            }
            if (imagesChanged) {
                notificationService.createImagesChangedNotification(advertisement);
            }
            if (descriptionChanged) {
                notificationService.createDescriptionChangedNotification(advertisement);
            }
        }
        
        return convertToResponseDTO(advertisement);
    }

    public void deleteAdvertisement(Long id, String userEmail) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        User user = userService.findByEmail(userEmail);
        
        // Only owner, ADMIN, or STAFF can delete
        if (!advertisement.getUser().getId().equals(user.getId()) && 
            user.getRole() != Role.ADMIN && 
            user.getRole() != Role.STAFF) {
            throw new RuntimeException("Unauthorized to delete this advertisement");
        }
        
        // Create notification before deleting
        if (notificationService != null) {
            notificationService.createAdDeletedNotification(advertisement);
        }
        
        advertisementRepository.delete(advertisement);
    }

    public void rejectAdvertisement(Long advertisementId, String reason, String rejectedByUsername) {
        Advertisement advertisement = advertisementRepository.findById(advertisementId)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        advertisement.setStatus(AdvertisementStatus.REJECTED);
        advertisementRepository.save(advertisement);
        
        messageService.sendRejectionMessage(advertisement, reason, rejectedByUsername);
    }

    public void resubmitAdvertisement(Long id, String userEmail) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        User user = userService.findByEmail(userEmail);
        
        if (!advertisement.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to resubmit this advertisement");
        }
        
        if (advertisement.getStatus() != AdvertisementStatus.REJECTED) {
            throw new RuntimeException("Only rejected advertisements can be resubmitted");
        }
        
        advertisement.setStatus(AdvertisementStatus.PENDING);
        advertisementRepository.save(advertisement);
    }

    public Advertisement findById(Long id) {
        return advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
    }

    public Advertisement save(Advertisement advertisement) {
        return advertisementRepository.save(advertisement);
    }

    public AdvertisementResponseDTO convertToResponseDTO(Advertisement advertisement) {
        AdvertisementResponseDTO dto = new AdvertisementResponseDTO();
        dto.setId(advertisement.getId());
        dto.setTitle(advertisement.getTitle());
        dto.setDescription(advertisement.getDescription());
        dto.setPrice(advertisement.getPrice());
        dto.setCondition(advertisement.getCondition());
        dto.setStatus(advertisement.getStatus().toString());
        dto.setCreatedAt(advertisement.getCreatedAt());
        dto.setUpdatedAt(advertisement.getUpdatedAt());
        dto.setViewCount(advertisement.getViewCount());
        
        if (advertisement.getUser() != null) {
            String fullName = advertisement.getUser().getFirstName() + " " + advertisement.getUser().getLastName();
            dto.setUserName(fullName);
        }
        
        if (advertisement.getCategory() != null) {
            dto.setCategoryId(advertisement.getCategory().getId());
            dto.setCategoryName(advertisement.getCategory().getName());
        }
        
        if (advertisement.getLocation() != null) {
            dto.setLocationId(advertisement.getLocation().getId());
            dto.setLocationName(advertisement.getLocation().getCity());
            dto.setLocation(advertisement.getLocation().getCity() + ", " + advertisement.getLocation().getRegion());
            dto.setVoivodeship(advertisement.getLocation().getRegion());
        }
        
        if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
            dto.setImageUrls(advertisement.getImages().stream()
                    .map(Image::getUrl)
                    .collect(Collectors.toList()));
            dto.setImageUrl(advertisement.getImages().get(0).getUrl());
            dto.setImageId(advertisement.getImages().get(0).getId());
        }
        
        // Map additional info
        dto.setIncludesCharger(advertisement.getIncludesCharger());
        dto.setWarranty(advertisement.getWarranty());
        
        if (advertisement.getSmartphoneSpecification() != null) {
            SmartphoneSpecification spec = advertisement.getSmartphoneSpecification();
            AdvertisementResponseDTO.SmartphoneSpecificationDTO specDTO = new AdvertisementResponseDTO.SmartphoneSpecificationDTO();
            specDTO.setBrand(spec.getBrand());
            specDTO.setModel(spec.getModel());
            specDTO.setColor(spec.getColor());
            specDTO.setOsType(spec.getOsType());
            specDTO.setOsVersion(spec.getOsVersion());
            specDTO.setStorage(spec.getStorage());
            specDTO.setRam(spec.getRam());
            specDTO.setRearCameras(spec.getRearCameras());
            specDTO.setFrontCamera(spec.getFrontCamera());
            specDTO.setBatteryCapacity(spec.getBatteryCapacity());
            specDTO.setDisplaySize(spec.getDisplaySize());
            specDTO.setDisplayTech(spec.getDisplayTech());
            specDTO.setWifi(spec.getWifi());
            specDTO.setBluetooth(spec.getBluetooth());
            specDTO.setIpRating(spec.getIpRating());
            specDTO.setFastCharging(spec.getFastCharging());
            specDTO.setWirelessCharging(spec.getWirelessCharging());
            specDTO.setProcessor(spec.getProcessor());
            specDTO.setGpu(spec.getGpu());
            specDTO.setScreenResolution(spec.getScreenResolution());
            specDTO.setRefreshRate(spec.getRefreshRate());
            dto.setSpecification(specDTO);
        }
        
        return dto;
    }

    public Map<String, Long> getUserAdvertisementStats(String userEmail) {
        User user = userService.findByEmail(userEmail);
        
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", advertisementRepository.countByUser(user));
        stats.put("active", advertisementRepository.countByUserAndStatus(user, AdvertisementStatus.ACTIVE));
        stats.put("pending", advertisementRepository.countByUserAndStatus(user, AdvertisementStatus.PENDING));
        stats.put("rejected", advertisementRepository.countByUserAndStatus(user, AdvertisementStatus.REJECTED));
        
        return stats;
    }
}
