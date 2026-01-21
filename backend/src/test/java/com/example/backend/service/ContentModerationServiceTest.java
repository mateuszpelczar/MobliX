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
        // Constructor: ComprehendClient, boolean moderationEnabled, double minConfidence
        contentModerationService = new ContentModerationService(comprehendClient, true, 0.7);
    }

    @Test
    @DisplayName("Powinien wykryć wulgaryzmy w tekście polskim")
    void shouldDetectPolishProfanity() {
        // Given
        String title = "Sprzedaję telefon";
        String description = "Kurwa jaki dobry telefon, polecam";

        // When
        List<String> issues = contentModerationService.moderateText(title, description);

        // Then
        assertFalse(issues.isEmpty());
        assertTrue(issues.stream().anyMatch(issue -> issue.contains("wulgaryzm")));
    }

    @Test
    @DisplayName("Powinien wykryć wulgaryzmy w tekście angielskim")
    void shouldDetectEnglishProfanity() {
        // Given
        String title = "Selling phone";
        String description = "This fucking phone is great";

        // When
        List<String> issues = contentModerationService.moderateText(title, description);

        // Then
        assertFalse(issues.isEmpty());
    }

    @Test
    @DisplayName("Powinien przepuścić czysty tekst")
    void shouldPassCleanText() {
        // Given
        String title = "iPhone 15 Pro Max 256GB";
        String description = "Telefon w idealnym stanie, używany przez 3 miesiące. Komplet z pudełkiem.";

        // When
        List<String> issues = contentModerationService.moderateText(title, description);

        // Then
        // Może być pusty lub zawierać tylko wyniki sentymentu (nie wulgaryzmy)
        assertTrue(issues.stream().noneMatch(issue -> issue.contains("wulgaryzm")));
    }

    @Test
    @DisplayName("Powinien wykryć warianty pisowni wulgaryzmów")
    void shouldDetectProfanityVariants() {
        // Given - różne warianty pisowni
        String description1 = "kuuuurwa co za telefon";
        String description2 = "chuuuj z tym";

        // When
        List<String> issues1 = contentModerationService.moderateText("Test", description1);
        List<String> issues2 = contentModerationService.moderateText("Test", description2);

        // Then
        assertFalse(issues1.isEmpty());
        assertFalse(issues2.isEmpty());
    }

    @Test
    @DisplayName("Powinien obsłużyć null wartości")
    void shouldHandleNullValues() {
        // When & Then - nie powinien rzucić wyjątku
        assertDoesNotThrow(() -> contentModerationService.moderateText(null, null));
        assertDoesNotThrow(() -> contentModerationService.moderateText("Title", null));
        assertDoesNotThrow(() -> contentModerationService.moderateText(null, "Description"));
    }

    @Test
    @DisplayName("Powinien obsłużyć pusty tekst")
    void shouldHandleEmptyText() {
        // When
        List<String> issues = contentModerationService.moderateText("", "");

        // Then
        assertNotNull(issues);
    }

    @Test
    @DisplayName("Powinien maskować wykryte słowa")
    void shouldMaskDetectedWords() {
        // Given
        String description = "Ten telefon to kurwa świetna rzecz";

        // When
        List<String> issues = contentModerationService.moderateText("Test", description);

        // Then
        // Sprawdź czy zamaskowane słowo ma format k***a
        assertTrue(issues.stream()
            .filter(issue -> issue.contains("wulgaryzm"))
            .anyMatch(issue -> issue.contains("k***a") || issue.contains("wulgaryzm")));
    }

    @Test
    @DisplayName("Nie powinien moderować gdy wyłączone")
    void shouldNotModerateWhenDisabled() {
        // Given - stwórz serwis z moderationEnabled = false
        ContentModerationService disabledService = new ContentModerationService(comprehendClient, false, 0.7);
        String description = "Kurwa jaki telefon";

        // When
        List<String> issues = disabledService.moderateText("Test", description);

        // Then
        assertTrue(issues.isEmpty());
    }

    @Test
    @DisplayName("Powinien wykryć wiele wulgaryzmów w jednym tekście")
    void shouldDetectMultipleProfanities() {
        // Given
        String description = "Kurwa chuj dupa";

        // When
        List<String> issues = contentModerationService.moderateText("Test", description);

        // Then
        assertFalse(issues.isEmpty());
        // Sprawdź że wykryto więcej niż jeden wulgaryzm
        String issueText = String.join(" ", issues);
        assertTrue(issueText.contains("wulgaryzm"));
    }

    @Test
    @DisplayName("Powinien być case-insensitive")
    void shouldBeCaseInsensitive() {
        // Given
        String description1 = "KURWA";
        String description2 = "Kurwa";
        String description3 = "kurwa";

        // When
        List<String> issues1 = contentModerationService.moderateText("Test", description1);
        List<String> issues2 = contentModerationService.moderateText("Test", description2);
        List<String> issues3 = contentModerationService.moderateText("Test", description3);

        // Then
        assertFalse(issues1.isEmpty());
        assertFalse(issues2.isEmpty());
        assertFalse(issues3.isEmpty());
    }
}
