package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/images}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Convert to absolute path with proper Windows file URL format
        Path absolutePath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String fileUrl = "file:///" + absolutePath.toString().replace("\\", "/") + "/";
        
        System.out.println("Serving static images from: " + fileUrl);
        
        // Map /uploads/images/** to the upload directory (nowe ogłoszenia)
        registry.addResourceHandler("/uploads/images/**")
                .addResourceLocations(fileUrl)
                .setCachePeriod(3600);
        
        // Map /uploads/** as fallback
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(fileUrl)
                .setCachePeriod(3600);
        
        // Map /images/** to the upload directory (stare ogłoszenia - backward compatibility)
        registry.addResourceHandler("/images/**")
                .addResourceLocations(fileUrl)
                .setCachePeriod(3600);
    }
}