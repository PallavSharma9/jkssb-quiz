'use client'

export interface QuestionAnswer {
  selectedOption: number | null
  isCorrect: boolean
  isSkipped: boolean
  answeredAt: string
}

export interface TopicProgress {
  answers: Record<string, QuestionAnswer>
  lastQuestionIndex: number
}

function getKey(unit: string, topic: string, retry = false): string {
  return retry ? `quiz_retry_${unit}_${topic}` : `quiz_progress_${unit}_${topic}`
}

export function loadProgress(unit: string, topic: string, retry = false): TopicProgress | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(getKey(unit, topic, retry))
    return raw ? (JSON.parse(raw) as TopicProgress) : null
  } catch {
    return null
  }
}

export function saveAnswer(
  unit: string,
  topic: string,
  questionId: number,
  answer: QuestionAnswer,
  lastIndex: number,
  retry = false
): void {
  if (typeof window === 'undefined') return
  try {
    const key = getKey(unit, topic, retry)
    const existing: TopicProgress = loadProgress(unit, topic, retry) ?? {
      answers: {},
      lastQuestionIndex: 0,
    }
    existing.answers[String(questionId)] = answer
    existing.lastQuestionIndex = lastIndex
    localStorage.setItem(key, JSON.stringify(existing))
  } catch {
    // Storage full or unavailable — fail silently
  }
}

export function resetProgress(unit: string, topic: string, retry = false): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(getKey(unit, topic, retry))
    localStorage.removeItem(getKey(unit, topic, !retry)) // clear both
  } catch {}
}

export function resetAllProgress(): void {
  if (typeof window === 'undefined') return
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && (k.startsWith('quiz_progress_') || k.startsWith('quiz_retry_'))) {
        toRemove.push(k)
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch {}
}

export interface TopicSummary {
  answered: number
  total: number
  lastIndex: number
  completed: boolean
}

export function getTopicSummary(unit: string, topic: string, total: number): TopicSummary | null {
  const p = loadProgress(unit, topic)
  if (!p) return null
  const answered = Object.keys(p.answers).length
  return {
    answered,
    total,
    lastIndex: p.lastQuestionIndex,
    completed: answered >= total,
  }
}
