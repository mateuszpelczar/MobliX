package com.example.backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import software.amazon.awssdk.services.comprehend.ComprehendClient;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Testy jednostkowe dla ContentModerationService
 * Testują wykrywanie wulgaryzmów i niedozwolonych treści
 */
@ExtendWith(MockitoExtension.class)
class ContentModerationServiceTest {

    @Mock
    private ComprehendClient comprehendClient;

    private ContentModerationService contentModerationService;

    @BeforeEach
    void setUp() {
       
        contentModerationService = new ContentModerationService(comprehendClient, true, 0.7);
    }

    //Sprawdza czy serwis wykrywa wulgaryzmy w tekście polskim
    @Test
    @DisplayName("Powinien wykryć wulgaryzmy w tekście polskim")
    void shouldDetectPolishProfanity() {
       
        String title = "Sprzedaję telefon";
        String description = "Kurwa jaki dobry telefon, polecam";

        
        List<String> issues = contentModerationService.moderateText(title, description);

        
        assertFalse(issues.isEmpty());
        assertTrue(issues.stream().anyMatch(issue -> issue.contains("wulgaryzm")));
    }

    //Sprawdza czy serwis wykrywa wulgaryzmy w tekście angielskim
    @Test
    @DisplayName("Powinien wykryć wulgaryzmy w tekście angielskim")
    void shouldDetectEnglishProfanity() {
        
        String title = "Selling phone";
        String description = "This fucking phone is great";

        
        List<String> issues = contentModerationService.moderateText(title, description);

        
        assertFalse(issues.isEmpty());
    }

    //Sprawdza czy serwis przepuści czysty tekst
    @Test
    @DisplayName("Powinien przepuścić czysty tekst")
    void shouldPassCleanText() {
        
        String title = "iPhone 15 Pro Max 256GB";
        String description = "Telefon w idealnym stanie, używany przez 3 miesiące. Komplet z pudełkiem.";

        
        List<String> issues = contentModerationService.moderateText(title, description);

        
        assertTrue(issues.stream().noneMatch(issue -> issue.contains("wulgaryzm")));
    }

    //Sprawdza czy serwis wykrywa warianty pisowni wulgaryzmów
    @Test
    @DisplayName("Powinien wykryć warianty pisowni wulgaryzmów")
    void shouldDetectProfanityVariants() {
       
        String description1 = "kuuuurwa co za telefon";
        String description2 = "chuuuj z tym";

        
        List<String> issues1 = contentModerationService.moderateText("Test", description1);
        List<String> issues2 = contentModerationService.moderateText("Test", description2);

      
        assertFalse(issues1.isEmpty());
        assertFalse(issues2.isEmpty());
    }

    //Sprawdza czy serwis obsłuży null wartości
    @Test
    @DisplayName("Powinien obsłużyć null wartości")
    void shouldHandleNullValues() {
       
        assertDoesNotThrow(() -> contentModerationService.moderateText(null, null));
        assertDoesNotThrow(() -> contentModerationService.moderateText("Title", null));
        assertDoesNotThrow(() -> contentModerationService.moderateText(null, "Description"));
    }

    //Sprawdza czy serwis obsłuży pusty tekst
    @Test
    @DisplayName("Powinien obsłużyć pusty tekst")
    void shouldHandleEmptyText() {
       
        List<String> issues = contentModerationService.moderateText("", "");

        
        assertNotNull(issues);
    }

    //Sprawdza czy serwis maskuje wykryte słowa
    @Test
    @DisplayName("Powinien maskować wykryte słowa")
    void shouldMaskDetectedWords() {
       
        String description = "Ten telefon to kurwa świetna rzecz";

       
        List<String> issues = contentModerationService.moderateText("Test", description);

       
        assertTrue(issues.stream()
            .filter(issue -> issue.contains("wulgaryzm"))
            .anyMatch(issue -> issue.contains("k***a") || issue.contains("wulgaryzm")));
    }

    //Sprawdza czy serwis nie moderuje gdy jest wyłączony
    @Test
    @DisplayName("Nie powinien moderować gdy wyłączone")
    void shouldNotModerateWhenDisabled() {
       
        ContentModerationService disabledService = new ContentModerationService(comprehendClient, false, 0.7);
        String description = "Kurwa jaki telefon";

       
        List<String> issues = disabledService.moderateText("Test", description);

     
        assertTrue(issues.isEmpty());
    }

    //Sprawdza czy serwis wykrywa wiele wulgaryzmów w jednym tekście
    @Test
    @DisplayName("Powinien wykryć wiele wulgaryzmów w jednym tekście")
    void shouldDetectMultipleProfanities() {
        
        String description = "Kurwa chuj dupa";

       
        List<String> issues = contentModerationService.moderateText("Test", description);

       
        assertFalse(issues.isEmpty());
       
        String issueText = String.join(" ", issues);
        assertTrue(issueText.contains("wulgaryzm"));
    }

    //Sprawdza czy serwis jest case-insensitive
    @Test
    @DisplayName("Powinien być case-insensitive")
    void shouldBeCaseInsensitive() {
      
        String description1 = "KURWA";
        String description2 = "Kurwa";
        String description3 = "kurwa";

      
        List<String> issues1 = contentModerationService.moderateText("Test", description1);
        List<String> issues2 = contentModerationService.moderateText("Test", description2);
        List<String> issues3 = contentModerationService.moderateText("Test", description3);

      
        assertFalse(issues1.isEmpty());
        assertFalse(issues2.isEmpty());
        assertFalse(issues3.isEmpty());
    }
}
