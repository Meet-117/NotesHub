import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { getNote, saveVersion, getVersionHistory, restoreVersion, getTagsForNote, getAllTags, addTagToNote, removeTagFromNote, updateNoteTitle, createTag, getSubjectNote, deleteNote } from '../api/client'
import { useAuth } from '../context/AuthContext'

// ── Toolbar config ──────────────────────────────────────────────
const TOOLBAR = [
  { label: 'B',      title: 'Bold',         style: { fontWeight: 700 },             active: e => e.isActive('bold'),        action: e => e.chain().focus().toggleBold().run() },
  { label: 'I',      title: 'Italic',        style: { fontStyle: 'italic' },         active: e => e.isActive('italic'),      action: e => e.chain().focus().toggleItalic().run() },
  { label: 'S̶',     title: 'Strikethrough', style: { textDecoration: 'line-through' }, active: e => e.isActive('strike'),   action: e => e.chain().focus().toggleStrike().run() },
  { type: 'div' },
  { label: 'H1',     title: 'Heading 1',     style: { fontSize: 11, fontWeight: 700 }, active: e => e.isActive('heading', { level: 1 }), action: e => e.chain().focus().toggleHeading({ level: 1 }).run() },
  { label: 'H2',     title: 'Heading 2',     style: { fontSize: 11, fontWeight: 700 }, active: e => e.isActive('heading', { level: 2 }), action: e => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { label: 'H3',     title: 'Heading 3',     style: { fontSize: 11, fontWeight: 700 }, active: e => e.isActive('heading', { level: 3 }), action: e => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { type: 'div' },
  { label: '• List', title: 'Bullet List',   style: { fontSize: 11 },                active: e => e.isActive('bulletList'), action: e => e.chain().focus().toggleBulletList().run() },
  { label: '1. List',title: 'Ordered List',  style: { fontSize: 11 },                active: e => e.isActive('orderedList'), action: e => e.chain().focus().toggleOrderedList().run() },
  { label: '❝',      title: 'Blockquote',    style: { fontSize: 13 },                active: e => e.isActive('blockquote'), action: e => e.chain().focus().toggleBlockquote().run() },
  { label: '</>',    title: 'Code Block',    style: { fontSize: 11, fontFamily: 'monospace' }, active: e => e.isActive('codeBlock'), action: e => e.chain().focus().toggleCodeBlock().run() },
  { label: '`c`',    title: 'Inline Code',   style: { fontSize: 10, fontFamily: 'monospace' }, active: e => e.isActive('code'), action: e => e.chain().focus().toggleCode().run() },
]

// ── Editor CSS injected into document ───────────────────────────
const EDITOR_CSS = `
.ProseMirror {
  outline: none;
  min-height: 400px;
  color: var(--text);
  font-family: var(--font);
  font-size: 15px;
  line-height: 1.75;
  caret-color: var(--accent-hover);
}
.ProseMirror p { margin: 0 0 12px; }
.ProseMirror p:last-child { margin-bottom: 0; }
.ProseMirror h1 { font-size: 26px; font-weight: 700; letter-spacing: -0.025em; margin: 28px 0 12px; border-bottom: 1px solid var(--border-muted); padding-bottom: 8px; }
.ProseMirror h2 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; margin: 24px 0 10px; border-bottom: 1px solid var(--border-muted); padding-bottom: 6px; }
.ProseMirror h3 { font-size: 16px; font-weight: 600; margin: 20px 0 8px; }
.ProseMirror strong { font-weight: 600; }
.ProseMirror code { font-family: "SFMono-Regular",Consolas,monospace; font-size: 85%; background: var(--surface); border: 1px solid var(--border); border-radius: 4px; padding: 2px 5px; color: #f78166; }
.ProseMirror pre { background: var(--surface); border: 1px solid var(--border); border-radius: 6px; padding: 16px; margin: 16px 0; overflow-x: auto; }
.ProseMirror pre code { background: transparent; border: none; padding: 0; color: var(--text); font-size: 13px; }
.ProseMirror blockquote { margin: 16px 0; padding: 8px 16px; border-left: 3px solid var(--green); color: var(--text-muted); background: var(--green-subtle); border-radius: 0 6px 6px 0; }
.ProseMirror ul, .ProseMirror ol { padding-left: 24px; margin: 8px 0 12px; }
.ProseMirror li { margin: 4px 0; }
.ProseMirror ul li::marker, .ProseMirror ol li::marker { color: var(--text-muted); }
.ProseMirror p.is-editor-empty:first-child::before { content: attr(data-placeholder); float: left; color: var(--text-subtle); pointer-events: none; height: 0; font-size: 15px; }
.ProseMirror ::selection { background: rgba(31,111,235,0.3); }
`

function ToolbarButton({ btn, editor }) {
  const [, tick] = useState(0)
  useEffect(() => {
    if (!editor) return
    const fn = () => tick(t => t + 1)
    editor.on('transaction', fn)
    return () => editor.off('transaction', fn)
  }, [editor])
  if (!editor) return null
  const isActive = btn.active(editor)
  return (
    <button
      title={btn.title}
      style={{
        background: isActive ? 'var(--accent-subtle)' : 'transparent',
        border: 'none',
        color: isActive ? 'var(--accent-hover)' : 'var(--text-muted)',
        borderRadius: 4, padding: '4px 7px', cursor: 'pointer',
        fontFamily: 'var(--font)', fontSize: 13, lineHeight: 1,
        minWidth: 28, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.1s', whiteSpace: 'nowrap', ...btn.style,
      }}
      onMouseDown={e => { e.preventDefault(); btn.action(editor) }}
      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)' } }}
      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)' } }}
    >
      {btn.label}
    </button>
  )
}

export default function NoteEditorPage() {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  
  const [title, setTitle] = useState('Loading...')
  const [subjectNote, setSubjectNote] = useState(null)
  const isOwner = subjectNote?.ownerId === user?.id
  
  const [history, setHistory] = useState([])
  const [previewVersion, setPreviewVersion] = useState(null) // null means showing HEAD
  const isViewOnly = !isOwner || !!previewVersion
  
  const [tags, setTags] = useState([])
  const [allTags, setAllTags] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [showTags, setShowTags] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [commitMsg, setCommitMsg] = useState('')
  const [showCommit, setShowCommit] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [loadingMetadata, setLoadingMetadata] = useState(true)
  const titleRef = useRef(null)

  // Inject CSS once
  useEffect(() => {
    if (document.getElementById('nh-editor-css')) return
    const style = document.createElement('style')
    style.id = 'nh-editor-css'
    style.textContent = EDITOR_CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, [])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({ placeholder: 'Start writing your note…' }),
    ],
    autofocus: true,
    editable: !isViewOnly,
  }, [isViewOnly])

  // Word count
  const [words, setWords] = useState(0)
  const [chars, setChars] = useState(0)
  useEffect(() => {
    if (!editor) return
    const fn = () => {
      const t = editor.getText()
      setWords(t.trim() ? t.trim().split(/\s+/).length : 0)
      setChars(t.length)
    }
    editor.on('update', fn); fn()
    return () => editor.off('update', fn)
  }, [editor])

  // Load version history & tags
  useEffect(() => {
    if (!noteId || !editor) return
    setLoadingMetadata(true)
    getNote(noteId).then(n => {
      setTitle(n.title)
      getSubjectNote(n.subjectNoteId).then(setSubjectNote).catch(console.error)
    }).catch(console.error)
    
    getVersionHistory(noteId).then(h => {
      setHistory(h)
      if (h.length > 0 && !previewVersion) {
        editor.commands.setContent(h[0].contentText || '')
      }
      setLoadingMetadata(false)
    }).catch(e => {
      console.error(e)
      setLoadingMetadata(false)
    })
    
    getTagsForNote(noteId).then(setTags).catch(console.error)
    getAllTags().then(setAllTags).catch(console.error)
  }, [noteId, editor])

  const handlePreviewVersion = (version) => {
    if (!editor) return
    setPreviewVersion(version)
    editor.commands.setContent(version.contentText || '')
  }

  const handleExitPreview = () => {
    if (!editor || history.length === 0) return
    setPreviewVersion(null)
    editor.commands.setContent(history[0].contentText || '')
  }

  // Auto-resize title
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [title])

  const handleSaveTitle = async () => {
    if (!noteId || !title.trim()) return
    try {
      await updateNoteTitle(noteId, { title })
    } catch (e) { console.error('Failed to update title', e) }
  }

  const handleSave = async () => {
    if (!editor || !noteId) return
    if (!commitMsg.trim()) { setShowCommit(true); return }
    setSaving(true)
    try {
      await updateNoteTitle(noteId, { title })
      await saveVersion({ noteId, contentText: editor.getHTML(), changeMessage: commitMsg })
      const h = await getVersionHistory(noteId)
      setHistory(h)
      setSaveMsg('Saved ✓')
      setCommitMsg('')
      setShowCommit(false)
      setTimeout(() => setSaveMsg(''), 2000)
    } catch (e) { alert(e.message) }
    finally { setSaving(false) }
  }

  const handleRestore = async (versionId) => {
    const msg = prompt('Restore message (required):')
    if (!msg) return
    try {
      await restoreVersion(versionId, { changeMessage: msg })
      const h = await getVersionHistory(noteId)
      setHistory(h)
      // Load the restored content
      const top = h[0]
      if (top && editor) editor.commands.setContent(top.contentText || '')
      setShowHistory(false)
    } catch (e) { alert(e.message) }
  }

  const handleAddTag = async (tagId) => {
    try {
      await addTagToNote(noteId, tagId)
      const t = await getTagsForNote(noteId)
      setTags(t)
    } catch (e) { alert(e.message) }
  }

  const handleRemoveTag = async (tagId) => {
    try {
      await removeTagFromNote(noteId, tagId)
      setTags(t => t.filter(x => x.id !== tagId))
    } catch (e) { alert(e.message) }
  }

  const handleCreateTag = async (name) => {
    try {
      const newTag = await createTag({ name })
      setAllTags(all => [...all, newTag])
      await addTagToNote(noteId, newTag.id)
      setTags(t => [...t, newTag])
      setTagInput('')
    } catch (e) { alert(e.message) }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this note and all its history?')) return
    try {
      await deleteNote(noteId)
      navigate(`/subjects/${subjectNote.id}`, { state: { source: location.state?.source || 'subject-notes' } })
    } catch (err) {
      alert(err.message)
    }
  }

  const unaddedTags = allTags
    .filter(t => !tags.find(x => x.id === t.id))
    .filter(t => t.name.toLowerCase().includes(tagInput.trim().toLowerCase()));

  if (loadingMetadata) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', gap: 12, color: 'var(--text-subtle)' }}>
        <div className="spinner" />
        Loading note...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>

      {/* ── Main editor column ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          height: 'var(--header-h)', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', padding: '0 24px', gap: 12,
          background: 'var(--bg-secondary)', flexShrink: 0,
        }}>
          <button
            onClick={() => subjectNote ? navigate(`/subjects/${subjectNote.id}`, { state: { source: location.state?.source || 'subject-notes' } }) : navigate('/dashboard')}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontFamily: 'var(--font)', padding: '4px 0' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z"/></svg>
            Back
          </button>
          
          {subjectNote?.forkedFromId && (
            <div style={{ fontSize: 12, color: 'var(--text-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ opacity: 0.7 }}>forked from</span>
              <button 
                onClick={() => navigate(`/profile/${subjectNote.originalOwnerId}`, { state: { source: 'profile' } })}
                style={{ background: 'none', border: 'none', color: 'var(--accent-hover)', cursor: 'pointer', padding: 0, fontSize: 12, fontWeight: 500 }}
              >
                {subjectNote.originalOwnerName}
              </button>
              <span style={{ opacity: 0.7 }}>/</span>
              <span style={{ color: 'var(--text-muted)' }}>{subjectNote.forkedFromTitle}</span>
            </div>
          )}
          <div style={{ width: 1, height: 20, background: 'var(--border)' }} />
          <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title || 'Untitled'}</span>

          {saveMsg && <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 500 }}>{saveMsg}</span>}

          <button className="btn btn-secondary btn-sm" onClick={() => setShowTags(!showTags)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 00.354 0l5.025-5.025a.25.25 0 000-.354l-6.25-6.25a.25.25 0 00-.177-.073H2.75a.25.25 0 00-.25.25v5.025zM6 5a1 1 0 100 2 1 1 0 000-2z"/></svg>
            Tags {tags.length > 0 && <span style={{ background: 'var(--accent-subtle)', color: 'var(--accent-hover)', borderRadius: 20, padding: '0 5px', fontSize: 10 }}>{tags.length}</span>}
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowHistory(!showHistory)}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684zM7.75 4a.75.75 0 01.75.75v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5A.75.75 0 017.75 4z"/></svg>
            History {history.length > 0 && <span style={{ background: 'var(--surface)', color: 'var(--text-muted)', borderRadius: 20, padding: '0 5px', fontSize: 10 }}>{history.length}</span>}
          </button>
          
          {isOwner && (
            <>
              <button 
                className="btn btn-secondary btn-sm" 
                style={{ color: 'var(--red)', minWidth: 40, padding: '4px 8px' }}
                onClick={handleDelete}
                title="Delete this note"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M11 1.75V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.476 6.03a.75.75 0 10-1.452-.379l.5 1.928a.75.75 0 101.452.379l-.5-1.928zm7.048-.379a.75.75 0 00-1.452.379l.5 1.928a.75.75 0 001.452-.379l-.5-1.928zM7.25 7.75a.75.75 0 011.5 0v5a.75.75 0 01-1.5 0v-5z"/><path d="M3.47 5.17l.56 9.38A1.75 1.75 0 005.78 16h4.44a1.75 1.75 0 001.75-1.45l.56-9.38H3.47zM11 6.5l-.53 8.75a.25.25 0 01-.25.25H5.78a.25.25 0 01-.25-.25L5 6.5h6z"/></svg>
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => setShowCommit(true)} disabled={saving}>
                <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5H4.07a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zm-1.43-.75a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"/></svg>
                {saving ? 'Saving…' : 'Commit'}
              </button>
            </>
          )}
        </div>

        {/* Toolbar */}
        {!isViewOnly && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 2,
            padding: '6px 24px', background: 'var(--surface)',
            borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap',
          }}>
            {TOOLBAR.map((btn, i) =>
              btn.type === 'div'
                ? <div key={i} style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
                : <ToolbarButton key={i} btn={btn} editor={editor} />
            )}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{words}w · {chars}c</span>
          </div>
        )}

        {previewVersion && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '8px 24px', background: 'var(--orange-subtle)',
            borderBottom: '1px solid var(--border)', flexShrink: 0,
            fontSize: 13, color: 'var(--orange-text)',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M1.643 3.143L.427 1.927A.25.25 0 000 2.104V5.75c0 .138.112.25.25.25h3.646a.25.25 0 00.177-.427L2.715 4.215a6.5 6.5 0 11-1.18 4.458.75.75 0 10-1.493.154 8.001 8.001 0 101.6-5.684z"/></svg>
            <strong>Previewing v{previewVersion.versionNumber}</strong>
            <span style={{ opacity: 0.8 }}>({previewVersion.changeMessage})</span>
            <div style={{ flex: 1 }} />
            <button className="btn btn-secondary btn-sm" onClick={handleExitPreview}>Back to Current Version</button>
            {isOwner && (
              <button className="btn btn-primary btn-sm" onClick={() => handleRestore(previewVersion.id)}>Restore this version</button>
            )}
          </div>
        )}

        {/* Editor scroll area */}
        <div style={{ flex: 1, overflow: 'auto', padding: '32px 48px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {/* Title */}
            <textarea
              ref={titleRef}
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={handleSaveTitle}
              placeholder="Note title…"
              rows={1}
              disabled={isViewOnly}
              style={{
                width: '100%', background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text)', fontFamily: 'var(--font)', fontSize: 36, fontWeight: 700,
                letterSpacing: '-0.03em', lineHeight: 1.2, marginBottom: 8,
                caret_color: 'var(--accent-hover)', resize: 'none', overflow: 'hidden',
                caretColor: 'var(--accent-hover)', padding: 0,
                cursor: isViewOnly ? 'default' : 'text',
              }}
            />

            {/* Meta row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, paddingBottom: 24, borderBottom: '1px solid var(--border-muted)', marginBottom: 28, flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <span key={tag.id} className="badge badge-blue" style={{ cursor: 'default' }}>
                  <svg width="8" height="8" viewBox="0 0 16 16" fill="currentColor"><path d="M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 00.354 0l5.025-5.025a.25.25 0 000-.354l-6.25-6.25a.25.25 0 00-.177-.073H2.75a.25.25 0 00-.25.25v5.025zM6 5a1 1 0 100 2 1 1 0 000-2z"/></svg>
                  {tag.name}
                </span>
              ))}
              {history.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5H4.07a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zm-1.43-.75a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"/></svg>
                  {history.length} commit{history.length !== 1 ? 's' : ''}
                </span>
              )}
              <span style={{ fontSize: 12, color: 'var(--text-subtle)' }}>
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Content area */}
            {subjectNote?.noteType === 'PDF' ? (
              <div style={{ marginTop: 20 }}>
                {previewVersion?.fileUrl || history[0]?.fileUrl ? (
                  <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', height: 'calc(100vh - 350px)' }}>
                    <iframe 
                      src={`http://localhost:8080${previewVersion?.fileUrl || history[0]?.fileUrl}`} 
                      width="100%" 
                      height="100%" 
                      style={{ border: 'none' }}
                    />
                  </div>
                ) : (
                  <div className="empty-state">
                    <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor"><path d="M3.75 1.5a.25.25 0 00-.25.25v11.5c0 .138.112.25.25.25h8.5a.25.25 0 00.25-.25V6H9.75A1.75 1.75 0 018 4.25V1.5H3.75zm5.75.56v2.19c0 .138.112.25.25.25h2.19L9.5 2.06zM2 1.75C2 .784 2.784 0 3.75 0h5.086c.464 0 .909.184 1.237.513l3.414 3.414c.329.328.513.773.513 1.237v8.086A1.75 1.75 0 0112.25 15h-8.5A1.75 1.75 0 012 13.25V1.75z"/></svg>
                    <p>No PDF file attached to this note.</p>
                  </div>
                )}
              </div>
            ) : (
              <EditorContent editor={editor} />
            )}
          </div>
        </div>
      </div>

      {/* ── History panel ── */}
      {showHistory && (
        <div style={{
          width: 320, borderLeft: '1px solid var(--border)',
          background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Version History</span>
            <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12 }}>
            {history.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-subtle)', fontSize: 13 }}>No commits yet</div>
            ) : history.map((v, i) => (
              <div key={v.id} style={{
                padding: 12, borderRadius: 6, marginBottom: 6,
                background: i === 0 ? 'var(--accent-subtle)' : 'var(--surface)',
                border: `1px solid ${i === 0 ? 'rgba(31,111,235,0.3)' : 'var(--border)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{
                    fontSize: 11, fontFamily: 'var(--mono)',
                    color: i === 0 && !previewVersion ? 'var(--accent-hover)' : 'var(--text-subtle)',
                    background: i === 0 && !previewVersion ? 'rgba(31,111,235,0.15)' : 'var(--border-muted)',
                    padding: '1px 6px', borderRadius: 4,
                  }}>
                    v{v.versionNumber}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {previewVersion?.id !== v.id && (
                       <button
                         className="btn btn-ghost btn-sm"
                         style={{ fontSize: 11, padding: '2px 8px' }}
                         onClick={() => handlePreviewVersion(v)}
                       >
                         View
                       </button>
                    )}
                    {isOwner && i !== 0 && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ fontSize: 11, padding: '2px 8px' }}
                        onClick={() => handleRestore(v.id)}
                      >
                        Restore
                      </button>
                    )}
                  </div>
                  {i === 0 && !previewVersion && <span style={{ fontSize: 11, color: 'var(--accent-hover)', fontWeight: 600 }}>HEAD</span>}
                </div>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{v.changeMessage}</div>
                <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                  {new Date(v.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Tags panel ── */}
      {showTags && (
        <div style={{
          width: 280, borderLeft: '1px solid var(--border)',
          background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 600, fontSize: 14 }}>Tags</span>
            <button onClick={() => setShowTags(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
            <div style={{ marginBottom: 16 }}>
              <input
                className="input"
                style={{ width: '100%', fontSize: 13, padding: '6px 10px' }}
                placeholder="Search or create tag..."
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && tagInput.trim() && !allTags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase())) {
                    handleCreateTag(tagInput.trim());
                  }
                }}
              />
              {tagInput.trim() && !allTags.find(t => t.name.toLowerCase() === tagInput.trim().toLowerCase()) && (
                <button 
                  className="btn btn-secondary btn-sm" 
                  style={{ width: '100%', marginTop: 8 }}
                  onClick={() => handleCreateTag(tagInput.trim())}
                >
                  + Create "{tagInput.trim()}"
                </button>
              )}
            </div>
            {tags.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Applied</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {tags.map(tag => (
                    <span key={tag.id} className="badge badge-blue" style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(tag.id)} title="Click to remove">
                      {tag.name} ×
                    </span>
                  ))}
                </div>
              </>
            )}
            {unaddedTags.length > 0 && (
              <>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Available</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {unaddedTags.map(tag => (
                    <span key={tag.id} className="badge badge-gray" style={{ cursor: 'pointer' }} onClick={() => handleAddTag(tag.id)} title="Click to add">
                      + {tag.name}
                    </span>
                  ))}
                </div>
              </>
            )}
            {allTags.length === 0 && (
              <div style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: 24 }}>No tags created yet</div>
            )}
          </div>
        </div>
      )}

      {/* ── Commit modal ── */}
      {showCommit && (
        <div className="modal-backdrop" onClick={() => setShowCommit(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style={{ color: 'var(--green)' }}><path d="M11.93 8.5a4.002 4.002 0 01-7.86 0H.75a.75.75 0 010-1.5H4.07a4.002 4.002 0 017.86 0h3.32a.75.75 0 010 1.5h-3.32zm-1.43-.75a2.5 2.5 0 10-5 0 2.5 2.5 0 005 0z"/></svg>
              Commit changes
            </h2>
            <div className="form-group">
              <label className="input-label">Commit message *</label>
              <input
                className="input"
                placeholder="e.g. Added section on AVL trees"
                value={commitMsg}
                onChange={e => setCommitMsg(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSave() }}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowCommit(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !commitMsg.trim()}>
                {saving ? 'Saving…' : 'Commit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
