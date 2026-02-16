package com.example.backend.dto;

import java.math.BigDecimal;

public class SearchSuggestionDTO {
  private Long id;
  private String name;
  private String brand;
  private String categoryName;
  private String imageUrl;
  private BigDecimal price;
  private Double rank;
  private String suggestionType;


  public SearchSuggestionDTO(){}

  public SearchSuggestionDTO(Long id, String name, String brand, String categoryName, String imageUrl, BigDecimal price, Double rank, String suggestionType){
    this.id=id;
    this.name=name;
    this.categoryName=categoryName;
    this.imageUrl=imageUrl;
    this.price=price;
    this.rank=rank;
    this.suggestionType=suggestionType;
  }
  
  
  
    public Long getId(){
      return id;
    }
    public void setId(Long id){
      this.id=id;
    }

     public String getName(){
      return name;
    }
    public void setName(String name){
      this.name=name;
    }

     public String getBrand(){
      return brand;
    }
    public void setBrand(String brand){
      this.brand=brand;
    }

     public String getCategoryName(){
      return categoryName;
    }
    public void setCategoryName(String categoryName){
      this.categoryName=categoryName;
    }

     public String getImageUrl(){
      return imageUrl;
    }
    public void setImageUrl(String imageUrl){
      this.imageUrl=imageUrl;
    }

     public BigDecimal getPrice(){
      return price;
    }
    public void setPrice(BigDecimal price){
      this.price=price;
    }

     public Double getRank(){
      return rank;
    }
    public void setRank(Double rank){
      this.rank=rank;
    }

    public String getSuggestionType(){
      return suggestionType;
    }
    public void setSuggestionType(String suggestionType){
      this.suggestionType=suggestionType;
    }

    


} 
