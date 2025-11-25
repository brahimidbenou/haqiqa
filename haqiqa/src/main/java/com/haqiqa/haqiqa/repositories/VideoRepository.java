package com.haqiqa.haqiqa.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.haqiqa.haqiqa.models.Video;

@Repository
public interface VideoRepository extends JpaRepository<Video, UUID>{
    Optional<Video> findByTitle(String title);
    Page<Video> findAllByUserId(UUID userId, Pageable pageable);
}
