package com.noteshub.repository;

import com.noteshub.entity.Source;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SourceRepository extends JpaRepository<Source, UUID> {
    List<Source> findAllByNoteId(UUID noteId);
    void deleteAllByNoteId(UUID noteId);
}
