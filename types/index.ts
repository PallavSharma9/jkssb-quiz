export interface Question {
  id: number
  unit: string
  unitLabel: string
  topic: string
  topicLabel: string
  question: string
  passage: string | null
  passageTitle: string | null
  options: string[]
  correct: number
  source: string
  bookmarked: boolean
  explanation?: string
  explanationSteps?: string[]
}

export interface TopicConfig {
  id: string
  label: string
}

export interface UnitConfig {
  id: string
  label: string
  description: string
  headerBg: string
  borderColor: string
  topicBtnColor: string
  badgeColor: string
  topics: TopicConfig[]
}
