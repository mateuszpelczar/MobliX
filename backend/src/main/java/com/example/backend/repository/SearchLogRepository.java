package com.example.backend.repository;

import com.example.backend.model.SearchLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchLogRepository extends JpaRepository<SearchLog, Long> {

    // Liczenie wyszukiwań dzisiaj
    @Query("SELECT COUNT(s) FROM SearchLog s WHERE CAST(s.createdAt AS date) = CURRENT_DATE")
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
}
