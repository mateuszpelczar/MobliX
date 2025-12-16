package com.example.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.rekognition.RekognitionClient;
import software.amazon.awssdk.services.rekognition.model.*;
import software.amazon.awssdk.core.SdkBytes;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Serwis do moderacji obrazów przy użyciu Amazon Rekognition
 * Wykrywa niepożądane treści: nagość, przemoc, itp.
 */
@Service
public class ImageModerationService {

    private final RekognitionClient rekognitionClient;
    private final boolean moderationEnabled;
    private final float minConfidence;
    
    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    // Mapowanie kategorii Rekognition na polskie opisy
    private static final Map<String, String> CATEGORY_TRANSLATIONS = new HashMap<>();
    
    static {
        CATEGORY_TRANSLATIONS.put("Explicit Nudity", "nagość");
        CATEGORY_TRANSLATIONS.put("Nudity", "nagość");
        CATEGORY_TRANSLATIONS.put("Graphic Male Nudity", "męska nagość");
        CATEGORY_TRANSLATIONS.put("Graphic Female Nudity", "kobieca nagość");
        CATEGORY_TRANSLATIONS.put("Sexual Activity", "treści seksualne");
        CATEGORY_TRANSLATIONS.put("Illustrated Explicit Nudity", "ilustrowana nagość");
        CATEGORY_TRANSLATIONS.put("Adult Toys", "zabawki dla dorosłych");
        CATEGORY_TRANSLATIONS.put("Suggestive", "sugestywne treści");
        CATEGORY_TRANSLATIONS.put("Female Swimwear Or Underwear", "damska bielizna");
        CATEGORY_TRANSLATIONS.put("Male Swimwear Or Underwear", "męska bielizna");
        CATEGORY_TRANSLATIONS.put("Partial Nudity", "częściowa nagość");
        CATEGORY_TRANSLATIONS.put("Barechested Male", "obnażony tors męski");
        CATEGORY_TRANSLATIONS.put("Revealing Clothes", "odsłaniająca odzież");
        CATEGORY_TRANSLATIONS.put("Sexual Situations", "sytuacje seksualne");
        CATEGORY_TRANSLATIONS.put("Violence", "przemoc");
        CATEGORY_TRANSLATIONS.put("Graphic Violence Or Gore", "drastyczna przemoc");
        CATEGORY_TRANSLATIONS.put("Physical Violence", "przemoc fizyczna");
        CATEGORY_TRANSLATIONS.put("Weapon Violence", "przemoc z użyciem broni");
        CATEGORY_TRANSLATIONS.put("Weapons", "broń");
        CATEGORY_TRANSLATIONS.put("Self Injury", "samookaleczenie");
        CATEGORY_TRANSLATIONS.put("Emaciated Bodies", "wychudzone ciała");
        CATEGORY_TRANSLATIONS.put("Corpses", "zwłoki");
        CATEGORY_TRANSLATIONS.put("Hanging", "powieszenie");
        CATEGORY_TRANSLATIONS.put("Air Crash", "katastrofa lotnicza");
        CATEGORY_TRANSLATIONS.put("Explosions And Blasts", "wybuchy");
        CATEGORY_TRANSLATIONS.put("Visually Disturbing", "niepokojące wizualnie");
        CATEGORY_TRANSLATIONS.put("Drug Products", "narkotyki");
        CATEGORY_TRANSLATIONS.put("Drug Use", "używanie narkotyków");
        CATEGORY_TRANSLATIONS.put("Pills", "tabletki/leki");
        CATEGORY_TRANSLATIONS.put("Drug Paraphernalia", "akcesoria narkotykowe");
        CATEGORY_TRANSLATIONS.put("Tobacco", "tytoń");
        CATEGORY_TRANSLATIONS.put("Tobacco Products", "produkty tytoniowe");
        CATEGORY_TRANSLATIONS.put("Smoking", "palenie");
        CATEGORY_TRANSLATIONS.put("Drinking", "picie alkoholu");
        CATEGORY_TRANSLATIONS.put("Alcoholic Beverages", "napoje alkoholowe");
        CATEGORY_TRANSLATIONS.put("Gambling", "hazard");
        CATEGORY_TRANSLATIONS.put("Nazi Party", "symbole nazistowskie");
        CATEGORY_TRANSLATIONS.put("White Supremacy", "supremacja białych");
        CATEGORY_TRANSLATIONS.put("Extremist", "treści ekstremistyczne");
        CATEGORY_TRANSLATIONS.put("Hate Symbols", "symbole nienawiści");
        CATEGORY_TRANSLATIONS.put("Rude Gestures", "wulgarne gesty");
        CATEGORY_TRANSLATIONS.put("Middle Finger", "środkowy palec");
    }

    // Kategorie do blokowania (wysokie ryzyko)
    private static final List<String> BLOCKED_CATEGORIES = List.of(
        "Explicit Nudity", "Nudity", "Graphic Male Nudity", "Graphic Female Nudity",
        "Sexual Activity", "Illustrated Explicit Nudity", "Adult Toys",
        "Violence", "Graphic Violence Or Gore", "Physical Violence", "Weapon Violence",
        "Self Injury", "Corpses", "Hanging",
        "Drug Products", "Drug Use", "Drug Paraphernalia",
        "Nazi Party", "White Supremacy", "Extremist", "Hate Symbols"
    );

    public ImageModerationService(
            RekognitionClient rekognitionClient,
            @Value("${aws.moderation.enabled:true}") boolean moderationEnabled,
            @Value("${aws.rekognition.min-confidence:75.0}") float minConfidence) {
        this.rekognitionClient = rekognitionClient;
        this.moderationEnabled = moderationEnabled;
        this.minConfidence = minConfidence;
    }

    /**
     * Moderuje listę obrazów i zwraca listę wykrytych problemów
     * @param imageUrls Lista URL-i obrazów (np. "/uploads/images/uuid.png")
     * @return Lista wykrytych problemów (pusta jeśli wszystko OK)
     */
    public List<String> moderateImages(List<String> imageUrls) {
        List<String> issues = new ArrayList<>();
        
        if (!moderationEnabled) {
            System.out.println("[ImageModeration] Moderacja obrazów wyłączona");
            return issues;
        }
        
        if (imageUrls == null || imageUrls.isEmpty()) {
            return issues;
        }
        
        for (String imageUrl : imageUrls) {
            try {
                List<String> imageIssues = moderateSingleImage(imageUrl);
                issues.addAll(imageIssues);
            } catch (Exception e) {
                System.err.println("[ImageModeration] Błąd moderacji obrazu " + imageUrl + ": " + e.getMessage());
                // Nie blokujemy ogłoszenia przy błędzie technicznym
            }
        }
        
        return issues;
    }

    /**
     * Moderuje pojedynczy obraz
     */
    private List<String> moderateSingleImage(String imageUrl) throws IOException {
        List<String> issues = new ArrayList<>();
        
        // Konwertuj URL na ścieżkę pliku
        String filePath = convertUrlToFilePath(imageUrl);
        Path path = Paths.get(filePath);
        
        if (!Files.exists(path)) {
            System.err.println("[ImageModeration] Plik nie istnieje: " + filePath);
            return issues;
        }
        
        byte[] imageBytes = Files.readAllBytes(path);
        SdkBytes sdkBytes = SdkBytes.fromByteArray(imageBytes);
        
        Image image = Image.builder()
                .bytes(sdkBytes)
                .build();
        
        DetectModerationLabelsRequest request = DetectModerationLabelsRequest.builder()
                .image(image)
                .minConfidence(minConfidence)
                .build();
        
        try {
            DetectModerationLabelsResponse response = rekognitionClient.detectModerationLabels(request);
            
            for (ModerationLabel label : response.moderationLabels()) {
                String labelName = label.name();
                float confidence = label.confidence();
                
                System.out.println("[ImageModeration] Wykryto: " + labelName + 
                                 " (pewność: " + confidence + "%, parent: " + label.parentName() + ")");
                
                // Sprawdź czy kategoria jest na liście blokowanych
                if (BLOCKED_CATEGORIES.contains(labelName) && confidence >= minConfidence) {
                    String polishName = CATEGORY_TRANSLATIONS.getOrDefault(labelName, labelName);
                    if (!issues.contains(polishName)) {
                        issues.add(polishName);
                    }
                }
            }
        } catch (RekognitionException e) {
            System.err.println("[ImageModeration] Błąd Rekognition: " + e.getMessage());
            throw e;
        }
        
        return issues;
    }

    /**
     * Konwertuje URL obrazu na ścieżkę pliku
     */
    private String convertUrlToFilePath(String imageUrl) {
        // Usuń początkowy slash jeśli istnieje
        String normalized = imageUrl.startsWith("/") ? imageUrl.substring(1) : imageUrl;
        
        // Usuń prefix "uploads/images/" jeśli istnieje, bo uploadDir już zawiera ścieżkę
        if (normalized.startsWith("uploads/images/")) {
            String filename = normalized.substring("uploads/images/".length());
            return Paths.get(uploadDir).resolve(filename).toAbsolutePath().toString();
        }
        
        return Paths.get(uploadDir).resolve(normalized).toAbsolutePath().toString();
    }
}
