package com.example.backend.service;

import com.example.backend.dto.NotificationDTO;
import com.example.backend.dto.NotificationType;
import com.example.backend.model.Advertisement;
import com.example.backend.model.FavoriteAd;
import com.example.backend.model.Notification;
import com.example.backend.model.User;
import com.example.backend.repository.FavoriteAdRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FavoriteAdRepository favoriteAdRepository;

    // Konwersja Notification -> NotificationDTO
    private NotificationDTO convertToDTO(Notification notification) {
        return new NotificationDTO(
            notification.getId(),
            notification.getType(),
            notification.getTitle(),
            notification.getMessage(),
            notification.getIsRead(),
            notification.getCreatedAt(),
            notification.getAdvertisement() != null ? notification.getAdvertisement().getId() : null,
            notification.getOldValue(),
            notification.getNewValue()
        );
    }

    // Pobierz wszystkie powiadomienia użytkownika
    public List<NotificationDTO> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user);
        return notifications.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // Pobierz nieprzeczytane powiadomienia
    public List<NotificationDTO> getUnreadNotifications(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> notifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        return notifications.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    // Liczba nieprzeczytanych powiadomień
    public Long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        return notificationRepository.countByUserAndIsRead(user, false);
    }

    // Oznacz powiadomienie jako przeczytane
    @Transactional
    public void markAsRead(String userEmail, Long notificationId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    // Oznacz wszystkie jako przeczytane
    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Notification> unreadNotifications = notificationRepository.findByUserAndIsReadOrderByCreatedAtDesc(user, false);
        
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(true);
        }
        
        notificationRepository.saveAll(unreadNotifications);
    }

    // Utwórz powiadomienie o zmianie ceny
    @Transactional
    public void createPriceChangeNotification(Advertisement advertisement, Double oldPrice, Double newPrice) {
        List<FavoriteAd> favorites = favoriteAdRepository.findByAdvertisement(advertisement);
        
        for (FavoriteAd favorite : favorites) {
            Notification notification = new Notification();
            notification.setUser(favorite.getUser());
            notification.setAdvertisement(advertisement);
            notification.setType(NotificationType.PRICE_CHANGE);
            notification.setTitle(advertisement.getTitle());
            notification.setMessage(String.format("Cena ogłoszenia została zmieniona z %.2f zł na %.2f zł", oldPrice, newPrice));
            notification.setOldValue(String.format("%.2f", oldPrice));
            notification.setNewValue(String.format("%.2f", newPrice));
            
            notificationRepository.save(notification);
        }
    }

    // Utwórz powiadomienie o zmianie zdjęć
    @Transactional
    public void createImagesChangedNotification(Advertisement advertisement) {
        List<FavoriteAd> favorites = favoriteAdRepository.findByAdvertisement(advertisement);
        
        for (FavoriteAd favorite : favorites) {
            Notification notification = new Notification();
            notification.setUser(favorite.getUser());
            notification.setAdvertisement(advertisement);
            notification.setType(NotificationType.IMAGES_CHANGED);
            notification.setTitle(advertisement.getTitle());
            notification.setMessage("Sprzedający dodał lub zmienił zdjęcia w ogłoszeniu");
            
            notificationRepository.save(notification);
        }
    }

    // Utwórz powiadomienie o zmianie opisu
    @Transactional
    public void createDescriptionChangedNotification(Advertisement advertisement) {
        List<FavoriteAd> favorites = favoriteAdRepository.findByAdvertisement(advertisement);
        
        for (FavoriteAd favorite : favorites) {
            Notification notification = new Notification();
            notification.setUser(favorite.getUser());
            notification.setAdvertisement(advertisement);
            notification.setType(NotificationType.DESCRIPTION_CHANGED);
            notification.setTitle(advertisement.getTitle());
            notification.setMessage("Opis ogłoszenia został zaktualizowany");
            
            notificationRepository.save(notification);
        }
    }

    // Utwórz powiadomienie o usunięciu ogłoszenia
    @Transactional
    public void createAdDeletedNotification(Advertisement advertisement) {
        List<FavoriteAd> favorites = favoriteAdRepository.findByAdvertisement(advertisement);
        
        for (FavoriteAd favorite : favorites) {
            Notification notification = new Notification();
            notification.setUser(favorite.getUser());
            notification.setAdvertisement(advertisement);
            notification.setType(NotificationType.AD_DELETED);
            notification.setTitle(advertisement.getTitle());
            notification.setMessage("Ogłoszenie zostało usunięte i nie jest już dostępne");
            
            notificationRepository.save(notification);
        }
    }

    // Utwórz powiadomienie o zakończeniu ogłoszenia
    @Transactional
    public void createAdEndedNotification(Advertisement advertisement) {
        List<FavoriteAd> favorites = favoriteAdRepository.findByAdvertisement(advertisement);
        
        for (FavoriteAd favorite : favorites) {
            Notification notification = new Notification();
            notification.setUser(favorite.getUser());
            notification.setAdvertisement(advertisement);
            notification.setType(NotificationType.AD_ENDED);
            notification.setTitle(advertisement.getTitle());
            notification.setMessage("Ogłoszenie zostało zakończone przez sprzedawcę");
            
            notificationRepository.save(notification);
        }
    }

    // Utwórz powiadomienie o zmianie regulaminu (dla wszystkich użytkowników)
    @Transactional
    public void createTermsUpdatedNotification() {
        List<User> allUsers = userRepository.findAll();
        
        for (User user : allUsers) {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setAdvertisement(null);
            notification.setType(NotificationType.TERMS_UPDATED);
            notification.setTitle("Platforma MobliX");
            notification.setMessage("Regulamin platformy został zaktualizowany. Zapoznaj się z nowymi zasadami.");
            
            notificationRepository.save(notification);
        }
    }

    // Usuń powiadomienie
    @Transactional
    public void deleteNotification(String userEmail, Long notificationId) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to notification");
        }
        
        notificationRepository.delete(notification);
    }
}
