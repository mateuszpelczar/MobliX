package com.example.backend.repository;

import com.example.backend.model.Conversation;
import com.example.backend.model.User;



import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {
    
    List<Conversation> findByUser1OrUser2OrderByUpdatedAtDesc(User user1, User user2);
    

    @org.springframework.data.jpa.repository.Query("SELECT c FROM Conversation c WHERE (c.user1 = :u1 AND c.user2 = :u2) OR (c.user1 = :u2 AND c.user2 = :u1)")
    java.util.Optional<Conversation> findByUsers(@org.springframework.data.repository.query.Param("u1") User user1, @org.springframework.data.repository.query.Param("u2") User user2);

}