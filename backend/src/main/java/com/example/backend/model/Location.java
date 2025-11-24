package com.example.backend.model;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

//klasa reprezentujaca lokalizacje ogloszen
@Entity
@Table(name="lokalizacje")
public class Location {

  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
   private Long id;
   private String city;
   private String region;

   @OneToMany(mappedBy = "location")
   private List<Advertisement> advertisements;

   // Konstruktory
   public Location() {}

   public Location(Long id, String city, String region, List<Advertisement> advertisements) {
     this.id = id;
     this.city = city;
     this.region = region;
     this.advertisements = advertisements;
   }

   // Gettery i Settery
   public Long getId() { return id; }
   public void setId(Long id) { this.id = id; }

   public String getCity() { return city; }
   public void setCity(String city) { this.city = city; }

   public String getRegion() { return region; }
   public void setRegion(String region) { this.region = region; }

   public List<Advertisement> getAdvertisements() { return advertisements; }
   public void setAdvertisements(List<Advertisement> advertisements) { this.advertisements = advertisements; }
}