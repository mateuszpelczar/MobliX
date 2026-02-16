package com.example.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.comprehend.ComprehendClient;
import software.amazon.awssdk.services.rekognition.RekognitionClient;


@Configuration
public class AwsModerationConfig {


    //klucze dostępu, region oraz tajny klucz do AWS
    @Value("${aws.access-key-id}")
    private String accessKeyId;
    
    @Value("${aws.secret-access-key}")
    private String secretAccessKey;

    @Value("${aws.moderation.region:eu-central-1}")
    private String region;

    //klient AWS do analizy obrazów
    @Bean
    public RekognitionClient rekognitionClient() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        
        return RekognitionClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }

    //klient AWS do analizy tekstu
    @Bean
    public ComprehendClient comprehendClient() {
        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKeyId, secretAccessKey);
        
        return ComprehendClient.builder()
                .region(Region.of(region))
                .credentialsProvider(StaticCredentialsProvider.create(credentials))
                .build();
    }
}
