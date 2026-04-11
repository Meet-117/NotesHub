package com.noteshub.service;

import com.noteshub.dto.NoteDto;
import com.noteshub.entity.Note;
import com.noteshub.entity.SubjectNote;
import com.noteshub.repository.NoteRepository;
import com.noteshub.repository.SubjectNoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.noteshub.entity.NoteVersion;
import com.noteshub.repository.NoteVersionRepository;
import com.noteshub.enums.NoteType;

import com.noteshub.entity.User;
import com.noteshub.repository.UserRepository;
import com.noteshub.repository.NoteTagRepository;
import com.noteshub.repository.NoteLinkRepository;
import com.noteshub.repository.SourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final SubjectNoteRepository subjectNoteRepository;
    private final UserRepository userRepository;
    private final NoteVersionRepository noteVersionRepository;
    private final NoteTagRepository noteTagRepository;
    private final NoteLinkRepository noteLinkRepository;
    private final SourceRepository sourceRepository;

    void verifyOwner(SubjectNote subjectNote) {
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

    void verifyReadAccess(SubjectNote subjectNote) {
        if (subjectNote.getVisibility() == com.noteshub.enums.Visibility.PUBLIC) return;
        verifyOwner(subjectNote);
    }

    @Transactional
    public NoteDto.Response createNote(NoteDto.CreateRequest request) {
        SubjectNote subjectNote = subjectNoteRepository.findById(request.getSubjectNoteId())
                .orElseThrow(() -> new IllegalArgumentException("SubjectNote not found: " + request.getSubjectNoteId()));

        verifyOwner(subjectNote);

        Note note = Note.builder()
                .title(request.getTitle())
                .noteType(request.getNoteType())
                .subjectNote(subjectNote)
                .build();

        Note savedNote = noteRepository.save(note);

        if (request.getNoteType() == NoteType.PDF && request.getFileUrl() != null) {
            NoteVersion version = NoteVersion.builder()
                    .note(savedNote)
                    .versionNumber(1)
                    .fileUrl(request.getFileUrl())
                    .changeMessage("Initial upload")
                    .build();
            NoteVersion savedVersion = noteVersionRepository.save(version);
            savedNote.setCurrentVersion(savedVersion);
            savedNote = noteRepository.save(savedNote);
        }

        return toResponse(savedNote);
    }

    @Transactional(readOnly = true)
    public List<NoteDto.Response> getNotesBySubjectNote(UUID subjectNoteId) {
        SubjectNote subjectNote = subjectNoteRepository.findById(subjectNoteId)
                .orElseThrow(() -> new IllegalArgumentException("SubjectNote not found: " + subjectNoteId));
        
        verifyReadAccess(subjectNote);

        return noteRepository.findAllBySubjectNoteId(subjectNoteId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteDto.Response getNoteById(UUID noteId) {
        Note note = findNote(noteId);
        verifyReadAccess(note.getSubjectNote());
        return toResponse(note);
    }

    @Transactional
    public NoteDto.Response updateNoteTitle(UUID noteId, NoteDto.UpdateRequest request) {
        Note note = findNote(noteId);
        verifyOwner(note.getSubjectNote());
        note.setTitle(request.getTitle());
        return toResponse(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(UUID noteId) {
        Note note = findNote(noteId);
        verifyOwner(note.getSubjectNote());

        // 1. Break circular dependency with current_version
        note.setCurrentVersion(null);
        noteRepository.saveAndFlush(note);

        // 2. Cleanup all associated data
        noteVersionRepository.deleteAllByNoteId(noteId);
        noteTagRepository.deleteAllByNote_Id(noteId);
        sourceRepository.deleteAllByNoteId(noteId);
        noteLinkRepository.deleteAllByFromNoteId(noteId);
        noteLinkRepository.deleteAllByToNoteId(noteId);

        // 3. Delete the note itself
        noteRepository.delete(note);
    }

    Note findNote(UUID noteId) {
        return noteRepository.findById(noteId)
                .orElseThrow(() -> new IllegalArgumentException("Note not found: " + noteId));
    }

    Note save(Note note) {
        return noteRepository.save(note);
    }

    NoteDto.Response toResponse(Note note) {
        NoteDto.Response res = new NoteDto.Response();
        res.setId(note.getId());
        res.setTitle(note.getTitle());
        res.setNoteType(note.getNoteType());
        res.setSubjectNoteId(note.getSubjectNote().getId());
        res.setCreatedAt(note.getCreatedAt());
        res.setUpdatedAt(note.getUpdatedAt());
        if (note.getCurrentVersion() != null) {
            res.setCurrentVersionId(note.getCurrentVersion().getId());
            res.setCurrentVersionNumber(note.getCurrentVersion().getVersionNumber());
        }
        return res;
    }
}
