package com.noteshub.controller;

import com.noteshub.dto.SubjectNoteDto;
import com.noteshub.service.SubjectNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/subject-notes")
@RequiredArgsConstructor
public class SubjectNoteController {

    private final SubjectNoteService subjectNoteService;

    @PostMapping
    public ResponseEntity<SubjectNoteDto.Response> create(@Valid @RequestBody SubjectNoteDto.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectNoteService.create(request));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SubjectNoteDto.Response>> getByUser(@PathVariable UUID userId) {
        return ResponseEntity.ok(subjectNoteService.getByUser(userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubjectNoteDto.Response> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(subjectNoteService.getById(id));
    }

    @PostMapping("/{subjectNoteId}/fork")
    public ResponseEntity<SubjectNoteDto.Response> fork(
            @PathVariable UUID subjectNoteId,
            @RequestParam UUID newOwnerId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subjectNoteService.fork(subjectNoteId, newOwnerId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SubjectNoteDto.Response>> searchPublic(@RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(subjectNoteService.searchPublic(query));
    }

    @GetMapping("/public/user/{userId}")
    public ResponseEntity<List<SubjectNoteDto.Response>> getPublicByUser(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "") String query) {
        return ResponseEntity.ok(subjectNoteService.getPublicByUser(userId, query));
    }
}
