package com.example.backend.dto;

public class SellerInfoDTO {
    private String sellerType; // "personal" lub "business"
    private String name; 
    private String phone;
    private String email;
    private Integer yearJoined; // Rok pierwszego ogłoszenia
    
    
    private String companyName;
    private String address;
    private String website;
    private String nip;
    private String regon;

    
    public SellerInfoDTO() {}

    public SellerInfoDTO(String sellerType, String name, String phone, String email, 
                        Integer yearJoined, String companyName, String address, 
                        String website, String nip, String regon) {
        this.sellerType = sellerType;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.yearJoined = yearJoined;
        this.companyName = companyName;
        this.address = address;
        this.website = website;
        this.nip = nip;
        this.regon = regon;
    }

    
    public String getSellerType() { return sellerType; }
    public void setSellerType(String sellerType) { this.sellerType = sellerType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getYearJoined() { return yearJoined; }
    public void setYearJoined(Integer yearJoined) { this.yearJoined = yearJoined; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getNip() { return nip; }
    public void setNip(String nip) { this.nip = nip; }

    public String getRegon() { return regon; }
    public void setRegon(String regon) { this.regon = regon; }
}