package com.noteshub.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class BookmarkDto {

    @Data
    public static class Response {
        private UUID id;
        private UUID userId;
        private UUID subjectNoteId;
        private SubjectNoteDto.Response subjectNote;
        private LocalDateTime createdAt;
    }
}
