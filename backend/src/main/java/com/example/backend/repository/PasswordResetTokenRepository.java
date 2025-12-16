package com.example.backend.repository;


import com.example.backend.model.PasswordResetToken;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken,Long> {

    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    List<PasswordResetToken> findByUser(User user);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.expiresAt < :now")
    void deleteExpiredTokens(LocalDateTime now);

    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.user = :user")
    void deleteByUser(User user);

    @Query("SELECT COUNT(t) FROM PasswordResetToken t WHERE t.user = :user AND t.createdAt > :since")
    long countRecentTokensByUser(User user, LocalDateTime since);
}
