package com.example.backend.service;

import com.example.backend.model.SearchLog;
import com.example.backend.repository.SearchLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchLogService {

    private final SearchLogRepository searchLogRepository;

    public SearchLogService(SearchLogRepository searchLogRepository) {
        this.searchLogRepository = searchLogRepository;
    }

    // Zapisz log wyszukiwania
    @Transactional
    public SearchLog saveSearchLog(SearchLog searchLog) {
        return searchLogRepository.save(searchLog);
    }

    // Statystyki dla Staff Panel - Statystyki.tsx
    public Map<String, Object> getSearchStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // 1. Wyszukiwania dzisiaj
        stats.put("searchesToday", searchLogRepository.countTodaySearches());

        // 2. Najczęściej wyszukiwane marki (top 10)
        List<Object[]> topBrands = searchLogRepository.findTopSearchedBrandsToday();
        List<Map<String, Object>> brandStats = topBrands.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("brand", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("topSearchedBrands", brandStats);

        // 3. Trendy wyszukiwań (ostatnie 7 dni)
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Object[]> trends = searchLogRepository.findSearchTrendsByDate(sevenDaysAgo);
        List<Map<String, Object>> trendStats = trends.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("date", row[0].toString());
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("searchTrends", trendStats);

        // 4. Analiza cen wyszukiwanych
        Object[] avgPrices = searchLogRepository.findAveragePriceRange();
        Map<String, Object> priceAnalysis = new HashMap<>();
        if (avgPrices != null && avgPrices.length >= 2) {
            priceAnalysis.put("avgMinPrice", avgPrices[0] != null ? Math.round((Double) avgPrices[0]) : 0);
            priceAnalysis.put("avgMaxPrice", avgPrices[1] != null ? Math.round((Double) avgPrices[1]) : 0);
        } else {
            priceAnalysis.put("avgMinPrice", 0);
            priceAnalysis.put("avgMaxPrice", 0);
        }
        stats.put("priceAnalysis", priceAnalysis);

        // 5. Analiza cen według marek (top 5)
        List<Object[]> pricesByBrand = searchLogRepository.findPriceAnalysisByBrand();
        List<Map<String, Object>> brandPriceStats = pricesByBrand.stream()
                .limit(5)
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("brand", row[0]);
                    item.put("avgMinPrice", row[1] != null ? Math.round((Double) row[1]) : 0);
                    item.put("avgMaxPrice", row[2] != null ? Math.round((Double) row[2]) : 0);
                    item.put("searchCount", row[3]);
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("priceAnalysisByBrand", brandPriceStats);

        // 6. Ostatnia aktywność wyszukiwań (ostatnie 20)
        List<SearchLog> recentSearches = searchLogRepository.findRecentSearches();
        List<Map<String, Object>> recentActivity = recentSearches.stream()
                .limit(20)
                .map(log -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", log.getId());
                    item.put("searchQuery", log.getSearchQuery());
                    item.put("brand", log.getBrand());
                    item.put("model", log.getModel());
                    item.put("minPrice", log.getMinPrice());
                    item.put("maxPrice", log.getMaxPrice());
                    item.put("createdAt", log.getCreatedAt().toString());
                    item.put("resultsCount", log.getResultsCount());
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("recentSearchActivity", recentActivity);

        // 7. Unikalni użytkownicy dzisiaj
        stats.put("uniqueUsersToday", searchLogRepository.countUniqueUsersToday());

        // 8. Unikalne sesje (anonimowe) dzisiaj
        stats.put("uniqueSessionsToday", searchLogRepository.countUniqueSessionsToday());

        // 9. Top modele
        List<Object[]> topModels = searchLogRepository.findTopSearchedModels();
        List<Map<String, Object>> modelStats = topModels.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("model", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("topSearchedModels", modelStats);

        return stats;
    }

    // Najczęściej wystawiane marki - z tabeli advertisements
    public List<Map<String, Object>> getTopListedBrands() {
        // To będzie wymagało zapytania do AdvertisementRepository
        // Na razie zwrócimy pustą listę, zaimplementujemy to w kontrolerze
        return List.of();
    }
}
