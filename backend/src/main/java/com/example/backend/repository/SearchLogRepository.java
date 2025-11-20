package com.example.backend.repository;

import com.example.backend.model.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    // Liczenie wyszukiwań dzisiaj - tylko z navbar, catalog_search, catalog_filter
    @Query("SELECT COUNT(s) FROM SearchLog s WHERE CAST(s.createdAt AS date) = CURRENT_DATE AND s.searchSource IN ('navbar', 'catalog_search', 'catalog_filter')")
    Long countTodaySearches();

    // Najczęściej wyszukiwane marki (top 10)
    @Query("SELECT s.brand, COUNT(s) as count FROM SearchLog s WHERE s.brand IS NOT NULL GROUP BY s.brand ORDER BY count DESC")
    List<Object[]> findTopSearchedBrands();

    // Najczęściej wyszukiwane marki dzisiaj
    @Query("SELECT s.brand, COUNT(s) as count FROM SearchLog s WHERE s.brand IS NOT NULL AND CAST(s.createdAt AS date) = CURRENT_DATE GROUP BY s.brand ORDER BY count DESC")
    List<Object[]> findTopSearchedBrandsToday();

    // Trendy wyszukiwań (ostatnie 7 dni, pogrupowane po dniach)
    @Query("SELECT CAST(s.createdAt AS date) as date, COUNT(s) as count FROM SearchLog s WHERE s.createdAt >= :startDate GROUP BY CAST(s.createdAt AS date) ORDER BY CAST(s.createdAt AS date) DESC")
    List<Object[]> findSearchTrendsByDate(@Param("startDate") LocalDateTime startDate);

    // Średnia cena wyszukiwanych ogłoszeń
    @Query("SELECT AVG(s.minPrice) as avgMin, AVG(s.maxPrice) as avgMax FROM SearchLog s WHERE s.minPrice IS NOT NULL OR s.maxPrice IS NOT NULL")
    Object[] findAveragePriceRange();

    // Analiza cen według marek
    @Query("SELECT s.brand, AVG(s.minPrice) as avgMin, AVG(s.maxPrice) as avgMax, COUNT(s) as count FROM SearchLog s WHERE s.brand IS NOT NULL AND (s.minPrice IS NOT NULL OR s.maxPrice IS NOT NULL) GROUP BY s.brand ORDER BY count DESC")
    List<Object[]> findPriceAnalysisByBrand();

    // Ostatnia aktywność wyszukiwań (ostatnie 20)
    @Query("SELECT s FROM SearchLog s ORDER BY s.createdAt DESC")
    List<SearchLog> findRecentSearches();

    // Wyszukiwania w danym przedziale czasowym
    List<SearchLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    // Najpopularniejsze modele
    @Query("SELECT s.model, COUNT(s) as count FROM SearchLog s WHERE s.model IS NOT NULL GROUP BY s.model ORDER BY count DESC")
    List<Object[]> findTopSearchedModels();

    // Liczba unikalnych użytkowników dzisiaj
    @Query("SELECT COUNT(DISTINCT s.userId) FROM SearchLog s WHERE s.userId IS NOT NULL AND CAST(s.createdAt AS date) = CURRENT_DATE")
    Long countUniqueUsersToday();

    // Wyszukiwania według IP (dla anonimowych)
    @Query("SELECT COUNT(DISTINCT s.ipAddress) FROM SearchLog s WHERE s.userId IS NULL AND CAST(s.createdAt AS date) = CURRENT_DATE")
    Long countUniqueSessionsToday();

    long countByCreatedAtAfter(LocalDateTime date);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT s.userId) FROM SearchLog s WHERE s.createdAt >= :date AND s.userId IS NOT NULL")
    long countDistinctUserIdByCreatedAtAfter(@Param("date") LocalDateTime date);

    @Query("""
        SELECT s.brand, COUNT(*) as searchCount
        FROM SearchLog s
        WHERE s.brand IS NOT NULL
        GROUP BY s.brand
        ORDER BY searchCount DESC
        """)
    List<Object[]> findMostCommonPriceRangesByBrand();

    // Najczęściej wyszukiwane marki - dzisiaj (ostatnie 24h) - tylko z navbar, catalog_search, catalog_filter
    // Wykrywa markę z pola brand lub z searchQuery (jeśli zawiera nazwę marki)
    @Query(value = "SELECT COALESCE(s.brand, " +
           "CASE " +
           "WHEN LOWER(s.search_query) LIKE '%apple%' OR LOWER(s.search_query) LIKE '%iphone%' THEN 'Apple' " +
           "WHEN LOWER(s.search_query) LIKE '%samsung%' THEN 'Samsung' " +
           "WHEN LOWER(s.search_query) LIKE '%xiaomi%' THEN 'Xiaomi' " +
           "WHEN LOWER(s.search_query) LIKE '%huawei%' THEN 'Huawei' " +
           "WHEN LOWER(s.search_query) LIKE '%oneplus%' OR LOWER(s.search_query) LIKE '%one plus%' THEN 'OnePlus' " +
           "WHEN LOWER(s.search_query) LIKE '%google%' OR LOWER(s.search_query) LIKE '%pixel%' THEN 'Google' " +
           "WHEN LOWER(s.search_query) LIKE '%nothing%' THEN 'Nothing' " +
           "WHEN LOWER(s.search_query) LIKE '%realme%' THEN 'Realme' " +
           "WHEN LOWER(s.search_query) LIKE '%oppo%' THEN 'Oppo' " +
           "WHEN LOWER(s.search_query) LIKE '%vivo%' THEN 'Vivo' " +
           "WHEN LOWER(s.search_query) LIKE '%motorola%' OR LOWER(s.search_query) LIKE '%moto%' THEN 'Motorola' " +
           "WHEN LOWER(s.search_query) LIKE '%sony%' THEN 'Sony' " +
           "END) as detected_brand, " +
           "COUNT(*) as count " +
           "FROM search_logs s " +
           "WHERE s.created_at >= :startDate " +
           "AND s.search_source IN ('navbar', 'catalog_search', 'catalog_filter') " +
           "AND (s.brand IS NOT NULL " +
           "OR LOWER(s.search_query) LIKE '%apple%' OR LOWER(s.search_query) LIKE '%iphone%' " +
           "OR LOWER(s.search_query) LIKE '%samsung%' " +
           "OR LOWER(s.search_query) LIKE '%xiaomi%' " +
           "OR LOWER(s.search_query) LIKE '%huawei%' " +
           "OR LOWER(s.search_query) LIKE '%oneplus%' OR LOWER(s.search_query) LIKE '%one plus%' " +
           "OR LOWER(s.search_query) LIKE '%google%' OR LOWER(s.search_query) LIKE '%pixel%' " +
           "OR LOWER(s.search_query) LIKE '%nothing%' " +
           "OR LOWER(s.search_query) LIKE '%realme%' " +
           "OR LOWER(s.search_query) LIKE '%oppo%' " +
           "OR LOWER(s.search_query) LIKE '%vivo%' " +
           "OR LOWER(s.search_query) LIKE '%motorola%' OR LOWER(s.search_query) LIKE '%moto%' " +
           "OR LOWER(s.search_query) LIKE '%sony%') " +
           "GROUP BY detected_brand " +
           "ORDER BY count DESC", nativeQuery = true)
    List<Object[]> findTopSearchedBrandsByPeriod(@Param("startDate") LocalDateTime startDate);

    // Najczęściej wyszukiwane marki z podziałem na źródło - dzisiaj - tylko z navbar, catalog_search, catalog_filter
    @Query(value = "SELECT COALESCE(s.brand, " +
           "CASE " +
           "WHEN LOWER(s.search_query) LIKE '%apple%' OR LOWER(s.search_query) LIKE '%iphone%' THEN 'Apple' " +
           "WHEN LOWER(s.search_query) LIKE '%samsung%' THEN 'Samsung' " +
           "WHEN LOWER(s.search_query) LIKE '%xiaomi%' THEN 'Xiaomi' " +
           "WHEN LOWER(s.search_query) LIKE '%huawei%' THEN 'Huawei' " +
           "WHEN LOWER(s.search_query) LIKE '%oneplus%' OR LOWER(s.search_query) LIKE '%one plus%' THEN 'OnePlus' " +
           "WHEN LOWER(s.search_query) LIKE '%google%' OR LOWER(s.search_query) LIKE '%pixel%' THEN 'Google' " +
           "WHEN LOWER(s.search_query) LIKE '%nothing%' THEN 'Nothing' " +
           "WHEN LOWER(s.search_query) LIKE '%realme%' THEN 'Realme' " +
           "WHEN LOWER(s.search_query) LIKE '%oppo%' THEN 'Oppo' " +
           "WHEN LOWER(s.search_query) LIKE '%vivo%' THEN 'Vivo' " +
           "WHEN LOWER(s.search_query) LIKE '%motorola%' OR LOWER(s.search_query) LIKE '%moto%' THEN 'Motorola' " +
           "WHEN LOWER(s.search_query) LIKE '%sony%' THEN 'Sony' " +
           "END) as detected_brand, " +
           "s.search_source, " +
           "COUNT(*) as count " +
           "FROM search_logs s " +
           "WHERE s.created_at >= :startDate " +
           "AND s.search_source IN ('navbar', 'catalog_search', 'catalog_filter') " +
           "AND (s.brand IS NOT NULL " +
           "OR LOWER(s.search_query) LIKE '%apple%' OR LOWER(s.search_query) LIKE '%iphone%' " +
           "OR LOWER(s.search_query) LIKE '%samsung%' " +
           "OR LOWER(s.search_query) LIKE '%xiaomi%' " +
           "OR LOWER(s.search_query) LIKE '%huawei%' " +
           "OR LOWER(s.search_query) LIKE '%oneplus%' OR LOWER(s.search_query) LIKE '%one plus%' " +
           "OR LOWER(s.search_query) LIKE '%google%' OR LOWER(s.search_query) LIKE '%pixel%' " +
           "OR LOWER(s.search_query) LIKE '%nothing%' " +
           "OR LOWER(s.search_query) LIKE '%realme%' " +
           "OR LOWER(s.search_query) LIKE '%oppo%' " +
           "OR LOWER(s.search_query) LIKE '%vivo%' " +
           "OR LOWER(s.search_query) LIKE '%motorola%' OR LOWER(s.search_query) LIKE '%moto%' " +
           "OR LOWER(s.search_query) LIKE '%sony%') " +
           "GROUP BY detected_brand, s.search_source " +
           "ORDER BY count DESC", nativeQuery = true)
    List<Object[]> findTopSearchedBrandsBySourceAndPeriod(@Param("startDate") LocalDateTime startDate);

        // Top 3 marki dla przedziału 0-1500 zł
        @Query("SELECT s.brand, COUNT(s) as count FROM SearchLog s WHERE s.brand IS NOT NULL AND s.searchSource = 'catalog_filter' AND ((s.minPrice >= 0 AND s.maxPrice <= 1500) OR (s.minPrice IS NULL AND s.maxPrice <= 1500) OR (s.minPrice >= 0 AND s.maxPrice IS NULL AND s.minPrice <= 1500)) GROUP BY s.brand ORDER BY count DESC")
        List<Object[]> findTopBrandsPriceRangeLow();

        // Top 3 marki dla przedziału 1500-5000 zł
        @Query("SELECT s.brand, COUNT(s) as count FROM SearchLog s WHERE s.brand IS NOT NULL AND s.searchSource = 'catalog_filter' AND ((s.minPrice >= 1500 AND s.maxPrice <= 5000) OR (s.minPrice >= 1500 AND s.maxPrice IS NULL AND s.minPrice <= 5000) OR (s.minPrice IS NULL AND s.maxPrice <= 5000 AND s.maxPrice >= 1500)) GROUP BY s.brand ORDER BY count DESC")
        List<Object[]> findTopBrandsPriceRangeMid();

        // Top 3 marki dla przedziału 5000+ zł
        @Query("SELECT s.brand, COUNT(s) as count FROM SearchLog s WHERE s.brand IS NOT NULL AND s.searchSource = 'catalog_filter' AND ((s.minPrice >= 5000) OR (s.maxPrice >= 5000)) GROUP BY s.brand ORDER BY count DESC")
        List<Object[]> findTopBrandsPriceRangeHigh();

    
}
