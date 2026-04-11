import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { getUser, getPublicNotesByUser, forkSubjectNote, toggleBookmark, getUserBookmarks } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ProfilePage() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user: currentUser } = useAuth()
  
  const [profileUser, setProfileUser] = useState(null)
  const [notebooks, setNotebooks] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

  useEffect(() => {
    loadProfile()
    if (currentUser) {
      loadBookmarks()
    }
  }, [userId, currentUser])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadNotebooks()
    }, 300)
    return () => clearTimeout(timer)
  }, [query, userId])

  const loadProfile = async () => {
    try {
      const u = await getUser(userId)
      setProfileUser(u)
    } catch (err) {
      console.error(err)
    }
  }

  const loadNotebooks = async () => {
    setLoading(true)
    try {
      const data = await getPublicNotesByUser(userId, query)
      setNotebooks(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const loadBookmarks = async () => {
    try {
      const bookmarks = await getUserBookmarks(currentUser.id)
      setBookmarkedIds(new Set(bookmarks.map(b => b.subjectNoteId)))
    } catch (e) {
      console.error(e)
    }
  }

  const handleFork = async (e, sn) => {
    e.stopPropagation()
    if (!currentUser) return
    try {
      await forkSubjectNote(sn.id, currentUser.id)
      alert(`Forked "${sn.title}"!`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleBookmark = async (e, snId) => {
    e.stopPropagation()
    if (!currentUser) return
    try {
      const res = await toggleBookmark(currentUser.id, snId)
      setBookmarkedIds(prev => {
        const next = new Set(prev)
        if (res.bookmarked) next.add(snId)
        else next.delete(snId)
        return next
      })
    } catch (err) {
      alert(err.message)
    }
  }

  if (!profileUser && loading) {
    return <div className="page" style={{ display: 'flex', justifyContent: 'center', paddingTop: 100 }}><div className="spinner" /></div>
  }

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: 24 }}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z"/></svg>
        Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--accent-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white' }}>
          {profileUser?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 32, fontWeight: 700, letterSpacing: '-0.03em' }}>{profileUser?.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16 }}>{profileUser?.email}</p>
        </div>
      </div>

      <div style={{ borderBottom: '1px solid var(--border)', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, paddingBottom: 12, borderBottom: '2px solid var(--accent-hover)', marginBottom: -1 }}>
          Public Notebooks
        </h2>
        <div style={{ position: 'relative', width: 300, marginBottom: 12 }}>
          <input 
            className="input" 
            placeholder="Search within profile..." 
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ paddingLeft: 32, height: 36, fontSize: 13 }}
          />
          <div style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-subtle)' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M10.68 11.74a6 6 0 01-7.922-8.982 6 6 0 018.982 7.922l3.04 3.04a.749.749 0 01-.326 1.275.749.749 0 01-.734-.215ZM11.5 7a4.499 4.499 0 10-8.997 0A4.499 4.499 0 0011.5 7Z"/></svg>
          </div>
        </div>
      </div>

      {loading && notebooks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>Loading...</div>
      ) : notebooks.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 16 16" fill="currentColor"><path d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75zM3.5 6.25a.75.75 0 01.75-.75h7a.75.75 0 010 1.5h-7a.75.75 0 01-.75-.75zm.75 2.25h4a.75.75 0 010 1.5h-4a.75.75 0 010-1.5z"/></svg>
          <h3>No public notebooks found</h3>
          <p>This user hasn't shared any notebooks yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {notebooks.map(sn => {
            const isBookmarked = bookmarkedIds.has(sn.id)
            return (
              <div 
                key={sn.id} 
                className="card" 
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => navigate(`/subjects/${sn.id}`, { state: { source: 'profile' } })}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>{sn.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {sn.description || 'No description'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className={`btn btn-ghost btn-sm ${isBookmarked ? 'active' : ''}`}
                    onClick={(e) => handleToggleBookmark(e, sn.id)}
                    style={{ color: isBookmarked ? 'var(--yellow)' : 'inherit' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M3.75 2h8.5c.966 0 1.75.784 1.75 1.75v10.5a.75.75 0 01-1.28.53L8 10.56l-4.72 4.22a.75.75 0 01-1.28-.53V3.75C2 2.784 2.784 2 3.75 2z"/>
                    </svg>
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => handleFork(e, sn)}
                    title="Fork to my notebooks"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75v-.878a2.25 2.25 0 111.5 0v.878a3.75 3.75 0 01-3.75 3.75H8.75v1.122a2.25 2.25 0 11-1.5 0V9.872a3.75 3.75 0 01-3.75-3.75v-.878a2.25 2.25 0 111.5 0z"/></svg>
                    Fork
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
