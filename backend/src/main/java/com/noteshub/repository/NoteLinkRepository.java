package com.noteshub.repository;

import com.noteshub.entity.NoteLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteLinkRepository extends JpaRepository<NoteLink, UUID> {
    List<NoteLink> findAllByFromNoteId(UUID fromNoteId);
    List<NoteLink> findAllByToNoteId(UUID toNoteId);
    boolean existsByFromNoteIdAndToNoteId(UUID fromNoteId, UUID toNoteId);
    void deleteAllByFromNoteId(UUID fromNoteId);
    void deleteAllByToNoteId(UUID toNoteId);
}
