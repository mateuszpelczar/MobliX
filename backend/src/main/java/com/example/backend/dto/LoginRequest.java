package com.example.backend.dto;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

  @NotBlank
  private String userName;
  @NotBlank
  private String password;

  //getters and setters
  public String getUserName(){
    return userName;
  }
  public void setUserName(String userName){
    this.userName=userName;
  }

  public String getPassword(){
    return password;
  }
  public void setPassword(String password){
    this.password=password;
  }
  
}
