import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubjectNotes, createSubjectNote, forkSubjectNote } from '../api/client'
import { useAuth } from '../context/AuthContext'

function SubjectNoteCard({ sn, onClick, onFork }) {
  const [forking, setForking] = useState(false)

  const handleFork = async (e) => {
    e.stopPropagation()
    setForking(true)
    try { await onFork(sn.id) }
    finally { setForking(false) }
  }

  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'all 0.15s', position: 'relative' }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--text-muted)', flexShrink: 0, marginTop: 1 }}>
            <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
          </svg>
          <span style={{ fontWeight: 600, fontSize: 15 }}>{sn.title}</span>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <span className={`badge badge-${sn.visibility === 'PUBLIC' ? 'green' : 'gray'}`}>
            {sn.visibility === 'PUBLIC' ? (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0a8 8 0 100 16A8 8 0 008 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0z"/></svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 16 16" fill="currentColor"><path d="M4 4a4 4 0 018 0v2h.25c.966 0 1.75.784 1.75 1.75v5.5A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25v-5.5C2 6.784 2.784 6 3.75 6H4V4zm8.25 3.5h-8.5a.25.25 0 00-.25.25v5.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25v-5.5a.25.25 0 00-.25-.25zM10.5 4a2.5 2.5 0 00-5 0v2h5V4z"/></svg>
            )}
            {sn.visibility.toLowerCase()}
          </span>
          {sn.forkedFromId && <span className="badge badge-orange">fork</span>}
        </div>
      </div>

      {sn.description && (
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          {sn.description}
        </p>
      )}

      {sn.forkedFromTitle && (
        <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878z"/></svg>
          Forked from <strong style={{ color: 'var(--text-muted)' }}>{sn.forkedFromTitle}</strong>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
          {new Date(sn.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          className="btn btn-ghost btn-sm"
          onClick={handleFork}
          disabled={forking}
          style={{ fontSize: 12 }}
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878z"/></svg>
          {forking ? 'Forking…' : 'Fork'}
        </button>
      </div>
    </div>
  )
}

export default function SubjectNotesPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', visibility: 'PUBLIC' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const load = () => {
    if (!userId) return setLoading(false)
    setLoading(true)
    getSubjectNotes(userId)
      .then(setNotes)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!form.title.trim()) { setError('Title is required'); return }
    setSaving(true); setError('')
    try {
      await createSubjectNote({ ...form, ownerId: userId })
      setShowModal(false)
      setForm({ title: '', description: '', visibility: 'PUBLIC' })
      load()
    } catch (e) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleFork = async (id) => {
    try {
      await forkSubjectNote(id, userId)
      load()
    } catch (e) { alert(e.message) }
  }

  const filtered = notes.filter(n => {
    if (filter === 'public') return n.visibility === 'PUBLIC'
    if (filter === 'private') return n.visibility === 'PRIVATE'
    if (filter === 'forked') return !!n.forkedFromId
    return true
  })

  if (!userId) return (
    <div className="page">
      <div className="empty-state">
        <h3>Not logged in</h3>
        <p>Go to the Dashboard and create an account first.</p>
      </div>
    </div>
  )

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>My Notebooks</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{notes.length} notebook{notes.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 01.75.75V7h4.25a.75.75 0 010 1.5H8.5v4.25a.75.75 0 01-1.5 0V8.5H2.75a.75.75 0 010-1.5H7V2.75A.75.75 0 017.75 2z"/></svg>
          New Notebook
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {[['all', 'All'], ['public', 'Public'], ['private', 'Private'], ['forked', 'Forked']].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              background: 'none', border: 'none',
              borderBottom: filter === val ? '2px solid var(--accent-hover)' : '2px solid transparent',
              color: filter === val ? 'var(--accent-hover)' : 'var(--text-muted)',
              padding: '8px 16px', cursor: 'pointer', fontFamily: 'var(--font)',
              fontSize: 14, fontWeight: filter === val ? 600 : 400,
              marginBottom: -1, transition: 'all 0.1s',
            }}
          >
            {label}
            <span style={{
              marginLeft: 6, background: 'var(--border-muted)', color: 'var(--text-muted)',
              borderRadius: 20, padding: '1px 6px', fontSize: 11,
            }}>
              {val === 'all' ? notes.length
                : val === 'public' ? notes.filter(n => n.visibility === 'PUBLIC').length
                : val === 'private' ? notes.filter(n => n.visibility === 'PRIVATE').length
                : notes.filter(n => n.forkedFromId).length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div className="spinner" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/></svg>
          <h3>No notebooks found</h3>
          <p>Create your first notebook to start organizing notes by subject</p>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>New Notebook</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map(sn => (
            <SubjectNoteCard
              key={sn.id}
              sn={sn}
              onClick={() => navigate(`/subjects/${sn.id}`)}
              onFork={handleFork}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>New Notebook</h2>
            <div className="form-group">
              <label className="input-label">Title *</label>
              <input className="input" placeholder="e.g. Data Structures & Algorithms" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} autoFocus />
            </div>
            <div className="form-group">
              <label className="input-label">Description</label>
              <textarea className="input" placeholder="What is this notebook about?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="input-label">Visibility</label>
              <select className="input" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </div>
            {error && <div style={{ color: 'var(--red)', fontSize: 13, marginBottom: 8 }}>{error}</div>}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Creating…' : 'Create Notebook'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
