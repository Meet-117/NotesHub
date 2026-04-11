package com.noteshub.repository;

import com.noteshub.entity.NoteVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NoteVersionRepository extends JpaRepository<NoteVersion, UUID> {
    List<NoteVersion> findAllByNoteIdOrderByVersionNumberDesc(UUID noteId);
    Optional<NoteVersion> findTopByNoteIdOrderByVersionNumberDesc(UUID noteId);
    void deleteAllByNoteId(UUID noteId);
}
