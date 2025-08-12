package com.example.backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//klasa reprezentujaca ulubione ogloszenia uzytkownikow
@Entity
@Table(name="ulubione_ogloszenia")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FavoriteAd {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User user;

    @ManyToOne
    private Advertisement advertisement;
  
}
