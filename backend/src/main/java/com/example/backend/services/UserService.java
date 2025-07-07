package com.example.backend.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.models.Role;
import com.example.backend.models.User;
import java.time.LocalDateTime;
import com.example.backend.repositories.UserRepository;

@Service
public class UserService {

  @Autowired
  private UserRepository userRepository;
  @Autowired
  private PasswordEncoder passwordEncoder;
  @Autowired
  private JwtService jwtService;

  //register method

  public String register(RegisterRequest request){

    if(userRepository.existsByUserName(request.getUserName())){
      throw new RuntimeException("Nazwa uzytkownika jest juz zajeta");
    }
    if(userRepository.existsByEmail(request.getEmail())){
      throw new RuntimeException("Email jest juz zajety");
    }

    Role role = userRepository.count() == 0 ? Role.ADMIN : Role.USER;

    User user = new User();
    user.setEmail(request.getEmail());
    user.setUserName(request.getUserName());
    user.setPassword(passwordEncoder.encode(request.getPassword()));  
    user.setRole(role);
    user.setDateCreation(LocalDateTime.now());

    userRepository.save(user);

    //generate jwt token at once(e.g automatic login)
    return jwtService.generateToken(user);
  }

  //login method
  public String login(LoginRequest request){
    User user = userRepository.findByUserName(request.getUserName())
                    .orElseThrow(() -> new RuntimeException("Nieprawidlowa nazwa uzytkownika lub haslo"));

    if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
      throw new RuntimeException("Nieprawidlowa nazwa uzytkownika lub haslo");
    }
    return jwtService.generateToken(user);
  }

}
 

