package com.example.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.backend.security.JwtAuthenticationFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    // private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // Statyczne zasoby - muszą być na początku!
                .requestMatchers("/uploads/**", "/uploads/images/**", "/images/**").permitAll()
                .requestMatchers("/api/auth/**").permitAll()
                    .requestMatchers("/api/auth/forgot-password").permitAll()
                    .requestMatchers("/api/auth/reset-password").permitAll()
                    .requestMatchers("/api/auth/validate-reset-token").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/advertisements/upload-images").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/advertisements/upload-image").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/ogloszenia/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/advertisements/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/advertisements/*/view").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/advertisements").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/advertisements/*").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/advertisements/*").authenticated()
                .requestMatchers("/api/advertisements/user").authenticated()
                .requestMatchers("/api/advertisements/all").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/advertisements/pending").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/advertisements/*/approve").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/advertisements/*/reject").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers(HttpMethod.PATCH, "/api/advertisements/*/resubmit").authenticated()
                .requestMatchers(HttpMethod.PATCH, "/api/advertisements/*/status").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/advertisements/latest").permitAll()
                .requestMatchers("/api/messages/**").authenticated()
                .requestMatchers("/api/admin/users/moderation").hasAnyRole("STAFF","ADMIN")
                .requestMatchers("/api/admin/users/*/details").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/admin/users/*/block").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/admin/users/*/unblock").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/admin/users/*/activity-logs").hasAnyRole("STAFF", "ADMIN")       
                .requestMatchers(HttpMethod.PUT, "/api/admin/users/*").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/admin/stats/staff").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/search-stats/**").hasAnyRole("STAFF", "ADMIN")
                .requestMatchers("/api/search-logs/**").permitAll() // Zapisywanie wyszukiwań - publiczne
                .requestMatchers(HttpMethod.POST, "/api/search/reindex-all").hasAnyRole("STAFF", "ADMIN") // Reindeksowanie tylko admin/staff
                .requestMatchers("/api/search/**").permitAll() // OpenSearch sugestie - publiczne
                .requestMatchers(HttpMethod.GET, "/api/content-pages/slug/*").permitAll() // Publiczne wyświetlanie stron
                .requestMatchers("/api/content-pages/**").hasRole("ADMIN")
                .requestMatchers("/api/logs/activities").authenticated()
                .requestMatchers("/api/logs/**").hasRole("ADMIN")
                .requestMatchers("/api/admin/stats/dashboard").hasRole("ADMIN")
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated())
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(Arrays.asList("http://localhost:*","http://127.0.0.1:*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"));
        config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source; 
        
    }
}