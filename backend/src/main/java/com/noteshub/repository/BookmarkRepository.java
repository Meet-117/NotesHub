package com.noteshub.repository;

import com.noteshub.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {
    List<Bookmark> findAllByUserId(UUID userId);
    Optional<Bookmark> findByUserIdAndSubjectNoteId(UUID userId, UUID subjectNoteId);
    boolean existsByUserIdAndSubjectNoteId(UUID userId, UUID subjectNoteId);
}
