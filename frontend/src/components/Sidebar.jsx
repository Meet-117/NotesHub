import { useState } from 'react'
import logo from '../assets/icon/NotesHub_Icon.png'

const navItems = [
  {
    label: 'Dashboard',
    page: 'dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/>
      </svg>
    ),
  },
  {
    label: 'My Notebooks',
    page: 'subject-notes',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8z"/>
      </svg>
    ),
  },
  {
    label: 'Explore',
    page: 'explore',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M10.68 11.74a6 6 0 01-7.922-8.982 6 6 0 018.982 7.922l3.04 3.04a.749.749 0 01-.326 1.275.749.749 0 01-.734-.215ZM11.5 7a4.499 4.499 0 10-8.997 0A4.499 4.499 0 0011.5 7Z"></path>
      </svg>
    ),
  },
  {
    label: 'Bookmarks',
    page: 'bookmarks',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2.75C3 1.784 3.784 1 4.75 1h6.5c.966 0 1.75.784 1.75 1.75v11.5a.75.75 0 01-1.228.579L8 11.722l-3.772 3.107A.751.751 0 013 14.25Zm1.75-.25a.25.25 0 00-.25.25v9.91l3.023-2.489a.75.75 0 01.954 0l3.023 2.49V2.75a.25.25 0 00-.25-.25Z"></path>
      </svg>
    ),
  },
]

export default function Sidebar({ navigate, currentPage }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside style={{
      width: collapsed ? '64px' : 'var(--sidebar-w)',
      minWidth: collapsed ? '64px' : 'var(--sidebar-w)',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>

      {/* Brand header */}
      <div style={{
        height: 'var(--header-h)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: 12,
        flexShrink: 0,
        justifyContent: collapsed ? 'center' : 'flex-start',
      }}>
        <div 
          onClick={() => navigate('dashboard')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10, 
            cursor: 'pointer',
            flexShrink: 0,
            overflow: 'hidden'
          }}
        >
          <img 
            src={logo} 
            alt="NotesHub" 
            style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0 }} 
          />
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              NotesHub
            </span>
          )}
        </div>
        
        {!collapsed && <div style={{ flex: 1 }} />}
        
        {!collapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-muted)',
              cursor: 'pointer', padding: 4, borderRadius: 4, flexShrink: 0,
              display: 'flex', alignItems: 'center',
            }}
            title="Collapse sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zm0 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H1.75a.75.75 0 01-.75-.75z"/>
            </svg>
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          style={{
            position: 'absolute',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--accent)',
            border: 'none',
            color: 'white',
            width: 32,
            height: 32,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 101,
          }}
          title="Expand sidebar"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.75A.75.75 0 011.75 2h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 2.75zm0 5A.75.75 0 011.75 7h12.5a.75.75 0 010 1.5H1.75A.75.75 0 011 7.75zm0 5a.75.75 0 01.75-.75h12.5a.75.75 0 010 1.5H1.75a.75.75 0 01-.75-.75z"/>
          </svg>
        </button>
      )}

      {/* Nav items */}
      <nav style={{ padding: '8px 0', flex: 1 }}>
        {navItems.map((item) => {
          const active = currentPage === item.page
          return (
            <button
              key={item.page}
              onClick={() => navigate(item.page)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 16px',
                background: active ? 'var(--accent-subtle)' : 'none',
                border: 'none',
                borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                color: active ? 'var(--accent-hover)' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'var(--font)',
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--surface-hover)'; e.currentTarget.style.color = 'var(--text)' }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'none'; e.currentTarget.style.color = active ? 'var(--accent-hover)' : 'var(--text-muted)' }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: 11,
          color: 'var(--text-subtle)',
        }}>
          NotesHub · Git-inspired notes
        </div>
      )}
    </aside>
  )
}
