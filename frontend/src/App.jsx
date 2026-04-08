import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import SubjectNotesPage from './pages/SubjectNotesPage'
import NotesListPage from './pages/NotesListPage'
import NoteEditorPage from './pages/NoteEditorPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ExplorePage from './pages/ExplorePage'
import BookmarksPage from './pages/BookmarksPage'
import SidebarWrapper from './components/SidebarWrapper'
import './index.css'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route element={<ProtectedRoute><SidebarWrapper /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<SubjectNotesPage />} />
            <Route path="/subjects/:subjectId" element={<NotesListPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
          </Route>

          <Route path="/notes/:noteId" element={
            <ProtectedRoute>
              <NoteEditorPage />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
