package com.example.backend.controller;

import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.UserRepository;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;



@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('STAFF')")
public class UserController {

    // private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    public UserController(AdvertisementRepository advertisementRepository,
                          UserRepository userRepository) {
    }

    //ogloszenia
    
}

