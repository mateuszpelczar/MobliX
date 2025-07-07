package com.example.backend.models;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "brand")
public class Brand {

  @NotNull
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) 
  private Long id;

  @NotNull
  private String name;

  public Brand() {
  }

  // Getters and Setters
  public Long getId() {
    return id;
  }
  public void setId(Long id) {
    this.id = id;
  }
  public String getName() {
    return name;
  }
  public void setName(String name) {
    this.name = name;
  }

  
  @OneToMany(mappedBy = "brand")
  private List<Model> models;
  
}

