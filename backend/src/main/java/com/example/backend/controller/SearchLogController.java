package com.example.backend.controller;

import com.example.backend.model.SearchLog;
import com.example.backend.service.SearchLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search-logs")
@CrossOrigin(origins = "http://localhost:5173")
public class SearchLogController {

    private final SearchLogService searchLogService;

    public SearchLogController(SearchLogService searchLogService) {
        this.searchLogService = searchLogService;
    }

    // Endpoint do zapisywania wyszukiwania
    @PostMapping
    public ResponseEntity<SearchLog> logSearch(
            @RequestBody SearchLogRequest request,
            HttpServletRequest httpRequest) {
        
        SearchLog searchLog = new SearchLog();
        searchLog.setSearchQuery(request.getSearchQuery());
        searchLog.setBrand(request.getBrand());
        searchLog.setModel(request.getModel());
        searchLog.setMinPrice(request.getMinPrice());
        searchLog.setMaxPrice(request.getMaxPrice());
        searchLog.setUserId(request.getUserId());
        searchLog.setSessionId(request.getSessionId());
        searchLog.setIpAddress(getClientIP(httpRequest));
        searchLog.setResultsCount(request.getResultsCount());

        SearchLog savedLog = searchLogService.saveSearchLog(searchLog);
        return ResponseEntity.ok(savedLog);
    }

    // metoda pomocnicza do pobierania ip klienta
    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }

    // DTO dla zapytan
    public static class SearchLogRequest {
        private String searchQuery;
        private String brand;
        private String model;
        private Double minPrice;
        private Double maxPrice;
        private Long userId;
        private String sessionId;
        private Integer resultsCount;

        // Gett i sett
        public String getSearchQuery() {
            return searchQuery;
        }

        public void setSearchQuery(String searchQuery) {
            this.searchQuery = searchQuery;
        }

        public String getBrand() {
            return brand;
        }

        public void setBrand(String brand) {
            this.brand = brand;
        }

        public String getModel() {
            return model;
        }

        public void setModel(String model) {
            this.model = model;
        }

        public Double getMinPrice() {
            return minPrice;
        }

        public void setMinPrice(Double minPrice) {
            this.minPrice = minPrice;
        }

        public Double getMaxPrice() {
            return maxPrice;
        }

        public void setMaxPrice(Double maxPrice) {
            this.maxPrice = maxPrice;
        }

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getSessionId() {
            return sessionId;
        }

        public void setSessionId(String sessionId) {
            this.sessionId = sessionId;
        }

        public Integer getResultsCount() {
            return resultsCount;
        }

        public void setResultsCount(Integer resultsCount) {
            this.resultsCount = resultsCount;
        }
    }
}
