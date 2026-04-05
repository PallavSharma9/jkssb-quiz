'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UNITS } from '@/lib/units'
import { getBookmarks } from '@/lib/bookmarks'
import { getTopicSummary, resetAllProgress } from '@/lib/progress'
import questionsData from '@/data/questions.json'
import type { Question, UnitConfig } from '@/types'

const allQ = questionsData as Question[]

function countTopic(topicId: string) { return allQ.filter(q => q.topic === topicId).length }
function countUnit(unitId: string)   { return allQ.filter(q => q.unit === unitId).length }

interface TopicProgress { answered: number; total: number; completed: boolean; lastIndex: number }

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg className={`w-5 h-5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function UnitCard({ unit, allProgress }: { unit: UnitConfig; allProgress: Record<string, TopicProgress> }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const total = countUnit(unit.id)

  // Count how many topics have progress
  const doneTopics = unit.topics.filter(t => allProgress[t.id]?.completed).length
  const inProgress = unit.topics.some(t => {
    const p = allProgress[t.id]
    return p && !p.completed && p.answered > 0
  })

  return (
    <div className={`rounded-2xl border-2 ${unit.borderColor} bg-white shadow-sm overflow-hidden`}>
      <button onClick={() => setOpen(o => !o)}
        className={`w-full ${unit.headerBg} text-white px-5 py-4 flex items-center justify-between active:opacity-80`}>
        <div className="text-left">
          <p className="text-xs font-bold uppercase tracking-widest opacity-75">{unit.label}</p>
          <h2 className="text-lg font-bold leading-snug mt-0.5">{unit.description}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs opacity-70">{total} questions</p>
            {doneTopics > 0 && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                {doneTopics}/{unit.topics.length} topics done
              </span>
            )}
            {inProgress && !doneTopics && (
              <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">In progress</span>
            )}
          </div>
        </div>
        <div className="ml-3 shrink-0 bg-white/20 rounded-full p-1.5">
          <ChevronIcon open={open} />
        </div>
      </button>

      {open && (
        <div className="p-4">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide mb-3">Select Topic</p>
          <div className="grid grid-cols-1 gap-2">
            {unit.topics.map(t => {
              const count = countTopic(t.id)
              const prog = allProgress[t.id]
              const hasProgress = prog && prog.answered > 0
              const isComplete = prog?.completed

              let label = `${t.label} (${count})`
              if (isComplete) label = `${t.label} (${count}/${count} ✓)`
              else if (hasProgress) label = `${t.label} (${prog.answered}/${count} done)`

              return (
                <div key={t.id} className="flex gap-2">
                  <button
                    onClick={() => count > 0 && router.push(`/quiz/${t.id}`)}
                    disabled={count === 0}
                    className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all active:scale-[0.98] ${
                      count === 0
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : `${unit.topicBtnColor} border`
                    }`}
                  >
                    <span className="text-sm font-medium leading-snug">{label}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                      isComplete ? 'bg-emerald-100 text-emerald-700' :
                      hasProgress ? 'bg-indigo-100 text-indigo-700' :
                      count === 0 ? 'bg-gray-100 text-gray-400' : unit.badgeColor
                    }`}>
                      {isComplete ? '✓' : hasProgress ? `${prog.answered}/${count}` : count}
                    </span>
                  </button>

                  {/* Continue button for in-progress topics */}
                  {hasProgress && !isComplete && (
                    <button
                      onClick={() => router.push(`/quiz/${t.id}`)}
                      className="bg-indigo-600 text-white text-xs font-bold px-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all shrink-0"
                      title={`Continue from Q${(prog.lastIndex ?? 0) + 1}`}
                    >
                      Continue
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const [bookmarkCount, setBookmarkCount]   = useState(0)
  const [allProgress, setAllProgress]       = useState<Record<string, TopicProgress>>({})
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const loadProgress = useCallback(() => {
    const prog: Record<string, TopicProgress> = {}
    for (const unit of UNITS) {
      for (const t of unit.topics) {
        const total = countTopic(t.id)
        const s = getTopicSummary(unit.id, t.id, total)
        if (s) prog[t.id] = s
      }
    }
    setAllProgress(prog)
    setBookmarkCount(getBookmarks().size)
  }, [])

  useEffect(() => {
    loadProgress()
    const handler = () => loadProgress()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [loadProgress])

  function handleResetAll() {
    resetAllProgress()
    setAllProgress({})
    setShowResetConfirm(false)
  }

  const totalAnswered = Object.values(allProgress).reduce((s, p) => s + p.answered, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-slate-800 text-white px-4 pt-10 pb-8">
        <div className="max-w-2xl mx-auto flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-1">JKSSB</p>
            <h1 className="text-xl font-bold leading-tight">Junior Assistant</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Question Bank — {allQ.length} Questions
              {totalAnswered > 0 && <span className="text-slate-300"> · {totalAnswered} answered</span>}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1">
            {/* Bookmarks */}
            <button onClick={() => router.push('/bookmarks')}
              className="relative p-2.5 bg-white/10 hover:bg-white/20 rounded-xl active:scale-95 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {bookmarkCount > 99 ? '99+' : bookmarkCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Tap a unit to see topics</p>
          {totalAnswered > 0 && (
            <button onClick={() => setShowResetConfirm(true)}
              className="text-xs text-red-400 font-medium hover:text-red-600 transition-colors">
              Reset All Progress
            </button>
          )}
        </div>

        {/* Reset confirm */}
        {showResetConfirm && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-700 mb-1">Reset all progress?</p>
            <p className="text-xs text-red-500 mb-3">This will clear all saved answers for every topic. Bookmarks are not affected.</p>
            <div className="flex gap-2">
              <button onClick={handleResetAll}
                className="flex-1 bg-red-600 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-red-700 active:scale-95 transition-all">
                Yes, Reset All
              </button>
              <button onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-gray-100 text-gray-700 text-sm font-bold py-2.5 rounded-xl hover:bg-gray-200 active:scale-95 transition-all">
                Cancel
              </button>
            </div>
          </div>
        )}

        {UNITS.map(u => (
          <UnitCard key={u.id} unit={u} allProgress={allProgress} />
        ))}

        <p className="text-center text-xs text-gray-400 pt-2 pb-4">
          Questions in original exam order · Progress saved automatically
        </p>
      </div>
    </div>
  )
}
