package com.noteshub.service;

import com.noteshub.dto.TagDto;
import com.noteshub.entity.Note;
import com.noteshub.entity.NoteTag;
import com.noteshub.entity.Tag;
import com.noteshub.repository.NoteTagRepository;
import com.noteshub.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final NoteTagRepository noteTagRepository;
    private final NoteService noteService;

    @Transactional
    public TagDto.Response createTag(TagDto.CreateRequest request) {
        if (tagRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Tag already exists: " + request.getName());
        }
        Tag tag = Tag.builder().name(request.getName()).build();
        return toResponse(tagRepository.save(tag));
    }

    @Transactional(readOnly = true)
    public List<TagDto.Response> getAllTags() {
        return tagRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public void addTagToNote(UUID noteId, UUID tagId) {
        if (noteTagRepository.existsByNote_IdAndTag_Id(noteId, tagId)) {
            throw new IllegalArgumentException("Tag is already applied to this note");
        }
        Note note = noteService.findNote(noteId);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new IllegalArgumentException("Tag not found: " + tagId));

        noteTagRepository.save(NoteTag.builder().note(note).tag(tag).build());
    }

    @Transactional
    public void removeTagFromNote(UUID noteId, UUID tagId) {
        if (!noteTagRepository.existsByNote_IdAndTag_Id(noteId, tagId)) {
            throw new IllegalArgumentException("Tag is not applied to this note");
        }
        noteTagRepository.deleteByNote_IdAndTag_Id(noteId, tagId);
    }

    @Transactional(readOnly = true)
    public List<TagDto.Response> getTagsForNote(UUID noteId) {
        noteService.findNote(noteId);
        return noteTagRepository.findAllByNote_Id(noteId)
                .stream()
                .map(nt -> toResponse(nt.getTag()))
                .collect(Collectors.toList());
    }

    private TagDto.Response toResponse(Tag tag) {
        TagDto.Response res = new TagDto.Response();
        res.setId(tag.getId());
        res.setName(tag.getName());
        res.setCreatedAt(tag.getCreatedAt());
        return res;
    }
}
