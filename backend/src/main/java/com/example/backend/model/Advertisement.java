package com.example.backend.model;

import java.util.List;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Entity
@Table(name="ogloszenia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Advertisement {
//klasa reprezentujaca ogloszenia
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

    @OneToMany(mappedBy = "advers")
    private List<Image> images;

    @OneToMany(mappedBy = "advers")
    private List<Moderation> moderations;
  
}
