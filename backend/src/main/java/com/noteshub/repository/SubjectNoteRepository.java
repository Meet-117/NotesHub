package com.noteshub.repository;

import com.noteshub.entity.SubjectNote;
import com.noteshub.enums.Visibility;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubjectNoteRepository extends JpaRepository<SubjectNote, UUID> {
    List<SubjectNote> findAllByOwnerId(UUID ownerId);

    @Query("SELECT s FROM SubjectNote s WHERE s.visibility = :visibility AND " +
           "(LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<SubjectNote> searchByVisibilityAndQuery(@Param("visibility") Visibility visibility, @Param("query") String query);
}
