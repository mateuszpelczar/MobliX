package com.example.backend.service;

import com.example.backend.dto.ModerationResultDTO;
import org.springframework.stereotype.Service;

import java.util.List;


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

    //moderacja ogłoszenia
    public ModerationResultDTO moderateAdvertisement(String title, String description, List<String> imageUrls) {
        ModerationResultDTO result = new ModerationResultDTO();
        
        System.out.println("[Moderation] Rozpoczynam moderację ogłoszenia: " + title);
        
        //tekst
        try {
            List<String> textIssues = contentModerationService.moderateText(title, description);
            for (String issue : textIssues) {
                result.addTextIssue(issue);
                System.out.println("[Moderation] Problem z treścią: " + issue);
            }
        } catch (Exception e) {
            System.err.println("[Moderation] Błąd moderacji tekstu: " + e.getMessage());
            
        }
        
        //zdjecia
        try {
            List<String> imageIssues = imageModerationService.moderateImages(imageUrls);
            for (String issue : imageIssues) {
                result.addImageIssue(issue);
                System.out.println("[Moderation] Problem ze zdjęciem: " + issue);
            }
        } catch (Exception e) {
            System.err.println("[Moderation] Błąd moderacji obrazów: " + e.getMessage());
           
        }
        
       //powód odrzucenia
        if (!result.isApproved()) {
            result.buildRejectionReason();
            System.out.println("[Moderation] Ogłoszenie ODRZUCONE: " + result.getRejectionReason());
        } else {
            System.out.println("[Moderation] Ogłoszenie ZATWIERDZONE automatycznie");
        }
        
        return result;
    }
}
