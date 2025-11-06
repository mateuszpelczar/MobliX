package com.example.backend.controller;

import com.example.backend.repository.AdvertisementRepository;
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
@CrossOrigin(origins = "http://localhost:5173")
public class SearchStatsController {

    private final SearchLogService searchLogService;
    private final AdvertisementRepository advertisementRepository;

    public SearchStatsController(SearchLogService searchLogService, AdvertisementRepository advertisementRepository) {
        this.searchLogService = searchLogService;
        this.advertisementRepository = advertisementRepository;
    }

    // Endpoint dla statystyk wyszukiwań (Staff Panel - Statystyki.tsx)
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getSearchStatistics() {
        Map<String, Object> stats = searchLogService.getSearchStatistics();
        
        // Dodaj najczęściej wystawiane marki
        List<Object[]> topListedBrands = advertisementRepository.findTopListedBrands();
        List<Map<String, Object>> listedBrandStats = topListedBrands.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("brand", row[0]);
                    item.put("count", row[1]);
                    return item;
                })
                .collect(Collectors.toList());
        stats.put("topListedBrands", listedBrandStats);
        
        return ResponseEntity.ok(stats);
    }
}
