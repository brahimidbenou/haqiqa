package com.haqiqa.haqiqa.repositories;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.haqiqa.haqiqa.models.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID>{
    Page<Message> findAllByVideoId(UUID videoId, Pageable pageable);
}
