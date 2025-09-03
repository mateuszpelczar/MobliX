package com.example.backend.service;

import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdvertisementService {

    @Autowired
    private AdvertisementRepository advertisementRepository;
    
    @Autowired
    private SmartphoneSpecificationRepository specificationRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private LocationRepository locationRepository;
    
    @Autowired
    private ImageRepository imageRepository;

    @Transactional
    public AdvertisementResponseDTO createAdvertisement(CreateAdvertisementDTO dto, String userEmail) {
        // Znajdź użytkownika
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Znajdź kategorię (jeśli podana)
        Category category = null;
        if (dto.getCategoryId() != null) {
            category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        }
        
        // Znajdź lokalizację (jeśli podana)
        Location location = null;
        if (dto.getLocationId() != null) {
            location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));
        }
        
        // Stwórz ogłoszenie
        Advertisement advertisement = new Advertisement();
        advertisement.setTitle(dto.getTitle());
        advertisement.setDescription(dto.getDescription());
        advertisement.setPrice(dto.getPrice());
        advertisement.setUser(user);
        advertisement.setCategory(category);
        advertisement.setLocation(location);
        
        // Zapisz ogłoszenie
        Advertisement savedAdvertisement = advertisementRepository.save(advertisement);
        
        // Stwórz specyfikację smartfona jeśli podana
        if (dto.getBrand() != null && !dto.getBrand().isEmpty()) {
            SmartphoneSpecification specification = new SmartphoneSpecification();
            specification.setAdvertisement(savedAdvertisement);
            specification.setBrand(dto.getBrand());
            specification.setModel(dto.getModel());
            specification.setColor(dto.getColor());
            specification.setOsType(dto.getOsType());
            specification.setOsVersion(dto.getOsVersion());
            specification.setStorage(dto.getStorage());
            specification.setRam(dto.getRam());
            specification.setRearCameras(dto.getRearCameras());
            specification.setFrontCamera(dto.getFrontCamera());
            specification.setBatteryCapacity(dto.getBatteryCapacity());
            specification.setDisplaySize(dto.getDisplaySize());
            specification.setDisplayTech(dto.getDisplayTech());
            specification.setWifi(dto.getWifi());
            specification.setBluetooth(dto.getBluetooth());
            specification.setIpRating(dto.getIpRating());
            specification.setFastCharging(dto.getFastCharging());
            specification.setWirelessCharging(dto.getWirelessCharging());
            specification.setProcessor(dto.getProcessor());
            specification.setGpu(dto.getGpu());
            specification.setScreenResolution(dto.getScreenResolution());
            specification.setRefreshRate(dto.getRefreshRate());
            
            specificationRepository.save(specification);
        }
        
        // Dodaj zdjęcia jeśli podane
        if (dto.getImageUrls() != null && !dto.getImageUrls().isEmpty()) {
            for (String imageUrl : dto.getImageUrls()) {
                if (imageUrl != null && !imageUrl.isEmpty()) {
                    Image image = new Image();
                    image.setUrl(imageUrl);
                    image.setAdvertisement(savedAdvertisement);
                    imageRepository.save(image);
                }
            }
        }
        
        return convertToResponseDTO(savedAdvertisement);
    }
    
    public List<AdvertisementResponseDTO> getAllAdvertisements() {
        List<Advertisement> advertisements = advertisementRepository.findAll();
        return advertisements.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
    
    public AdvertisementResponseDTO getAdvertisementById(Long id) {
        Advertisement advertisement = advertisementRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        return convertToResponseDTO(advertisement);
    }
    
    public List<AdvertisementResponseDTO> getUserAdvertisements(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        List<Advertisement> advertisements = advertisementRepository.findByUserId(user.getId());
        return advertisements.stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
    
    private AdvertisementResponseDTO convertToResponseDTO(Advertisement advertisement) {
        AdvertisementResponseDTO dto = new AdvertisementResponseDTO();
        dto.setId(advertisement.getId());
        dto.setTitle(advertisement.getTitle());
        dto.setDescription(advertisement.getDescription());
        dto.setPrice(advertisement.getPrice());
        dto.setUserName(advertisement.getUser().getUsername());
        
        if (advertisement.getCategory() != null) {
            dto.setCategoryName(advertisement.getCategory().getName());
        }
        
        if (advertisement.getLocation() != null) {
            dto.setLocationName(advertisement.getLocation().getCity() + ", " + advertisement.getLocation().getRegion());
        }
        
        if (advertisement.getImages() != null && !advertisement.getImages().isEmpty()) {
            List<String> imageUrls = advertisement.getImages().stream()
                .map(Image::getUrl)
                .collect(Collectors.toList());
            dto.setImageUrls(imageUrls);
        }
        
        if (advertisement.getSmartphoneSpecification() != null) {
            SmartphoneSpecification spec = advertisement.getSmartphoneSpecification();
            AdvertisementResponseDTO.SmartphoneSpecificationDTO specDTO = 
                new AdvertisementResponseDTO.SmartphoneSpecificationDTO();
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

    @Transactional
    public void deleteAdvertisement(Long advertisementId, String userEmail) {
        Advertisement advertisement = advertisementRepository.findById(advertisementId)
            .orElseThrow(() -> new RuntimeException("Advertisement not found"));
        
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Sprawdź czy użytkownik jest właścicielem ogłoszenia lub ma rolę ADMIN/STAFF
        if (!advertisement.getUser().getId().equals(user.getId()) && 
            !user.getRole().name().equals("ADMIN") && 
            !user.getRole().name().equals("STAFF")) {
            throw new RuntimeException("You can only delete your own advertisements");
        }
        
        advertisementRepository.delete(advertisement);
    }
}
