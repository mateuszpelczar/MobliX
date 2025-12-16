package com.example.backend.service;

import com.example.backend.repository.AdvertisementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service providing search suggestions using PostgreSQL full-text search
 * Replaces OpenSearch for cost-effective AI-like suggestions
 */
@Service
public class SearchSuggestionService {

    private static final Logger log = LoggerFactory.getLogger(SearchSuggestionService.class);

    private final JdbcTemplate jdbcTemplate;
    private final AdvertisementRepository advertisementRepository;

    @Autowired
    public SearchSuggestionService(JdbcTemplate jdbcTemplate, 
                                   AdvertisementRepository advertisementRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.advertisementRepository = advertisementRepository;
        log.info("✅ PostgreSQL Search Suggestion Service initialized");
    }

    /**
     * Get search suggestions based on user input
     * Uses PostgreSQL ILIKE for fuzzy matching similar to OpenSearch
     */
    public List<String> getSuggestions(String query, int limit) {
        if (query == null || query.trim().isEmpty() || query.length() < 2) {
            return Collections.emptyList();
        }

        String queryLower = query.toLowerCase().trim();
        log.debug("Fetching suggestions for query: '{}', limit: {}", query, limit);

        try {
            Set<String> suggestions = new LinkedHashSet<>();
            
            // Query for brands and models using ILIKE (case-insensitive LIKE)
            // Note: advertisements table is named 'ogloszenia' in the database
            int sqlLimit = limit * 3;
            String sql = String.format("""
                SELECT DISTINCT 
                    ss.brand, 
                    ss.model
                FROM smartphone_specifications ss
                JOIN ogloszenia a ON ss.advertisement_id = a.id
                WHERE ss.brand IS NOT NULL
                  AND (
                    LOWER(ss.brand) LIKE ? 
                    OR LOWER(ss.model) LIKE ?
                    OR LOWER(CONCAT(ss.brand, ' ', ss.model)) LIKE ?
                  )
                ORDER BY ss.brand, ss.model
                LIMIT %d
                """, sqlLimit);

            String pattern = "%" + queryLower + "%";
            
            log.info("Executing search suggestions SQL with pattern: {}", pattern);
            
            List<Map<String, Object>> results = jdbcTemplate.queryForList(
                sql, pattern, pattern, pattern
            );
            
            log.info("Found {} raw results from database", results.size());

            for (Map<String, Object> row : results) {
                String brand = (String) row.get("brand");
                String model = (String) row.get("model");
                
                if (brand != null && model != null) {
                    String brandLower = brand.toLowerCase();
                    String fullName = brand + " " + model;
                    
                    // Case 1: User typing part of brand (e.g., "sa" -> "Samsung")
                    if (brandLower.startsWith(queryLower) && !brandLower.equals(queryLower)) {
                        suggestions.add(brand);
                    }
                    
                    // Case 2: User typed brand exactly OR brand+model matches
                    if (brandLower.equals(queryLower) || 
                        fullName.toLowerCase().contains(queryLower)) {
                        suggestions.add(fullName);
                    }
                    
                    // Case 3: If nothing matched yet, add full name
                    if (suggestions.isEmpty() || 
                        brandLower.contains(queryLower) || 
                        model.toLowerCase().contains(queryLower)) {
                        suggestions.add(fullName);
                    }
                }
            }

            // Sort suggestions: exact matches first, then alphabetically
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

            log.debug("Returning {} suggestions", sortedSuggestions.size());
            return sortedSuggestions;
            
        } catch (Exception e) {
            log.error("❌ Error fetching suggestions: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    /**
     * Search smartphones by query
     */
    public List<Map<String, Object>> search(String query, int limit) {
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            String sql = """
                SELECT 
                    a.id,
                    a.title,
                    a.description,
                    a.price,
                    ss.brand,
                    ss.model
                FROM advertisements a
                JOIN smartphone_specifications ss ON a.smartphone_specification_id = ss.id
                WHERE a.status = 'ACTIVE'
                  AND (
                    LOWER(a.title) LIKE ?
                    OR LOWER(a.description) LIKE ?
                    OR LOWER(ss.brand) LIKE ?
                    OR LOWER(ss.model) LIKE ?
                  )
                ORDER BY a.created_at DESC
                LIMIT ?
                """;

            String pattern = "%" + query.toLowerCase().trim() + "%";
            
            return jdbcTemplate.queryForList(sql, pattern, pattern, pattern, pattern, limit);
            
        } catch (Exception e) {
            log.error("❌ Error searching: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }
}
