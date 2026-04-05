/**
 * Extracts questions from jkssb-juniorAssistant-question-data.docx
 * Handles:
 *   - Standard: <p>Q header</p><ul>options</ul>
 *   - Multi-para: <p>Q header</p><ol>statements</ol><p>continuation</p><ul>options</ul>
 *   - Deduplication by question text (keeps first occurrence = correct topic)
 *
 * Run: node scripts/extract-questions.js
 */
const mammoth = require('mammoth')
const fs = require('fs')
const path = require('path')

const DOCX = path.join(__dirname, '..', 'jkssb-juniorAssistant-question-data.docx')
const OUT  = path.join(__dirname, '..', 'data', 'questions.json')

// ─── Syllabus ─────────────────────────────────────────────────────────────────
const UNITS = [
  {
    unit: 'unit1', unitLabel: 'General English',
    pattern: /UNIT\s+I\b/i,
    topics: [
      { topic: 'comprehension',        topicLabel: 'Comprehension',                                       pattern: /comprehension/i },
      { topic: 'editing',              topicLabel: 'Editing / Proof Reading',                             pattern: /editing|proof.?read/i },
      { topic: 'jumbled_sentences',    topicLabel: 'Rearranging of Jumbled Sentences',                    pattern: /jumbled/i },
      { topic: 'narration',            topicLabel: 'Narration (Direct & Indirect Speech)',                pattern: /narration|direct.*indirect/i },
      { topic: 'modals',               topicLabel: 'Modals',                                              pattern: /\bmodal/i },
      { topic: 'articles',             topicLabel: 'Articles',                                            pattern: /\barticle/i },
      { topic: 'paragraph_writing',    topicLabel: 'Paragraph Writing — Phrases, Pronouns, Homonyms/Homophones', pattern: /paragraph.?writ|pronoun|homonym|homophone/i },
      { topic: 'clauses',              topicLabel: 'Clauses',                                             pattern: /clause/i },
      { topic: 'punctuation',          topicLabel: 'Punctuation',                                         pattern: /punctuation/i },
      { topic: 'synonyms_antonyms',    topicLabel: 'Synonyms and Antonyms',                              pattern: /synonym|antonym/i },
      { topic: 'idioms_phrases',       topicLabel: 'Idioms and Phrases',                                  pattern: /idiom/i },
      { topic: 'prepositions',         topicLabel: 'Uses of Prepositions',                                pattern: /preposition/i },
      { topic: 'active_passive_voice', topicLabel: 'Active & Passive Voice',                             pattern: /active.*passive|passive.*active|\bvoice\b/i },
    ],
  },
  {
    unit: 'unit2', unitLabel: 'General Awareness (J&K Focus)',
    pattern: /UNIT\s+II\b/i,
    topics: [
      { topic: 'current_events',             topicLabel: 'Current Events — National & International',   pattern: /current.event/i },
      { topic: 'political_physical_divisions',topicLabel: 'Political & Physical Divisions of India',    pattern: /political.*physical|physical.*divis/i },
      { topic: 'culture_heritage_freedom',   topicLabel: 'Indian Culture, Heritage and Freedom Struggle', pattern: /culture.*heritage|heritage.*culture|freedom.struggle/i },
      { topic: 'demography_census',          topicLabel: 'Demography — Census',                         pattern: /demograph|census/i },
      { topic: 'rivers_lakes',               topicLabel: 'Important Rivers & Lakes in India',           pattern: /river|lake/i },
      { topic: 'weather_climate_crops',      topicLabel: 'Weather, Climate, Crops, Means of Transport', pattern: /weather|climate|crop|transport/i },
      { topic: 'jk_history',                topicLabel: 'J&K — History & Politics',                    pattern: /j&?k.*hist|j&?k.*polit|history.*politic/i },
      { topic: 'jk_economy',                topicLabel: 'J&K — Economy',                               pattern: /j&?k.*econom|economy/i },
      { topic: 'jk_geography',              topicLabel: 'J&K — Geography',                             pattern: /j&?k.*geograph|geography/i },
      { topic: 'jk_heritage_culture',       topicLabel: 'J&K — Heritage & Culture',                   pattern: /j&?k.*heritage|j&?k.*cultur/i },
      { topic: 'jk_tourist_destinations',   topicLabel: 'J&K — Important Tourist Destinations',       pattern: /tourist|shrine|destination/i },
      { topic: 'jk_history',                topicLabel: 'J&K — History & Politics',                    pattern: /j&?k\b|jammu.*kashmir/i },
    ],
  },
  {
    unit: 'unit3', unitLabel: 'Numerical and Reasoning Ability',
    pattern: /UNIT\s+III\b/i,
    topics: [
      { topic: 'number_system',       topicLabel: 'Number System',               pattern: /number.?system/i },
      { topic: 'percentage',          topicLabel: 'Percentage',                  pattern: /percentage/i },
      { topic: 'average',             topicLabel: 'Average',                     pattern: /\baverage\b/i },
      { topic: 'profit_loss',         topicLabel: 'Profit & Loss',               pattern: /profit.*loss|loss.*profit/i },
      { topic: 'ratio_proportion',    topicLabel: 'Ratio & Proportion',          pattern: /ratio.*proportion|proportion/i },
      { topic: 'time_work',           topicLabel: 'Time & Work',                 pattern: /time.*work\b/i },
      { topic: 'number_series',       topicLabel: 'Number Series',               pattern: /number.?series/i },
      { topic: 'letter_series',       topicLabel: 'Letter Series',               pattern: /letter.?series/i },
      { topic: 'coding_decoding',     topicLabel: 'Coding-Decoding',             pattern: /coding.?decoding/i },
      { topic: 'direction_sense',     topicLabel: 'Direction Sense',             pattern: /direction.?sense/i },
      { topic: 'blood_relations',     topicLabel: 'Blood Relations',             pattern: /blood.?relation/i },
      { topic: 'mathematical_reasoning', topicLabel: 'Mathematical Reasoning',   pattern: /math.*reason|reasoning/i },
      { topic: 'speed_distance_time', topicLabel: 'Speed, Distance and Time',   pattern: /speed.*distance|distance.*time/i },
      { topic: 'statements_conclusions', topicLabel: 'Statements and Conclusions', pattern: /statement.*conclusion|conclusion/i },
      { topic: 'number_system',       topicLabel: 'Number System',               pattern: /arithmetic|basic.?arith/i },
    ],
  },
  {
    unit: 'unit4', unitLabel: 'Basic Concepts of Computers',
    pattern: /UNIT\s+IV\b/i,
    topics: [
      { topic: 'fundamentals',         topicLabel: 'Fundamentals of Computer Sciences',              pattern: /fundamental.*computer|computer.*science/i },
      { topic: 'hardware_software',    topicLabel: 'Hardware & Software',                            pattern: /hardware.*software|software.*hardware/i },
      { topic: 'input_output_devices', topicLabel: 'Input and Output Devices',                      pattern: /input.*output|output.*input/i },
      { topic: 'operating_system',     topicLabel: 'Operating System',                               pattern: /operating.?system/i },
      { topic: 'ms_office',            topicLabel: 'MS Word, MS Excel, MS Access and PowerPoint',   pattern: /ms.?word|ms.?excel|ms.?access|powerpoint|ms.?office/i },
      { topic: 'email_internet',       topicLabel: 'Email & Internet',                               pattern: /email|internet|platform/i },
    ],
  },
]

const SOURCE_MAP = {
  '2024': 'Junior Assistant 2024', '2023': 'Junior Assistant 2023', '2022': 'Junior Assistant 2022',
  'Website Operator': 'JKSSB Website Operator', 'Wildlife Guard': 'JKSSB Wildlife Guard',
  'Stock Assistant': 'JKSSB Stock Assistant', 'Assistant Secretary': 'JKSSB Assistant Secretary 2025',
  'Assistant Programmer': 'JKSSB Assistant Programmer 2025', 'Telephone Operator': 'JKSSB Telephone Operator 2025',
  'Statistical Assistant': 'JKSSB Statistical Assistant 2025', 'Junior Programmer': 'JKSSB Junior Programmer 2025',
  'Data Entry Operator': 'JKSSB Data Entry Operator', 'Technical Officer': 'JKSSB Technical Officer 2025',
  'DEO': 'JKSSB DEO 2025', 'Patwari': 'JKSSB Patwari 2024', 'Constable': 'JKSSB Constable 2024',
  'Graduate Level': 'JKSSB Graduate Level 2024',
}

function resolveSource(raw) {
  if (!raw) return 'JKSSB Exam'
  for (const [k, v] of Object.entries(SOURCE_MAP)) {
    if (raw.includes(k)) return v
  }
  return `JKSSB ${raw.trim()}`
}

function stripTags(s) {
  return s.replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"')
    .replace(/&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()
}

// ─── Tokenise HTML into typed tokens ─────────────────────────────────────────
function tokenize(html) {
  const tokens = []
  const re = /<(h[1-6])[^>]*>([\s\S]*?)<\/\1>|<p[^>]*>([\s\S]*?)<\/p>|<ul[^>]*>([\s\S]*?)<\/ul>|<ol[^>]*>([\s\S]*?)<\/ol>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    if (m[1])                        tokens.push({ type: m[1].toLowerCase(), raw: m[2] })
    else if (m[3] !== undefined)     tokens.push({ type: 'p',  raw: m[3] })
    else if (m[4] !== undefined)     tokens.push({ type: 'ul', raw: m[4] })
    else if (m[6] !== undefined)     tokens.push({ type: 'ol', raw: m[6] })
  }
  return tokens
}

function resolveUnit(text) {
  for (const u of UNITS) { if (u.pattern.test(text)) return u }
  return null
}

function resolveTopic(unitDef, text) {
  if (!unitDef) return null
  for (const t of unitDef.topics) { if (t.pattern.test(text)) return t }
  return null
}

// ─── Parse options from <ul> HTML ─────────────────────────────────────────────
function parseOptions(ulRaw) {
  const liParts = []
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let lm
  while ((lm = liRe.exec(ulRaw)) !== null) liParts.push(lm[1])
  const combined = liParts.join(' ')

  // Find bold = correct answer
  const boldTexts = []
  const boldRe = /<strong[^>]*>([\s\S]*?)<\/strong>/gi
  let bm
  while ((bm = boldRe.exec(combined)) !== null) {
    const t = stripTags(bm[1]).trim()
    if (t) boldTexts.push(t)
  }

  const plain = stripTags(combined)
    .replace(/\(Note:[^)]*\)/gi,'')
    .replace(/\(correct answer[^)]*\)/gi,'')

  const opts = {}
  const optRe = /\b([A-D])\)\s*([\s\S]*?)(?=\s+[A-D]\)|$)/g
  let om
  while ((om = optRe.exec(plain)) !== null) {
    opts[om[1]] = om[2].replace(/\s+/g,' ').trim()
  }
  if (Object.keys(opts).length < 2) {
    const parts = plain.split(/(?=\b[A-D]\)\s)/)
    for (const p of parts) {
      const pm = p.match(/^([A-D])\)\s*(.+)/)
      if (pm) opts[pm[1]] = pm[2].trim()
    }
  }
  if (!opts.A && !opts.B) return null

  const options = ['A','B','C','D'].map(l => `${l}) ${opts[l] || ''}`)

  let correct = 0
  outer: for (const bold of boldTexts) {
    const lm2 = bold.match(/^([A-D])\)/i)
    if (lm2) { correct = 'ABCD'.indexOf(lm2[1].toUpperCase()); break }
    const boldClean = bold.replace(/^[A-D]\)\s*/i,'').toLowerCase().trim()
    for (let i = 0; i < 4; i++) {
      const optContent = (opts['ABCD'[i]] || '').toLowerCase().trim()
      if (optContent.length > 1 && (optContent === boldClean || optContent.startsWith(boldClean) || boldClean.startsWith(optContent.substring(0, Math.min(optContent.length, 20))))) {
        correct = i; break outer
      }
    }
  }

  return { options, correct }
}

// ─── Parse ordered list items into readable text ──────────────────────────────
function parseOlItems(olRaw) {
  const items = []
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi
  let m
  let n = 1
  while ((m = liRe.exec(olRaw)) !== null) {
    items.push(`${n}. ${stripTags(m[1]).trim()}`)
    n++
  }
  return items.join('\n')
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Extracting HTML from docx...')
  const { value: html } = await mammoth.convertToHtml({ path: DOCX }, {
    styleMap: ['b => strong', 'i => em'],
  })
  console.log(`HTML: ${html.length} chars`)
  fs.writeFileSync(path.join(__dirname, '..', 'full_text.txt'), html, 'utf8')

  const tokens = tokenize(html)
  console.log(`Tokens: ${tokens.length}`)

  const questions = []

  let currentUnitDef  = UNITS[0]
  let currentTopicDef = UNITS[0].topics[0]
  let currentPassage  = null
  let pq = null   // pending question

  const qHeaderFull    = /^<strong>Q(\d+)\.\s*\[([^\]]+)\]\s+([\s\S]+?)<\/strong>\s*$/
  const qHeaderPartial = /^<strong>Q(\d+)\.\s*\[([^\]]+)\]<\/strong>\s*([\s\S]*)$/

  let id = 1

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]

    // ── h1: unit ──
    if (/^h[1-6]$/.test(tok.type) && tok.type !== 'h2' && tok.type !== 'h3' && tok.type !== 'h4') {
      const u = resolveUnit(stripTags(tok.raw))
      if (u) { currentUnitDef = u; currentTopicDef = u.topics[0]; currentPassage = null }
      continue
    }
    if (tok.type === 'h1') {
      const u = resolveUnit(stripTags(tok.raw))
      if (u) { currentUnitDef = u; currentTopicDef = u.topics[0]; currentPassage = null }
      continue
    }

    // ── h2/h3/h4: topic or passage heading ──
    if (['h2','h3','h4'].includes(tok.type)) {
      const text = stripTags(tok.raw)
      if (/passage\s*\d*\s*[—\-–:]/i.test(text) || /^passage\b/i.test(text)) {
        const title = text.replace(/\(Q[\d,\s]+(?:to|and)?\s*Q?\d*\)/gi,'').trim()
        currentPassage = { title, text: null }
        continue
      }
      const t = resolveTopic(currentUnitDef, text)
      if (t) { currentTopicDef = t; currentPassage = null }
      continue
    }

    // ── p: question header or passage body ──
    if (tok.type === 'p') {
      const raw = tok.raw.trim()
      const plain = stripTags(raw)

      // Passage body
      if (/^<strong>\s*Passage\s*\d*\s*:?\s*<\/strong>/i.test(raw)) {
        const pt = plain.replace(/^Passage\s*\d*\s*:?\s*/i,'').trim()
        if (currentPassage) currentPassage.text = (currentPassage.text || '') + (currentPassage.text ? '\n\n' : '') + pt
        else currentPassage = { title: null, text: pt }
        continue
      }

      // Passage continuation (long paragraph before any question in this passage)
      if (currentPassage && !currentPassage.text && !/<strong>Q\d+/i.test(raw) && plain.length > 100) {
        currentPassage.text = plain; continue
      }
      if (currentPassage && currentPassage.text && !pq && !/<strong>Q\d+/i.test(raw) && plain.length > 40) {
        currentPassage.text += '\n\n' + plain; continue
      }

      // Question header
      const qm = raw.match(qHeaderFull) || raw.match(qHeaderPartial)
      if (qm) {
        pq = {
          num: qm[1], source: resolveSource(qm[2]),
          text: stripTags(qm[3] || '').trim(),
          extraText: '',      // accumulates ol items + continuation <p>
          unit: currentUnitDef.unit, unitLabel: currentUnitDef.unitLabel,
          topic: currentTopicDef.topic, topicLabel: currentTopicDef.topicLabel,
          passage: currentPassage ? (currentPassage.text || null) : null,
          passageTitle: currentPassage ? (currentPassage.title || null) : null,
        }
        continue
      }

      // If pending question exists and next token is not a <ul>, this <p> is continuation text
      if (pq && plain.length > 2) {
        pq.extraText += (pq.extraText ? ' ' : '') + plain
      }
      continue
    }

    // ── ol: numbered statement list (part of a multi-para question) ──
    if (tok.type === 'ol' && pq) {
      const items = parseOlItems(tok.raw)
      pq.extraText += (pq.extraText ? '\n' : '') + items
      continue
    }

    // ── ul: options ──
    if (tok.type === 'ul' && pq) {
      const parsed = parseOptions(tok.raw)
      const saved = pq
      pq = null

      if (!parsed) continue
      const { options, correct } = parsed
      if (options.filter(o => o.replace(/^[A-D]\)\s*/,'').trim().length < 1).length > 2) continue

      // Build full question text
      let fullQ = saved.text
      if (saved.extraText) fullQ = fullQ ? `${fullQ}\n${saved.extraText}` : saved.extraText
      fullQ = fullQ.trim() || `(Question ${saved.num})`

      questions.push({
        id: id++,
        unit: saved.unit, unitLabel: saved.unitLabel,
        topic: saved.topic, topicLabel: saved.topicLabel,
        question: fullQ,
        passage: saved.passage, passageTitle: saved.passageTitle,
        options, correct,
        source: saved.source,
        bookmarked: false,
      })
    }
  }

  fs.writeFileSync(OUT, JSON.stringify(questions, null, 2), 'utf8')
  console.log(`\n✓ ${questions.length} unique questions → data/questions.json`)

  // Summary
  const byUnit = {}, byTopic = {}
  for (const q of questions) {
    byUnit[q.unitLabel] = (byUnit[q.unitLabel]||0)+1
    const k = `  ${q.unitLabel} → ${q.topicLabel}`
    byTopic[k] = (byTopic[k]||0)+1
  }
  console.log('\n── By Unit ──')
  for (const [k,v] of Object.entries(byUnit)) console.log(` ${k}: ${v}`)
  console.log('\n── By Topic ──')
  for (const [k,v] of Object.entries(byTopic)) console.log(`${k}: ${v}`)

  const withPassage = questions.filter(q=>q.passage).length
  const bySource = {}
  questions.forEach(q=>{ bySource[q.source]=(bySource[q.source]||0)+1 })
  console.log(`\n  With passage: ${withPassage}`)
  console.log('\n── By Source ──')
  Object.entries(bySource).sort((a,b)=>b[1]-a[1]).forEach(([k,v])=>console.log(` ${v} ${k}`))
}

main().catch(err => { console.error(err); process.exit(1) })
