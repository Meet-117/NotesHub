const BASE = 'http://localhost:8080/api'

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  if (res.status === 204) return null
  return res.json()
}

// Users
export const createUser    = (data) => req('POST', '/users', data)
export const loginUser     = (data) => req('POST', '/users/login', data)
export const getUser       = (id)   => req('GET',  `/users/${id}`)

// Subject Notes
export const createSubjectNote  = (data)              => req('POST', '/subject-notes', data)
export const getSubjectNotes    = (userId)            => req('GET',  `/subject-notes/user/${userId}`)
export const forkSubjectNote    = (id, newOwnerId)    => req('POST', `/subject-notes/${id}/fork?newOwnerId=${newOwnerId}`)
export const getSubjectNote     = (id)                => req('GET',  `/subject-notes/${id}`)
export const searchSubjectNotes = (query)             => req('GET',  `/subject-notes/search?query=${encodeURIComponent(query)}`)

// Notes
export const createNote         = (data)              => req('POST', '/notes', data)
export const getNotesBySubject  = (subjectNoteId)     => req('GET',  `/notes/subject/${subjectNoteId}`)
export const getNote            = (noteId)            => req('GET',  `/notes/${noteId}`)
export const updateNoteTitle    = (noteId, data)      => req('PUT',  `/notes/${noteId}`, data)

// Versions
export const saveVersion        = (data)              => req('POST', '/versions', data)
export const getVersionHistory  = (noteId)            => req('GET',  `/versions/note/${noteId}`)
export const restoreVersion     = (versionId, data)   => req('POST', `/versions/${versionId}/restore`, data)

// Links
export const createLink         = (data)              => req('POST', '/links', data)
export const getLinkedNotes     = (noteId)            => req('GET',  `/links/note/${noteId}`)

// Tags
export const createTag          = (data)              => req('POST', '/tags', data)
export const getAllTags         = ()                  => req('GET',  '/tags')
export const addTagToNote       = (noteId, tagId)     => req('POST', `/notes/${noteId}/tags/${tagId}`)
export const removeTagFromNote  = (noteId, tagId)     => req('DELETE', `/notes/${noteId}/tags/${tagId}`)
export const getTagsForNote     = (noteId)            => req('GET',  `/notes/${noteId}/tags`)

// Sources
export const addSource          = (data)              => req('POST', '/sources', data)
export const getSourcesForNote  = (noteId)            => req('GET',  `/sources/note/${noteId}`)
export const deleteSource       = (sourceId)          => req('DELETE', `/sources/${sourceId}`)

// Bookmarks
export const toggleBookmark     = (userId, subjectNoteId) => req('POST', `/bookmarks/toggle?userId=${userId}&subjectNoteId=${subjectNoteId}`)
export const getUserBookmarks   = (userId)            => req('GET',  `/bookmarks/user/${userId}`)