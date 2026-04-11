package com.noteshub.dto;

import com.noteshub.enums.NoteType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class NoteDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        @NotNull(message = "Note type is required (TEXT or PDF)")
        private NoteType noteType;

        @NotNull(message = "Subject note ID is required")
        private UUID subjectNoteId;

        private String fileUrl;
    }

    @Data
    public static class UpdateRequest {
        @NotBlank(message = "Title is required")
        private String title;
    }

    @Data
    public static class Response {
        private UUID id;
        private String title;
        private NoteType noteType;
        private UUID subjectNoteId;
        private UUID currentVersionId;
        private Integer currentVersionNumber;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
