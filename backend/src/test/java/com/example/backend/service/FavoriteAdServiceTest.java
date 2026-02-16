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

    //Sprawdza czy serwis poprawnie dodaje ogłoszenie do ulubionych
    @Test
    @DisplayName("Powinien dodać ogłoszenie do ulubionych")
    void shouldAddToFavorites() {
       
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(false);

       
        favoriteAdService.addToFavorites("test@example.com", 100L);

      
        verify(favoriteAdRepository).save(any(FavoriteAd.class));
        verify(logService).logUserActivity(eq(testUser), contains("Dodano do ulubionych"), anyString());
    }

    //Sprawdza czy serwis nie dodaje duplikatu do ulubionych
    @Test
    @DisplayName("Nie powinien dodać duplikatu do ulubionych")
    void shouldNotAddDuplicateFavorite() {
       
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(true);

     
        favoriteAdService.addToFavorites("test@example.com", 100L);

       
        verify(favoriteAdRepository, never()).save(any(FavoriteAd.class));
    }

    //Sprawdza czy serwis poprawnie usuwa ogłoszenie z ulubionych
    @Test
    @DisplayName("Powinien usunąć ogłoszenie z ulubionych")
    void shouldRemoveFromFavorites() {
       
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));

       
        favoriteAdService.removeFromFavorites("test@example.com", 100L);

       
        verify(favoriteAdRepository).deleteByUserAndAdvertisement(testUser, testAd);
        verify(logService).logUserActivity(eq(testUser), contains("Usunieto z ulubionych"), anyString());
    }

    //Sprawdza czy serwis poprawnie zwraca true gdy ogłoszenie jest w ulubionych
    @Test
    @DisplayName("Powinien zwrócić true gdy ogłoszenie jest w ulubionych")
    void shouldReturnTrueWhenFavorite() {
       
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(true);

      
        boolean isFavorite = favoriteAdService.isFavorite("test@example.com", 100L);

        
        assertTrue(isFavorite);
    }

    //Sprawdza czy serwis poprawnie zwraca false gdy ogłoszenie nie jest w ulubionych
    @Test
    @DisplayName("Powinien zwrócić false gdy ogłoszenie nie jest w ulubionych")
    void shouldReturnFalseWhenNotFavorite() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(100L)).thenReturn(Optional.of(testAd));
        when(favoriteAdRepository.existsByUserAndAdvertisement(testUser, testAd)).thenReturn(false);

       
        boolean isFavorite = favoriteAdService.isFavorite("test@example.com", 100L);

        
        assertFalse(isFavorite);
    }

    //Sprawdza czy serwis poprawnie liczy ulubione ogłoszenia użytkownika
    @Test
    @DisplayName("Powinien policzyć ulubione ogłoszenia użytkownika")
    void shouldCountUserFavorites() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(favoriteAdRepository.countByUser(testUser)).thenReturn(5L);

       
        long count = favoriteAdService.countUserFavorites("test@example.com");

        
        assertEquals(5L, count);
    }

    //Sprawdza czy serwis rzuci wyjątek dla nieistniejącego użytkownika
    @Test
    @DisplayName("Powinien rzucić wyjątek dla nieistniejącego użytkownika")
    void shouldThrowForNonExistentUser() {
        
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

       
        assertThrows(RuntimeException.class, 
            () -> favoriteAdService.addToFavorites("nonexistent@example.com", 100L));
    }

    //Sprawdza czy serwis rzuci wyjątek dla nieistniejącego ogłoszenia
    @Test
    @DisplayName("Powinien rzucić wyjątek dla nieistniejącego ogłoszenia")
    void shouldThrowForNonExistentAdvertisement() {
        
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(advertisementRepository.findById(999L)).thenReturn(Optional.empty());

       
        assertThrows(RuntimeException.class, 
            () -> favoriteAdService.addToFavorites("test@example.com", 999L));
    }
}
