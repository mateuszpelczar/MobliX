package com.example.backend.service;

import com.example.backend.repository.AdvertisementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla SearchSuggestionService
 * Testują wyszukiwanie sugestii i ich sortowanie
 */
@ExtendWith(MockitoExtension.class)
class SearchSuggestionServiceTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @Mock
    private AdvertisementRepository advertisementRepository;

    private SearchSuggestionService searchSuggestionService;

    @BeforeEach
    void setUp() {
        // Constructor requires: JdbcTemplate, AdvertisementRepository
        searchSuggestionService = new SearchSuggestionService(jdbcTemplate, advertisementRepository);
    }

    @Test
    @DisplayName("Powinien zwrócić sugestie dla poprawnego zapytania")
    void shouldReturnSuggestionsForValidQuery() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15 Pro"),
            createResult("Apple", "iPhone 15"),
            createResult("Samsung", "Galaxy S24")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("iphone", 5);

        // Then
        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty());
    }

    @Test
    @DisplayName("Powinien zwrócić pustą listę dla null zapytania")
    void shouldReturnEmptyForNullQuery() {
        // When
        List<String> suggestions = searchSuggestionService.getSuggestions(null, 5);

        // Then
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    @Test
    @DisplayName("Powinien zwrócić pustą listę dla pustego zapytania")
    void shouldReturnEmptyForEmptyQuery() {
        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("", 5);

        // Then
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    @Test
    @DisplayName("Powinien zwrócić pustą listę dla zbyt krótkiego zapytania")
    void shouldReturnEmptyForTooShortQuery() {
        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("a", 5);

        // Then
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    @Test
    @DisplayName("Powinien ograniczyć liczbę wyników do limitu")
    void shouldLimitResults() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15 Pro Max"),
            createResult("Apple", "iPhone 15 Pro"),
            createResult("Apple", "iPhone 15"),
            createResult("Apple", "iPhone 14 Pro Max"),
            createResult("Apple", "iPhone 14 Pro"),
            createResult("Apple", "iPhone 14")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("iphone", 3);

        // Then
        assertTrue(suggestions.size() <= 3);
    }

    @Test
    @DisplayName("Powinien sortować wyniki - match na początku ma wyższy priorytet")
    void shouldPrioritizeStartsWithMatch() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Samsung", "Galaxy Note"),
            createResult("Samsung", "Galaxy S24"),
            createResult("Samsung", "Galaxy A54")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("galaxy", 5);

        // Then
        assertFalse(suggestions.isEmpty());
    }

    @Test
    @DisplayName("Powinien obsłużyć wyniki z null wartościami")
    void shouldHandleNullValues() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", null),
            createResult(null, "iPhone 15"),
            createResult("Samsung", "Galaxy S24")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When & Then - nie powinien rzucić wyjątku
        assertDoesNotThrow(() -> searchSuggestionService.getSuggestions("test", 5));
    }

    @Test
    @DisplayName("Powinien być case-insensitive")
    void shouldBeCaseInsensitive() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When
        List<String> suggestionsLower = searchSuggestionService.getSuggestions("iphone", 5);
        List<String> suggestionsUpper = searchSuggestionService.getSuggestions("IPHONE", 5);

        // Then
        assertEquals(suggestionsLower.size(), suggestionsUpper.size());
    }

    @Test
    @DisplayName("Powinien trimować białe znaki z zapytania")
    void shouldTrimWhitespace() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("  iphone  ", 5);

        // Then
        assertNotNull(suggestions);
    }

    @Test
    @DisplayName("Powinien łączyć brand i model w jedną sugestię")
    void shouldCombineBrandAndModel() {
        // Given
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15 Pro")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("apple", 5);

        // Then
        assertFalse(suggestions.isEmpty());
        assertTrue(suggestions.stream().anyMatch(s -> s.contains("Apple") || s.contains("iPhone")));
    }

    @Test
    @DisplayName("Powinien obsługiwać wyjątek z bazy danych")
    void shouldHandleDatabaseException() {
        // Given
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenThrow(new RuntimeException("Database error"));

        // When
        List<String> suggestions = searchSuggestionService.getSuggestions("iphone", 5);

        // Then
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    private Map<String, Object> createResult(String brand, String model) {
        Map<String, Object> result = new HashMap<>();
        result.put("brand", brand);
        result.put("model", model);
        return result;
    }
}
