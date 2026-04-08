import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect, useRef, useState } from 'react'

const TOOLBAR_BUTTONS = [
  {
    label: 'B',
    title: 'Bold (Ctrl+B)',
    style: { fontWeight: 700, fontFamily: 'inherit' },
    isActive: (editor) => editor.isActive('bold'),
    action: (editor) => editor.chain().focus().toggleBold().run(),
  },
  {
    label: 'I',
    title: 'Italic (Ctrl+I)',
    style: { fontStyle: 'italic', fontFamily: 'inherit' },
    isActive: (editor) => editor.isActive('italic'),
    action: (editor) => editor.chain().focus().toggleItalic().run(),
  },
  {
    label: 'S',
    title: 'Strikethrough',
    style: { textDecoration: 'line-through', fontFamily: 'inherit' },
    isActive: (editor) => editor.isActive('strike'),
    action: (editor) => editor.chain().focus().toggleStrike().run(),
  },
  { type: 'divider' },
  {
    label: 'H1',
    title: 'Heading 1',
    style: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' },
    isActive: (editor) => editor.isActive('heading', { level: 1 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    label: 'H2',
    title: 'Heading 2',
    style: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' },
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    label: 'H3',
    title: 'Heading 3',
    style: { fontSize: '11px', fontWeight: 700, letterSpacing: '0.02em' },
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    action: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  { type: 'divider' },
  {
    label: '• List',
    title: 'Bullet List',
    style: { fontSize: '11px', letterSpacing: '0.02em' },
    isActive: (editor) => editor.isActive('bulletList'),
    action: (editor) => editor.chain().focus().toggleBulletList().run(),
  },
  {
    label: '1. List',
    title: 'Ordered List',
    style: { fontSize: '11px', letterSpacing: '0.02em' },
    isActive: (editor) => editor.isActive('orderedList'),
    action: (editor) => editor.chain().focus().toggleOrderedList().run(),
  },
  {
    label: '❝',
    title: 'Blockquote',
    style: { fontSize: '13px' },
    isActive: (editor) => editor.isActive('blockquote'),
    action: (editor) => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    label: '</>',
    title: 'Code Block',
    style: { fontSize: '11px', fontFamily: '"SFMono-Regular", Consolas, monospace', letterSpacing: '0.02em' },
    isActive: (editor) => editor.isActive('codeBlock'),
    action: (editor) => editor.chain().focus().toggleCodeBlock().run(),
  },
  {
    label: '`code`',
    title: 'Inline Code',
    style: { fontSize: '10px', fontFamily: '"SFMono-Regular", Consolas, monospace' },
    isActive: (editor) => editor.isActive('code'),
    action: (editor) => editor.chain().focus().toggleCode().run(),
  },
]

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Mona+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap');

  * { box-sizing: border-box; }

  .ne-root {
    --gh-bg: #0d1117;
    --gh-surface: #161b22;
    --gh-border: #30363d;
    --gh-border-muted: #21262d;
    --gh-text: #e6edf3;
    --gh-text-muted: #7d8590;
    --gh-text-subtle: #484f58;
    --gh-accent: #1f6feb;
    --gh-accent-hover: #388bfd;
    --gh-accent-subtle: rgba(31, 111, 235, 0.15);
    --gh-green: #3fb950;
    --gh-success-subtle: rgba(63, 185, 80, 0.1);
    --gh-toolbar-bg: #161b22;
    --gh-code-bg: #161b22;
    --gh-blockquote-border: #3fb950;
    --radius: 6px;
    --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    --font-body: "Mona Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

    min-height: 100vh;
    background: var(--gh-bg);
    color: var(--gh-text);
    font-family: var(--font-body);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 16px 80px;
  }

  /* Header bar */
  .ne-topbar {
    width: 100%;
    max-width: 860px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0 12px;
    border-bottom: 1px solid var(--gh-border-muted);
    margin-bottom: 40px;
    gap: 12px;
  }

  .ne-topbar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--gh-text);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  .ne-topbar-brand svg {
    flex-shrink: 0;
  }

  .ne-topbar-badge {
    font-size: 11px;
    font-weight: 500;
    color: var(--gh-text-muted);
    background: var(--gh-border-muted);
    padding: 2px 8px;
    border-radius: 20px;
    border: 1px solid var(--gh-border);
  }

  .ne-topbar-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .ne-btn-ghost {
    background: transparent;
    border: 1px solid var(--gh-border);
    color: var(--gh-text-muted);
    border-radius: var(--radius);
    padding: 5px 12px;
    font-size: 12px;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 500;
  }

  .ne-btn-ghost:hover {
    color: var(--gh-text);
    border-color: var(--gh-text-muted);
    background: var(--gh-border-muted);
  }

  .ne-btn-primary {
    background: var(--gh-green);
    border: 1px solid rgba(63, 185, 80, 0.4);
    color: #0d1117;
    border-radius: var(--radius);
    padding: 5px 16px;
    font-size: 12px;
    font-family: var(--font-body);
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 600;
  }

  .ne-btn-primary:hover {
    background: #45d461;
    border-color: rgba(63, 185, 80, 0.6);
  }

  /* Main editor wrapper */
  .ne-wrapper {
    width: 100%;
    max-width: 860px;
    position: relative;
  }

  /* Title */
  .ne-title {
    width: 100%;
    background: transparent;
    border: none;
    outline: none;
    color: var(--gh-text);
    font-family: var(--font-body);
    font-size: 36px;
    font-weight: 700;
    line-height: 1.2;
    letter-spacing: -0.03em;
    margin-bottom: 6px;
    caret-color: var(--gh-accent-hover);
    resize: none;
    overflow: hidden;
    min-height: 48px;
    padding: 0;
  }

  .ne-title::placeholder {
    color: var(--gh-text-subtle);
  }

  /* Meta row */
  .ne-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--gh-border-muted);
    margin-bottom: 28px;
  }

  .ne-meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--gh-text-muted);
  }

  .ne-meta-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--gh-green);
    display: inline-block;
    box-shadow: 0 0 0 2px var(--gh-success-subtle);
  }

  /* Floating toolbar */
  .ne-toolbar {
    position: fixed;
    z-index: 100;
    background: var(--gh-surface);
    border: 1px solid var(--gh-border);
    border-radius: 8px;
    padding: 4px 6px;
    display: flex;
    align-items: center;
    gap: 2px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04);
    pointer-events: all;
    backdrop-filter: blur(8px);
    animation: ne-toolbar-in 0.12s ease;
    transform: translateX(-50%);
  }

  @keyframes ne-toolbar-in {
    from { opacity: 0; transform: translateX(-50%) translateY(4px) scale(0.97); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
  }

  .ne-toolbar.hidden {
    display: none;
  }

  .ne-toolbar-btn {
    background: transparent;
    border: none;
    color: var(--gh-text-muted);
    border-radius: 4px;
    padding: 4px 7px;
    cursor: pointer;
    font-family: var(--font-body);
    font-size: 13px;
    line-height: 1;
    min-width: 28px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.1s ease;
    white-space: nowrap;
  }

  .ne-toolbar-btn:hover {
    background: var(--gh-border-muted);
    color: var(--gh-text);
  }

  .ne-toolbar-btn.active {
    background: var(--gh-accent-subtle);
    color: var(--gh-accent-hover);
  }

  .ne-toolbar-divider {
    width: 1px;
    height: 18px;
    background: var(--gh-border);
    margin: 0 3px;
    flex-shrink: 0;
  }

  /* Static toolbar (always visible below meta) */
  .ne-static-toolbar {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 6px 8px;
    background: var(--gh-surface);
    border: 1px solid var(--gh-border);
    border-radius: var(--radius);
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  /* TipTap editor content */
  .ne-editor {
    min-height: 500px;
    outline: none;
  }

  .ProseMirror {
    outline: none;
    min-height: 500px;
    color: var(--gh-text);
    font-family: var(--font-body);
    font-size: 15px;
    line-height: 1.7;
    caret-color: var(--gh-accent-hover);
  }

  .ProseMirror p {
    margin: 0 0 12px;
  }

  .ProseMirror p:last-child {
    margin-bottom: 0;
  }

  .ProseMirror > *:first-child {
    margin-top: 0;
  }

  .ProseMirror h1 {
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.025em;
    line-height: 1.25;
    margin: 32px 0 12px;
    color: var(--gh-text);
    border-bottom: 1px solid var(--gh-border-muted);
    padding-bottom: 8px;
  }

  .ProseMirror h2 {
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.3;
    margin: 28px 0 10px;
    color: var(--gh-text);
    border-bottom: 1px solid var(--gh-border-muted);
    padding-bottom: 6px;
  }

  .ProseMirror h3 {
    font-size: 17px;
    font-weight: 600;
    letter-spacing: -0.01em;
    line-height: 1.35;
    margin: 24px 0 8px;
    color: var(--gh-text);
  }

  .ProseMirror strong {
    font-weight: 600;
    color: var(--gh-text);
  }

  .ProseMirror em {
    font-style: italic;
    color: var(--gh-text);
  }

  .ProseMirror s {
    color: var(--gh-text-muted);
    text-decoration: line-through;
  }

  .ProseMirror code {
    font-family: var(--font-mono);
    font-size: 85%;
    background: var(--gh-code-bg);
    border: 1px solid var(--gh-border);
    border-radius: 4px;
    padding: 2px 5px;
    color: #f78166;
  }

  .ProseMirror pre {
    background: var(--gh-code-bg);
    border: 1px solid var(--gh-border);
    border-radius: var(--radius);
    padding: 16px;
    margin: 16px 0;
    overflow-x: auto;
    position: relative;
  }

  .ProseMirror pre::before {
    content: 'CODE';
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 10px;
    font-family: var(--font-mono);
    color: var(--gh-text-subtle);
    letter-spacing: 0.1em;
  }

  .ProseMirror pre code {
    background: transparent;
    border: none;
    padding: 0;
    border-radius: 0;
    font-size: 13px;
    color: #e6edf3;
    line-height: 1.6;
  }

  .ProseMirror blockquote {
    margin: 16px 0;
    padding: 8px 16px;
    border-left: 3px solid var(--gh-blockquote-border);
    color: var(--gh-text-muted);
    background: rgba(63, 185, 80, 0.04);
    border-radius: 0 var(--radius) var(--radius) 0;
  }

  .ProseMirror ul {
    padding-left: 24px;
    margin: 8px 0 12px;
  }

  .ProseMirror ol {
    padding-left: 24px;
    margin: 8px 0 12px;
  }

  .ProseMirror li {
    margin: 4px 0;
    color: var(--gh-text);
  }

  .ProseMirror ul li::marker {
    color: var(--gh-text-muted);
  }

  .ProseMirror ol li::marker {
    color: var(--gh-text-muted);
    font-weight: 600;
  }

  .ProseMirror hr {
    border: none;
    border-top: 1px solid var(--gh-border);
    margin: 24px 0;
  }

  .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: var(--gh-text-subtle);
    pointer-events: none;
    height: 0;
    font-size: 15px;
  }

  /* Word count */
  .ne-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 16px;
    margin-top: 32px;
    padding-top: 16px;
    border-top: 1px solid var(--gh-border-muted);
    font-size: 12px;
    color: var(--gh-text-subtle);
  }

  .ne-footer span {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  /* Selection */
  .ProseMirror ::selection {
    background: rgba(31, 111, 235, 0.3);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--gh-border); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--gh-text-subtle); }
`

function FloatingToolbar({ editor }) {
  const toolbarRef = useRef(null)
  const [toolbarStyle, setToolbarStyle] = useState({ display: 'none' })
  const [activeState, setActiveState] = useState(0)

  const updateToolbar = useCallback(() => {
    if (!editor) return
    const { from, to } = editor.state.selection
    const isEmpty = from === to

    if (isEmpty) {
      setToolbarStyle({ display: 'none' })
      return
    }

    const domSelection = window.getSelection()
    if (!domSelection || domSelection.rangeCount === 0) {
      setToolbarStyle({ display: 'none' })
      return
    }

    const range = domSelection.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    if (rect.width === 0) {
      setToolbarStyle({ display: 'none' })
      return
    }

    const OFFSET = 10
    const top = rect.top + window.scrollY - (toolbarRef.current?.offsetHeight || 40) - OFFSET
    const left = rect.left + rect.width / 2

    setToolbarStyle({
      display: 'flex',
      top: `${top}px`,
      left: `${left}px`,
    })
    setActiveState((s) => s + 1)
  }, [editor])

  useEffect(() => {
    if (!editor) return
    editor.on('selectionUpdate', updateToolbar)
    editor.on('transaction', updateToolbar)
    document.addEventListener('mouseup', updateToolbar)
    document.addEventListener('keyup', updateToolbar)

    return () => {
      editor.off('selectionUpdate', updateToolbar)
      editor.off('transaction', updateToolbar)
      document.removeEventListener('mouseup', updateToolbar)
      document.removeEventListener('keyup', updateToolbar)
    }
  }, [editor, updateToolbar])

  if (!editor) return null

  return (
    <div ref={toolbarRef} className="ne-toolbar" style={toolbarStyle}>
      {TOOLBAR_BUTTONS.map((btn, i) => {
        if (btn.type === 'divider') {
          return <div key={i} className="ne-toolbar-divider" />
        }
        return (
          <button
            key={i}
            className={`ne-toolbar-btn${btn.isActive(editor) ? ' active' : ''}`}
            title={btn.title}
            style={btn.style}
            onMouseDown={(e) => {
              e.preventDefault()
              btn.action(editor)
            }}
          >
            {btn.label}
          </button>
        )
      })}
    </div>
  )
}

function StaticToolbar({ editor }) {
  const [, forceUpdate] = useState(0)

  useEffect(() => {
    if (!editor) return
    const update = () => forceUpdate((s) => s + 1)
    editor.on('transaction', update)
    return () => editor.off('transaction', update)
  }, [editor])

  if (!editor) return null

  return (
    <div className="ne-static-toolbar">
      {TOOLBAR_BUTTONS.map((btn, i) => {
        if (btn.type === 'divider') {
          return <div key={i} className="ne-toolbar-divider" />
        }
        return (
          <button
            key={i}
            className={`ne-toolbar-btn${btn.isActive(editor) ? ' active' : ''}`}
            title={btn.title}
            style={btn.style}
            onMouseDown={(e) => {
              e.preventDefault()
              btn.action(editor)
            }}
          >
            {btn.label}
          </button>
        )
      })}
    </div>
  )
}

function useWordCount(editor) {
  const [counts, setCounts] = useState({ words: 0, chars: 0 })

  useEffect(() => {
    if (!editor) return
    const update = () => {
      const text = editor.getText()
      const words = text.trim() ? text.trim().split(/\s+/).length : 0
      const chars = text.length
      setCounts({ words, chars })
    }
    editor.on('update', update)
    update()
    return () => editor.off('update', update)
  }, [editor])

  return counts
}

export default function NoteEditor() {
  const [title, setTitle] = useState('')
  const titleRef = useRef(null)
  const now = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
      }),
      Placeholder.configure({
        placeholder: 'Start writing… or select text to format it',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'ne-editor',
      },
    },
    autofocus: false,
  })

  const { words, chars } = useWordCount(editor)

  // Auto-resize title textarea
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [title])

  return (
    <>
      <style>{css}</style>
      <div className="ne-root">
        <FloatingToolbar editor={editor} />

        {/* Top bar */}
        <div className="ne-topbar">
          <div className="ne-topbar-brand">
            <img src="./assets/icon/NotesHub_icon.png" width="22" height="22" />
            GitHub Notes
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ne-topbar-badge">Draft</span>
            <div className="ne-topbar-actions">
              <button className="ne-btn-ghost">Preview</button>
              <button className="ne-btn-primary">Publish</button>
            </div>
          </div>
        </div>

        {/* Editor area */}
        <div className="ne-wrapper">
          {/* Title */}
          <textarea
            ref={titleRef}
            className="ne-title"
            placeholder="Note title…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            rows={1}
          />

          {/* Meta */}
          <div className="ne-meta">
            <div className="ne-meta-item">
              <span className="ne-meta-dot" />
              <span>Active</span>
            </div>
            <div className="ne-meta-item">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878z" />
              </svg>
              {now}
            </div>
            <div className="ne-meta-item">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 001.498-.07 6.005 6.005 0 00-3.432-5.142z" />
              </svg>
              You
            </div>
          </div>

          {/* Static Toolbar */}
          <StaticToolbar editor={editor} />

          {/* TipTap Editor */}
          <EditorContent editor={editor} />

          {/* Footer */}
          <div className="ne-footer">
            <span>{words} {words === 1 ? 'word' : 'words'}</span>
            <span>{chars} {chars === 1 ? 'character' : 'characters'}</span>
          </div>
        </div>
      </div>
    </>
  )
}