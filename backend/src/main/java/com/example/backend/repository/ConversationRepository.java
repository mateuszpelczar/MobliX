package com.example.backend.repository;

import com.example.backend.model.Advertisement;
import com.example.backend.model.Conversation;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    List<Conversation> findByUser1OrUser2OrderByUpdatedAtDesc(User user1, User user2);
    
    Optional<Conversation> findByAdvertisementAndUser1AndUser2(
        Advertisement advertisement, User user1, User user2);
}
