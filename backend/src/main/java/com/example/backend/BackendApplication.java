package com.example.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.example.backend.model")
@EnableJpaRepositories(basePackages = "com.example.backend.repository")
public class BackendApplication {

	public static void main(String[] args) {
//        System.out.println("URL = " + System.getenv("DB_URL"));
//        System.out.println("USER = " + System.getenv("DB_USER"));
//        System.out.println("PASS = " + System.getenv("DB_PASSWORD"));

        SpringApplication.run(BackendApplication.class, args);
	}

}
