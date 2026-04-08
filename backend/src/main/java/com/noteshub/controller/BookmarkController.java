package com.noteshub.controller;

import com.noteshub.dto.BookmarkDto;
import com.noteshub.service.BookmarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookmarks")
@RequiredArgsConstructor
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @PostMapping("/toggle")
    public ResponseEntity<Map<String, Boolean>> toggleBookmark(
            @RequestParam UUID userId,
            @RequestParam UUID subjectNoteId) {
        boolean bookmarked = bookmarkService.toggleBookmark(userId, subjectNoteId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BookmarkDto.Response>> getUserBookmarks(@PathVariable UUID userId) {
        return ResponseEntity.ok(bookmarkService.getUserBookmarks(userId));
    }
}
