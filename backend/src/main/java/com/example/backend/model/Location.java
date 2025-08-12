package com.example.backend.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//klasa reprezentujaca lokalizacje ogloszen
@Entity
@Table(name="lokalizacje")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
   private Long id;
   private String city;
   private String region;

   @OneToMany(mappedBy = "location")
   private List<Advertisement> advers;
  
  
}
