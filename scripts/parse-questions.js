/**
 * Parses full_text.txt (HTML from mammoth) and generates data/questions.json
 * Run: node scripts/parse-questions.js
 */
const fs = require('fs')
const path = require('path')

const html = fs.readFileSync(path.join(__dirname, '..', 'full_text.txt'), 'utf8')

// ─── Strip HTML tags helper ──────────────────────────────────────────────────
function stripTags(str) {
  return str
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// ─── Unit / Topic maps ────────────────────────────────────────────────────────
const UNIT_MAP = [
  { pattern: /UNIT I\b/i,   unit: 'unit1' },
  { pattern: /UNIT II\b/i,  unit: 'unit2' },
  { pattern: /UNIT III\b/i, unit: 'unit3' },
  { pattern: /UNIT IV\b/i,  unit: 'unit4' },
]

// Maps h2 heading text → { topic, topicLabel }
const TOPIC_MAP = [
  // Unit 1 – General English
  { pattern: /comprehension/i,                topic: 'comprehension',  topicLabel: 'Comprehension' },
  { pattern: /editing|proof.?read/i,          topic: 'editing',        topicLabel: 'Editing & Proof Reading' },
  { pattern: /jumbled/i,                      topic: 'jumbled',        topicLabel: 'Jumbled Sentences' },
  { pattern: /narration|direct.*indirect/i,   topic: 'narration',      topicLabel: 'Direct & Indirect Speech' },
  { pattern: /modal/i,                        topic: 'modals',         topicLabel: 'Modals' },
  { pattern: /article/i,                      topic: 'articles',       topicLabel: 'Articles' },
  { pattern: /pronoun/i,                      topic: 'pronouns',       topicLabel: 'Pronouns' },
  { pattern: /homonym|homophone/i,            topic: 'homonyms',       topicLabel: 'Homonyms & Homophones' },
  { pattern: /clause/i,                       topic: 'clauses',        topicLabel: 'Clauses' },
  { pattern: /punctuation/i,                  topic: 'punctuation',    topicLabel: 'Punctuation' },
  { pattern: /synonym|antonym/i,              topic: 'synonyms',       topicLabel: 'Synonyms & Antonyms' },
  { pattern: /idiom/i,                        topic: 'idioms',         topicLabel: 'Idioms & Phrases' },
  { pattern: /preposition/i,                  topic: 'prepositions',   topicLabel: 'Prepositions' },
  { pattern: /active.*passive|passive.*active/i, topic: 'voice',       topicLabel: 'Active & Passive Voice' },
  { pattern: /vocabulary|one.?word/i,         topic: 'vocabulary',     topicLabel: 'Vocabulary & One Word Substitution' },
  { pattern: /grammatically correct/i,        topic: 'grammar',        topicLabel: 'Grammatically Correct Sentences' },
  { pattern: /fill.?in.?the.?blank/i,         topic: 'fillblanks',     topicLabel: 'Fill in the Blanks' },
  // Unit 2 – General Awareness
  { pattern: /current event/i,                topic: 'current',        topicLabel: 'Current Events' },
  { pattern: /political.*physical|physical.*division/i, topic: 'geography', topicLabel: 'Political & Physical Divisions of India' },
  { pattern: /culture.*heritage|freedom struggle|heritage.*culture/i, topic: 'history', topicLabel: 'Indian Culture, Heritage & Freedom Struggle' },
  { pattern: /demography|census/i,            topic: 'demography',     topicLabel: 'Demography & Census' },
  { pattern: /river|lake/i,                   topic: 'rivers',         topicLabel: 'Important Rivers & Lakes' },
  { pattern: /weather|climate|crop|transport/i, topic: 'geography',    topicLabel: 'Weather, Climate, Crops & Transport' },
  { pattern: /j&?k|jammu.*kashmir/i,          topic: 'jk',             topicLabel: 'J&K — History, Economy, Geography & Culture' },
  // Unit 3 – Numerical & Reasoning
  { pattern: /number system/i,                topic: 'numbersystem',   topicLabel: 'Number System' },
  { pattern: /percentage/i,                   topic: 'percentage',     topicLabel: 'Percentage' },
  { pattern: /average/i,                      topic: 'average',        topicLabel: 'Average' },
  { pattern: /profit.*loss|loss.*profit/i,    topic: 'profitloss',     topicLabel: 'Profit & Loss' },
  { pattern: /ratio.*proportion|proportion/i, topic: 'ratio',          topicLabel: 'Ratio & Proportion' },
  { pattern: /time.*work/i,                   topic: 'timework',       topicLabel: 'Time & Work' },
  { pattern: /speed.*distance|distance.*time/i, topic: 'speed',        topicLabel: 'Speed, Distance & Time' },
  { pattern: /basic arithmetic/i,             topic: 'arithmetic',     topicLabel: 'Basic Arithmetic' },
  { pattern: /number series/i,                topic: 'series',         topicLabel: 'Number Series' },
  { pattern: /coding.?decoding/i,             topic: 'coding',         topicLabel: 'Coding & Decoding' },
  { pattern: /direction sense/i,              topic: 'direction',      topicLabel: 'Direction Sense' },
  { pattern: /blood relation/i,               topic: 'bloodrelations', topicLabel: 'Blood Relations' },
  { pattern: /statement.*conclusion|conclusion/i, topic: 'statements', topicLabel: 'Statements & Conclusions' },
  { pattern: /reasoning/i,                    topic: 'reasoning',      topicLabel: 'Reasoning' },
  // Unit 4 – Computers
  { pattern: /fundamental.*computer|computer.*science/i, topic: 'fundamentals', topicLabel: 'Fundamentals of Computer Science' },
  { pattern: /hardware.*software|software.*hardware/i,   topic: 'hardware',     topicLabel: 'Hardware & Software' },
  { pattern: /input.*output|output.*input/i,             topic: 'io',           topicLabel: 'Input & Output Devices' },
  { pattern: /operating system/i,                        topic: 'os',           topicLabel: 'Operating System' },
  { pattern: /ms.?word/i,                                topic: 'msword',       topicLabel: 'MS Word' },
  { pattern: /ms.?excel/i,                               topic: 'msexcel',      topicLabel: 'MS Excel' },
  { pattern: /ms.?access/i,                              topic: 'msaccess',     topicLabel: 'MS Access' },
  { pattern: /powerpoint/i,                              topic: 'ppt',          topicLabel: 'PowerPoint' },
  { pattern: /ms word.*excel.*access|word.*excel.*powerpoint/i, topic: 'msoffice', topicLabel: 'MS Office Suite' },
  { pattern: /email.*internet|internet.*email/i,         topic: 'internet',     topicLabel: 'Email & Internet' },
  { pattern: /internet|platform/i,                       topic: 'internet',     topicLabel: 'Internet & Platforms' },
]

const SOURCE_MAP = {
  '2024':              'Junior Assistant 2024',
  '2023':              'Junior Assistant 2023',
  'Website Operator':  'JKSSB Website Operator',
  'Wildlife Guard':    'JKSSB Wildlife Guard',
  'Stock Assistant':   'JKSSB Stock Assistant',
}

function resolveSource(raw) {
  if (!raw) return 'JKSSB Exam'
  for (const [key, label] of Object.entries(SOURCE_MAP)) {
    if (raw.includes(key)) return label
  }
  return `JKSSB ${raw.trim()}`
}

// ─── Parser ───────────────────────────────────────────────────────────────────
const questions = []
let id = 1
let currentUnit = 'unit1'
let currentTopic = 'comprehension'
let currentTopicLabel = 'Comprehension'

// Tokenise: split HTML into meaningful chunks
// We care about: <h1>, <h2>, <p>, <ul>
const tokenRe = /<h1[^>]*>([\s\S]*?)<\/h1>|<h2[^>]*>([\s\S]*?)<\/h2>|<p[^>]*>([\s\S]*?)<\/p>|<ul[^>]*>([\s\S]*?)<\/ul>/gi
const tokens = []
let m
while ((m = tokenRe.exec(html)) !== null) {
  if (m[1] !== undefined) tokens.push({ type: 'h1', raw: m[1] })
  else if (m[2] !== undefined) tokens.push({ type: 'h2', raw: m[2] })
  else if (m[3] !== undefined) tokens.push({ type: 'p', raw: m[3] })
  else if (m[4] !== undefined) tokens.push({ type: 'ul', raw: m[4] })
}

function matchTopic(text) {
  for (const t of TOPIC_MAP) {
    if (t.pattern.test(text)) return t
  }
  return null
}

// ─── Question regex: matches  <strong>Q5. [2024]</strong> OR <strong>Q5. [2024] full bold text</strong>
const qHeaderRe = /^<strong>Q(\d+)\.\s*\[([^\]]+)\]<\/strong>\s*([\s\S]*)$/i
const qHeaderBoldRe = /^<strong>Q(\d+)\.\s*\[([^\]]+)\]\s+([\s\S]+?)<\/strong>\s*$/i

// ─── Process options from <ul> raw HTML ───────────────────────────────────────
function parseOptions(ulRaw) {
  // Collect all <li> text
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let liMatch
  const liParts = []
  while ((liMatch = liRe.exec(ulRaw)) !== null) {
    liParts.push(liMatch[1])
  }

  // Join all option text (some Qs have all options in one <li>)
  const combined = liParts.join(' ')

  // Find correct answer (text inside <strong>...</strong>)
  const strongRe = /<strong>([\s\S]*?)<\/strong>/g
  const bolds = []
  let bm
  while ((bm = strongRe.exec(combined)) !== null) {
    bolds.push(stripTags(bm[1]).trim())
  }

  // Strip all tags to get plain text
  const plainText = stripTags(combined)

  // Extract options A) B) C) D) from plain text
  // Pattern: A) text B) text C) text D) text
  const optRe = /([A-D])\)\s*([\s\S]*?)(?=\s+[A-D]\)|$)/g
  const opts = {}
  let om
  while ((om = optRe.exec(plainText)) !== null) {
    opts[om[1]] = om[2].trim()
      .replace(/\(Note:[^)]+\)/gi, '').trim()
  }

  // If we don't have 4 options, fallback: split on A) B) C) D)
  if (Object.keys(opts).length < 2) {
    const parts = plainText.split(/(?=[A-D]\)\s)/)
    for (const p of parts) {
      const pm = p.match(/^([A-D])\)\s*(.+)/)
      if (pm) opts[pm[1]] = pm[2].trim().replace(/\(Note:[^)]+\)/gi, '').trim()
    }
  }

  if (!opts.A && !opts.B) return null  // unparseable

  const options = [
    `A) ${opts.A || ''}`,
    `B) ${opts.B || ''}`,
    `C) ${opts.C || ''}`,
    `D) ${opts.D || ''}`,
  ]

  // Determine correct index: which option letter's text is in bolds?
  let correct = 0
  for (const bold of bolds) {
    if (!bold) continue
    for (let i = 0; i < 4; i++) {
      const letter = ['A', 'B', 'C', 'D'][i]
      const optText = (opts[letter] || '').toLowerCase()
      const boldLow = bold.toLowerCase()
      // Check if bold matches option text (starts with letter) or content
      if (
        boldLow.startsWith(`${letter})`) ||
        (optText.length > 3 && optText.includes(boldLow.replace(/^[a-d]\)\s*/i, '')))
      ) {
        correct = i
        break
      }
    }
  }

  return { options, correct }
}

// ─── Main loop ────────────────────────────────────────────────────────────────
let pendingQuestion = null  // { num, source, text }

for (let i = 0; i < tokens.length; i++) {
  const tok = tokens[i]

  if (tok.type === 'h1') {
    const text = stripTags(tok.raw)
    for (const u of UNIT_MAP) {
      if (u.pattern.test(text)) { currentUnit = u.unit; break }
    }
    continue
  }

  if (tok.type === 'h2') {
    const text = stripTags(tok.raw)
    const t = matchTopic(text)
    if (t) { currentTopic = t.topic; currentTopicLabel = t.topicLabel }
    continue
  }

  if (tok.type === 'p') {
    const raw = tok.raw.trim()

    // Try matching question header
    let qMatch = raw.match(qHeaderBoldRe) || raw.match(qHeaderRe)
    if (qMatch) {
      pendingQuestion = {
        num: qMatch[1],
        source: resolveSource(qMatch[2]),
        text: stripTags(qMatch[3] || '').trim(),
      }
    }
    continue
  }

  if (tok.type === 'ul' && pendingQuestion) {
    const parsed = parseOptions(tok.raw)
    pendingQuestion = null  // consume

    if (!parsed) continue

    const { options, correct } = parsed
    // Skip if question text is empty or options are mostly empty
    const hasOpts = options.filter(o => o.length > 3).length >= 2

    if (hasOpts) {
      // Get question text from the pending q — might still be empty if bold style
      // (the text was INSIDE the <strong> — handled by qHeaderBoldRe)
      questions.push({
        id: id++,
        unit: currentUnit,
        topic: currentTopic,
        topicLabel: currentTopicLabel,
        question: pendingQuestion
          ? pendingQuestion.text  // already consumed above — use cached
          : '(see passage)',
        options,
        correct,
        source: pendingQuestion ? pendingQuestion.source : 'JKSSB Exam',
      })
    }
  }
}

// Fix: we consumed pendingQuestion too early above. Let's redo with a cleaner approach.
// The above loop has a bug — pendingQuestion is set to null before writing.
// Re-do cleanly:

const questions2 = []
let id2 = 1
currentUnit = 'unit1'
currentTopic = 'comprehension'
currentTopicLabel = 'Comprehension'
let pq = null

for (let i = 0; i < tokens.length; i++) {
  const tok = tokens[i]

  if (tok.type === 'h1') {
    const text = stripTags(tok.raw)
    for (const u of UNIT_MAP) {
      if (u.pattern.test(text)) { currentUnit = u.unit; break }
    }
    continue
  }

  if (tok.type === 'h2') {
    const text = stripTags(tok.raw)
    const t = matchTopic(text)
    if (t) { currentTopic = t.topic; currentTopicLabel = t.topicLabel }
    continue
  }

  if (tok.type === 'p') {
    const raw = tok.raw.trim()
    const qm = raw.match(qHeaderBoldRe) || raw.match(qHeaderRe)
    if (qm) {
      pq = {
        num: qm[1],
        source: resolveSource(qm[2]),
        text: stripTags(qm[3] || '').trim(),
        unit: currentUnit,
        topic: currentTopic,
        topicLabel: currentTopicLabel,
      }
    }
    continue
  }

  if (tok.type === 'ul' && pq) {
    const parsed = parseOptions(tok.raw)
    const saved = pq
    pq = null

    if (!parsed) continue
    const { options, correct } = parsed
    if (options.filter(o => o.replace(/^[A-D]\)\s*/, '').trim().length > 1).length < 2) continue

    questions2.push({
      id: id2++,
      unit: saved.unit,
      topic: saved.topic,
      topicLabel: saved.topicLabel,
      question: saved.text || `(Question ${saved.num})`,
      options,
      correct,
      source: saved.source,
    })
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, '..', 'data', 'questions.json')
fs.writeFileSync(outPath, JSON.stringify(questions2, null, 2), 'utf8')

console.log(`✓ Parsed ${questions2.length} questions → data/questions.json`)

// Summary by unit/topic
const summary = {}
for (const q of questions2) {
  const key = `${q.unit} / ${q.topic}`
  summary[key] = (summary[key] || 0) + 1
}
console.log('\nBy unit/topic:')
for (const [k, v] of Object.entries(summary)) {
  console.log(`  ${k}: ${v}`)
}
