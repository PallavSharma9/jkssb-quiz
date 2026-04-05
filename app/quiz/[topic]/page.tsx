'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import questionsData from '@/data/questions.json'
import { UNITS } from '@/lib/units'
import { getBookmarks, toggleBookmark } from '@/lib/bookmarks'
import { loadProgress, saveAnswer, resetProgress } from '@/lib/progress'
import type { Question } from '@/types'

const allQ = questionsData as Question[]

// ─── Types ───────────────────────────────────────────────────────────────────
type QState = 'unanswered' | 'correct' | 'wrong' | 'skipped'
interface Attempt { state: QState; selected: number | null }

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getUnitForTopic(topicId: string) {
  for (const u of UNITS) {
    const t = u.topics.find(t => t.id === topicId)
    if (t) return { unit: u, topic: t }
  }
  return { unit: UNITS[0], topic: UNITS[0].topics[0] }
}

function blankAttempt(): Attempt { return { state: 'unanswered', selected: null } }

// ─── PassageBox ───────────────────────────────────────────────────────────────
function PassageBox({ title, text }: { title: string | null; text: string }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-xl overflow-hidden mb-4">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-200 text-left">
        <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">
          {title || 'Passage'}
        </span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 py-3 max-h-52 overflow-y-auto">
          {text.split('\n\n').map((p, i) => (
            <p key={i} className="text-sm text-gray-700 leading-relaxed mb-2 last:mb-0">{p}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── OptionBtn ────────────────────────────────────────────────────────────────
function OptionBtn({ label, index, attempt, correctIdx, onClick }: {
  label: string; index: number; attempt: Attempt | null; correctIdx: number; onClick: () => void
}) {
  const letters = ['A', 'B', 'C', 'D']
  const clean = label.replace(/^[A-D]\)\s*/i, '')
  const answered = attempt !== null

  let ring = 'border-2 border-gray-200 bg-white text-gray-800 hover:border-indigo-300 hover:bg-indigo-50 active:scale-[0.98]'
  let circle = 'bg-gray-100 text-gray-500'
  if (answered) {
    if (index === correctIdx) {
      ring = 'border-2 border-emerald-400 bg-emerald-50 text-emerald-900'
      circle = 'bg-emerald-500 text-white'
    } else if (attempt.selected === index) {
      ring = 'border-2 border-red-400 bg-red-50 text-red-900'
      circle = 'bg-red-500 text-white'
    } else {
      ring = 'border-2 border-gray-100 bg-gray-50 text-gray-400'
      circle = 'bg-gray-200 text-gray-400'
    }
  }

  return (
    <button onClick={onClick} disabled={answered}
      className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-xl text-left transition-all ${ring}`}>
      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${circle}`}>
        {letters[index]}
      </span>
      <span className="text-sm font-medium leading-snug pt-0.5 flex-1">{clean}</span>
      {answered && index === correctIdx && <span className="text-emerald-500 shrink-0 pt-0.5 font-bold">✓</span>}
      {answered && attempt.selected === index && index !== correctIdx && (
        <span className="text-red-500 shrink-0 pt-0.5 font-bold">✗</span>
      )}
    </button>
  )
}

// ─── IndexPanel ───────────────────────────────────────────────────────────────
function IndexPanel({ questions, attempts, bookmarks, currentIdx, onJump, open, onToggle }: {
  questions: Question[]; attempts: Attempt[]; bookmarks: Set<number>
  currentIdx: number; onJump: (i: number) => void; open: boolean; onToggle: () => void
}) {
  const correct  = attempts.filter(a => a.state === 'correct').length
  const wrong    = attempts.filter(a => a.state === 'wrong').length
  const skipped  = attempts.filter(a => a.state === 'skipped').length
  const bmCount  = questions.filter(q => bookmarks.has(q.id)).length

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-xl z-20">
      {/* Toggle bar */}
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-2.5 max-w-2xl mx-auto">
        <div className="flex gap-3 text-xs font-semibold">
          <span className="text-emerald-600">✓ {correct}</span>
          <span className="text-red-500">✗ {wrong}</span>
          <span className="text-yellow-600">— {skipped}</span>
          {bmCount > 0 && <span className="text-orange-500">🔖 {bmCount}</span>}
          <span className="text-gray-400 font-normal">of {questions.length}</span>
        </div>
        <span className="text-xs font-semibold text-indigo-600">
          {open ? 'Hide ▼' : 'Questions ▲'}
        </span>
      </button>

      {/* Grid */}
      {open && (
        <div className="max-h-44 overflow-y-auto px-3 pb-3 max-w-2xl mx-auto">
          <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10">
            {questions.map((q, i) => {
              const a = attempts[i]
              const isCurrent = i === currentIdx
              const isBm = bookmarks.has(q.id)

              let bg = 'bg-white text-gray-700 border-gray-300'
              if (a.state === 'correct') bg = 'bg-emerald-500 text-white border-emerald-500'
              else if (a.state === 'wrong') bg = 'bg-red-500 text-white border-red-500'
              else if (a.state === 'skipped') bg = 'bg-yellow-400 text-white border-yellow-400'

              const extraRing = isCurrent
                ? 'ring-2 ring-blue-500 ring-offset-1'
                : isBm && a.state === 'unanswered'
                ? 'ring-2 ring-orange-400 ring-offset-1'
                : ''

              return (
                <button key={q.id} onClick={() => onJump(i)}
                  className={`aspect-square rounded-lg border-2 text-xs font-bold flex items-center justify-center transition-all active:scale-90 ${bg} ${extraRing}`}>
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ScoreScreen ──────────────────────────────────────────────────────────────
function ScoreScreen({ questions, attempts, bookmarks, topicLabel, headerBg, unitId, topicId,
  onRetryWrong, onResetRetry, onHome }: {
  questions: Question[]; attempts: Attempt[]; bookmarks: Set<number>
  topicLabel: string; headerBg: string; unitId: string; topicId: string
  onRetryWrong: () => void; onResetRetry: () => void; onHome: () => void
}) {
  const router = useRouter()
  const total     = questions.length
  const correct   = attempts.filter(a => a.state === 'correct').length
  const wrong     = attempts.filter(a => a.state === 'wrong').length
  const skipped   = attempts.filter(a => a.state === 'skipped').length
  const bmCount   = questions.filter(q => bookmarks.has(q.id)).length
  const attempted = correct + wrong
  const pct       = attempted > 0 ? Math.round((correct / attempted) * 100) : 0

  const { msg, color } = pct >= 80
    ? { msg: 'Excellent! 🏆', color: 'text-emerald-600' }
    : pct >= 60
    ? { msg: 'Good Job! 👍', color: 'text-blue-600' }
    : pct >= 40
    ? { msg: 'Keep Practising 📖', color: 'text-yellow-600' }
    : { msg: 'Needs More Work 💪', color: 'text-red-500' }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className={`${headerBg} text-white px-4 py-5`}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-lg font-bold">Quiz Complete</h1>
          <p className="text-sm opacity-75">{topicLabel}</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Score ring */}
        <div className="bg-white rounded-3xl shadow-sm p-6 mb-4 text-center">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
              <circle cx="60" cy="60" r="50" fill="none"
                stroke={pct >= 80 ? '#10b981' : pct >= 60 ? '#3b82f6' : pct >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{pct}%</span>
              <span className="text-xs text-gray-400">accuracy</span>
            </div>
          </div>
          <p className={`text-lg font-bold mb-1 ${color}`}>{msg}</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Correct',    value: correct,   icon: '✓', cls: 'bg-emerald-50 text-emerald-700' },
            { label: 'Wrong',      value: wrong,     icon: '✗', cls: 'bg-red-50 text-red-700' },
            { label: 'Skipped',    value: skipped,   icon: '—', cls: 'bg-gray-100 text-gray-600' },
            { label: 'Bookmarked', value: bmCount,   icon: '🔖', cls: 'bg-yellow-50 text-yellow-700' },
          ].map(s => (
            <div key={s.label} className={`${s.cls} rounded-2xl p-4 flex items-center gap-3`}>
              <span className="text-2xl font-bold">{s.value}</span>
              <div>
                <p className="text-xs font-bold">{s.label}</p>
                <p className="text-lg leading-none">{s.icon}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
          <span className="text-sm text-gray-600 font-medium">Overall Accuracy</span>
          <span className="text-lg font-bold text-indigo-600">{pct}% ({correct}/{attempted} attempted)</span>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          {wrong > 0 && (
            <button onClick={onRetryWrong}
              className="w-full bg-red-50 border-2 border-red-200 text-red-700 font-semibold py-3.5 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all">
              Retry Wrong Questions ({wrong})
            </button>
          )}
          {bmCount > 0 && (
            <button onClick={() => router.push('/bookmarks')}
              className="w-full bg-yellow-50 border-2 border-yellow-200 text-yellow-800 font-semibold py-3.5 rounded-xl hover:bg-yellow-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
              <span>🔖</span><span>Review Bookmarked ({bmCount})</span>
            </button>
          )}
          <button onClick={onResetRetry}
            className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all">
            Reset & Retry All
          </button>
          <button onClick={onHome}
            className="w-full bg-gray-100 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all">
            Back to Topics
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main QuizPage ────────────────────────────────────────────────────────────
export default function QuizPage({ params }: { params: { topic: string } }) {
  const router  = useRouter()
  const topicId = params.topic
  const { unit, topic } = getUnitForTopic(topicId)

  // Base questions for this topic (original order)
  const baseQuestions = allQ.filter(q => q.topic === topicId)

  // ── State ──
  const [isRetryMode, setIsRetryMode]     = useState(false)
  const [questions, setQuestions]         = useState<Question[]>(baseQuestions)
  const [attempts, setAttempts]           = useState<Attempt[]>(() => baseQuestions.map(blankAttempt))
  const [idx, setIdx]                     = useState(0)
  const [bookmarks, setBookmarks]         = useState<Set<number>>(new Set())
  const [isFinished, setIsFinished]       = useState(false)
  const [showIndex, setShowIndex]         = useState(false)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [mounted, setMounted]             = useState(false)

  // For the banner
  const [savedAnsweredCount, setSavedAnsweredCount] = useState(0)

  // ── Load progress + bookmarks on mount ──
  useEffect(() => {
    const bm = getBookmarks()
    setBookmarks(bm)

    const progress = loadProgress(unit.id, topicId)
    if (progress) {
      const loadedAttempts: Attempt[] = baseQuestions.map(q => {
        const saved = progress.answers[String(q.id)]
        if (!saved) return blankAttempt()
        return {
          state: saved.isSkipped ? 'skipped' : saved.isCorrect ? 'correct' : 'wrong',
          selected: saved.selectedOption,
        }
      })
      setAttempts(loadedAttempts)
      const answered = loadedAttempts.filter(a => a.state !== 'unanswered').length
      setSavedAnsweredCount(answered)

      if (answered >= baseQuestions.length) {
        setIsFinished(true)
      } else {
        const firstUnanswered = loadedAttempts.findIndex(a => a.state === 'unanswered')
        setIdx(firstUnanswered === -1 ? 0 : firstUnanswered)
      }
    }
    setMounted(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topicId])

  // ── Handlers ──
  const handleAnswer = useCallback((optIdx: number) => {
    if (attempts[idx].state !== 'unanswered') return
    const q = questions[idx]
    const isCorrect = optIdx === q.correct
    const newAttempt: Attempt = { state: isCorrect ? 'correct' : 'wrong', selected: optIdx }
    const next = [...attempts]
    next[idx] = newAttempt
    setAttempts(next)

    // Find next unanswered for lastIndex
    const nextUnanswered = next.findIndex((a, i) => i > idx && a.state === 'unanswered')
    const lastIndex = nextUnanswered === -1 ? idx : nextUnanswered

    saveAnswer(unit.id, topicId, q.id, {
      selectedOption: optIdx,
      isCorrect,
      isSkipped: false,
      answeredAt: new Date().toISOString(),
    }, lastIndex, isRetryMode)
  }, [attempts, idx, questions, unit.id, topicId, isRetryMode])

  const handleSkip = useCallback(() => {
    if (attempts[idx].state !== 'unanswered') return
    const q = questions[idx]
    const next = [...attempts]
    next[idx] = { state: 'skipped', selected: null }
    setAttempts(next)

    const nextUnanswered = next.findIndex((a, i) => i > idx && a.state === 'unanswered')
    const lastIndex = nextUnanswered === -1 ? idx : nextUnanswered

    saveAnswer(unit.id, topicId, q.id, {
      selectedOption: null,
      isCorrect: false,
      isSkipped: true,
      answeredAt: new Date().toISOString(),
    }, lastIndex, isRetryMode)
  }, [attempts, idx, questions, unit.id, topicId, isRetryMode])

  const handleNext = useCallback(() => {
    if (idx + 1 >= questions.length) {
      setIsFinished(true)
    } else {
      setIdx(i => i + 1)
    }
  }, [idx, questions.length])

  const handleJump = useCallback((i: number) => {
    setIdx(i)
    setShowIndex(false)
  }, [])

  const handleBookmark = useCallback(() => {
    const q = questions[idx]
    const updated = toggleBookmark(q.id)
    setBookmarks(new Set(updated))
    window.dispatchEvent(new Event('storage'))
  }, [questions, idx])

  const startRetryMode = useCallback(() => {
    const wrongQs = baseQuestions.filter((q, i) => attempts[i]?.state === 'wrong')
    if (wrongQs.length === 0) return
    setQuestions(wrongQs)
    setAttempts(wrongQs.map(blankAttempt))
    setIdx(0)
    setIsFinished(false)
    setIsRetryMode(true)
    resetProgress(unit.id, topicId, true) // clear any old retry
  }, [baseQuestions, attempts, unit.id, topicId])

  const resetAndRetryAll = useCallback(() => {
    resetProgress(unit.id, topicId)
    resetProgress(unit.id, topicId, true)
    setQuestions(baseQuestions)
    setAttempts(baseQuestions.map(blankAttempt))
    setIdx(0)
    setIsFinished(false)
    setIsRetryMode(false)
    setSavedAnsweredCount(0)
  }, [baseQuestions, unit.id, topicId])

  // ── Empty state ──
  if (baseQuestions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gray-50">
        <div className="bg-white rounded-2xl p-8 text-center shadow max-w-sm w-full">
          <div className="text-4xl mb-3">📭</div>
          <h2 className="text-lg font-bold text-gray-700 mb-2">No Questions Yet</h2>
          <p className="text-sm text-gray-500 mb-6">No questions found for <strong>{topic.label}</strong>.</p>
          <button onClick={() => router.push('/')}
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl">Back to Home</button>
        </div>
      </div>
    )
  }

  // ── Score screen ──
  if (isFinished) {
    return (
      <ScoreScreen
        questions={baseQuestions}
        attempts={attempts}
        bookmarks={bookmarks}
        topicLabel={topic.label}
        headerBg={unit.headerBg}
        unitId={unit.id}
        topicId={topicId}
        onRetryWrong={startRetryMode}
        onResetRetry={resetAndRetryAll}
        onHome={() => router.push('/')}
      />
    )
  }

  const q = questions[idx]
  const attempt = attempts[idx]
  const answered = attempt.state !== 'unanswered'
  const isBookmarked = bookmarks.has(q.id)
  const progress = (idx / questions.length) * 100
  const answeredCount = attempts.filter(a => a.state !== 'unanswered').length
  const showBanner = mounted && savedAnsweredCount > 0 && !bannerDismissed && !isRetryMode

  const feedbackInfo = (() => {
    if (attempt.state === 'correct')
      return { text: '✅ Correct!', cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' }
    if (attempt.state === 'wrong')
      return {
        text: `❌ Wrong! Correct answer: ${['A','B','C','D'][q.correct]}) ${q.options[q.correct].replace(/^[A-D]\)\s*/i, '')}`,
        cls: 'bg-red-50 border-red-200 text-red-700',
      }
    if (attempt.state === 'skipped')
      return { text: '⏭️ Skipped', cls: 'bg-gray-100 border-gray-200 text-gray-500' }
    return null
  })()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className={`${unit.headerBg} text-white`}>
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.push('/')}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs opacity-70 truncate">{unit.description}{isRetryMode ? ' — Retry Mode' : ''}</p>
            <h1 className="text-sm font-bold truncate">{topic.label}</h1>
          </div>
          <button onClick={handleBookmark}
            className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 active:scale-95">
            <svg className="w-5 h-5" fill={isBookmarked ? 'white' : 'none'} stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div className="h-full bg-white transition-all duration-500"
            style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Progress resume banner */}
      {showBanner && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-2.5 max-w-2xl mx-auto w-full flex items-center justify-between">
          <p className="text-xs text-indigo-700 font-medium">
            Resuming — {savedAnsweredCount} of {baseQuestions.length} answered
          </p>
          <button onClick={() => setBannerDismissed(true)}
            className="text-indigo-400 hover:text-indigo-600 text-lg leading-none">×</button>
        </div>
      )}

      {/* Scrollable content — pb-20 to clear the fixed IndexPanel */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="max-w-2xl mx-auto px-4 py-4">

          {/* Question meta */}
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-gray-400">
              #{q.id} &nbsp;·&nbsp; {topic.label} &nbsp;·&nbsp; {q.source}
            </p>
            <div className="flex items-center gap-2">
              {isBookmarked && <span className="text-yellow-500 text-sm">🔖</span>}
              {answered && attempt.state !== 'skipped' && (
                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Already Answered
                </span>
              )}
              {!answered && (
                <button onClick={handleSkip}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg active:scale-95 transition-all">
                  Skip
                </button>
              )}
            </div>
          </div>

          {/* Question number */}
          <div className="mb-3">
            <span className="text-sm font-bold text-gray-700">
              {isRetryMode ? 'Retry ' : ''}Question {idx + 1} of {questions.length}
            </span>
          </div>

          {/* Passage */}
          {q.passage && <PassageBox title={q.passageTitle} text={q.passage} />}

          {/* Question */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
            <p className="text-gray-800 text-base font-medium leading-relaxed">{q.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-2.5 mb-4">
            {q.options.map((opt, i) => (
              <OptionBtn key={i} label={opt} index={i}
                attempt={answered ? attempt : null}
                correctIdx={q.correct}
                onClick={() => handleAnswer(i)} />
            ))}
          </div>

          {/* Feedback + Next */}
          {answered && (
            <div className="space-y-3">
              {feedbackInfo && (
                <div className={`rounded-xl px-4 py-3 border text-sm font-medium leading-snug ${feedbackInfo.cls}`}>
                  {feedbackInfo.text}
                </div>
              )}
              <p className="text-xs text-gray-400 px-1">📄 {q.source}</p>
              <button onClick={handleNext}
                className="w-full bg-indigo-600 text-white font-semibold py-4 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all text-base">
                {idx + 1 >= questions.length ? 'See Results →' : 'Next Question →'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed index panel at bottom */}
      <IndexPanel
        questions={questions}
        attempts={attempts}
        bookmarks={bookmarks}
        currentIdx={idx}
        onJump={handleJump}
        open={showIndex}
        onToggle={() => setShowIndex(o => !o)}
      />
    </div>
  )
}
