package com.example.backend.dto;

import jakarta.validation.constraints.Pattern;

public class UserDto {
    private Long id;
    private String email;
    private String username;
    private String role;
    
    // Nowe pola dla kont prywatnych i firmowych
    private String accountType;
    private String firstName;
    private String lastName;
    @Pattern(regexp = "\\d{9}",message="Numer telefonu musi składać się z 9 cyfr")
    private String phone;
    
    // Pola dla kont firmowych
    private String companyName;
    @Pattern(regexp = "\\d{10}",message="Numer NIP musi składać się z 10 cyfr")
    private String nip;
    @Pattern(regexp = "\\d{9}",message="Numer REGON musi składać się z 9 cyfr")
    private String regon;
    private String address;
    private String website;

    // Konstruktory
    public UserDto() {}

    public UserDto(Long id, String email, String username, String role,
                   String accountType, String firstName, String lastName, String phone,
                   String companyName, String nip, String regon, String address, String website) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.role = role;
        this.accountType = accountType;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.companyName = companyName;
        this.nip = nip;
        this.regon = regon;
        this.address = address;
        this.website = website;
    }

    // Gettery i Settery
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getNip() { return nip; }
    public void setNip(String nip) { this.nip = nip; }

    public String getRegon() { return regon; }
    public void setRegon(String regon) { this.regon = regon; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
}