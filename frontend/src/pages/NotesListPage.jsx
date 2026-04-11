import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getNotesBySubject, createNote, getSubjectNote, uploadFile, deleteNote } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function NotesListPage() {
  const { subjectId: subjectNoteId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [notes, setNotes] = useState([])
  const [subjectData, setSubjectData] = useState(null)
  const isOwner = subjectData?.ownerId === user?.id
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', noteType: 'TEXT' })
  const [file, setFile] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    Promise.all([
      getNotesBySubject(subjectNoteId),
      getSubjectNote(subjectNoteId)
    ])
      .then(([notesData, data]) => {
        setNotes(notesData)
        setSubjectData(data)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [subjectNoteId])

  const handleCreate = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      let fileUrl = null
      if (form.noteType === 'PDF' && file) {
        fileUrl = await uploadFile(file)
      }
      
      const note = await createNote({ 
        ...form, 
        subjectNoteId, 
        fileUrl 
      })
      setShowModal(false)
      setForm({ title: '', noteType: 'TEXT' })
      setFile(null)
      load()
      navigate(`/notes/${note.id}`)
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (e, noteId) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this note and all its history?')) return
    try {
      await deleteNote(noteId)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page">
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 13, color: 'var(--text-muted)' }}>
        <button onClick={() => navigate('/subjects')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'var(--font)', fontSize: 13, padding: 0 }}>
          Notebooks
        </button>
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"/></svg>
        <span style={{ color: 'var(--text)' }}>{subjectData?.title || 'Loading...'}</span>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>{subjectData?.title || 'Loading...'}</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{notes.length} note{notes.length !== 1 ? 's' : ''}</p>
        </div>
        {isOwner && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/></svg>
            New Note
          </button>
        )}
      </div>

      {/* Notes list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : notes.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor"><path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75zM3.5 6.25a.75.75 0 01.75-.75h7a.75.75 0 010 1.5h-7a.75.75 0 01-.75-.75zm.75 2.25h4a.75.75 0 010 1.5h-4a.75.75 0 010-1.5z"/></svg>
          <h3>No notes yet</h3>
          <p>Create your first note in this notebook</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>New Note</button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Table header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 80px 160px 120px 40px',
            padding: '8px 16px', fontSize: 12, color: 'var(--text-muted)',
            fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
            borderBottom: '1px solid var(--border)',
          }}>
            <span>Title</span>
            <span>Type</span>
            <span>Version</span>
            <span>Created</span>
            <span></span>
          </div>

          {notes.map(note => (
            <div
              key={note.id}
              onClick={() => navigate(`/notes/${note.id}`)}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 80px 160px 120px 40px',
                padding: '12px 16px', cursor: 'pointer', borderRadius: 6,
                borderBottom: '1px solid var(--border-muted)',
                transition: 'background 0.1s', alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                {note.noteType === 'TEXT' ? (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--accent-hover)', flexShrink: 0 }}>
                    <path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75z"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--red)', flexShrink: 0 }}>
                    <path d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"/>
                  </svg>
                )}
                <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{note.title}</span>
              </div>
              <span className={`badge badge-${note.noteType === 'TEXT' ? 'blue' : 'orange'}`} style={{ width: 'fit-content' }}>
                {note.noteType}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {note.currentVersionNumber != null ? `v${note.currentVersionNumber}` : '—'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                {isOwner && (
                  <button 
                    className="btn btn-ghost btn-sm" 
                    onClick={(e) => handleDelete(e, note.id)}
                    style={{ padding: 4, height: 28, width: 28 }}
                    title="Delete note"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--red)' }}><path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.476 6.03a.75.75 0 10-1.452-.379l.5 1.928a.75.75 0 101.452.379l-.5-1.928zm7.048-.379a.75.75 0 00-1.452.379l.5 1.928a.75.75 0 001.452-.379l-.5-1.928zM7.25 7.75a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5z"/><path d="M3.47 5.17l.56 9.38A1.75 1.75 0 005.78 16h4.44a1.75 1.75 0 001.75-1.45l.56-9.38H3.47zM11 6.5l-.53 8.75a.25.25 0 01-.25.25H5.78a.25.25 0 01-.25-.25L5 6.5h6z"/></svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create note modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Note</h2>
            <div className="form-group">
              <label className="input-label">Title *</label>
              <input className="input" placeholder="e.g. Binary Search Trees" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            </div>
            <div className="form-group">
              <label className="input-label">Type</label>
              <select className="input" value={form.noteType} onChange={e => setForm(f => ({ ...f, noteType: e.target.value }))}>
                <option value="TEXT">Note Editor</option>
                <option value="PDF">PDF Link</option>
              </select>
            </div>

            {form.noteType === 'PDF' && (
              <div className="form-group">
                <label className="input-label">PDF File</label>
                <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ padding: '8px 0' }} />
              </div>
            )}

            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 8 }}>{error}</div>}

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
              <button 
                className="btn btn-primary" 
                onClick={handleCreate} 
                disabled={saving || (form.noteType === 'PDF' && !file)}
              >
                {saving ? 'Creating...' : 'Create Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
