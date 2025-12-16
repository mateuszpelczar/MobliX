package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.SellerInfoDTO;
import com.example.backend.model.*;
import com.example.backend.others.AdvertisementStatus;
import com.example.backend.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.dao.DataIntegrityViolationException;

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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import com.example.backend.dto.ModerationResultDTO;

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
    private final UserRepository userRepository;
    private final FavoriteAdRepository favoriteAdRepository;
    private final NotificationRepository notificationRepository;
    private final AdvertisementReportRepository advertisementReportRepository;
    private AdvertisementModerationService advertisementModerationService;
    
    @Value("${aws.moderation.enabled:false}")
    private boolean moderationEnabled;
    
    @PersistenceContext
    private EntityManager entityManager;
    

    @Value("${file.upload-dir}")
    private String uploadDir;

    public AdvertisementService(AdvertisementRepository advertisementRepository,
                                UserService userService,
                                CategoryRepository categoryRepository,
                                LocationRepository locationRepository,
                                ImageRepository imageRepository,
                                MessageService messageService,
                                LogService logService,
                                UserRepository userRepository,
                                FavoriteAdRepository favoriteAdRepository,
                                NotificationRepository notificationRepository,
                                MessageRepository messageRepository,
                                ConversationRepository conversationRepository,
                                AdvertisementReportRepository advertisementReportRepository) {
        this.advertisementRepository = advertisementRepository;
        this.userService = userService;
        this.categoryRepository = categoryRepository;
        this.locationRepository = locationRepository;
        this.imageRepository = imageRepository;
        this.messageService = messageService;
        this.logService = logService;
        this.userRepository = userRepository;
        this.favoriteAdRepository = favoriteAdRepository;
        this.notificationRepository = notificationRepository;
        this.advertisementReportRepository = advertisementReportRepository;
    }

    
    @org.springframework.beans.factory.annotation.Autowired
    public void setNotificationService(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @org.springframework.beans.factory.annotation.Autowired
    public void setAdvertisementModerationService(AdvertisementModerationService advertisementModerationService) {
        this.advertisementModerationService = advertisementModerationService;
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
                
            }
        }
    } catch (Exception e) {
        // Użytkownik niezalogowany lub brak kontekstu uwierzytelnienia
    }
    
   
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
        advertisement.setWarranty(createDto.getWarranty());
        advertisement.setIncludesCharger(createDto.getIncludesCharger());
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

        // Automatyczna moderacja AWS (Rekognition + Comprehend)
        if (moderationEnabled && advertisementModerationService != null) {
            try {
                List<String> imageUrls = createDto.getImageUrls() != null ? createDto.getImageUrls() : new ArrayList<>();
                ModerationResultDTO moderationResult = advertisementModerationService.moderateAdvertisement(
                    createDto.getTitle(),
                    createDto.getDescription(),
                    imageUrls
                );
                
                if (moderationResult.isApproved()) {
                    // Automatyczne zatwierdzenie - ogłoszenie przeszło moderację
                    advertisement.setStatus(AdvertisementStatus.ACTIVE);
                    advertisement.setRejectReason(null);
                    logService.logUserActivity(user, 
                        "Ogłoszenie automatycznie zatwierdzone przez moderację AI: " + advertisement.getTitle(), 
                        "advertisementId:" + advertisement.getId());
                } else {
                    // Automatyczne odrzucenie - wykryto problemy
                    advertisement.setStatus(AdvertisementStatus.REJECTED);
                    advertisement.setRejectReason(moderationResult.getRejectionReason());
                    
                    // Powiadomienie użytkownika o odrzuceniu
                    if (notificationService != null) {
                        notificationService.createAdvertisementRejectedNotification(
                            user,
                            advertisement.getTitle(),
                            moderationResult.getRejectionReason()
                        );
                    }
                    
                    logService.logUserActivity(user, 
                        "Ogłoszenie automatycznie odrzucone przez moderację AI: " + advertisement.getTitle() + 
                        ", Powód: " + moderationResult.getRejectionReason(), 
                        "advertisementId:" + advertisement.getId());
                }
                advertisement = advertisementRepository.save(advertisement);
            } catch (Exception e) {
                // W przypadku błędu moderacji - ogłoszenie pozostaje PENDING (ręczna weryfikacja)
                logService.logUserActivity(user, 
                    "Błąd automatycznej moderacji, ogłoszenie wymaga ręcznej weryfikacji: " + e.getMessage(), 
                    "advertisementId:" + advertisement.getId());
                System.err.println("[Moderation] Błąd moderacji ogłoszenia ID " + advertisement.getId() + ": " + e.getMessage());
            }
        }
      
         logService.logUserActivity(user, 
        "Utworzono ogłoszenie: " + advertisement.getTitle(), 
        "advertisementId:" + advertisement.getId());

        // PostgreSQL search - sugestie pobierane bezpośrednio z bazy (nie wymaga indeksacji)

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
        
       
        if (!advertisement.getUser().getId().equals(user.getId()) && 
            user.getRole() != Role.ADMIN && 
            user.getRole() != Role.STAFF) {
            throw new RuntimeException("Unauthorized to update this advertisement");
        }
        
        advertisement.setStatus(AdvertisementStatus.valueOf(status));
       
        if ("REJECTED".equals(status) && rejectReason != null && !rejectReason.trim().isEmpty()) {
            advertisement.setRejectReason(rejectReason);

            if (notificationService != null) {
            notificationService.createAdvertisementRejectedNotification(
                advertisement.getUser(), 
                advertisement.getTitle(), 
                rejectReason
            );
        }

        } else if (!"REJECTED".equals(status)) {
            
            advertisement.setRejectReason(null);
        }
        
        advertisement = advertisementRepository.save(advertisement);
        
        return convertToResponseDTO(advertisement);
    }

    public String saveImage(MultipartFile file) throws IOException {
       
        String originalFilename = file.getOriginalFilename();
        String extension = ".png"; 
        
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

    // Helper: delete a stored image file given its stored URL (e.g. "/uploads/images/uuid.jpg" or "uploads/images/uuid.jpg")
    private void deleteImageFileByUrl(String url) {
        if (url == null || url.trim().isEmpty()) return;
        try {
            String normalized = url;
            if (normalized.startsWith("/")) normalized = normalized.substring(1);
            // Expecting uploads/images/<filename>
            if (normalized.startsWith("uploads/images/")) {
                String filename = normalized.substring("uploads/images/".length());
                Path filePath = Paths.get(uploadDir).resolve(filename);
                try {
                    Files.deleteIfExists(filePath);
                } catch (Exception e) {
                    // swallow: don't fail delete flow because file removal failed
                    System.err.println("Failed to delete image file: " + filePath + "; " + e.getMessage());
                }
            } else {
                // If url was stored differently, try to extract filename and delete
                Path filePath = Paths.get(uploadDir).resolve(Paths.get(normalized).getFileName());
                try {
                    Files.deleteIfExists(filePath);
                } catch (Exception e) {
                    System.err.println("Failed to delete image file fallback: " + filePath + "; " + e.getMessage());
                }
            }
        } catch (Exception ignored) {}
    }

    
    private String normalizeString(String s) {
        if (s == null) return "";
        return s.replaceAll("\\s+", " ").trim();
    }

    private boolean listsEqualAsStrings(List<String> a, List<String> b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        if (a.size() != b.size()) return false;
        for (int i = 0; i < a.size(); i++) {
            if (!String.valueOf(a.get(i)).equals(String.valueOf(b.get(i)))) return false;
        }
        return true;
    }

    public AdvertisementResponseDTO updateAdvertisement(Long id, CreateAdvertisementDTO updateDto, String userEmail) {
        Advertisement advertisement = advertisementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        User user = userService.findByEmail(userEmail);
        
      
        if (!advertisement.getUser().getId().equals(user.getId()) && 
            user.getRole() != Role.ADMIN && 
            user.getRole() != Role.STAFF) {
            throw new RuntimeException("Unauthorized to update this advertisement");
        }
        
      
        boolean priceChanged = false;
        boolean imagesChanged = false;
        boolean descriptionChanged = false;
        boolean titleChanged = false;
        boolean specChanged = false;
        Double oldPrice = advertisement.getPrice();
        int oldImageCount = advertisement.getImages() != null ? advertisement.getImages().size() : 0;
        
       
        if (!normalizeString(advertisement.getTitle()).equals(normalizeString(updateDto.getTitle()))) {
            titleChanged = true;
        }
      
        Double newPrice = updateDto.getPrice() == null ? 0.0 : updateDto.getPrice();
        Double oldPriceSafe = advertisement.getPrice() == null ? 0.0 : advertisement.getPrice();
        if (!oldPriceSafe.equals(newPrice)) {
            priceChanged = true;
        }
      
        if (!normalizeString(advertisement.getDescription()).equals(normalizeString(updateDto.getDescription()))) {
            descriptionChanged = true;
        }
        
        boolean categoryChanged = false;
        if (updateDto.getCategoryId() != null && advertisement.getCategory() != null) {
            if (!updateDto.getCategoryId().equals(advertisement.getCategory().getId())) {
                categoryChanged = true;
            }
        } else if ((updateDto.getCategoryId() == null && advertisement.getCategory() != null) ||
                   (updateDto.getCategoryId() != null && advertisement.getCategory() == null)) {
            categoryChanged = true;
        }
        
      
        boolean locationChanged = false;
        if (updateDto.getLocationId() != null && advertisement.getLocation() != null) {
            if (!updateDto.getLocationId().equals(advertisement.getLocation().getId())) {
                locationChanged = true;
            }
        } else if ((updateDto.getLocationId() == null && advertisement.getLocation() != null) ||
                   (updateDto.getLocationId() != null && advertisement.getLocation() == null)) {
            locationChanged = true;
        }
        
       
        SmartphoneSpecification spec = advertisement.getSmartphoneSpecification();
        if (spec != null) {
            if (!normalizeString(spec.getBrand()).equals(normalizeString(updateDto.getBrand()))
                || !normalizeString(spec.getModel()).equals(normalizeString(updateDto.getModel()))
                || !normalizeString(spec.getColor()).equals(normalizeString(updateDto.getColor()))
            ) {
                specChanged = true;
            }
        } else {
           
            if (updateDto.getBrand() != null || updateDto.getModel() != null || updateDto.getColor() != null) {
                specChanged = true;
            }
        }
        
       
        List<String> incomingImageUrls = updateDto.getImageUrls();
        List<String> currentImageUrls = advertisement.getImages() != null ? advertisement.getImages().stream().map(Image::getUrl).collect(Collectors.toList()) : null;
        if (incomingImageUrls != null) {
            if (!listsEqualAsStrings(currentImageUrls, incomingImageUrls)) {
                imagesChanged = true;
            }
        }
        
    
        boolean meaningfulChange = titleChanged || priceChanged || descriptionChanged || imagesChanged || categoryChanged || locationChanged || specChanged;
        
       
        advertisement.setTitle(updateDto.getTitle());
        advertisement.setDescription(updateDto.getDescription());
        advertisement.setPrice(updateDto.getPrice());
        advertisement.setCondition(updateDto.getCondition());
        advertisement.setIncludesCharger(updateDto.getIncludesCharger());
        advertisement.setWarranty(updateDto.getWarranty());
        
        
        if (updateDto.getCategoryId() != null) {
            Category category = categoryRepository.findById(updateDto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found"));
            advertisement.setCategory(category);
        }
        
       
        if (updateDto.getLocationId() != null) {
            Location location = locationRepository.findById(updateDto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));
            advertisement.setLocation(location);
        }
        
     
        if (advertisement.getSmartphoneSpecification() == null) {
            advertisement.setSmartphoneSpecification(new SmartphoneSpecification());
        }
        SmartphoneSpecification specToSet = advertisement.getSmartphoneSpecification();
        specToSet.setBrand(updateDto.getBrand());
        specToSet.setModel(updateDto.getModel());
        specToSet.setColor(updateDto.getColor());
        specToSet.setOsType(updateDto.getOsType());
        specToSet.setOsVersion(updateDto.getOsVersion());
        specToSet.setStorage(updateDto.getStorage());
        specToSet.setRam(updateDto.getRam());
        specToSet.setRearCameras(updateDto.getRearCameras());
        specToSet.setFrontCamera(updateDto.getFrontCamera());
        specToSet.setBatteryCapacity(updateDto.getBatteryCapacity());
        specToSet.setDisplaySize(updateDto.getDisplaySize());
        specToSet.setDisplayTech(updateDto.getDisplayTech());
        specToSet.setWifi(updateDto.getWifi());
        specToSet.setBluetooth(updateDto.getBluetooth());
        specToSet.setIpRating(updateDto.getIpRating());
        specToSet.setFastCharging(updateDto.getFastCharging());
        specToSet.setWirelessCharging(updateDto.getWirelessCharging());
        specToSet.setProcessor(updateDto.getProcessor());
        specToSet.setGpu(updateDto.getGpu());
        specToSet.setScreenResolution(updateDto.getScreenResolution());
        specToSet.setRefreshRate(updateDto.getRefreshRate());
        specToSet.setAdvertisement(advertisement);
        advertisement.setSmartphoneSpecification(specToSet);
        
       
        if (updateDto.getImageUrls() != null && !updateDto.getImageUrls().isEmpty()) {
            int newImageCount = updateDto.getImageUrls().size();
            if (oldImageCount != newImageCount) {
                imagesChanged = true;
            }
            
      
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                for (com.example.backend.model.Image img : advertisement.getImages()) {
                    try { deleteImageFileByUrl(img.getUrl()); } catch (Exception ignored) {}
                }
                imageRepository.deleteAll(advertisement.getImages());
                advertisement.getImages().clear();
            }
            
        
            List<Image> images = new ArrayList<>();
            for (String url : updateDto.getImageUrls()) {
                Image image = new Image();
                image.setUrl(url);
                image.setAdvertisement(advertisement);
                images.add(imageRepository.save(image));
            }
            advertisement.setImages(images);
        }
        
      
        if (meaningfulChange) {
            // Automatyczna moderacja AWS przy zmianie (Rekognition + Comprehend)
            if (moderationEnabled && advertisementModerationService != null) {
                try {
                    List<String> imageUrls = updateDto.getImageUrls() != null ? updateDto.getImageUrls() : new ArrayList<>();
                    ModerationResultDTO moderationResult = advertisementModerationService.moderateAdvertisement(
                        updateDto.getTitle(),
                        updateDto.getDescription(),
                        imageUrls
                    );
                    
                    if (moderationResult.isApproved()) {
                        // Automatyczne zatwierdzenie po aktualizacji
                        advertisement.setStatus(AdvertisementStatus.ACTIVE);
                        advertisement.setRejectReason(null);
                        logService.logUserActivity(user, 
                            "Zaktualizowane ogłoszenie automatycznie zatwierdzone przez moderację AI: " + advertisement.getTitle(), 
                            "advertisementId:" + advertisement.getId());
                    } else {
                        // Automatyczne odrzucenie - wykryto problemy
                        advertisement.setStatus(AdvertisementStatus.REJECTED);
                        advertisement.setRejectReason(moderationResult.getRejectionReason());
                        
                        // Powiadomienie użytkownika o odrzuceniu
                        if (notificationService != null) {
                            notificationService.createAdvertisementRejectedNotification(
                                user,
                                advertisement.getTitle(),
                                moderationResult.getRejectionReason()
                            );
                        }
                        
                        logService.logUserActivity(user, 
                            "Zaktualizowane ogłoszenie automatycznie odrzucone przez moderację AI: " + advertisement.getTitle() + 
                            ", Powód: " + moderationResult.getRejectionReason(), 
                            "advertisementId:" + advertisement.getId());
                    }
                } catch (Exception e) {
                    // W przypadku błędu moderacji - ogłoszenie pozostaje PENDING
                    advertisement.setStatus(AdvertisementStatus.PENDING);
                    logService.logUserActivity(user, 
                        "Błąd moderacji aktualizacji, ogłoszenie wymaga ręcznej weryfikacji: " + e.getMessage(), 
                        "advertisementId:" + advertisement.getId());
                }
            } else {
                // Brak moderacji - status PENDING jak wcześniej
                if (advertisement.getStatus() != AdvertisementStatus.PENDING) {
                    advertisement.setStatus(AdvertisementStatus.PENDING);
                }
            }
        } 
        
        advertisement = advertisementRepository.save(advertisement);

        logService.logUserActivity(user, "Zaktualizowano ogloszenie: " + advertisement.getTitle(), "advertisementId:" + advertisement.getId());
        
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
        
    
        boolean isOwner = advertisement.getUser().getId().equals(user.getId());
        boolean isAdminOrStaff = user.getRole() == Role.ADMIN || user.getRole() == Role.STAFF;

        if (!isOwner && !isAdminOrStaff) {
            throw new RuntimeException("Unauthorized to delete this advertisement");
        }

        if (isOwner && !isAdminOrStaff) {
        
            if (!(advertisement.getStatus() == AdvertisementStatus.PENDING
                    || advertisement.getStatus() == AdvertisementStatus.ACTIVE
                    || advertisement.getStatus() == AdvertisementStatus.SOLD)) {
                throw new RuntimeException("Użytkownik może usuwać jedynie ogłoszenia o statusie Oczekujące, Aktywne lub Sprzedane");
            }
        }
        
     
        final List<Long> favoriteUserIds = new java.util.ArrayList<>();
        final String advertisementTitle = advertisement.getTitle();
        if (favoriteAdRepository != null) {
            try {
                List<com.example.backend.model.FavoriteAd> favs = favoriteAdRepository.findByAdvertisement(advertisement);
                for (com.example.backend.model.FavoriteAd f : favs) {
                    if (f.getUser() != null && f.getUser().getId() != null) {
                        favoriteUserIds.add(f.getUser().getId());
                    }
                }
            } catch (Exception ignored) {}
        }

        if (notificationService != null && !favoriteUserIds.isEmpty()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(
                new org.springframework.transaction.support.TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        try {
                            notificationService.createAdDeletedNotificationForUserIds(favoriteUserIds, advertisementTitle);
                        } catch (Exception e) {
                            // swallow to avoid affecting commit flow; logging could be added
                            System.err.println("Failed to create post-commit ad-deleted notifications: " + e.getMessage());
                        }
                    }
                }
            );
        }
        
       try {
            
            // 3) Usuń powiadomienia, ulubione
            if (notificationRepository != null) {
                try { notificationRepository.deleteByAdvertisementId(id); } catch (Exception ignored) {}
            }
            if (favoriteAdRepository != null) {
                try { favoriteAdRepository.deleteByAdvertisementId(id); } catch (Exception ignored) {}
            }

            // 3.1) Usuń zgloszenia powiazane z ogloszeniem (zgloszone_ogloszenia)
            if (advertisementReportRepository != null) {
                try { advertisementReportRepository.deleteByAdvertisementId(id); } catch (Exception ignored) {}
            }
            // 4) Usuń obrazy (jeśli nie są kaskadowo usuwane) — usuń najpierw pliki z dysku, potem rekordy w DB
            if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
                for (com.example.backend.model.Image img : advertisement.getImages()) {
                    try { deleteImageFileByUrl(img.getUrl()); } catch (Exception ignored) {}
                }
                try { imageRepository.deleteAll(advertisement.getImages()); } catch (Exception ignored) {}
            }

            try {
                if (entityManager != null) {
                    entityManager.flush();
                    entityManager.clear();
                }
            } catch (Exception ignored) {}

            
            Advertisement toDelete = advertisementRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Advertisement not found"));
            advertisementRepository.delete(toDelete);

            logService.logUserActivity(user, "Usunieto ogloszenie: " + advertisement.getTitle(), "advertisementId:" + id);
        } catch (DataIntegrityViolationException dive) {
            throw new RuntimeException("Nie można usunąć ogłoszenia z powodu powiązanych rekordów w bazie danych. Spróbuj usunąć powiązane dane lub skontaktuj się z administratorem.");
        } catch (Exception e) {
            throw e;
        }
    }

    //metoda ktora sumuje wszystkie aktywne ogloszenia danego uzytkownika
    public long getTotalViewsForActiveAds(String email){
        User user = userRepository.findByEmail(email)
        .orElseThrow(() -> new RuntimeException("User not found"));
             

        List<Advertisement> activeAds = advertisementRepository.findByUserAndStatus(user, AdvertisementStatus.ACTIVE);

        return activeAds.stream()
                .mapToLong(ad -> ad.getViewCount() != null ? ad.getViewCount() : 0)
                .sum();
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