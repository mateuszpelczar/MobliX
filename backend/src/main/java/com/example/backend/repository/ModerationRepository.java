package com.example.backend.repository;
import com.example.backend.model.Moderation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ModerationRepository extends JpaRepository<Moderation, Long> {

    @Modifying
    @Transactional
    @Query("DELETE FROM Moderation m WHERE m.advertisement.user.id = :userId")
    void deleteByAdvertisementUserId(@Param("userId") Long userId);
}