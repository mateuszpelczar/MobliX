package com.example.backend.service;

import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.User;
import com.example.backend.repository.PasswordResetTokenRepository;
import com.example.backend.repository.UserRepository;
import com.google.common.cache.CacheBuilder;
import com.google.common.cache.CacheLoader;
import com.google.common.cache.LoadingCache;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;

@Service
public class PasswordResetService {

    private static final Logger log = LoggerFactory.getLogger(PasswordResetService.class);

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public PasswordResetService(PasswordResetTokenRepository tokenRepository,
                                UserRepository userRepository,
                                EmailService emailService,
                                PasswordEncoder passwordEncoder) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Value("${password.reset.token.expiration:3600000}") // 1 hour default
    private long tokenExpirationMs;

    @Value("${password.reset.max.attempts:3}")
    private int maxAttempts;

    @Value("${password.reset.lockout.duration:900000}") // 15 minutes
    private long lockoutDurationMs;

    // Rate limiting: max 3 requests per IP per 15 minutes
    private final LoadingCache<String, Integer> requestCountsPerIp = CacheBuilder.newBuilder()
            .expireAfterWrite(15, TimeUnit.MINUTES)
            .build(new CacheLoader<>() {
                @Override
                public Integer load(String key) {
                    return 0;
                }
            });

    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public void initiatePasswordReset(String email, String requestIp, String userAgent) {
        // Rate limiting check
        try {
            int requestCount = requestCountsPerIp.get(requestIp);
            if (requestCount >= maxAttempts) {
                log.warn("Rate limit exceeded for IP: {}", requestIp);
                // Still return success to prevent email enumeration
                return;
            }
            requestCountsPerIp.put(requestIp, requestCount + 1);
        } catch (ExecutionException e) {
            log.error("Error checking rate limit", e);
        }

        // Find user - but don't reveal if email exists
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.info("Password reset requested for non-existent email: {}", email);
            // Don't reveal that email doesn't exist - return success anyway
            return;
        }

        // Check if user has too many recent reset requests
        LocalDateTime recentRequestThreshold = LocalDateTime.now().minusMinutes(15);
        long recentTokenCount = tokenRepository.countRecentTokensByUser(user, recentRequestThreshold);

        if (recentTokenCount >= maxAttempts) {
            log.warn("Too many password reset attempts for user: {}", user.getEmail());
            // Don't reveal this to the user - return success anyway
            return;
        }

        // Invalidate all previous tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate strong random token (UUID v4 + additional randomness)
        String rawToken = generateSecureToken();
        String tokenHash = hashToken(rawToken);

        // Create token entity
        PasswordResetToken token = new PasswordResetToken();
        token.setTokenHash(tokenHash);
        token.setUser(user);
        token.setCreatedAt(LocalDateTime.now());
        token.setExpiresAt(LocalDateTime.now().plusSeconds(tokenExpirationMs / 1000));
        token.setRequestIp(requestIp);
        token.setUserAgent(userAgent);
        token.setUsed(false);
        token.setAttemptCount(0);

        tokenRepository.save(token);

        // Send email asynchronously (rawToken, not hash!)
        // Email is sent in background thread, user doesn't wait
        emailService.sendPasswordResetEmail(user.getEmail(), rawToken);
        log.info("Password reset token created for user: {}, email will be sent asynchronously", user.getEmail());
    }

    @Transactional
    public void resetPassword(String rawToken, String newPassword, String requestIp) {
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy lub wygasły token resetowania hasła"));

        // Validate token
        if (!token.isValid()) {
            throw new IllegalArgumentException("Token resetowania hasła wygasł lub został już użyty");
        }

        // Check attempt count (protect against brute force)
        if (token.getAttemptCount() >= maxAttempts) {
            throw new IllegalArgumentException("Przekroczono maksymalną liczbę prób. Poproś o nowy link resetujący");
        }

        // Validate password strength
        validatePasswordStrength(newPassword);

        // Update user password
        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark token as used
        token.setUsed(true);
        tokenRepository.save(token);

        // Delete all other tokens for this user
        tokenRepository.deleteByUser(user);

        log.info("Password successfully reset for user: {} from IP: {}", user.getEmail(), requestIp);
    }

    @Transactional
    public void validateToken(String rawToken) {
        String tokenHash = hashToken(rawToken);

        PasswordResetToken token = tokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Nieprawidłowy lub wygasły token resetowania hasła"));

        if (!token.isValid()) {
            throw new IllegalArgumentException("Token resetowania hasła wygasł lub został już użyty");
        }

        // Increment attempt count
        token.setAttemptCount(token.getAttemptCount() + 1);
        tokenRepository.save(token);
    }

    private String generateSecureToken() {
        // UUID v4 + additional random bytes for extra security
        UUID uuid = UUID.randomUUID();
        byte[] randomBytes = new byte[16];
        secureRandom.nextBytes(randomBytes);

        String combined = uuid + Base64.getUrlEncoder().encodeToString(randomBytes);
        return combined.replace("=", ""); // Remove padding
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Hasło musi mieć co najmniej 8 znaków");
        }

        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "!@#$%^&*()_+-=[]{}|;:,.<>?".indexOf(ch) >= 0);

        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            throw new IllegalArgumentException(
                    "Hasło musi zawierać co najmniej jedną wielką literę, małą literę, cyfrę i znak specjalny"
            );
        }
    }

    // Clean up expired tokens every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredTokens() {
        tokenRepository.deleteExpiredTokens(LocalDateTime.now());
        log.debug("Expired password reset tokens cleaned up");
    }
}