package com.noteshub.dto;

import com.noteshub.enums.Visibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

public class SubjectNoteDto {

    @Data
    public static class CreateRequest {
        @NotBlank(message = "Title is required")
        private String title;

        private String description;

        @NotNull(message = "Visibility is required (PUBLIC or PRIVATE)")
        private Visibility visibility;

        @NotNull(message = "Owner ID is required")
        private UUID ownerId;
    }

    @Data
    public static class Response {
        private UUID id;
        private String title;
        private String description;
        private Visibility visibility;
        private UUID ownerId;
        private String ownerName;
        private UUID forkedFromId;
        private String forkedFromTitle;
        private UUID originalOwnerId;
        private String originalOwnerName;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
