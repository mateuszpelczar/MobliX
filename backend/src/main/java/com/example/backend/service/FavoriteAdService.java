package com.example.backend.service;

import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.model.Advertisement;
import com.example.backend.model.FavoriteAd;
import com.example.backend.model.User;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.FavoriteAdRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class FavoriteAdService {

    @Autowired
    private FavoriteAdRepository favoriteAdRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdvertisementRepository advertisementRepository;

    @Autowired
    private AdvertisementService advertisementService;

    @Autowired
    private LogService logService;

    /**
     * Dodaj ogłoszenie do ulubionych
     */
    public void addToFavorites(String userEmail, Long advertisementId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Advertisement advertisement = advertisementRepository.findById(advertisementId)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        // Sprawdź czy już nie istnieje
        if (!favoriteAdRepository.existsByUserAndAdvertisement(user, advertisement)) {
            FavoriteAd favorite = new FavoriteAd();
            favorite.setUser(user);
            favorite.setAdvertisement(advertisement);
            favoriteAdRepository.save(favorite);
        }

        logService.logUserActivity(user, "Dodano do ulubionych: " + advertisement.getTitle(), "advertisementId:" + advertisement.getId());
    }

    /**
     * Usuń ogłoszenie z ulubionych
     */
    public void removeFromFavorites(String userEmail, Long advertisementId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Advertisement advertisement = advertisementRepository.findById(advertisementId)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        favoriteAdRepository.deleteByUserAndAdvertisement(user, advertisement);

        logService.logUserActivity(user, "Usunieto z ulubionych: " + advertisement.getTitle(), "advertisementId:" + advertisement.getId());
}

    /**
     * Sprawdź czy ogłoszenie jest w ulubionych
     */
    public boolean isFavorite(String userEmail, Long advertisementId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Advertisement advertisement = advertisementRepository.findById(advertisementId)
                .orElseThrow(() -> new RuntimeException("Advertisement not found"));

        return favoriteAdRepository.existsByUserAndAdvertisement(user, advertisement);
    }

    /**
     * Pobierz wszystkie ulubione ogłoszenia użytkownika
     */
    public List<AdvertisementResponseDTO> getUserFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<FavoriteAd> favorites = favoriteAdRepository.findByUser(user);
        
        return favorites.stream()
                .map(fav -> advertisementService.convertToResponseDTO(fav.getAdvertisement()))
                .collect(Collectors.toList());
    }

    /**
     * Policz ile użytkownik ma ulubionych ogłoszeń
     */
    public long countUserFavorites(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return favoriteAdRepository.countByUser(user);
    }


}
