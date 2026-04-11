package com.noteshub.repository;

import com.noteshub.entity.NoteTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteTagRepository extends JpaRepository<NoteTag, NoteTag.NoteTagId> {
    List<NoteTag> findAllByNote_Id(UUID noteId);
    boolean existsByNote_IdAndTag_Id(UUID noteId, UUID tagId);
    void deleteByNote_IdAndTag_Id(UUID noteId, UUID tagId);
    void deleteAllByNote_Id(UUID noteId);
}
