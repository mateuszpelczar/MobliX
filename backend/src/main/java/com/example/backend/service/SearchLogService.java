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

    
    @Transactional
    public SearchLog saveSearchLog(SearchLog searchLog) {
        return searchLogRepository.save(searchLog);
    }

    
    public Map<String, Object> getSearchStatistics() {
        Map<String, Object> stats = new HashMap<>();

       
        stats.put("searchesToday", searchLogRepository.countTodaySearches());

        // Najczęściej wyszukiwane marki - dzisiaj
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

       // Średnie ceny wyszukiwań według marki
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

        
        List<SearchLog> recentSearches = searchLogRepository.findRecentSearches();
        
        List<Map<String, Object>> recentActivity = recentSearches.stream()
                .filter(log -> {
                    String src = log.getSearchSource();
                    return src != null && (src.equalsIgnoreCase("navbar") || src.equalsIgnoreCase("catalog_filter"));
                })
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
                    
                    item.put("searchSource", log.getSearchSource());
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("recentSearchActivity", recentActivity);

       
        stats.put("uniqueUsersToday", searchLogRepository.countUniqueUsersToday());

        
        stats.put("uniqueSessionsToday", searchLogRepository.countUniqueSessionsToday());

        // Najczęściej wyszukiwane modele
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

        
        stats.put("priceRangesByBrand", getTopListedBrandsByPriceBuckets());

        return stats;
    }

    public List<Map<String, Object>> getTopListedBrandsByPriceBuckets() {
        List<Map<String, Object>> result = new java.util.ArrayList<>();

        // Przedziały cenowe wyszukiwań - niskie
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
            Map<String, Object> emptyLow = new HashMap<>();
            emptyLow.put("brand", null);
            emptyLow.put("minPrice", 0);
            emptyLow.put("maxPrice", 1500);
            emptyLow.put("count", 0);
            result.add(emptyLow);
        }

    // Przedziały cenowe wyszukiwań - średnie
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
            Map<String, Object> emptyMid = new HashMap<>();
            emptyMid.put("brand", null);
            emptyMid.put("minPrice", 1500);
            emptyMid.put("maxPrice", 5000);
            emptyMid.put("count", 0);
            result.add(emptyMid);
        }

      // Przedziały cenowe wyszukiwań - wysokie
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
            Map<String, Object> emptyHigh = new HashMap<>();
            emptyHigh.put("brand", null);
            emptyHigh.put("minPrice", 5000);
            emptyHigh.put("maxPrice", null);
            emptyHigh.put("count", 0);
            result.add(emptyHigh);
        }

        return result;
    }

        // Liczba wyszukiwań w nawiasie - dzisiaj lub podział na dni
        public Map<String, Object> getNavbarCounts(String period) {
            Map<String, Object> result = new HashMap<>();
            if (period == null || period.equalsIgnoreCase("today")) {
                Long count = searchLogRepository.countNavbarToday();
                result.put("count", count != null ? count : 0);
                return result;
            }

            java.time.LocalDateTime startDate;
            switch (period.toLowerCase()) {
                case "week":
                    startDate = java.time.LocalDateTime.now().minusDays(7);
                    break;
                case "month":
                    startDate = java.time.LocalDateTime.now().minusDays(30);
                    break;
                default:
                    startDate = java.time.LocalDateTime.now().minusDays(7);
            }

            List<Object[]> rows = searchLogRepository.findNavbarCountsByDate(startDate);
            List<Map<String, Object>> byDate = rows.stream().map(r -> {
                Map<String, Object> m = new HashMap<>();
                m.put("date", r[0].toString());
                m.put("count", ((Number) r[1]).longValue());
                return m;
            }).collect(Collectors.toList());
            result.put("byDate", byDate);
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

        // Pobieranie szczegółów według źródła
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
        
        return List.of();
    }
}