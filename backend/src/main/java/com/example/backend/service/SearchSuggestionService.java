package com.example.backend.service;

import com.example.backend.dto.CategorySuggestionDTO;
import com.example.backend.dto.SearchSuggestionDTO;
import com.example.backend.dto.SearchSuggestionsResponseDTO;
import com.example.backend.repository.FullTextSearchRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

/**
 * Service providing search suggestions using PostgreSQL Full-Text Search
 * Wykorzystuje tsvector, tsquery, indeksy GIN oraz trigram similarity
 */
@Service
public class SearchSuggestionService {

    private static final Logger log = LoggerFactory.getLogger(SearchSuggestionService.class);

    private final JdbcTemplate jdbcTemplate;
    private final FullTextSearchRepository fullTextSearchRepository;

    @Autowired
    public SearchSuggestionService(JdbcTemplate jdbcTemplate, 
                                   FullTextSearchRepository fullTextSearchRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.fullTextSearchRepository = fullTextSearchRepository;
        log.info("✅ PostgreSQL Full-Text Search Suggestion Service initialized");
    }

    /**
     * Pobiera wszystkie sugestie (ogłoszenia, marki, kategorie) równolegle
     * Używa PostgreSQL Full-Text Search z rankingiem
     */
    public SearchSuggestionsResponseDTO getAllSuggestions(String query) {
        if (query == null || query.trim().length() < 2) {
            return new SearchSuggestionsResponseDTO();
        }

        log.info("📝 Getting all suggestions for query: '{}'", query);

        try {
            // Wykonaj zapytania równolegle dla lepszej wydajności
            CompletableFuture<List<SearchSuggestionDTO>> advertisementsFuture = 
                CompletableFuture.supplyAsync(() -> fullTextSearchRepository.getAdvertisementSuggestions(query, 8));
            
            CompletableFuture<List<String>> brandsFuture = 
                CompletableFuture.supplyAsync(() -> fullTextSearchRepository.getBrandSuggestions(query, 5));
            
            CompletableFuture<List<CategorySuggestionDTO>> categoriesFuture = 
                CompletableFuture.supplyAsync(() -> fullTextSearchRepository.getCategorySuggestions(query, 5));

            // Poczekaj na wszystkie wyniki
            CompletableFuture.allOf(advertisementsFuture, brandsFuture, categoriesFuture).join();

            SearchSuggestionsResponseDTO response = new SearchSuggestionsResponseDTO();
            response.setProducts(advertisementsFuture.get());
            response.setBrands(brandsFuture.get());
            response.setCategories(categoriesFuture.get());

            log.info("✅ Found {} products, {} brands, {} categories for query: '{}'", 
                    response.getProducts().size(), 
                    response.getBrands().size(), 
                    response.getCategories().size(), 
                    query);

            return response;
        } catch (Exception e) {
            log.error("❌ Error getting all suggestions: {}", e.getMessage(), e);
            return new SearchSuggestionsResponseDTO();
        }
    }

    /**
     * Pobiera proste sugestie tekstowe (brand + model) dla autouzupełniania
     * Wykorzystuje PostgreSQL Full-Text Search z trigram similarity
     */
    public List<String> getSuggestions(String query, int limit) {
        if (query == null || query.trim().isEmpty() || query.length() < 2) {
            return Collections.emptyList();
        }

        String queryLower = query.toLowerCase().trim();
        log.info("📝 [Full-Text Search] Fetching suggestions for query: '{}', limit: {}", query, limit);

        try {
            Set<String> suggestions = new LinkedHashSet<>();
            
            // Full-Text Search z trigram similarity dla tolerancji błędów
            String sql = """
                SELECT DISTINCT 
                    ss.brand, 
                    ss.model,
                    COALESCE(ts_rank(o.search_vector, plainto_tsquery('simple', ?)), 0) +
                    COALESCE(similarity(ss.brand, ?), 0) + 
                    COALESCE(similarity(ss.model, ?), 0) as rank
                FROM smartphone_specifications ss
                JOIN ogloszenia o ON ss.advertisement_id = o.id
                WHERE ss.brand IS NOT NULL
                  AND o.status = 'ACTIVE'
                  AND (
                    o.search_vector @@ plainto_tsquery('simple', ?)
                    OR LOWER(ss.brand) LIKE ?
                    OR LOWER(ss.model) LIKE ?
                    OR LOWER(CONCAT(ss.brand, ' ', ss.model)) LIKE ?
                    OR similarity(ss.brand, ?) > 0.3
                    OR similarity(ss.model, ?) > 0.3
                  )
                ORDER BY rank DESC
                LIMIT ?
                """;

            String searchQuery = normalizeSearchQuery(query);
            String pattern = "%" + queryLower + "%";
            
            log.debug("Executing Full-Text Search with pattern: {} and tsquery: {}", pattern, searchQuery);
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql, searchQuery, query, query, searchQuery, pattern, pattern, pattern, query, query, limit * 3
            );
            
            log.info("📝 Found {} raw results from Full-Text Search", results.size());

            for (Map<String, Object> row : results) {
                String brand = (String) row.get("brand");
                String model = (String) row.get("model");
                
                if (brand != null) {
                    String brandLower = brand.toLowerCase();
                    String fullName = brand + (model != null ? " " + model : "");
                    
                    // Case 1: User typing part of brand (e.g., "sa" -> "Samsung")
                    if (brandLower.startsWith(queryLower) && !brandLower.equals(queryLower)) {
                        suggestions.add(brand);
                    }
                    
                    // Case 2: User typed brand exactly -> show models
                    if (brandLower.equals(queryLower) && model != null) {
                        suggestions.add(fullName);
                    }
                    
                    // Case 3: Brand+model matches search
                    if (fullName.toLowerCase().contains(queryLower)) {
                        suggestions.add(fullName);
                    }
                    
                    // Case 4: Similarity match - add full name
                    if (brandLower.contains(queryLower) || 
                        (model != null && model.toLowerCase().contains(queryLower))) {
                        suggestions.add(fullName);
                    }
                }
            }

            // Sort suggestions: exact matches first, then by rank
            List<String> sortedSuggestions = suggestions.stream()
                .sorted((a, b) -> {
                    boolean aStarts = a.toLowerCase().startsWith(queryLower);
                    boolean bStarts = b.toLowerCase().startsWith(queryLower);
                    if (aStarts && !bStarts) return -1;
                    if (!aStarts && bStarts) return 1;
                    return a.compareToIgnoreCase(b);
                })
                .limit(limit)
                .collect(Collectors.toList());

            log.info("✅ [Full-Text Search] Returning {} suggestions for '{}': {}", sortedSuggestions.size(), query, sortedSuggestions);
            return sortedSuggestions;
            
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Wyszukuje ogłoszenia z rankingiem Full-Text Search
     */
    public List<Map<String, Object>> search(String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        log.info("📝 Searching with Full-Text Search for: '{}', limit: {}", query, limit);

        try {
            String searchQuery = normalizeSearchQuery(query);
            String pattern = "%" + query.toLowerCase().trim() + "%";

            String sql = """
                SELECT 
                    o.id,
                    o.title,
                    o.description,
                    o.price,
                    ss.brand,
                    ss.model,
                    ts_rank(o.search_vector, plainto_tsquery('simple', ?)) as rank
                FROM ogloszenia o
                LEFT JOIN smartphone_specifications ss ON ss.advertisement_id = o.id
                WHERE o.status = 'ACTIVE'
                  AND (
                    o.search_vector @@ plainto_tsquery('simple', ?)
                    OR LOWER(o.title) LIKE ?
                    OR LOWER(o.description) LIKE ?
                    OR LOWER(ss.brand) LIKE ?
                    OR LOWER(ss.model) LIKE ?
                  )
                ORDER BY rank DESC, o.created_at DESC
                LIMIT ?
                """;

            List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql, searchQuery, searchQuery, pattern, pattern, pattern, pattern, limit
            );

            log.info("✅ Found {} results for search: '{}'", results.size(), query);
            return results;
            
        } catch (Exception e) {
            log.error("❌ Error searching: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Pobiera sugestie tylko dla marek
     */
    public List<String> getBrandSuggestions(String query, int limit) {
        return fullTextSearchRepository.getBrandSuggestions(query, limit);
    }

    /**
     * Pobiera sugestie modeli dla danej marki
     */
    public List<String> getModelSuggestions(String query, String brand, int limit) {
        return fullTextSearchRepository.getModelSuggestions(query, brand, limit);
    }

    /**
     * Pobiera sugestie kategorii
     */
    public List<CategorySuggestionDTO> getCategorySuggestions(String query, int limit) {
        return fullTextSearchRepository.getCategorySuggestions(query, limit);
    }

    /**
     * Normalizuje query dla PostgreSQL tsquery
     * Dodaje prefix matching (:*) dla każdego słowa
     */
    private String normalizeSearchQuery(String query) {
        String normalized = query.trim().toLowerCase()
                .replaceAll("[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\\s]", "");
        String[] words = normalized.split("\\s+");
        StringBuilder sb = new StringBuilder();
        
        for (String word : words) {
            if (word.isEmpty()) continue;
            if (sb.length() > 0) {
                sb.append(" & ");
            }
            sb.append(word).append(":*");
        }
        
        return sb.length() > 0 ? sb.toString() : query.trim();
    }
}
