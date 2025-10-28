package com.example.backend.service;

import com.example.backend.dto.CreateOpinionDTO;
import com.example.backend.dto.OpinionResponseDTO;
import com.example.backend.dto.RejectOpinionDTO;
import com.example.backend.model.Advertisement;
import com.example.backend.model.Opinion;
import com.example.backend.model.OpinionStatus;
import com.example.backend.model.User;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.OpinionRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OpinionService {

    private final OpinionRepository opinionRepository;
    private final UserRepository userRepository;
    private final AdvertisementRepository advertisementRepository;
    private final LogService logService;

    // Constructor
    public OpinionService(OpinionRepository opinionRepository, 
                         UserRepository userRepository,
                         AdvertisementRepository advertisementRepository,
                         LogService logService) {
        this.opinionRepository = opinionRepository;
        this.userRepository = userRepository;
        this.advertisementRepository = advertisementRepository;
        this.logService = logService;
    }

    @Transactional
    public OpinionResponseDTO createOpinion(CreateOpinionDTO dto, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Advertisement advertisement = advertisementRepository.findById(dto.getAdvertisementId())
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        // Sprawdź czy użytkownik już wystawił opinię dla tego ogłoszenia (niezależnie od statusu)
        if (opinionRepository.existsByUserIdAndAdvertisementIdAndStatus(
                user.getId(), dto.getAdvertisementId(), OpinionStatus.APPROVED) ||
            opinionRepository.existsByUserIdAndAdvertisementIdAndStatus(
                user.getId(), dto.getAdvertisementId(), OpinionStatus.PENDING)) {
            throw new RuntimeException("You have already submitted an opinion for this advertisement");
        }

        Opinion opinion = new Opinion();
        opinion.setUserId(user.getId());
        opinion.setAdvertisementId(dto.getAdvertisementId());
        opinion.setUserName(user.getEmail());
        opinion.setRating(dto.getRating());
        opinion.setComment(dto.getComment());
        opinion.setStatus(OpinionStatus.PENDING);

        Opinion saved = opinionRepository.save(opinion);

        logService.logUserActivity(user, "Dodano opinie z ocena " + saved.getRating() + "/5", "opinionId: " + saved.getId() + ",advertisementId: " + advertisement.getId() + ",rating:" + saved.getRating());

        return mapToDTO(saved, advertisement.getTitle());
    }

    public List<OpinionResponseDTO> getApprovedOpinionsByAdvertisement(Long advertisementId) {
        Advertisement advertisement = advertisementRepository.findById(advertisementId)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        return opinionRepository.findByAdvertisementIdAndStatus(advertisementId, OpinionStatus.APPROVED)
                .stream()
                .map(opinion -> mapToDTO(opinion, advertisement.getTitle()))
                .collect(Collectors.toList());
    }

    public List<OpinionResponseDTO> getUserOpinions(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return opinionRepository.findByUserId(user.getId())
                .stream()
                .map(opinion -> {
                    String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                            .map(Advertisement::getTitle)
                            .orElse("Unknown");
                    return mapToDTO(opinion, adTitle);
                })
                .collect(Collectors.toList());
    }

    public List<OpinionResponseDTO> getUserOpinionsByStatus(String userEmail, OpinionStatus status) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return opinionRepository.findByUserIdAndStatus(user.getId(), status)
                .stream()
                .map(opinion -> {
                    String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                            .map(Advertisement::getTitle)
                            .orElse("Unknown");
                    return mapToDTO(opinion, adTitle);
                })
                .collect(Collectors.toList());
    }

    public List<OpinionResponseDTO> getPendingOpinions() {
        return opinionRepository.findByStatus(OpinionStatus.PENDING)
                .stream()
                .map(opinion -> {
                    String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                            .map(Advertisement::getTitle)
                            .orElse("Unknown");
                    return mapToDTO(opinion, adTitle);
                })
                .collect(Collectors.toList());
    }

    public List<OpinionResponseDTO> getOpinionsByStatus(OpinionStatus status) {
        return opinionRepository.findByStatus(status)
                .stream()
                .map(opinion -> {
                    String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                            .map(Advertisement::getTitle)
                            .orElse("Unknown");
                    return mapToDTO(opinion, adTitle);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public OpinionResponseDTO approveOpinion(Long opinionId) {
        Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new RuntimeException("Opinion not found"));

        if (opinion.getStatus() != OpinionStatus.PENDING) {
            throw new RuntimeException("Only pending opinions can be approved");
        }

        opinion.setStatus(OpinionStatus.APPROVED);
        opinion.setRejectionReason(null);
        Opinion saved = opinionRepository.save(opinion);

        String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                .map(Advertisement::getTitle)
                .orElse("Unknown");

        return mapToDTO(saved, adTitle);
    }

    @Transactional
    public OpinionResponseDTO rejectOpinion(Long opinionId, RejectOpinionDTO dto) {
        Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new RuntimeException("Opinion not found"));

        // Pozwól odrzucić opinie PENDING lub APPROVED (np. jeśli użytkownik edytował opinię)
        if (opinion.getStatus() != OpinionStatus.PENDING && opinion.getStatus() != OpinionStatus.APPROVED) {
            throw new RuntimeException("Only pending or approved opinions can be rejected");
        }

        opinion.setStatus(OpinionStatus.REJECTED);
        opinion.setRejectionReason(dto.getRejectionReason());
        Opinion saved = opinionRepository.save(opinion);

        String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                .map(Advertisement::getTitle)
                .orElse("Unknown");

        return mapToDTO(saved, adTitle);
    }

    private OpinionResponseDTO mapToDTO(Opinion opinion, String advertisementTitle) {
        OpinionResponseDTO dto = new OpinionResponseDTO();
        dto.setId(opinion.getId());
        dto.setUserId(opinion.getUserId());
        dto.setAdvertisementId(opinion.getAdvertisementId());
        dto.setUserName(opinion.getUserName());
        dto.setRating(opinion.getRating());
        dto.setComment(opinion.getComment());
        dto.setStatus(opinion.getStatus());
        dto.setRejectionReason(opinion.getRejectionReason());
        dto.setCreatedAt(opinion.getCreatedAt());
        dto.setUpdatedAt(opinion.getUpdatedAt());
        dto.setAdvertisementTitle(advertisementTitle);
        
        // Dodaj status ogłoszenia
        String advertisementStatus = advertisementRepository.findById(opinion.getAdvertisementId())
                .map(ad -> ad.getStatus() != null ? ad.getStatus().toString() : "UNKNOWN")
                .orElse("DELETED");
        dto.setAdvertisementStatus(advertisementStatus);
        
        return dto;
    }

    @Transactional
    public OpinionResponseDTO updateOpinion(Long opinionId, CreateOpinionDTO dto, String userEmail) {
        Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new RuntimeException("Opinion not found"));
        
        // Sprawdź czy użytkownik jest właścicielem opinii
        if (!opinion.getUserName().equals(userEmail)) {
            throw new RuntimeException("You can only edit your own opinions");
        }
        
        // Walidacja danych
        if (dto.getComment() == null || dto.getComment().trim().length() < 10) {
            throw new RuntimeException("Comment must be at least 10 characters long");
        }
        
        if (dto.getComment().trim().length() > 1000) {
            throw new RuntimeException("Comment must not exceed 1000 characters");
        }
        
        if (dto.getRating() < 1 || dto.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }
        
        // Zaktualizuj opinię
        opinion.setRating(dto.getRating());
        opinion.setComment(dto.getComment().trim());
        opinion.setStatus(OpinionStatus.PENDING); // Po edycji wymaga ponownej moderacji
        opinion.setRejectionReason(null); // Wyczyść poprzedni powód odrzucenia
        opinion.setUpdatedAt(LocalDateTime.now());
        
        Opinion saved = opinionRepository.save(opinion);
        
        // Pobierz tytuł ogłoszenia
        String adTitle = advertisementRepository.findById(saved.getAdvertisementId())
                .map(Advertisement::getTitle)
                .orElse("Deleted Advertisement");
        
        return mapToDTO(saved, adTitle);
    }

    @Transactional
    public void deleteOpinion(Long opinionId, String userEmail) {
        Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new RuntimeException("Opinion not found"));
        
        // Sprawdź czy użytkownik jest właścicielem opinii
        if (!opinion.getUserName().equals(userEmail)) {
            throw new RuntimeException("You can only delete your own opinions");
        }
        
        opinionRepository.delete(opinion);
    }

    public List<OpinionResponseDTO> getOpinionsForUserAdvertisements(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Znajdź wszystkie ogłoszenia użytkownika
        List<Advertisement> userAds = advertisementRepository.findByUserId(user.getId());
        
        // Zbierz ID wszystkich ogłoszeń użytkownika
        List<Long> adIds = userAds.stream()
                .map(Advertisement::getId)
                .collect(Collectors.toList());
        
        if (adIds.isEmpty()) {
            return List.of();
        }
        
        // Znajdź wszystkie zatwierdzone opinie dla tych ogłoszeń
        return opinionRepository.findByAdvertisementIdInAndStatus(adIds, OpinionStatus.APPROVED)
                .stream()
                .map(opinion -> {
                    String adTitle = advertisementRepository.findById(opinion.getAdvertisementId())
                            .map(Advertisement::getTitle)
                            .orElse("Unknown");
                    return mapToDTO(opinion, adTitle);
                })
                .collect(Collectors.toList());
    }
}

