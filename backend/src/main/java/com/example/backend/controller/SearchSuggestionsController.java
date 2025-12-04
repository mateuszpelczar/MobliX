package com.example.backend.controller;

import com.example.backend.service.OpenSearchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchSuggestionsController {

    private final OpenSearchService openSearchService;

    public SearchSuggestionsController(OpenSearchService openSearchService) {
        this.openSearchService = openSearchService;
    }

    /**
     * Endpoint dla sugestii wyszukiwania
     * GET /api/search/suggestions?q=samsung&limit=5
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        
        if (limit > 20) limit = 20; // Max 20 sugestii
        if (limit < 1) limit = 5;

        try {
            List<String> suggestions = openSearchService.getSuggestions(query, limit);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            // Zwróć pustą listę gdy OpenSearch niedostępny
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
            List<Map<String, Object>> results = openSearchService.search(query, limit);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            // Zwróć pustą listę gdy OpenSearch niedostępny
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Endpoint do reindeksowania wszystkich istniejących ogłoszeń
     * POST /api/search/reindex-all
     */
    @PostMapping("/reindex-all")
    public ResponseEntity<Map<String, Object>> reindexAllAdvertisements() {
        try {
            int count = openSearchService.reindexAllAdvertisements();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Zaindeksowano " + count + " ogłoszeń",
                "count", count
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of(
                "success", false,
                "message", "Błąd reindeksowania: " + e.getMessage()
            ));
        }
    }
}
