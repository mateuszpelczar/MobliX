package com.example.backend.controller;

import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.SearchLogRepository;
import com.example.backend.service.SearchLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search-stats")
public class SearchStatsController {

    private final SearchLogService searchLogService;
    private final AdvertisementRepository advertisementRepository;
    private final SearchLogRepository searchLogRepository;

    public SearchStatsController(SearchLogService searchLogService, AdvertisementRepository advertisementRepository, SearchLogRepository searchLogRepository) {
        this.searchLogService = searchLogService;
        this.advertisementRepository = advertisementRepository;
        this.searchLogRepository = searchLogRepository;
    }

   //statystyki wyszukiwań dla panelu moderatora
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getSearchStatistics() {
        Map<String, Object> stats = searchLogService.getSearchStatistics();

        //najczęściej wystawiane marki
        List<Object[]> topListedBrands = advertisementRepository.findTopListedBrands();
        List<Map<String, Object>> listedBrandStats = topListedBrands.stream()
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("brand", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("topListedBrands", listedBrandStats);

        //przedziały cenowe z agregacji search_logs
        stats.put("priceRangesByBrand", searchLogService.getTopListedBrandsByPriceBuckets());

        return ResponseEntity.ok(stats);
    }

    //najczęściej wyszukiwane przedziały cenowe dla każdej marki
    public List<Map<String, Object>> getPriceRangesByBrand() {
        List<Object[]> results = searchLogRepository.findMostCommonPriceRangesByBrand();

        return results.stream().map(row -> {
            Map<String, Object> item = new HashMap<>();
            item.put("brand", row[0]);
            item.put("count", row[1]);
            item.put("minPrice", null);
            item.put("maxPrice", null);
            return item;
        }).collect(Collectors.toList());
    }

    //najczęściej wyszukiwane marki z podziałem na okresy
    @GetMapping("/top-brands-by-period")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTopBrandsByPeriod(@RequestParam(defaultValue = "today") String period) {
        Map<String, Object> result = searchLogService.getTopBrandsByTimePeriod(period);
        return ResponseEntity.ok(result);
    }

    //liczba wyszukiwań dla paska nawigacyjnego
    @GetMapping("/navbar-count")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getNavbarCount(@RequestParam(defaultValue = "today") String period) {
        Map<String, Object> result = searchLogService.getNavbarCounts(period);
        return ResponseEntity.ok(result);
    }
}