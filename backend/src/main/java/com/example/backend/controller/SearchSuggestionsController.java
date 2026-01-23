package com.example.backend.controller;

import com.example.backend.dto.CategorySuggestionDTO;
import com.example.backend.dto.SearchSuggestionDTO;
import com.example.backend.dto.SearchSuggestionsResponseDTO;
import com.example.backend.service.SearchSuggestionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller dla PostgreSQL Full-Text Search
 * Zapewnia sugestie wyszukiwania i pełne wyszukiwanie z rankingiem
 */
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
     * Endpoint dla prostych sugestii tekstowych (kompatybilny z istniejącym frontendem)
     * GET /api/search/suggestions?q=samsung&limit=5
     * 
     * Wykorzystuje PostgreSQL Full-Text Search z:
     * - tsvector i tsquery
     * - Indeksy GIN
     * - Trigram similarity dla tolerancji błędów
     */
    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        
        if (limit > 20) limit = 20;
        if (limit < 1) limit = 5;

        try {
            log.info("📝 [Full-Text Search] Fetching suggestions for query: '{}', limit: {}", query, limit);
            List<String> suggestions = searchSuggestionService.getSuggestions(query, limit);
            log.info("✅ [Full-Text Search] Returning {} suggestions", suggestions.size());
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error fetching suggestions: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Endpoint dla rozszerzonych sugestii (produkty, marki, kategorie)
     * GET /api/search/suggestions/full?q=samsung
     * 
     * Zwraca pełne informacje o sugestiach z rankingiem Full-Text Search
     */
    @GetMapping("/suggestions/full")
    public ResponseEntity<SearchSuggestionsResponseDTO> getFullSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query) {
        
        try {
            log.info("📝 [Full-Text Search] Fetching full suggestions for query: '{}'", query);
            SearchSuggestionsResponseDTO suggestions = searchSuggestionService.getAllSuggestions(query);
            log.info("✅ [Full-Text Search] Returning full suggestions: {} products, {} brands, {} categories", 
                    suggestions.getProducts().size(), 
                    suggestions.getBrands().size(), 
                    suggestions.getCategories().size());
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error fetching full suggestions: {}", e.getMessage(), e);
            return ResponseEntity.ok(new SearchSuggestionsResponseDTO());
        }
    }

    /**
     * Endpoint dla sugestii marek
     * GET /api/search/brands?q=sam&limit=5
     */
    @GetMapping("/brands")
    public ResponseEntity<List<String>> getBrandSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        
        if (limit > 20) limit = 20;
        if (limit < 1) limit = 5;

        try {
            log.info("📝 [Full-Text Search] Fetching brand suggestions for query: '{}'", query);
            List<String> brands = searchSuggestionService.getBrandSuggestions(query, limit);
            log.info("✅ [Full-Text Search] Returning {} brand suggestions", brands.size());
            return ResponseEntity.ok(brands);
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error fetching brand suggestions: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Endpoint dla sugestii modeli (opcjonalnie dla konkretnej marki)
     * GET /api/search/models?q=galaxy&brand=Samsung&limit=5
     */
    @GetMapping("/models")
    public ResponseEntity<List<String>> getModelSuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "brand", required = false) String brand,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        
        if (limit > 20) limit = 20;
        if (limit < 1) limit = 5;

        try {
            log.info("📝 [Full-Text Search] Fetching model suggestions for query: '{}', brand: '{}'", query, brand);
            List<String> models = searchSuggestionService.getModelSuggestions(query, brand, limit);
            log.info("✅ [Full-Text Search] Returning {} model suggestions", models.size());
            return ResponseEntity.ok(models);
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error fetching model suggestions: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Endpoint dla sugestii kategorii
     * GET /api/search/categories?q=smart&limit=5
     */
    @GetMapping("/categories")
    public ResponseEntity<List<CategorySuggestionDTO>> getCategorySuggestions(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "5") int limit) {
        
        if (limit > 20) limit = 20;
        if (limit < 1) limit = 5;

        try {
            log.info("📝 [Full-Text Search] Fetching category suggestions for query: '{}'", query);
            List<CategorySuggestionDTO> categories = searchSuggestionService.getCategorySuggestions(query, limit);
            log.info("✅ [Full-Text Search] Returning {} category suggestions", categories.size());
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error fetching category suggestions: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Endpoint dla pełnego wyszukiwania z rankingiem Full-Text Search
     * GET /api/search?q=samsung&limit=10
     */
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> search(
            @RequestParam(name = "q", defaultValue = "") String query,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        
        if (limit > 50) limit = 50;
        if (limit < 1) limit = 10;

        try {
            log.info("📝 [Full-Text Search] Searching for: '{}', limit: {}", query, limit);
            List<Map<String, Object>> results = searchSuggestionService.search(query, limit);
            log.info("✅ [Full-Text Search] Returning {} search results", results.size());
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error searching: {}", e.getMessage(), e);
            return ResponseEntity.ok(List.of());
        }
    }
}

