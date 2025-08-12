package com.example.backend.model;

import java.util.Date;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//klasa reprezentujaca podsumowanie raportu szczeglowego
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "raport_szczegolowy")
public class ReportSummary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // SALES, SEARCH, etc.
    private String description;
    private Date createdAt;

    @ManyToOne
    private User createdBy;
}