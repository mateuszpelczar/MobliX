package com.example.backend.model;

import java.util.List;


import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Entity
@Table(name="ogloszenia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Ad {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;

  private String title;
    private String description;
    private String productDescription; // Dodany opis produktu
    private Double price;

    @ManyToOne
    private User user;

    @ManyToOne
    @JoinColumn(name="category_id")
    private Category category;

    @ManyToOne
    private Location location;

    @OneToMany(mappedBy = "ad")
    private List<Image> images;

    @OneToMany(mappedBy = "ad")
    private List<Moderation> moderations;
  
}
