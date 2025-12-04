package com.example.backend.service;

import com.example.backend.model.Advertisement;
import com.example.backend.model.SmartphoneSpecification;
import com.example.backend.repository.AdvertisementRepository;
import org.opensearch.action.search.SearchRequest;
import org.opensearch.action.search.SearchResponse;
import org.opensearch.action.index.IndexRequest;
import org.opensearch.client.RequestOptions;
import org.opensearch.client.RestHighLevelClient;
import org.opensearch.index.query.QueryBuilders;
import org.opensearch.search.builder.SearchSourceBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.*;

@Service
public class OpenSearchService {

    private final RestHighLevelClient opensearchClient;
    private final AdvertisementRepository advertisementRepository;
    private static final String SMARTPHONE_INDEX = "smartphones";

    @Autowired(required = false)
    public OpenSearchService(RestHighLevelClient opensearchClient, 
                            @Autowired(required = false) AdvertisementRepository advertisementRepository) {
        this.opensearchClient = opensearchClient;
        this.advertisementRepository = advertisementRepository;
    }

    /**
     * Indeksuje ogłoszenie smartfona w OpenSearch
     */
    public void indexAdvertisement(Long advertisementId, String title, String brand, String model, String description) {
        if (opensearchClient == null) {
            return; // OpenSearch wyłączony
        }
        try {
            Map<String, Object> document = new HashMap<>();
            document.put("id", advertisementId);
            document.put("title", title);
            document.put("brand", brand);
            document.put("model", model);
            document.put("description", description);
            document.put("timestamp", System.currentTimeMillis());

            IndexRequest request = new IndexRequest(SMARTPHONE_INDEX)
                    .id(advertisementId.toString())
                    .source(document);

            opensearchClient.index(request, RequestOptions.DEFAULT);
        } catch (IOException e) {
            System.err.println("Błąd indeksowania: " + e.getMessage());
        }
    }

    /**
     * Pobiera sugestie na podstawie wprowadzonego tekstu
     */
    public List<String> getSuggestions(String query, int limit) {
        if (opensearchClient == null) {
            return Collections.emptyList(); // OpenSearch wyłączony
        }
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
            
            // Wyszukiwanie po marce i modelu z wildcard
            sourceBuilder.query(QueryBuilders.boolQuery()
                    .should(QueryBuilders.wildcardQuery("brand", "*" + query.toLowerCase() + "*"))
                    .should(QueryBuilders.wildcardQuery("model", "*" + query.toLowerCase() + "*"))
                    .should(QueryBuilders.matchPhrasePrefixQuery("brand", query))
                    .should(QueryBuilders.matchPhrasePrefixQuery("model", query))
            );
            sourceBuilder.size(limit * 5); // Pobierz więcej wyników do filtrowania

            SearchRequest searchRequest = new SearchRequest(SMARTPHONE_INDEX);
            searchRequest.source(sourceBuilder);

            SearchResponse response = opensearchClient.search(searchRequest, RequestOptions.DEFAULT);
            
            Set<String> suggestions = new LinkedHashSet<>();
            String queryLower = query.toLowerCase().trim();
            
            response.getHits().forEach(hit -> {
                Map<String, Object> source = hit.getSourceAsMap();
                String brand = (String) source.get("brand");
                String model = (String) source.get("model");
                
                if (brand != null && model != null) {
                    String brandLower = brand.toLowerCase();
                    String modelLower = model.toLowerCase();
                    String fullName = brand + " " + model;
                    
                    // Przypadek 1: Wpisano część marki (np. "re" -> "Realme")
                    if (brandLower.contains(queryLower) && !brandLower.equals(queryLower)) {
                        suggestions.add(brand); // Dodaj samą markę
                    }
                    
                    // Przypadek 2: Wpisano dokładnie markę (np. "realme" -> "Realme GT 2 Pro")
                    // LUB wpisano markę + część modelu (np. "realme gt" -> "Realme GT 2 Pro")
                    if (brandLower.equals(queryLower) || 
                        brandLower.contains(queryLower) || 
                        modelLower.contains(queryLower) ||
                        fullName.toLowerCase().contains(queryLower)) {
                        suggestions.add(fullName); // Dodaj pełną nazwę "Marka Model"
                    }
                }
            });

            // Ogranicz do limitu
            return suggestions.stream().limit(limit).collect(java.util.stream.Collectors.toList());
        } catch (IOException e) {
            System.err.println("Błąd wyszukiwania sugestii: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Wyszukuje smartfony na podstawie zapytania
     */
    public List<Map<String, Object>> search(String query, int limit) {
        if (opensearchClient == null) {
            return Collections.emptyList(); // OpenSearch wyłączony
        }
        if (query == null || query.trim().isEmpty()) {
            return Collections.emptyList();
        }

        try {
            SearchSourceBuilder sourceBuilder = new SearchSourceBuilder();
            sourceBuilder.query(QueryBuilders.multiMatchQuery(query, "brand", "model", "title", "description"));
            sourceBuilder.size(limit);

            SearchRequest searchRequest = new SearchRequest(SMARTPHONE_INDEX);
            searchRequest.source(sourceBuilder);

            SearchResponse response = opensearchClient.search(searchRequest, RequestOptions.DEFAULT);
            
            List<Map<String, Object>> results = new ArrayList<>();
            response.getHits().forEach(hit -> results.add(hit.getSourceAsMap()));

            return results;
        } catch (IOException e) {
            System.err.println("Błąd wyszukiwania: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Reindeksuje wszystkie istniejące ogłoszenia do OpenSearch
     * Użyj tego aby zaindeksować stare ogłoszenia
     */
    public int reindexAllAdvertisements() {
        if (opensearchClient == null) {
            System.err.println("OpenSearch client jest wyłączony");
            return 0;
        }
        
        if (advertisementRepository == null) {
            System.err.println("AdvertisementRepository nie jest dostępny");
            return 0;
        }
        
        List<Advertisement> allAds = advertisementRepository.findAll();
        int successCount = 0;
        int failCount = 0;
        
        System.out.println("Rozpoczynam reindeksowanie " + allAds.size() + " ogłoszeń...");
        
        for (Advertisement ad : allAds) {
            try {
                SmartphoneSpecification spec = ad.getSmartphoneSpecification();
                String brand = spec != null ? spec.getBrand() : "";
                String model = spec != null ? spec.getModel() : "";
                
                indexAdvertisement(
                    ad.getId(),
                    ad.getTitle(),
                    brand,
                    model,
                    ad.getDescription()
                );
                successCount++;
                
                if (successCount % 10 == 0) {
                    System.out.println("Zaindeksowano " + successCount + "/" + allAds.size() + " ogłoszeń");
                }
            } catch (Exception e) {
                failCount++;
                System.err.println("Błąd indeksowania ogłoszenia ID " + ad.getId() + ": " + e.getMessage());
            }
        }
        
        System.out.println("Reindeksowanie zakończone! Sukces: " + successCount + ", Błędy: " + failCount);
        return successCount;
    }
}
