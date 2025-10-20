package com.example.backend.repository;

import com.example.backend.model.Opinion;
import com.example.backend.model.OpinionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpinionRepository extends JpaRepository<Opinion, Long> {
    
    List<Opinion> findByAdvertisementIdAndStatus(Long advertisementId, OpinionStatus status);
    
    List<Opinion> findByUserId(Long userId);
    
    List<Opinion> findByStatus(OpinionStatus status);
    
    List<Opinion> findByUserIdAndStatus(Long userId, OpinionStatus status);
    
    boolean existsByUserIdAndAdvertisementIdAndStatus(Long userId, Long advertisementId, OpinionStatus status);
    
    List<Opinion> findByAdvertisementIdInAndStatus(List<Long> advertisementIds, OpinionStatus status);
}
