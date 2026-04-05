'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import questionsData from '@/data/questions.json'
import { getBookmarks, toggleBookmark } from '@/lib/bookmarks'
import { UNITS } from '@/lib/units'
import type { Question } from '@/types'

const allQ = questionsData as Question[]

function getTopicColor(topicId: string) {
  for (const u of UNITS) {
    if (u.topics.some(t => t.id === topicId)) return u.badgeColor
  }
  return 'bg-gray-100 text-gray-600'
}

export default function BookmarksPage() {
  const router = useRouter()
  const [bookmarks, setBookmarks] = useState<Set<number>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    setBookmarks(getBookmarks())
    setLoaded(true)
  }, [])

  const bookmarkedQs = allQ.filter(q => bookmarks.has(q.id))

  // Group by topic
  const grouped: Record<string, Question[]> = {}
  for (const q of bookmarkedQs) {
    if (!grouped[q.topicLabel]) grouped[q.topicLabel] = []
    grouped[q.topicLabel].push(q)
  }

  function handleRemove(id: number) {
    const updated = toggleBookmark(id)
    setBookmarks(new Set(updated))
  }

  function goToQuestion(q: Question) {
    router.push(`/quiz/${q.topic}?start=${q.id}`)
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 pt-10 pb-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/')}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-lg font-bold">Bookmarked Questions</h1>
            <p className="text-slate-400 text-sm">{bookmarkedQs.length} saved</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {bookmarkedQs.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <div className="text-5xl mb-4">🔖</div>
            <h2 className="text-lg font-bold text-gray-700 mb-2">No Bookmarks Yet</h2>
            <p className="text-sm text-gray-500 mb-6">
              Tap the bookmark icon (🔖) while answering questions to save them here.
            </p>
            <button onClick={() => router.push('/')}
              className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all">
              Start Practising
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([topicLabel, qs]) => (
              <div key={topicLabel}>
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-sm font-bold text-gray-700">{topicLabel}</h2>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getTopicColor(qs[0].topic)}`}>
                    {qs.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {qs.map(q => (
                    <div key={q.id}
                      className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-3">
                            {q.question}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">📄 {q.source}</p>
                        </div>
                        <button
                          onClick={() => handleRemove(q.id)}
                          className="shrink-0 p-1.5 rounded-lg hover:bg-red-50 active:scale-95 transition-all"
                          title="Remove bookmark"
                        >
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => goToQuestion(q)}
                        className="mt-3 w-full text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 py-2 rounded-lg active:scale-[0.98] transition-all"
                      >
                        Practice This Question →
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                if (confirm('Remove all bookmarks?')) {
                  for (const q of bookmarkedQs) toggleBookmark(q.id)
                  setBookmarks(new Set())
                }
              }}
              className="w-full text-sm text-red-400 font-medium py-3 hover:text-red-600 transition-colors"
            >
              Clear All Bookmarks
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
