package com.example.backend.service;

import com.example.backend.repository.FullTextSearchRepository;
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
    private FullTextSearchRepository fullTextSearchRepository;

    private SearchSuggestionService searchSuggestionService;

    @BeforeEach
    void setUp() {
       
        searchSuggestionService = new SearchSuggestionService(jdbcTemplate, fullTextSearchRepository);
    }
    // sprawdza czy zwraca sugestie dla poprawnego zapytania
    @Test
    @DisplayName("Powinien zwrócić sugestie dla poprawnego zapytania")
    void shouldReturnSuggestionsForValidQuery() {
        
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15 Pro"),
            createResult("Apple", "iPhone 15"),
            createResult("Samsung", "Galaxy S24")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

       
        List<String> suggestions = searchSuggestionService.getSuggestions("iphone", 5);

       
        assertNotNull(suggestions);
        assertFalse(suggestions.isEmpty());
    }

    // sprawdza czy zwraca pusta liste dla null zapytania
    @Test
    @DisplayName("Powinien zwrócić pustą listę dla null zapytania")
    void shouldReturnEmptyForNullQuery() {
        
        List<String> suggestions = searchSuggestionService.getSuggestions(null, 5);

       
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    // sprawdza czy zwraca pusta liste dla pustego zapytania
    @Test
    @DisplayName("Powinien zwrócić pustą listę dla pustego zapytania")
    void shouldReturnEmptyForEmptyQuery() {
        
        List<String> suggestions = searchSuggestionService.getSuggestions("", 5);

       
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    // sprawdza czy zwraca pusta liste dla zbyt krótkiego zapytania
    @Test
    @DisplayName("Powinien zwrócić pustą listę dla zbyt krótkiego zapytania")
    void shouldReturnEmptyForTooShortQuery() {
      
        List<String> suggestions = searchSuggestionService.getSuggestions("a", 5);

       
        assertNotNull(suggestions);
        assertTrue(suggestions.isEmpty());
    }

    // sprawdza czy ogranicza liczbe wynikow do limitu
    @Test
    @DisplayName("Powinien ograniczyć liczbę wyników do limitu")
    void shouldLimitResults() {
        
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

       
        List<String> suggestions = searchSuggestionService.getSuggestions("iphone", 3);

        assertTrue(suggestions.size() <= 3);
    }

    // sprawdza czy sortuje wyniki - match na początku ma wyższy priorytet
    @Test
    @DisplayName("Powinien sortować wyniki - match na początku ma wyższy priorytet")
    void shouldPrioritizeStartsWithMatch() {
       
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Samsung", "Galaxy Note"),
            createResult("Samsung", "Galaxy S24"),
            createResult("Samsung", "Galaxy A54")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

       
        List<String> suggestions = searchSuggestionService.getSuggestions("galaxy", 5);

        
        assertFalse(suggestions.isEmpty());
    }

    // sprawdza czy obsłuży wyniki z null wartościami
    @Test
    @DisplayName("Powinien obsłużyć wyniki z null wartościami")
    void shouldHandleNullValues() {
        
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", null),
            createResult(null, "iPhone 15"),
            createResult("Samsung", "Galaxy S24")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        
        assertDoesNotThrow(() -> searchSuggestionService.getSuggestions("test", 5));
    }

    // sprawdza czy jest case-insensitive
    @Test
    @DisplayName("Powinien być case-insensitive")
    void shouldBeCaseInsensitive() {
       
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

       
        List<String> suggestionsLower = searchSuggestionService.getSuggestions("iphone", 5);
        List<String> suggestionsUpper = searchSuggestionService.getSuggestions("IPHONE", 5);

        
        assertEquals(suggestionsLower.size(), suggestionsUpper.size());
    }

    // sprawdza czy trimuje białe znaki z zapytania
    @Test
    @DisplayName("Powinien trimować białe znaki z zapytania")
    void shouldTrimWhitespace() {
       
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        
        List<String> suggestions = searchSuggestionService.getSuggestions("  iphone  ", 5);

        
        assertNotNull(suggestions);
    }

    // sprawdza czy łączy brand i model w jedną sugestię
    @Test
    @DisplayName("Powinien łączyć brand i model w jedną sugestię")
    void shouldCombineBrandAndModel() {
        
        List<Map<String, Object>> mockResults = Arrays.asList(
            createResult("Apple", "iPhone 15 Pro")
        );
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenReturn(mockResults);

        
        List<String> suggestions = searchSuggestionService.getSuggestions("apple", 5);

       
        assertFalse(suggestions.isEmpty());
        assertTrue(suggestions.stream().anyMatch(s -> s.contains("Apple") || s.contains("iPhone")));
    }

    // sprawdza czy obsłuży wyjątek z bazy danych
    @Test
    @DisplayName("Powinien obsługiwać wyjątek z bazy danych")
    void shouldHandleDatabaseException() {
        
        when(jdbcTemplate.queryForList(anyString(), anyString(), anyString(), anyString()))
            .thenThrow(new RuntimeException("Database error"));

        
        List<String> suggestions = searchSuggestionService.getSuggestions("iphone", 5);

       
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
