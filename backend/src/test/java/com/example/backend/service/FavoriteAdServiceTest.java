package com.example.backend.service;

import com.example.backend.model.Advertisement;
import com.example.backend.model.FavoriteAd;
import com.example.backend.model.User;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.FavoriteAdRepository;
import com.example.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Testy jednostkowe dla FavoriteAdService
 * Testują dodawanie, usuwanie i sprawdzanie ulubionych ogłoszeń
 */
@ExtendWith(MockitoExtension.class)
class FavoriteAdServiceTest {

    @Mock
    private FavoriteAdRepository favoriteAdRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AdvertisementRepository advertisementRepository;

    @Mock
    private AdvertisementService advertisementService;

    @Mock
    private LogService logService;

    @InjectMocks
    private FavoriteAdService favoriteAdService;

    private User testUser;
    private Advertisement testAd;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");

        testAd = new Advertisement();
        testAd.setId(100L);
        testAd.setTitle("iPhone 15 Pro");
        testAd.setDescription("Nowy telefon");
    }

    @Test
    @DisplayName("Powinien dodać ogłoszenie do ulubionych")
    void shouldAddToFavorites() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(false);

        // When
        favoriteAdService.addToFavorites("test@example.com", 100L);

        // Then
        verify(favoriteAdRepository).save(any(FavoriteAd.class));
        verify(logService).logUserActivity(eq(testUser), contains("Dodano do ulubionych"), anyString());
    }

    @Test
    @DisplayName("Nie powinien dodać duplikatu do ulubionych")
    void shouldNotAddDuplicateFavorite() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(true);

        // When
        favoriteAdService.addToFavorites("test@example.com", 100L);

        // Then
        verify(favoriteAdRepository, never()).save(any(FavoriteAd.class));
    }

    @Test
    @DisplayName("Powinien usunąć ogłoszenie z ulubionych")
    void shouldRemoveFromFavorites() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));

        // When
        favoriteAdService.removeFromFavorites("test@example.com", 100L);

        // Then
        verify(favoriteAdRepository).deleteByUserAndAdvertisement(testUser, testAd);
        verify(logService).logUserActivity(eq(testUser), contains("Usunieto z ulubionych"), anyString());
    }

    @Test
    @DisplayName("Powinien zwrócić true gdy ogłoszenie jest w ulubionych")
    void shouldReturnTrueWhenFavorite() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(true);

        // When
        boolean isFavorite = favoriteAdService.isFavorite("test@example.com", 100L);

        // Then
        assertTrue(isFavorite);
    }

    @Test
    @DisplayName("Powinien zwrócić false gdy ogłoszenie nie jest w ulubionych")
    void shouldReturnFalseWhenNotFavorite() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(false);

        // When
        boolean isFavorite = favoriteAdService.isFavorite("test@example.com", 100L);

        // Then
        assertFalse(isFavorite);
    }

    @Test
    @DisplayName("Powinien policzyć ulubione ogłoszenia użytkownika")
    void shouldCountUserFavorites() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(favoriteAdRepository.countByUser(testUser)).thenReturn(5L);

        // When
        long count = favoriteAdService.countUserFavorites("test@example.com");

        // Then
        assertEquals(5L, count);
    }

    @Test
    @DisplayName("Powinien rzucić wyjątek dla nieistniejącego użytkownika")
    void shouldThrowForNonExistentUser() {
        // Given
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, 
            () -> favoriteAdService.addToFavorites("nonexistent@example.com", 100L));
    }

    @Test
    @DisplayName("Powinien rzucić wyjątek dla nieistniejącego ogłoszenia")
    void shouldThrowForNonExistentAdvertisement() {
        // Given
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(999L)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, 
            () -> favoriteAdService.addToFavorites("test@example.com", 999L));
    }
}
