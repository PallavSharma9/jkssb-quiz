'use client'

const KEY = 'jkssb_bookmarks'

export function getBookmarks(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as number[])
  } catch {
    return new Set()
  }
}

export function saveBookmarks(ids: Set<number>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify([...ids]))
}

export function toggleBookmark(id: number): Set<number> {
  const bm = getBookmarks()
  if (bm.has(id)) bm.delete(id)
  else bm.add(id)
  saveBookmarks(bm)
  return new Set(bm)
}
