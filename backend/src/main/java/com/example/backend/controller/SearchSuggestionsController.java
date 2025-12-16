package com.example.backend.controller;

import com.example.backend.service.SearchSuggestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchSuggestionsController {

    private static final Logger log = LoggerFactory.getLogger(SearchSuggestionsController.class);

    private final SearchSuggestionService searchSuggestionService;

    public SearchSuggestionsController(SearchSuggestionService searchSuggestionService) {
        this.searchSuggestionService = searchSuggestionService;
    }

    /**
     * Endpoint dla sugestii wyszukiwania (PostgreSQL powered)
     * GET /api/search/suggestions?q=samsung&limit=5
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        
        if (limit > 20) limit = 20; // Max 20 sugestii
        if (limit < 1) limit = 5;

        try {
            log.info("Fetching suggestions for query: '{}', limit: {}", query, limit);
            List<String> suggestions = searchSuggestionService.getSuggestions(query, limit);
            log.info("Returning {} suggestions", suggestions.size());
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("Error fetching suggestions: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Endpoint dla pełnego wyszukiwania
     * GET /api/search?q=samsung&limit=10
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        
        if (limit > 50) limit = 50;
        if (limit < 1) limit = 10;

        try {
            List<Map<String, Object>> results = searchSuggestionService.search(query, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Error searching: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }
}

