package com.example.backend.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;


@Entity
@Table(name="categories")
public class Category {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  private String name;

  @OneToMany(mappedBy = "category")
  private List<Advertisement> advertisements;

 
  public Category() {}

  public Category(Long id, String name, List<Advertisement> advertisements) {
    this.id = id;
    this.name = name;
    this.advertisements = advertisements;
  }

  
  public Long getId() { return id; }
  public void setId(Long id) { this.id = id; }

  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public List<Advertisement> getAdvertisements() { return advertisements; }
  public void setAdvertisements(List<Advertisement> advertisements) { this.advertisements = advertisements; }
}