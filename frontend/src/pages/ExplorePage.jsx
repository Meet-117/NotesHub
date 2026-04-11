import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchSubjectNotes, forkSubjectNote, toggleBookmark, getUserBookmarks } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ExplorePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

  // Initial load
  useEffect(() => {
    if (user) {
      loadBookmarks()
    }
  }, [user])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  const loadBookmarks = async () => {
    try {
      const bookmarks = await getUserBookmarks(user.id)
      setBookmarkedIds(new Set(bookmarks.map(b => b.subjectNoteId)))
    } catch (e) {
      console.error('Failed to load bookmarks', e)
    }
  }

  const handleSearch = async (searchQuery) => {
    setLoading(true)
    try {
      const qs = typeof searchQuery === 'string' ? searchQuery : query
      const res = await searchSubjectNotes(qs)
      setResults(res)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleFork = async (e, subjectNote) => {
    e.stopPropagation()
    if (!user) return
    try {
      await forkSubjectNote(subjectNote.id, user.id)
      alert(`Forked "${subjectNote.title}" to your notebooks!`)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleToggleBookmark = async (e, subjectNoteId) => {
    e.stopPropagation()
    if (!user) return
    try {
      const res = await toggleBookmark(user.id, subjectNoteId)
      setBookmarkedIds(prev => {
        const next = new Set(prev)
        if (res.bookmarked) next.add(subjectNoteId)
        else next.delete(subjectNoteId)
        return next
      })
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }}>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em' }}>
          Explore
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
          Discover public notebooks created by the community. Fork them to your account to read and modify.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <input
          className="input"
          style={{ flex: 1 }}
          placeholder="Search public notebooks by title, description, or tags..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {results.map(sn => {
            const isBookmarked = bookmarkedIds.has(sn.id)
            const isOwner = sn.ownerId === user?.id
            return (
              <div 
                key={sn.id} 
                className="card" 
                style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => navigate(`/subjects/${sn.id}`, { state: { source: 'explore' } })}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{sn.title}</h3>
                    <span className="badge badge-gray">{sn.ownerName}</span>
                  </div>
                  {sn.description && (
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sn.description}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
                    Last updated {new Date(sn.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={(e) => handleToggleBookmark(e, sn.id)}
                    title={isBookmarked ? "Remove bookmark" : "Bookmark"}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill={isBookmarked ? "var(--purple)" : "currentColor"} style={{ color: isBookmarked ? "var(--purple)" : "inherit" }}>
                      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 01-1.228.579L8 11.722l-3.772 3.107A.751.751 0 013 14.25Zm1.75-.25a.25.25 0 00-.25.25v9.91l3.023-2.489a.75.75 0 01.954 0l3.023 2.49V2.75a.25.25 0 00-.25-.25Z"></path>
                    </svg>
                  </button>
                  <button 
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => handleFork(e, sn)}
                    disabled={isOwner}
                    title={isOwner ? "This is your notebook" : "Fork to your account"}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878z"/>
                    </svg>
                    Fork
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3 style={{ marginTop: 0 }}>No public notebooks found</h3>
          <p>Try searching with different keywords.</p>
        </div>
      )}
    </div>
  )
}
