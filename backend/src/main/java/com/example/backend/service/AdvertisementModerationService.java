package com.example.backend.service;

import com.example.backend.dto.ModerationResultDTO;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Główny serwis moderacji ogłoszeń łączący moderację obrazów i tekstu
 */
@Service
public class AdvertisementModerationService {

    private final ImageModerationService imageModerationService;
    private final ContentModerationService contentModerationService;

    public AdvertisementModerationService(
            ImageModerationService imageModerationService,
            ContentModerationService contentModerationService) {
        this.imageModerationService = imageModerationService;
        this.contentModerationService = contentModerationService;
    }

    /**
     * Przeprowadza pełną moderację ogłoszenia (obrazy + tekst)
     * 
     * @param title Tytuł ogłoszenia
     * @param description Opis ogłoszenia
     * @param imageUrls Lista URL-i obrazów
     * @return Wynik moderacji
     */
    public ModerationResultDTO moderateAdvertisement(String title, String description, List<String> imageUrls) {
        ModerationResultDTO result = new ModerationResultDTO();
        
        System.out.println("[Moderation] Rozpoczynam moderację ogłoszenia: " + title);
        
        // 1. Moderacja treści tekstowej
        try {
            List<String> textIssues = contentModerationService.moderateText(title, description);
            for (String issue : textIssues) {
                result.addTextIssue(issue);
                System.out.println("[Moderation] Problem z treścią: " + issue);
            }
        } catch (Exception e) {
            System.err.println("[Moderation] Błąd moderacji tekstu: " + e.getMessage());
            // Nie blokujemy przy błędzie technicznym
        }
        
        // 2. Moderacja obrazów
        try {
            List<String> imageIssues = imageModerationService.moderateImages(imageUrls);
            for (String issue : imageIssues) {
                result.addImageIssue(issue);
                System.out.println("[Moderation] Problem ze zdjęciem: " + issue);
            }
        } catch (Exception e) {
            System.err.println("[Moderation] Błąd moderacji obrazów: " + e.getMessage());
            // Nie blokujemy przy błędzie technicznym
        }
        
        // 3. Buduj powód odrzucenia jeśli są problemy
        if (!result.isApproved()) {
            result.buildRejectionReason();
            System.out.println("[Moderation] Ogłoszenie ODRZUCONE: " + result.getRejectionReason());
        } else {
            System.out.println("[Moderation] Ogłoszenie ZATWIERDZONE automatycznie");
        }
        
        return result;
    }
}
