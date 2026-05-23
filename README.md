# NotesHub 🚀

NotesHub is a powerful, community-driven note-taking platform designed for students and professionals. It combines rich-text editing with advanced organization, version control, and social features.

## ✨ Features

- **Rich Text Editor**: Powered by Tiptap, support for headings, lists, code blocks, and blockquotes.
- **PDF Support**: Upload and view PDF documents directly within your notes.
- **Version Control**: Every save creates a new version. View history and restore previous versions effortlessly.
- **Notebook Organization**: Group your notes into Subject Notebooks for better structure.
- **Collaborative Discovery**: Explore public notebooks, fork them into your own collection, and follow other users.
- **Tagging System**: Organize notes with global and private tags for easy filtering.
- **Bookmarking**: Save important public notebooks to your personal bookmarks for quick access.
- **User Profiles**: Showcase your public work and discover others' contributions.

## 🛠️ Tech Stack

### Frontend
- **React** (Vite)
- **Tiptap** (Editor Framework)
- **Vanilla CSS** (Custom Premium UI)
- **React Router** (Navigation)

### Backend
- **Spring Boot** (Java 17+)
- **PostgreSQL** (Database)
- **Spring Security + JWT** (Authentication)
- **Hibernate/JPA** (Data Persistence)

## 🚀 Getting Started

### Prerequisites
- JDK 17+
- Node.js & npm
- PostgreSQL

### Backend Setup
1. Configure your database in `backend/src/main/resources/application.properties`.
2. Run the application:
   ```bash
   ./mvnw spring-boot:run
   ```

### Frontend Setup
1. Navigate to the `frontend` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
