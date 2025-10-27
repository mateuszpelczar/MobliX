package com.example.backend.dto;

public enum NotificationType {
    PRICE_CHANGE,           // Zmiana ceny
    IMAGES_CHANGED,         // Zmiana zdjęć
    DESCRIPTION_CHANGED,    // Zmiana opisu
    AD_DELETED,             // Ogłoszenie usunięte
    AD_ENDED,               // Ogłoszenie zakończone
    TERMS_UPDATED,          // Regulamin zaktualizowany
    NEW_MESSAGE             // Nowa wiadomość
}
