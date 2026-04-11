package com.noteshub.service;

import com.noteshub.dto.SubjectNoteDto;
import com.noteshub.entity.SubjectNote;
import com.noteshub.entity.User;
import com.noteshub.enums.Visibility;
import com.noteshub.repository.SubjectNoteRepository;
import com.noteshub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.noteshub.entity.Note;
import com.noteshub.entity.NoteVersion;
import com.noteshub.repository.NoteRepository;
import com.noteshub.repository.NoteVersionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class SubjectNoteService {

    private final SubjectNoteRepository subjectNoteRepository;
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final NoteVersionRepository noteVersionRepository;

    private void verifyOwner(SubjectNote subjectNote) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Authentication required");
        }
        String email = auth.getName();
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!subjectNote.getOwner().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not the owner");
        }
    }

    private void verifyReadAccess(SubjectNote subjectNote) {
        if (subjectNote.getVisibility() == Visibility.PUBLIC) return;
        verifyOwner(subjectNote);
    }

    @Transactional
    public SubjectNoteDto.Response create(SubjectNoteDto.CreateRequest request) {
        User owner = findUser(request.getOwnerId());

        SubjectNote sn = SubjectNote.builder()
                .owner(owner)
                .title(request.getTitle())
                .description(request.getDescription())
                .visibility(request.getVisibility())
                .build();

        return toResponse(subjectNoteRepository.save(sn));
    }

    @Transactional(readOnly = true)
    public List<SubjectNoteDto.Response> getByUser(UUID userId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        return subjectNoteRepository.findAllByOwnerId(userId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SubjectNoteDto.Response getById(UUID id) {
        SubjectNote sn = findSubjectNote(id);
        verifyReadAccess(sn);
        return toResponse(sn);
    }

    @Transactional
    public SubjectNoteDto.Response fork(UUID subjectNoteId, UUID newOwnerId) {
        SubjectNote original = findSubjectNote(subjectNoteId);
        verifyReadAccess(original);
        User newOwner = findUser(newOwnerId);

        SubjectNote fork = SubjectNote.builder()
                .owner(newOwner)
                .title(original.getTitle() + " (fork)")
                .description(original.getDescription())
                .visibility(original.getVisibility())
                .forkedFrom(original)
                .build();

        SubjectNote savedFork = subjectNoteRepository.save(fork);

        // Copy notes
        List<Note> notes = noteRepository.findAllBySubjectNoteId(original.getId());
        for (Note n : notes) {
            Note newNote = Note.builder()
                    .title(n.getTitle())
                    .noteType(n.getNoteType())
                    .subjectNote(savedFork)
                    .build();
            Note savedNewNote = noteRepository.save(newNote);

            if (n.getCurrentVersion() != null) {
                NoteVersion curr = n.getCurrentVersion();
                NoteVersion newVer = NoteVersion.builder()
                        .note(savedNewNote)
                        .versionNumber(1)
                        .contentText(curr.getContentText())
                        .fileUrl(curr.getFileUrl())
                        .fileHash(curr.getFileHash())
                        .changeMessage("Forked from " + original.getTitle())
                        .build();
                NoteVersion savedVer = noteVersionRepository.save(newVer);
                savedNewNote.setCurrentVersion(savedVer);
                noteRepository.save(savedNewNote);
            }
        }

        return toResponse(savedFork);
    }

    @Transactional(readOnly = true)
    public List<SubjectNoteDto.Response> searchPublic(String query) {
        return subjectNoteRepository.searchByVisibilityAndQuery(Visibility.PUBLIC, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SubjectNoteDto.Response> getPublicByUser(UUID userId, String query) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        // Simplified search for profile page - filter by user + query
        return subjectNoteRepository.searchByVisibilityAndQuery(Visibility.PUBLIC, query != null ? query : "")
                .stream()
                .filter(sn -> sn.getOwner().getId().equals(userId))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    SubjectNote findSubjectNote(UUID id) {
        return subjectNoteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("SubjectNote not found: " + id));
    }

    User findUser(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    SubjectNoteDto.Response toResponse(SubjectNote sn) {
        SubjectNoteDto.Response res = new SubjectNoteDto.Response();
        res.setId(sn.getId());
        res.setTitle(sn.getTitle());
        res.setDescription(sn.getDescription());
        res.setVisibility(sn.getVisibility());
        res.setOwnerId(sn.getOwner().getId());
        res.setOwnerName(sn.getOwner().getName());
        if (sn.getForkedFrom() != null) {
            res.setForkedFromId(sn.getForkedFrom().getId());
            res.setForkedFromTitle(sn.getForkedFrom().getTitle());
            res.setOriginalOwnerId(sn.getForkedFrom().getOwner().getId());
            res.setOriginalOwnerName(sn.getForkedFrom().getOwner().getName());
        }
        res.setCreatedAt(sn.getCreatedAt());
        res.setUpdatedAt(sn.getUpdatedAt());
        return res;
    }
}
