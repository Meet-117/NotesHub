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

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final SubjectNoteRepository subjectNoteRepository;

    @Transactional
    public NoteDto.Response createNote(NoteDto.CreateRequest request) {
        SubjectNote subjectNote = subjectNoteRepository.findById(request.getSubjectNoteId())
                .orElseThrow(() -> new IllegalArgumentException("SubjectNote not found: " + request.getSubjectNoteId()));

        Note note = Note.builder()
                .title(request.getTitle())
                .noteType(request.getNoteType())
                .subjectNote(subjectNote)
                .build();

        return toResponse(noteRepository.save(note));
    }

    @Transactional(readOnly = true)
    public List<NoteDto.Response> getNotesBySubjectNote(UUID subjectNoteId) {
        if (!subjectNoteRepository.existsById(subjectNoteId)) {
            throw new IllegalArgumentException("SubjectNote not found: " + subjectNoteId);
        }
        return noteRepository.findAllBySubjectNoteId(subjectNoteId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoteDto.Response getNoteById(UUID noteId) {
        return toResponse(findNote(noteId));
    }

    @Transactional
    public NoteDto.Response updateNoteTitle(UUID noteId, NoteDto.UpdateRequest request) {
        Note note = findNote(noteId);
        note.setTitle(request.getTitle());
        return toResponse(noteRepository.save(note));
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
