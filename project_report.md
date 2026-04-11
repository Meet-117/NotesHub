# NotesHub - Project Technical Report 📝

## 1. Project Overview
NotesHub is a full-stack web application designed to facilitate efficient note management and knowledge sharing. Unlike traditional note-taking apps, NotesHub integrates version control and social discovery features, allowing users to fork and build upon existing knowledge bases.

## 2. System Architecture

### 2.1 Backend (Service Layer)
The backend is built using **Spring Boot 3.x**, following a layered architecture:
- **Controllers**: Handle HTTP requests and DTO mapping.
- **Services**: Contain core business logic, including complex operations like forking and version restoration.
- **Repositories**: JPA-based data access with custom JPQL queries for search and discovery.
- **Security**: JWT-based stateless authentication integrated with Spring Security.

### 2.2 Frontend (Presentation Layer)
The frontend is a modern **React** application built with **Vite**:
- **State Management**: Context API for authentication and local component state for UI responsiveness.
- **Editor Integration**: TipTap editor provides a schema-based rich text experience.
- **Dynamic CSS**: Custom-built CSS system for a consistent "premium" aesthetic.

## 3. Core Modules & Features

### 3.1 Advanced Versioning
NotesHub implements a linear versioning system. Every "Commit" creates a `NoteVersion` snapshot. This ensures data persistence and allows users to traverse the history of any note.
- **PDF Versioning**: For PDF notes, versions track the file URL directly, allowing users to switch between different PDF uploads in history.

### 3.2 The Forking System
The "Fork" feature allows users to copy an entire Subject Notebook (including all notes and tags) into their own account.
- **Lineage Tracking**: Forked notebooks maintain a link to the original owner, which is used to populate profiles and social attribution.

### 3.3 Public Discovery (Explore)
The "Explore" module features a debounced live-search system that filters notebooks by title, description, or tags.
- **Tag Integration**: Search queries are matched against `Tag` entities via JOIN queries in the backend.

### 3.4 Security & Access Control
- **JWT Auth**: Tokens are issued upon login and validated per request via a `JwtAuthenticationFilter`.
- **Ownership Verification**: All write/delete operations are verified against the authenticated user's ID to prevent unauthorized modifications.

## 4. Database Schema Highlights
- **SubjectNote**: The parent container.
- **Note**: Individual notes, linked to a current `NoteVersion`.
- **NoteVersion**: Historical records of note content.
- **Tag**: Global entities for categorization.
- **NoteTag**: Join table for many-to-many relationship between Notes and Tags.
- **Bookmark**: Links Users to public SubjectNotes.

## 5. Performance Optimizations
- **Debounced Search**: Reduces backend load during live typing.
- **Lazy Loading**: JPA FetchType.LAZY used for large associations (like versions) to optimize initial page loads.

## 6. Future Roadmap
- **Collaborative Editing**: Real-time multi-user editing via WebSockets/Y-JS.
- **Mobile App**: React Native port for cross-platform availability.
- **AI Integration**: Automatic summarization and tag generation using LLMs.

---
*Report Generated: 2026-04-09*
