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

    // Endpoint dla statystyk wyszukiwań (Staff Panel - Statystyki.tsx)
@GetMapping
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public ResponseEntity<Map<String, Object>> getSearchStatistics() {
    Map<String, Object> stats = searchLogService.getSearchStatistics();
    
    // Dodaj najczęściej wystawiane marki (aktywne ogłoszenia, limit 5)
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
    
    // Dodaj przedziały cenowe według marek - wywołaj metodę z tego kontrolera
    stats.put("priceRangesByBrand", getPriceRangesByBrand());
    
    return ResponseEntity.ok(stats);
}

// Metodo do sekcji Analiza cen według marek w pliku statystyki
public List<Map<String, Object>> getPriceRangesByBrand(){
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

    // Nowy endpoint dla najczęściej wyszukiwanych marek z podziałem na okresy
    @GetMapping("/top-brands-by-period")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getTopBrandsByPeriod(@RequestParam(defaultValue = "today") String period) {
        Map<String, Object> result = searchLogService.getTopBrandsByTimePeriod(period);
        return ResponseEntity.ok(result);
    }
}