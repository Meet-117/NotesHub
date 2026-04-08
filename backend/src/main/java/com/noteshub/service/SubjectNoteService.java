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

@Service
@RequiredArgsConstructor
public class SubjectNoteService {

    private final SubjectNoteRepository subjectNoteRepository;
    private final UserRepository userRepository;

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
        return toResponse(findSubjectNote(id));
    }

    @Transactional
    public SubjectNoteDto.Response fork(UUID subjectNoteId, UUID newOwnerId) {
        SubjectNote original = findSubjectNote(subjectNoteId);
        User newOwner = findUser(newOwnerId);

        SubjectNote fork = SubjectNote.builder()
                .owner(newOwner)
                .title(original.getTitle() + " (fork)")
                .description(original.getDescription())
                .visibility(original.getVisibility())
                .forkedFrom(original)
                .build();

        return toResponse(subjectNoteRepository.save(fork));
    }

    @Transactional(readOnly = true)
    public List<SubjectNoteDto.Response> searchPublic(String query) {
        return subjectNoteRepository.searchByVisibilityAndQuery(Visibility.PUBLIC, query)
                .stream().map(this::toResponse).collect(Collectors.toList());
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
        }
        res.setCreatedAt(sn.getCreatedAt());
        res.setUpdatedAt(sn.getUpdatedAt());
        return res;
    }
}
