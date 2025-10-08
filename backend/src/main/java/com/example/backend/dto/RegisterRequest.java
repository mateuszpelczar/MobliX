package com.example.backend.dto;

public class RegisterRequest {
    private String username;
    private String email;
    private String password;
    
    // Nowe pola dla kont prywatnych i firmowych
    private String accountType; // "personal" lub "business"
    private String firstName;
    private String lastName;
    private String phone;
    
    // Pola dla kont firmowych
    private String companyName;
    private String nip;
    private String regon;
    private String address;
    private String website;

    // Konstruktory
    public RegisterRequest() {}

    public RegisterRequest(String username, String email, String password,
                         String accountType, String firstName, String lastName, String phone,
                         String companyName, String nip, String regon, String address, String website) {
        this.username = username;
        this.email = email;
        this.password = password;
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
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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