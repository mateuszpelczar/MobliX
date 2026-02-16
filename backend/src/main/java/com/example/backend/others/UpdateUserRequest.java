package com.example.backend.others;

public class UpdateUserRequest {
    private String accountType;
    private String firstName;
    private String lastName;
    private String phone;
    private String password; 
    
    //firmowe
    private String companyName;
    private String nip;
    private String regon;
    private String address;
    private String website;

    public UpdateUserRequest() {}

    public UpdateUserRequest(String accountType, String firstName, String lastName, String phone,
                           String password, String companyName, String nip, String regon, 
                           String address, String website) {
        this.accountType = accountType;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.password = password;
        this.companyName = companyName;
        this.nip = nip;
        this.regon = regon;
        this.address = address;
        this.website = website;
    }

   
    public String getAccountType() { return accountType; }
    public void setAccountType(String accountType) { this.accountType = accountType; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

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