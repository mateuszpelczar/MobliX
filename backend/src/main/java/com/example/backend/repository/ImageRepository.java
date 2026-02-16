package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.Image;

@Repository
public interface ImageRepository  extends JpaRepository<Image,Long>{

    @Modifying
    @Transactional
    @Query("DELETE FROM Image i WHERE i.advertisement.user.id = :userId")
    void deleteByAdvertisementUserId(@Param("userId") Long userId);
}