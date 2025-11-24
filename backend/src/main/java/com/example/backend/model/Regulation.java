package com.example.backend.model;

import java.util.Date;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
//klasa reprezentujaca regulacje i zasady korzystania z aplikacji
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "regulacje")
public class Regulation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;
    private Date createdAt;
}