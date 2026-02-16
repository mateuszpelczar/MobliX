package com.example.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class SearchSuggestionsResponseDTO {
    private List<SearchSuggestionDTO> products = new ArrayList<>();
    private List<String> brands = new ArrayList<>();
    private List<CategorySuggestionDTO> categories = new ArrayList<>();

    public SearchSuggestionsResponseDTO() {}

    public SearchSuggestionsResponseDTO(List<SearchSuggestionDTO> products, List<String> brands, List<CategorySuggestionDTO> categories) {
        this.products = products != null ? products : new ArrayList<>();
        this.brands = brands != null ? brands : new ArrayList<>();
        this.categories = categories != null ? categories : new ArrayList<>();
    }

    
    public List<SearchSuggestionDTO> getProducts() {
        return products;
    }

    public void setProducts(List<SearchSuggestionDTO> products) {
        this.products = products != null ? products : new ArrayList<>();
    }

    public List<String> getBrands() {
        return brands;
    }

    public void setBrands(List<String> brands) {
        this.brands = brands != null ? brands : new ArrayList<>();
    }

    public List<CategorySuggestionDTO> getCategories() {
        return categories;
    }

    public void setCategories(List<CategorySuggestionDTO> categories) {
        this.categories = categories != null ? categories : new ArrayList<>();
    }
}