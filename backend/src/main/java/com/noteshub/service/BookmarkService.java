package com.noteshub.service;

import com.noteshub.dto.BookmarkDto;
import com.noteshub.entity.Bookmark;
import com.noteshub.entity.SubjectNote;
import com.noteshub.entity.User;
import com.noteshub.repository.BookmarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final SubjectNoteService subjectNoteService;
    private final com.noteshub.repository.UserRepository userRepository;

    @Transactional
    public boolean toggleBookmark(UUID userId, UUID subjectNoteId) {
        Optional<Bookmark> existing = bookmarkRepository.findByUserIdAndSubjectNoteId(userId, subjectNoteId);
        
        if (existing.isPresent()) {
            bookmarkRepository.delete(existing.get());
            return false; // unbookmarked
        } else {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
            SubjectNote subjectNote = subjectNoteService.findSubjectNote(subjectNoteId);
            
            Bookmark bookmark = Bookmark.builder()
                    .user(user)
                    .subjectNote(subjectNote)
                    .build();
            bookmarkRepository.save(bookmark);
            return true; // bookmarked
        }
    }

    @Transactional(readOnly = true)
    public List<BookmarkDto.Response> getUserBookmarks(UUID userId) {
        return bookmarkRepository.findAllByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private BookmarkDto.Response toResponse(Bookmark bookmark) {
        BookmarkDto.Response res = new BookmarkDto.Response();
        res.setId(bookmark.getId());
        res.setUserId(bookmark.getUser().getId());
        res.setSubjectNoteId(bookmark.getSubjectNote().getId());
        res.setCreatedAt(bookmark.getCreatedAt());
        res.setSubjectNote(subjectNoteService.toResponse(bookmark.getSubjectNote()));
        return res;
    }
}
