package com.example.backend.service;

import com.example.backend.model.SearchLog;
import com.example.backend.repository.SearchLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        // 10. Najczęściej wystawiane marki wg przedziałów cenowych (0-1500,1500-5000,5000+)
        stats.put("priceRangesByBrand", getTopListedBrandsByPriceBuckets());

        return stats;
    }

    // Aggregation: top listed/searching brands per price bucket based on search_logs
    public List<Map<String, Object>> getTopListedBrandsByPriceBuckets() {
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        // low bucket
        List<Object[]> low = searchLogRepository.findTopBrandsBySearchPriceRangeLow();
        if (low != null && !low.isEmpty()) {
            Object[] row = low.get(0);
            Map<String, Object> item = new HashMap<>();
            item.put("brand", row[0]);
            item.put("minPrice", 0);
            item.put("maxPrice", 1500);
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        } else {
            result.add(Map.of("brand", null, "minPrice", 0, "maxPrice", 1500, "count", 0));
        }

        // mid bucket
        List<Object[]> mid = searchLogRepository.findTopBrandsBySearchPriceRangeMid();
        if (mid != null && !mid.isEmpty()) {
            Object[] row = mid.get(0);
            Map<String, Object> item = new HashMap<>();
            item.put("brand", row[0]);
            item.put("minPrice", 1500);
            item.put("maxPrice", 5000);
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        } else {
            result.add(Map.of("brand", null, "minPrice", 1500, "maxPrice", 5000, "count", 0));
        }

        // high bucket
        List<Object[]> high = searchLogRepository.findTopBrandsBySearchPriceRangeHigh();
        if (high != null && !high.isEmpty()) {
            Object[] row = high.get(0);
            Map<String, Object> item = new HashMap<>();
            item.put("brand", row[0]);
            item.put("minPrice", 5000);
            item.put("maxPrice", null);
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        } else {
            result.add(Map.of("brand", null, "minPrice", 5000, "maxPrice", null, "count", 0));
        }

        return result;
    }

    // Najczęściej wyszukiwane marki z podziałem na okresy
    public Map<String, Object> getTopBrandsByTimePeriod(String period) {
        Map<String, Object> result = new HashMap<>();
        LocalDateTime startDate;

        switch (period.toLowerCase()) {
            case "today":
                startDate = LocalDateTime.now().minusHours(24);
                break;
            case "week":
                startDate = LocalDateTime.now().minusDays(7);
                break;
            case "month":
                startDate = LocalDateTime.now().minusDays(30);
                break;
            default:
                startDate = LocalDateTime.now().minusHours(24);
        }

        // Pobierz top marki dla danego okresu (limit 3)
        List<Object[]> topBrands = searchLogRepository.findTopSearchedBrandsByPeriod(startDate);
        List<Map<String, Object>> brandStats = topBrands.stream()
                .limit(3)
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("brand", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());

        // Pobierz szczegóły według źródła
        List<Object[]> brandsBySource = searchLogRepository.findTopSearchedBrandsBySourceAndPeriod(startDate);
        Map<String, Map<String, Long>> sourceBreakdown = new HashMap<>();

        for (Object[] row : brandsBySource) {
            String brand = (String) row[0];
            String source = (String) row[1];
            Long count = (Long) row[2];

            sourceBreakdown.putIfAbsent(brand, new HashMap<>());
            sourceBreakdown.get(brand).put(source, count);
        }

        result.put("topBrands", brandStats);
        result.put("sourceBreakdown", sourceBreakdown);
        result.put("period", period);

        return result;
    }

    // Najczęściej wystawiane marki - z tabeli advertisements
    public List<Map<String, Object>> getTopListedBrands() {
        // To będzie wymagało zapytania do AdvertisementRepository
        // Na razie zwrócimy pustą listę, zaimplementujemy to w kontrolerze
        return List.of();
    }
}