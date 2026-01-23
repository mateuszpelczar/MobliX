package com.example.backend.repository;

import com.example.backend.dto.CategorySuggestionDTO;
import com.example.backend.dto.SearchSuggestionDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Repository dla PostgreSQL Full-Text Search
 * Wykorzystuje tsvector, tsquery, indeksy GIN oraz trigram similarity
 */
@Repository
public class FullTextSearchRepository {

    private static final Logger log = LoggerFactory.getLogger(FullTextSearchRepository.class);

    @PersistenceContext
    private EntityManager entityManager;

    /**
     * Pobiera sugestie ogłoszeń (smartfonów) używając PostgreSQL Full-Text Search
     * Łączy dane z tabeli ogloszenia i smartphone_specifications
     */
    public List<SearchSuggestionDTO> getAdvertisementSuggestions(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        String searchQuery = normalizeSearchQuery(query);
        String likeQuery = "%" + query.toLowerCase() + "%";

        log.debug("Full-text search for advertisements: query='{}', normalized='{}'", query, searchQuery);

        String sql = """
            SELECT 
                o.id,
                o.title,
                ss.brand,
                c.name as category_name,
                (SELECT z.url FROM zdjecia z WHERE z.advertisement_id = o.id LIMIT 1) as image_url,
                o.price,
                (
                    COALESCE(ts_rank(o.search_vector, plainto_tsquery('simple', :query)), 0) + 
                    COALESCE(similarity(o.title, :originalQuery), 0) +
                    COALESCE(similarity(ss.brand, :originalQuery), 0) * 0.5 +
                    COALESCE(similarity(ss.model, :originalQuery), 0) * 0.5
                ) as rank
            FROM ogloszenia o
            LEFT JOIN smartphone_specifications ss ON ss.advertisement_id = o.id
            LEFT JOIN categories c ON o.category_id = c.id
            WHERE 
                o.status = 'ACTIVE'
                AND (
                    o.search_vector @@ plainto_tsquery('simple', :query)
                    OR LOWER(o.title) LIKE :likeQuery
                    OR LOWER(ss.brand) LIKE :likeQuery
                    OR LOWER(ss.model) LIKE :likeQuery
                    OR LOWER(CONCAT(ss.brand, ' ', ss.model)) LIKE :likeQuery
                    OR similarity(o.title, :originalQuery) > 0.3
                    OR similarity(ss.brand, :originalQuery) > 0.3
                    OR similarity(ss.model, :originalQuery) > 0.3
                )
            ORDER BY rank DESC
            LIMIT :limit
            """;

        try {
            Query nativeQuery = entityManager.createNativeQuery(sql);
            nativeQuery.setParameter("query", searchQuery);
            nativeQuery.setParameter("originalQuery", query);
            nativeQuery.setParameter("likeQuery", likeQuery);
            nativeQuery.setParameter("limit", limit);

            @SuppressWarnings("unchecked")
            List<Object[]> results = nativeQuery.getResultList();

            log.debug("Found {} advertisement suggestions", results.size());

            return results.stream()
                    .map(row -> {
                        SearchSuggestionDTO dto = new SearchSuggestionDTO();
                        dto.setId(((Number) row[0]).longValue());
                        dto.setName((String) row[1]);
                        dto.setBrand((String) row[2]);
                        dto.setCategoryName((String) row[3]);
                        dto.setImageUrl((String) row[4]);
                        dto.setPrice(row[5] != null ? BigDecimal.valueOf(((Number) row[5]).doubleValue()) : null);
                        dto.setRank(row[6] != null ? ((Number) row[6]).doubleValue() : 0.0);
                        dto.setSuggestionType("advertisement");
                        return dto;
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Error executing full-text search for advertisements: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Pobiera sugestie marek używając Full-Text Search i trigram similarity
     */
    public List<String> getBrandSuggestions(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        String likeQuery = "%" + query.toLowerCase() + "%";

        log.info("📝 [Full-Text Search] Searching for brands: query='{}'", query);

        String sql = """
            SELECT DISTINCT ss.brand
            FROM smartphone_specifications ss
            JOIN ogloszenia o ON ss.advertisement_id = o.id
            WHERE 
                ss.brand IS NOT NULL
                AND ss.brand != ''
                AND o.status = 'ACTIVE'
                AND (
                    LOWER(ss.brand) LIKE :likeQuery
                    OR similarity(ss.brand, :query) > 0.3
                )
            ORDER BY similarity(ss.brand, :query) DESC, ss.brand
            LIMIT :limit
            """;

        try {
            Query nativeQuery = entityManager.createNativeQuery(sql);
            nativeQuery.setParameter("query", query);
            nativeQuery.setParameter("likeQuery", likeQuery);
            nativeQuery.setParameter("limit", limit);

            @SuppressWarnings("unchecked")
            List<String> results = nativeQuery.getResultList();

            log.info("✅ [Full-Text Search] Found {} brand suggestions: {}", results.size(), results);

            return results.stream()
                    .filter(brand -> brand != null && !brand.isEmpty())
                    .toList();
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error searching for brands: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Pobiera sugestie modeli dla danej marki używając Full-Text Search i trigram similarity
     */
    public List<String> getModelSuggestions(String query, String brand, int limit) {
        if (query == null || query.trim().length() < 1) {
            return new ArrayList<>();
        }

        String likeQuery = "%" + query.toLowerCase() + "%";

        log.info("📝 [Full-Text Search] Searching for models: query='{}', brand='{}'", query, brand);

        String sql;
        Query nativeQuery;

        if (brand != null && !brand.isEmpty()) {
            sql = """
                SELECT DISTINCT ss.model
                FROM smartphone_specifications ss
                JOIN ogloszenia o ON ss.advertisement_id = o.id
                WHERE 
                    ss.model IS NOT NULL
                    AND ss.model != ''
                    AND o.status = 'ACTIVE'
                    AND LOWER(ss.brand) = LOWER(:brand)
                    AND (
                        LOWER(ss.model) LIKE :likeQuery
                        OR similarity(ss.model, :query) > 0.2
                    )
                ORDER BY similarity(ss.model, :query) DESC, ss.model
                LIMIT :limit
                """;
            nativeQuery = entityManager.createNativeQuery(sql);
            nativeQuery.setParameter("brand", brand);
        } else {
            sql = """
                SELECT DISTINCT ss.model
                FROM smartphone_specifications ss
                JOIN ogloszenia o ON ss.advertisement_id = o.id
                WHERE 
                    ss.model IS NOT NULL
                    AND ss.model != ''
                    AND o.status = 'ACTIVE'
                    AND (
                        LOWER(ss.model) LIKE :likeQuery
                        OR similarity(ss.model, :query) > 0.2
                    )
                ORDER BY similarity(ss.model, :query) DESC, ss.model
                LIMIT :limit
                """;
            nativeQuery = entityManager.createNativeQuery(sql);
        }

        try {
            nativeQuery.setParameter("query", query);
            nativeQuery.setParameter("likeQuery", likeQuery);
            nativeQuery.setParameter("limit", limit);

            @SuppressWarnings("unchecked")
            List<String> results = nativeQuery.getResultList();

            log.info("✅ [Full-Text Search] Found {} model suggestions: {}", results.size(), results);

            return results.stream()
                    .filter(model -> model != null && !model.isEmpty())
                    .toList();
        } catch (Exception e) {
            log.error("❌ [Full-Text Search] Error searching for models: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Pobiera sugestie kategorii używając Full-Text Search
     */
    public List<CategorySuggestionDTO> getCategorySuggestions(String query, int limit) {
        if (query == null || query.trim().length() < 2) {
            return new ArrayList<>();
        }

        String likeQuery = "%" + query.toLowerCase() + "%";

        log.debug("Full-text search for categories: query='{}'", query);

        String sql = """
            SELECT 
                c.id,
                c.name,
                COUNT(o.id) as advertisement_count
            FROM categories c
            LEFT JOIN ogloszenia o ON c.id = o.category_id AND o.status = 'ACTIVE'
            WHERE 
                LOWER(c.name) LIKE :likeQuery
                OR similarity(c.name, :query) > 0.3
            GROUP BY c.id, c.name
            ORDER BY similarity(c.name, :query) DESC, advertisement_count DESC
            LIMIT :limit
            """;

        try {
            Query nativeQuery = entityManager.createNativeQuery(sql);
            nativeQuery.setParameter("query", query);
            nativeQuery.setParameter("likeQuery", likeQuery);
            nativeQuery.setParameter("limit", limit);

            @SuppressWarnings("unchecked")
            List<Object[]> results = nativeQuery.getResultList();

            log.debug("Found {} category suggestions", results.size());

            return results.stream()
                    .map(row -> {
                        CategorySuggestionDTO dto = new CategorySuggestionDTO();
                        dto.setId(((Number) row[0]).longValue());
                        dto.setName((String) row[1]);
                        dto.setProductCount(((Number) row[2]).longValue());
                        return dto;
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Error executing full-text search for categories: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Wyszukuje ogłoszenia z pełnym rankingiem Full-Text Search
     * Używane do głównego wyszukiwania (nie tylko sugestii)
     */
    public List<SearchSuggestionDTO> searchAdvertisementsWithRanking(String query, int page, int pageSize) {
        if (query == null || query.trim().isEmpty()) {
            return new ArrayList<>();
        }

        String searchQuery = normalizeSearchQuery(query);
        String likeQuery = "%" + query.toLowerCase() + "%";
        int offset = (page - 1) * pageSize;

        log.debug("Full-text search with ranking: query='{}', page={}, pageSize={}", query, page, pageSize);

        String sql = """
            SELECT 
                o.id,
                o.title,
                ss.brand,
                c.name as category_name,
                (SELECT z.url FROM zdjecia z WHERE z.advertisement_id = o.id LIMIT 1) as image_url,
                o.price,
                ts_rank(o.search_vector, plainto_tsquery('simple', :query)) as rank
            FROM ogloszenia o
            LEFT JOIN smartphone_specifications ss ON ss.advertisement_id = o.id
            LEFT JOIN categories c ON o.category_id = c.id
            WHERE 
                o.status = 'ACTIVE'
                AND (
                    o.search_vector @@ plainto_tsquery('simple', :query)
                    OR LOWER(o.title) LIKE :likeQuery
                    OR LOWER(o.description) LIKE :likeQuery
                    OR LOWER(ss.brand) LIKE :likeQuery
                    OR LOWER(ss.model) LIKE :likeQuery
                )
            ORDER BY rank DESC, o.created_at DESC
            OFFSET :offset
            LIMIT :limit
            """;

        try {
            Query nativeQuery = entityManager.createNativeQuery(sql);
            nativeQuery.setParameter("query", searchQuery);
            nativeQuery.setParameter("likeQuery", likeQuery);
            nativeQuery.setParameter("offset", offset);
            nativeQuery.setParameter("limit", pageSize);

            @SuppressWarnings("unchecked")
            List<Object[]> results = nativeQuery.getResultList();

            log.debug("Found {} advertisements with ranking", results.size());

            return results.stream()
                    .map(row -> {
                        SearchSuggestionDTO dto = new SearchSuggestionDTO();
                        dto.setId(((Number) row[0]).longValue());
                        dto.setName((String) row[1]);
                        dto.setBrand((String) row[2]);
                        dto.setCategoryName((String) row[3]);
                        dto.setImageUrl((String) row[4]);
                        dto.setPrice(row[5] != null ? BigDecimal.valueOf(((Number) row[5]).doubleValue()) : null);
                        dto.setRank(row[6] != null ? ((Number) row[6]).doubleValue() : 0.0);
                        dto.setSuggestionType("advertisement");
                        return dto;
                    })
                    .toList();
        } catch (Exception e) {
            log.error("Error executing full-text search with ranking: {}", e.getMessage(), e);
            return new ArrayList<>();
        }
    }

    /**
     * Normalizuje query dla PostgreSQL tsquery
     * Dodaje prefix matching (:*) dla każdego słowa
     * Przykład: "samsung galaxy" -> "samsung:* & galaxy:*"
     */
    private String normalizeSearchQuery(String query) {
        String normalized = query.trim().toLowerCase()
                .replaceAll("[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ\\s]", ""); // Usuń znaki specjalne
        String[] words = normalized.split("\\s+");
        StringBuilder sb = new StringBuilder();
        
        for (int i = 0; i < words.length; i++) {
            if (words[i].isEmpty()) continue;
            if (sb.length() > 0) {
                sb.append(" & ");
            }
            sb.append(words[i]).append(":*");
        }
        
        return sb.length() > 0 ? sb.toString() : query.trim();
    }
}