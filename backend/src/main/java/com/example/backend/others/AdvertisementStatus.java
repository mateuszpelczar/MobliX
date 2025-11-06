package com.example.backend.others;

public enum AdvertisementStatus {
    PENDING,    // Oczekuje na moderację
    ACTIVE,     // Zatwierdzone i aktywne
    REJECTED,   // Odrzucone
    PAUSED,     // Wstrzymane przez użytkownika
    SOLD        // Sprzedane
}