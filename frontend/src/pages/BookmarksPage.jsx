import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserBookmarks, toggleBookmark } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function BookmarksPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBookmarks()
    }
  }, [user])

  const loadBookmarks = async () => {
    setLoading(true)
    try {
      const res = await getUserBookmarks(user.id)
      setBookmarks(res)
    } catch (e) {
      console.error('Failed to load bookmarks', e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBookmark = async (e, subjectNoteId) => {
    e.stopPropagation()
    if (!user) return
    try {
      await toggleBookmark(user.id, subjectNoteId)
      // Optimistically remove from list
      setBookmarks(prev => prev.filter(b => b.subjectNoteId !== subjectNoteId))
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="page" style={{ maxWidth: 800, margin: '0 auto', paddingTop: 40 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="24" height="24" viewBox="0 0 16 16" fill="var(--purple)">
            <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 01-1.228.579L8 11.722l-3.772 3.107A.751.751 0 013 14.25Zm1.75-.25a.25.25 0 00-.25.25v9.91l3.023-2.489a.75.75 0 01.954 0l3.023 2.49V2.75a.25.25 0 00-.25-.25Z"></path>
          </svg>
          Bookmarks
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
          Your saved notebooks from the community.
        </p>
      </div>

      {loading ? (
        <div>Loading bookmarks...</div>
      ) : bookmarks.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {bookmarks.map(b => {
             const sn = b.subjectNote
             return (
              <div key={b.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
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
                    Bookmarked on {new Date(b.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button 
                    className="btn btn-secondary btn-sm" 
                    onClick={(e) => handleToggleBookmark(e, sn.id)}
                    title="Remove bookmark"
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="var(--purple)">
                      <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 01-1.228.579L8 11.722l-3.772 3.107A.751.751 0 013 14.25Zm1.75-.25a.25.25 0 00-.25.25v9.91l3.023-2.489a.75.75 0 01.954 0l3.023 2.49V2.75a.25.25 0 00-.25-.25Z"></path>
                    </svg>
                  </button>
                  {sn.ownerId === user?.id ? (
                    <button className="btn btn-primary btn-sm" onClick={() => navigate(`/subjects/${sn.id}`)}>Open</button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3 style={{ marginTop: 0 }}>No bookmarks yet</h3>
          <p>Go to Explore to find notebooks and bookmark them to appear here.</p>
          <button className="btn btn-primary" onClick={() => navigate('/explore')} style={{ marginTop: 16 }}>Go to Explore</button>
        </div>
      )}
    </div>
  )
}
