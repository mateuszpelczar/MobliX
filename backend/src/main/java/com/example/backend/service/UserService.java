package com.example.backend.service;

import com.example.backend.dto.UserModerationDTO;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.others.LoginRequest;
import com.example.backend.others.RegisterRequest;
import com.example.backend.others.UpdateUserRequest;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.FavoriteAdRepository;
import com.example.backend.repository.LogRepository;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.NotificationRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final LogRepository logRepository;
    private final FavoriteAdRepository favoriteRepository;
    private final AdvertisementRepository advertisementRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;
    

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService,LogRepository logRepository, FavoriteAdRepository favoriteRepository,AdvertisementRepository advertisementRepository,MessageRepository messageRepository,NotificationRepository notificationRepository ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.logRepository = logRepository;
        this.favoriteRepository = favoriteRepository;
        this.advertisementRepository = advertisementRepository;
        this.messageRepository = messageRepository;
        this.notificationRepository = notificationRepository;

    }
 
    
    public String register(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        
        user.setAccountType(request.getAccountType());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        
        //firmowe
        if ("business".equals(request.getAccountType())) {
            user.setCompanyName(request.getCompanyName());
            user.setNip(request.getNip());
            user.setRegon(request.getRegon());
            user.setAddress(request.getAddress());
            user.setWebsite(request.getWebsite());
        }

        long userCount = userRepository.count();

        if (userCount == 0) {
            user.setRole(Role.ADMIN);  
        } else {
            user.setRole(Role.USER);  
        }

        userRepository.save(user);
        return jwtService.generateToken(user);
    }

    public String login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
   
        if(userOpt.isEmpty()){
            throw new RuntimeException("Invalid credentials");
        }

        User user = userOpt.get();

        //sprawdzenie hasla
        if(!passwordEncoder.matches(request.getPassword(),user.getPassword())){
            throw new RuntimeException("Invalid credentials");
        }

        //sprawdzenie czy uzytkownik jest zablokowany
        if(user.isBlocked()){
            //sprawdzenie czy blokada juz wygasla
            if(user.getBlockedUntil() !=null && user.getBlockedUntil().isBefore(java.time.LocalDateTime.now())){
                //automatycznie odblokuj
                user.setBlocked(false);
                user.setBlockedUntil(null)
;               user.setBlockReason(null);
                userRepository.save(user);

                return jwtService.generateToken(user);
            }else{
                //konto jest nadal zablokowane
                String blockMessage = "Twoje konto zostalo zablokowane";
                if(user.getBlockReason() != null){
                    blockMessage += " do " + user.getBlockedUntil();
                }
                if(user.getBlockReason() != null && !user.getBlockReason().isEmpty()){
                    blockMessage += ". Powod: " + user.getBlockReason();
                }
            throw new RuntimeException(blockMessage);
            }
            
        }
        return jwtService.generateToken(user);
    }

    public User getCurrentUser(String username) {
        return userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User updateUser(String email, UpdateUserRequest request) {
        User user = findByEmail(email);
        
        //podstawowe dane - update
        if (request.getAccountType() != null) {
            user.setAccountType(request.getAccountType());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        //update hasla
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        //update danych firmowych
        if ("business".equals(request.getAccountType())) {
            if (request.getCompanyName() != null) {
                user.setCompanyName(request.getCompanyName());
            }
            if (request.getNip() != null) {
                user.setNip(request.getNip());
            }
            if (request.getRegon() != null) {
                user.setRegon(request.getRegon());
            }
            if (request.getAddress() != null) {
                user.setAddress(request.getAddress());
            }
            if (request.getWebsite() != null) {
                user.setWebsite(request.getWebsite());
            }
        } else {
           
            user.setCompanyName(null);
            user.setNip(null);
            user.setRegon(null);
            user.setAddress(null);
            user.setWebsite(null);
        }
        
        return userRepository.save(user);
    }

   
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    
    public User getUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    //zmiana roli uzytkownika
    public User changeUserRole(Long userId, String newRole) {
        User user = getUserById(userId);
        
        // Walidacja - konwersja String na enum Role
        try {
            Role role = Role.valueOf(newRole.toUpperCase());
            user.setRole(role);
            return userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + newRole + ". Available roles: USER, STAFF, ADMIN");
        }
    }

   //usuwanie uzytkownika
    public void deleteUser(Long userId) {
        User user = getUserById(userId);
        
        //zabezpieczenie - nie mozna usunac ostatniego admina
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the last admin user");
            }
        }

       
        if(favoriteRepository !=null){
            favoriteRepository.deleteByUserId(userId);
        }

        
        if(advertisementRepository !=null){
            advertisementRepository.deleteByUserId(userId);
        }


       
        if(messageRepository !=null){
            messageRepository.deleteByUserId(userId);
        }

       
        if(notificationRepository !=null){
            notificationRepository.deleteByUserId(userId);
        }

       
        if(logRepository != null){
            logRepository.nullifyUserIdForUser(userId);
        }
        

       
        userRepository.delete(user);
    }


     public List<com.example.backend.dto.UserModerationDTO> getUsersForModeration(String currentUserEmail){
        User currentUser = findByEmail(currentUserEmail);
        List<User> users;

        if(currentUser.getRole() == Role.ADMIN){
            //admin widzi wszystkich
            users = userRepository.findAll();
        } else if(currentUser.getRole()== Role.STAFF){
            //staff widzi tylko user
            users = userRepository.findByRole(Role.USER);

        } else {
            throw new RuntimeException("Unauthorized access");
            
        }


        //automatyczne odblokowanie uzytkownikow z wygasla blokada
        java.time.LocalDateTime now = java.time.LocalDateTime.now();

        for(User user : users){
            if(user.isBlocked() != null && user.isBlocked() &&
                user.getBlockedUntil() !=null &&
                user.getBlockedUntil().isBefore(now)
            ){
                user.setBlocked(false);
                user.setBlockedUntil(null);
                user.setBlockReason(null);
                userRepository.save(user);

            }
        }

    

        return users.stream()
            .map(this::convertToModerationDTO)
            .collect(java.util.stream.Collectors.toList());
     }

     //blokowanie uzytkownika
    public User blockUser(Long userId, int durationMinutes, String reason) {
        User user = getUserById(userId);
        user.setBlocked(true);
        user.setBlockedUntil(java.time.LocalDateTime.now().plusMinutes(durationMinutes));
        user.setBlockReason(reason);
        return userRepository.save(user);
    }
    
    //odblokowanie uzytkownika
    public User unblockUser(Long userId) {
        User user = getUserById(userId);
        user.setBlocked(false);
        user.setBlockedUntil(null);
        user.setBlockReason(null);
        return userRepository.save(user);
    }
    
    //aktualizacja ostatniej aktywnosci uzytkownika
    public void updateLastActivity(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setLastActivity(java.time.LocalDateTime.now());
            userRepository.save(user);
        });
    }

    //zliczanie aktywnych uzytkownikow
    public long countActiveUsers(){
        return userRepository.count() - userRepository.countByIsBlockedTrue();
    }
    
    
    //konwersja uzytkownika na dto
    public  com.example.backend.dto.UserModerationDTO convertToModerationDTO(User user) {
        com.example.backend.dto.UserModerationDTO dto = new com.example.backend.dto.UserModerationDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().toString());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setCompanyName(user.getCompanyName());
        dto.setLastActivity(user.getLastActivity());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setAdvertisementCount(user.getAdvertisements() != null ? user.getAdvertisements().size() : 0);
        dto.setBlocked(user.isBlocked());
        dto.setBlockedUntil(user.getBlockedUntil());
        dto.setBlockReason(user.getBlockReason());
        return dto;

    }

    public UserModerationDTO convertToModerationDTOWithFullDetails(User user){
        UserModerationDTO dto = new UserModerationDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setAccountType(user.getAccountType());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setPhone(user.getPhone());
        dto.setCompanyName(user.getCompanyName());
        dto.setNip(user.getNip());
        dto.setRegon(user.getRegon());
        dto.setAddress(user.getAddress());
        dto.setWebsite(user.getWebsite());
        dto.setLastActivity(user.getLastActivity());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setAdvertisementCount(user.getAdvertisements() != null ? user.getAdvertisements().size() : 0);
        dto.setBlocked(user.isBlocked());
        dto.setBlockedUntil(user.getBlockedUntil());
        dto.setBlockReason(user.getBlockReason());
        return dto;

    }

    public void updateUserByAdmin(Long userId, UpdateUserRequest request) {
    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    
    if (request.getFirstName() != null) {
        user.setFirstName(request.getFirstName());
    }
    if (request.getLastName() != null) {
        user.setLastName(request.getLastName());
    }
    if (request.getPhone() != null) {
        user.setPhone(request.getPhone());
    }
    
    
    if (request.getAccountType() != null) {
        String oldAccountType = user.getAccountType();
        user.setAccountType(request.getAccountType());
        
        
        if ("business".equals(oldAccountType) && "private".equals(request.getAccountType())) {
            user.setCompanyName(null);
            user.setNip(null);
            user.setRegon(null);
            user.setAddress(null);
            user.setWebsite(null);
        }
    }
    
    //firmowe
    if ("business".equals(user.getAccountType())) {
        if (request.getCompanyName() != null) {
            user.setCompanyName(request.getCompanyName());
        }
        if (request.getNip() != null) {
            user.setNip(request.getNip());
        }
        if (request.getRegon() != null) {
            user.setRegon(request.getRegon());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getWebsite() != null) {
            user.setWebsite(request.getWebsite());
        }
    }
    
    userRepository.save(user);
}
}