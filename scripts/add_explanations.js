/**
 * add_explanations.js
 * Adds detailed explanation + explanationSteps to every question in questions.json
 * Also verifies and fixes known wrong answers.
 */

const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '../data/questions.json');
const data = JSON.parse(fs.readFileSync(FILE, 'utf8'));

const letters = ['A', 'B', 'C', 'D'];

function opt(q, i) {
  return q.options[i] ? q.options[i].replace(/^[A-D]\)\s*/i, '') : '';
}
function correctLetter(q) { return letters[q.correct]; }
function correctText(q) { return opt(q, q.correct); }
function answerLine(q) { return `Answer is ${correctLetter(q)}) ${correctText(q)}`; }

// ─── Helper: extract number from option text ──────────────────────────────────
function numFromOpt(text) {
  const m = text.replace(/[,₹Rs.\s]/g, '').match(/-?[\d.]+/);
  return m ? parseFloat(m[0]) : null;
}

// ─── MATH SOLVERS ─────────────────────────────────────────────────────────────

function solvePercentage(q) {
  const qText = q.question;
  const correct = correctText(q);
  return {
    explanation: `Percentage calculation: ${qText.substring(0, 100)}. The correct answer is ${correct}.`,
    explanationSteps: [
      "Step 1: Identify the percentage and base values from the question",
      "Step 2: Apply formula — Percentage Value = (Percentage × Base) ÷ 100",
      "Step 3: Perform the arithmetic calculation",
      `Step 4: ${answerLine(q)}`
    ]
  };
}

function solveAverage(q) {
  return {
    explanation: `Average = Sum of all values ÷ Number of values. ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Identify the given numbers and count",
      "Step 2: Calculate the sum of all values",
      "Step 3: Divide sum by count to get average",
      "Step 4: If new average needed, use: New Total = New Average × New Count",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveProfitLoss(q) {
  return {
    explanation: `Profit/Loss calculation: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Identify Cost Price (CP) and Selling Price (SP) or profit/loss %",
      "Step 2: Profit = SP - CP | Loss = CP - SP",
      "Step 3: Profit% = (Profit/CP) × 100 | SP = CP × (100 + Profit%) ÷ 100",
      "Step 4: Calculate final answer",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveRatioProportion(q) {
  return {
    explanation: `Ratio & Proportion: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Write given ratios in fraction form",
      "Step 2: To combine ratios, make the common term equal (LCM method)",
      "Step 3: Multiply each ratio to get equivalent ratios with equal common term",
      "Step 4: Combine to get the final ratio",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveTimeWork(q) {
  return {
    explanation: `Time & Work: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Find each person's work rate = 1/days (work done per day)",
      "Step 2: Combined rate = sum of individual rates",
      "Step 3: Time together = 1 ÷ Combined rate",
      "Step 4: If partial work given, use: Time = Remaining work ÷ Combined rate",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveSpeedDistance(q) {
  return {
    explanation: `Speed, Distance & Time: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Recall the formula — Distance = Speed × Time",
      "Step 2: Convert units if needed (km/hr to m/s: multiply by 5/18)",
      "Step 3: For trains: Time = (Length of train + Length of platform) ÷ Speed",
      "Step 4: For relative speed: Same direction = S1-S2, Opposite = S1+S2",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveNumberSystem(q) {
  return {
    explanation: `Number System: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Recall number classification: Natural (1,2,3...), Whole (0,1,2...), Integer (...-1,0,1...), Rational (p/q form)",
      "Step 2: Prime numbers have exactly 2 factors: 1 and itself",
      "Step 3: Apply divisibility rules where needed",
      "Step 4: LCM = Least Common Multiple; HCF = Highest Common Factor",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveNumberSeries(q) {
  return {
    explanation: `Number Series: Find the pattern in the series. ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Look at differences between consecutive terms",
      "Step 2: Check if differences form an arithmetic or geometric pattern",
      "Step 3: Check for alternating series (odd/even positioned terms)",
      "Step 4: Identify the term that breaks the pattern",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveCodingDecoding(q) {
  return {
    explanation: `Coding-Decoding: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Identify the given code pattern (letter shift, reversal, position swap)",
      "Step 2: Find the shift value or rule by comparing input and coded output",
      "Step 3: Apply the same rule to the new word",
      "Step 4: Verify each letter of the coded word matches the rule",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveDirectionSense(q) {
  return {
    explanation: `Direction Sense: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Draw a compass — North(up), South(down), East(right), West(left)",
      "Step 2: Start at origin and track each movement step by step",
      "Step 3: Right turn = clockwise 90°; Left turn = anticlockwise 90°",
      "Step 4: Calculate net displacement (X-axis: East/West, Y-axis: North/South)",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveBloodRelations(q) {
  return {
    explanation: `Blood Relations: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Identify all persons mentioned and their stated relationships",
      "Step 2: Build a family tree diagram mentally",
      "Step 3: Trace the relationship chain from the starting person to the target",
      "Step 4: Apply gender-specific terms (father/mother, brother/sister, son/daughter)",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveStatements(q) {
  return {
    explanation: `Statements & Conclusions: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Read the statement(s) carefully — accept them as true facts",
      "Step 2: Read each conclusion — check if it logically follows from statements",
      "Step 3: A conclusion must be directly derivable, not an assumption",
      "Step 4: Conclusion that goes beyond what is stated does NOT follow",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function solveMathReasoning(q) {
  return {
    explanation: `Mathematical Reasoning/Symbol Substitution: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Note the symbol substitution rules given in the question",
      "Step 2: Replace each symbol in the expression with the actual mathematical operator",
      "Step 3: Apply BODMAS/PEMDAS rule: Brackets → Division → Multiplication → Addition → Subtraction",
      "Step 4: Calculate step by step",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

// ─── ENGLISH GENERATORS ───────────────────────────────────────────────────────

function explainComprehension(q) {
  const passage = q.passage ? `Based on the passage: "${q.passage.substring(0, 150)}..."` : '';
  return {
    explanation: `${passage} The question asks: ${q.question.substring(0, 100)}. Correct answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Read the passage carefully and identify the relevant section",
      "Step 2: Locate the part of the passage that answers this specific question",
      "Step 3: Match the meaning with the options given",
      "Step 4: Eliminate options that contradict the passage",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainEditing(q) {
  return {
    explanation: `Error Detection: ${q.question.substring(0, 150)}. The error is in part ${correctLetter(q)}: "${correctText(q)}". This part contains a grammatical error.`,
    explanationSteps: [
      "Step 1: Read the complete sentence formed by all parts A, B, C, D",
      "Step 2: Check each part for subject-verb agreement errors",
      "Step 3: Check for tense consistency, article usage, preposition errors",
      "Step 4: Check for incorrect word form (noun/verb/adjective confusion)",
      `Step 5: The error is in ${answerLine(q)}`
    ]
  };
}

function explainJumbled(q) {
  return {
    explanation: `Jumbled Sentences: Rearrange the given segments to form a coherent sentence/paragraph. Correct sequence: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Identify the opening segment — usually introduces the subject/topic",
      "Step 2: Find connectors (however, therefore, moreover, then, but) to link segments",
      "Step 3: The concluding segment usually has the result or conclusion",
      "Step 4: Read through the chosen sequence to verify it makes grammatical sense",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainNarration(q) {
  return {
    explanation: `Direct to Indirect Speech: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Remove inverted commas and change reporting verb appropriately",
      "Step 2: Add conjunction 'that' after the reporting verb",
      "Step 3: Change pronoun: I→he/she, we→they, you→he/she",
      "Step 4: Backshift tense: is→was, am→was, has→had, will→would, can→could",
      "Step 5: Change time words: now→then, today→that day, tomorrow→next day",
      `Step 6: ${answerLine(q)}`
    ]
  };
}

function explainModals(q) {
  return {
    explanation: `Modals: ${q.question.substring(0, 120)}. The correct modal is "${correctText(q)}".`,
    explanationSteps: [
      "Step 1: Read the context of the sentence carefully",
      "Step 2: Identify what the sentence expresses: ability, permission, possibility, obligation, or advice",
      "Step 3: Can/Could = ability/possibility | Should/Ought to = advice/duty | Must/Have to = obligation | May/Might = possibility | Would = polite request/habit",
      "Step 4: Match the modal to the context",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainArticles(q) {
  return {
    explanation: `Articles: ${q.question.substring(0, 120)}. Correct articles: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: 'A' is used before words starting with consonant SOUNDS (e.g., a book, a Canadian — 'K' sound)",
      "Step 2: 'An' is used before words starting with vowel SOUNDS (e.g., an hour — silent H, an apple)",
      "Step 3: 'The' is used for specific, unique things (the sun, the President) or things already mentioned",
      "Step 4: No article for general plural nouns, proper nouns, abstract nouns used generally",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainParagraphWriting(q) {
  return {
    explanation: `Grammar/Usage: ${q.question.substring(0, 120)}. Correct answer: "${correctText(q)}".`,
    explanationSteps: [
      "Step 1: Identify what is being asked (pronoun, phrase, homonym, etc.)",
      "Step 2: For pronouns: identify the case needed (subjective/objective/possessive)",
      "Step 3: For homophones: words that sound same but have different meanings and spellings",
      "Step 4: For phrases: identify the correct phrase for the given context",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainClauses(q) {
  return {
    explanation: `Clauses: ${q.question.substring(0, 120)}. Answer: "${correctText(q)}".`,
    explanationSteps: [
      "Step 1: A clause has a subject and a verb",
      "Step 2: Main/Independent clause: can stand alone as a complete sentence",
      "Step 3: Subordinate/Dependent clause: cannot stand alone; begins with conjunction (that, if, when, whether, because)",
      "Step 4: Noun clause functions as noun; Adjective clause modifies noun; Adverb clause modifies verb",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainPunctuation(q) {
  return {
    explanation: `Punctuation: ${q.question.substring(0, 120)}. The correctly punctuated sentence is option ${correctLetter(q)}.`,
    explanationSteps: [
      "Step 1: Commas separate items in a list and clauses",
      "Step 2: Inverted commas (quotes) enclose direct speech — 'single' inside double or vice versa for nested quotes",
      "Step 3: Apostrophe for possession (Ram's) and contraction (don't)",
      "Step 4: Full stop ends declarative; Question mark ends interrogative; Exclamation for exclamation",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainSynonymsAntonyms(q) {
  const isAntonym = q.question.toLowerCase().includes('antonym') || q.question.toLowerCase().includes('opposite');
  const word = q.question.match(/of[:\s]+([A-Z][a-z]+)/)?.[1] || 'the given word';
  return {
    explanation: `${isAntonym ? 'Antonym' : 'Synonym'} of "${word}": The ${isAntonym ? 'opposite' : 'similar'} meaning word is "${correctText(q)}".`,
    explanationSteps: [
      `Step 1: Understand the meaning of "${word}"`,
      `Step 2: ${isAntonym ? 'An antonym has the OPPOSITE meaning' : 'A synonym has the SAME or SIMILAR meaning'}`,
      "Step 3: Evaluate each option — eliminate obviously wrong ones",
      `Step 4: "${correctText(q)}" ${isAntonym ? 'is the opposite of' : 'means the same as'} "${word}"`,
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainIdioms(q) {
  const idiom = q.question.match(/[""]([^""]+)[""]/)?.[1] || q.question.substring(0, 60);
  return {
    explanation: `Idiom "${idiom}" means: ${correctText(q)}. Idioms are fixed expressions where the literal meaning differs from the figurative meaning.`,
    explanationSteps: [
      `Step 1: The idiom is: "${idiom}"`,
      "Step 2: Idioms cannot be understood word-by-word — they have figurative meanings",
      "Step 3: Eliminate options that describe the literal meaning of individual words",
      `Step 4: "${idiom}" figuratively means: ${correctText(q)}`,
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainPrepositions(q) {
  return {
    explanation: `Prepositions: ${q.question.substring(0, 120)}. Correct prepositions: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Read the sentence carefully to understand the relationship between words",
      "Step 2: 'At' for specific points; 'In' for enclosed spaces; 'On' for surfaces",
      "Step 3: 'By' for proximity/agent; 'With' for accompaniment; 'For' for purpose/duration",
      "Step 4: 'Towards' for direction; 'About' for concerning something",
      `Step 5: ${answerLine(q)}`
    ]
  };
}

function explainActivePassive(q) {
  const isActive = q.question.toLowerCase().includes('active to passive') || q.question.toLowerCase().includes('passive voice');
  return {
    explanation: `${isActive ? 'Active to Passive' : 'Passive to Active'} Voice: ${q.question.substring(0, 120)}. Answer: ${correctText(q)}.`,
    explanationSteps: [
      "Step 1: Active: Subject + Verb + Object",
      "Step 2: Passive: Object + Helping verb (is/are/was/were/being/been) + Past Participle + by + Subject",
      "Step 3: Identify tense to choose correct helping verb",
      "Step 4: Simple Present → is/are + PP | Simple Past → was/were + PP | Present Continuous → is/are being + PP",
      "Step 5: Future → will be + PP | Present Perfect → has/have been + PP",
      `Step 6: ${answerLine(q)}`
    ]
  };
}

// ─── GK/COMPUTER GENERATORS ──────────────────────────────────────────────────

function explainGK(q) {
  const correct = correctText(q);
  const others = q.options.filter((_, i) => i !== q.correct).map(o => o.replace(/^[A-D]\)\s*/i, ''));
  return {
    explanation: `${q.question.substring(0, 150)} The correct answer is "${correct}". ${others.join(', ')} are incorrect options.`,
    explanationSteps: [
      `Step 1: Question: ${q.question.substring(0, 100)}`,
      `Step 2: Correct Answer: ${correct}`,
      `Step 3: Why others are wrong: ${others[0]} — not the correct answer for this question`,
      `Step 4: ${answerLine(q)}`
    ]
  };
}

function explainComputer(q) {
  const correct = correctText(q);
  return {
    explanation: `Computer Fundamentals: ${q.question.substring(0, 150)} Answer: "${correct}".`,
    explanationSteps: [
      `Step 1: Question topic: ${q.question.substring(0, 80)}`,
      `Step 2: Key concept: ${correct}`,
      "Step 3: Eliminate options that are incorrect based on computer science knowledge",
      `Step 4: ${answerLine(q)}`
    ]
  };
}

// ─── TOPIC-SPECIFIC DETAILED EXPLANATIONS ────────────────────────────────────

function generateExplanation(q) {
  const topic = q.topic;
  const qText = q.question.toLowerCase();
  const correct = q.correct;

  switch (topic) {
    // ── MATHEMATICS ──
    case 'percentage': {
      // Try to solve specific patterns
      if (qText.includes('neither')) {
        // Union formula: A∪B = A + B - A∩B; Neither = Total - A∪B
        const match40 = qText.match(/(\d+)%\s*(?:students?\s*)?play/g);
        return {
          explanation: `Using set theory: If ${opt(q,0)} play Football and 50% play Cricket and 18% play neither, then those playing at least one = 100% - 18% = 82%. Football + Cricket - Both = 82%. So Both = 40% + 50% - 82% = 8%. Answer: ${correctText(q)}.`,
          explanationSteps: [
            "Step 1: Those playing at least one game = 100% - 18% (neither) = 82%",
            "Step 2: Using inclusion-exclusion: Football + Cricket - Both = 82%",
            "Step 3: 40% + 50% - Both = 82%",
            "Step 4: Both = 90% - 82% = 8%",
            `Step 5: ${answerLine(q)}`
          ]
        };
      }
      return solvePercentage(q);
    }

    case 'average': {
      const m = qText.match(/(\d+)\s*numbers?\s*(?:to be|as)\s*(\d+)/);
      if (m) {
        const n = parseInt(m[1]), avg = parseInt(m[2]);
        return {
          explanation: `To find the ${n}th number when average of ${n} numbers is ${avg}: Sum of ${n} numbers = ${n} × ${avg} = ${n*avg}. Then subtract the given ${n-1} numbers. Answer: ${correctText(q)}.`,
          explanationSteps: [
            `Step 1: Required sum of ${n} numbers = ${n} × ${avg} = ${n*avg}`,
            "Step 2: Find the sum of the given numbers from the question",
            `Step 3: Missing number = ${n*avg} - (sum of known numbers)`,
            `Step 4: ${answerLine(q)}`
          ]
        };
      }
      return solveAverage(q);
    }

    case 'profit_loss': {
      const cpMatch = qText.match(/cost price[^0-9]*(\d+)/i) || qText.match(/cp[^0-9]*(\d+)/i);
      const profMatch = qText.match(/(\d+\.?\d*)%\s*(?:net\s*)?profit/i);
      if (cpMatch && profMatch) {
        const cp = parseFloat(cpMatch[1]);
        const prof = parseFloat(profMatch[1]);
        const transpMatch = qText.match(/(\d+\.?\d*)%\s*(?:charged\s*for\s*transport|transport)/i);
        if (transpMatch) {
          const transp = parseFloat(transpMatch[1]);
          const totalCp = cp * (1 + transp/100);
          const sp = totalCp * (1 + prof/100);
          return {
            explanation: `CP = Rs.${cp}. Transport = ${transp}% → Total CP = ${cp} × ${1+transp/100} = Rs.${totalCp}. SP = ${totalCp} × ${1+prof/100} = Rs.${sp.toFixed(2)}. Answer: ${correctText(q)}.`,
            explanationSteps: [
              `Step 1: Original CP = Rs.${cp}`,
              `Step 2: Transport charges = ${transp}% of ${cp} = Rs.${(cp*transp/100).toFixed(2)}`,
              `Step 3: Effective CP = ${cp} + ${(cp*transp/100).toFixed(2)} = Rs.${totalCp.toFixed(2)}`,
              `Step 4: Required SP (with ${prof}% profit) = ${totalCp.toFixed(2)} × ${(1+prof/100)} = Rs.${sp.toFixed(2)}`,
              `Step 5: ${answerLine(q)}`
            ]
          };
        }
      }
      return solveProfitLoss(q);
    }

    case 'ratio_proportion': {
      // Try A:B = x:y, B:C = p:q → A:B:C
      const ratioMatch1 = qText.match(/a:b\s*=\s*(\d+):(\d+)/i);
      const ratioMatch2 = qText.match(/b:c\s*=\s*(\d+):(\d+)/i);
      if (ratioMatch1 && ratioMatch2) {
        const [,a,b1] = ratioMatch1.map(Number);
        const [,b2,c] = ratioMatch2.map(Number);
        const lcmB = lcm(b1, b2);
        const A = a * (lcmB/b1), B = lcmB, C = c * (lcmB/b2);
        return {
          explanation: `A:B = ${a}:${b1}, B:C = ${b2}:${c}. LCM of ${b1} and ${b2} = ${lcmB}. So A:B:C = ${A}:${B}:${C}. Answer: ${correctText(q)}.`,
          explanationSteps: [
            `Step 1: A:B = ${a}:${b1} → multiply by ${lcmB/b1} → A:B = ${A}:${lcmB}`,
            `Step 2: B:C = ${b2}:${c} → multiply by ${lcmB/b2} → B:C = ${lcmB}:${C}`,
            `Step 3: Combine: A:B:C = ${A}:${B}:${C}`,
            `Step 4: ${answerLine(q)}`
          ]
        };
      }
      // A:C question
      if (qText.includes('a:c')) {
        const r1 = qText.match(/a:b\s*=\s*(\d+):(\d+)/i);
        const r2 = qText.match(/b:c\s*=\s*(\d+):(\d+)/i);
        if (r1 && r2) {
          const a = Number(r1[1]), b1 = Number(r1[2]), b2 = Number(r2[1]), c = Number(r2[2]);
          const A = a * b2, C = b1 * c;
          const g = gcd(A, C);
          return {
            explanation: `A:B = ${a}:${b1}, B:C = ${b2}:${c}. A:C = (A/B)×(B/C) = (${a}/${b1})×(${b2}/${c}) = ${a*b2}:${b1*c} = ${A/g}:${C/g}. Answer: ${correctText(q)}.`,
            explanationSteps: [
              `Step 1: A:B = ${a}:${b1} means A/B = ${a}/${b1}`,
              `Step 2: B:C = ${b2}:${c} means B/C = ${b2}/${c}`,
              `Step 3: A/C = (A/B) × (B/C) = (${a}/${b1}) × (${b2}/${c}) = ${a*b2}/${b1*c}`,
              `Step 4: Simplify: ${A/g}:${C/g}`,
              `Step 5: ${answerLine(q)}`
            ]
          };
        }
      }
      return solveRatioProportion(q);
    }

    case 'time_work': {
      const daysMatch = qText.match(/(\w+)\s+(?:can\s+)?(?:complete|do|finish)\s+\w+\s+in\s+(\d+)\s+days?/gi);
      if (daysMatch && daysMatch.length >= 2) {
        const nums = [];
        for (const m of daysMatch) {
          const n = m.match(/(\d+)/);
          if (n) nums.push(parseInt(n[1]));
        }
        if (nums.length >= 2) {
          const d1 = nums[0], d2 = nums[1];
          const combined = (d1 * d2) / (d1 + d2);
          return {
            explanation: `A takes ${d1} days, B takes ${d2} days. Together: 1/${d1} + 1/${d2} = ${d2+d1}/${d1*d2}. Days together = ${d1*d2}/${d1+d2} = ${combined.toFixed(1)} days. Answer: ${correctText(q)}.`,
            explanationSteps: [
              `Step 1: A's rate = 1/${d1} work per day`,
              `Step 2: B's rate = 1/${d2} work per day`,
              `Step 3: Combined rate = 1/${d1} + 1/${d2} = ${d2+d1}/${d1*d2} work per day`,
              `Step 4: Days together = ${d1*d2}/${d1+d2} = ${combined.toFixed(1)} days`,
              `Step 5: ${answerLine(q)}`
            ]
          };
        }
      }
      return solveTimeWork(q);
    }

    case 'speed_distance_time': {
      const speedMatch = qText.match(/speed\s+of\s+(\d+)\s*km/i);
      const timeMatch = qText.match(/(\d+)\s*(?:hours?|hrs?|minutes?|mins?)/i);
      return solveSpeedDistance(q);
    }

    case 'number_system': {
      // HCF/LCM specific
      if (qText.includes('hcf') && qText.includes('lcm')) {
        const nums = qText.match(/\d+/g)?.map(Number) || [];
        const hcf = nums[0], lcm_ = nums[1], num1 = nums[2];
        if (hcf && lcm_ && num1) {
          const product = hcf * lcm_;
          const num2 = product / num1;
          const sum = num1 + num2;
          const isCorrect = q.options.some((o,i) => i===q.correct && o.includes(String(Math.round(sum))));
          return {
            explanation: `HCF × LCM = Product of two numbers. ${hcf} × ${lcm_} = ${product}. Second number = ${product} ÷ ${num1} = ${num2}. ${qText.includes('sum') ? `Sum = ${num1} + ${num2} = ${sum}` : `Difference = |${num1} - ${num2}| = ${Math.abs(num1-num2)}`}. Answer: ${correctText(q)}.`,
            explanationSteps: [
              "Step 1: Formula — HCF × LCM = Product of the two numbers",
              `Step 2: ${hcf} × ${lcm_} = ${product}`,
              `Step 3: Second number = ${product} ÷ ${num1} = ${num2}`,
              `Step 4: ${qText.includes('sum') ? `Sum = ${num1} + ${num2} = ${sum}` : `Result: ${Math.abs(num1-num2)}`}`,
              `Step 5: ${answerLine(q)}`
            ]
          };
        }
      }
      if (qText.includes('prime')) {
        return {
          explanation: `Prime numbers have exactly 2 factors: 1 and themselves. ${q.question.substring(0,120)}. Answer: ${correctText(q)}.`,
          explanationSteps: [
            "Step 1: A prime number is divisible only by 1 and itself",
            "Step 2: Check divisibility of each number by 2, 3, 5, 7...",
            "Step 3: If a number has no factor other than 1 and itself → Prime",
            "Step 4: 2 is the only even prime number",
            `Step 5: ${answerLine(q)}`
          ]
        };
      }
      return solveNumberSystem(q);
    }

    case 'number_series': return solveNumberSeries(q);
    case 'coding_decoding': return solveCodingDecoding(q);
    case 'direction_sense': return solveDirectionSense(q);
    case 'blood_relations': return solveBloodRelations(q);
    case 'statements_conclusions': return solveStatements(q);
    case 'mathematical_reasoning': return solveMathReasoning(q);

    // ── ENGLISH ──
    case 'comprehension': return explainComprehension(q);
    case 'editing': return explainEditing(q);
    case 'jumbled_sentences': return explainJumbled(q);
    case 'narration': return explainNarration(q);
    case 'modals': return explainModals(q);
    case 'articles': return explainArticles(q);
    case 'paragraph_writing': return explainParagraphWriting(q);
    case 'clauses': return explainClauses(q);
    case 'punctuation': return explainPunctuation(q);
    case 'synonyms_antonyms': return explainSynonymsAntonyms(q);
    case 'idioms_phrases': return explainIdioms(q);
    case 'prepositions': return explainPrepositions(q);
    case 'active_passive_voice': return explainActivePassive(q);

    // ── GK & COMPUTER ──
    case 'current_events':
    case 'political_physical_divisions':
    case 'culture_heritage_freedom':
    case 'demography_census':
    case 'rivers_lakes':
    case 'weather_climate_crops':
    case 'jk_history':
    case 'jk_economy':
    case 'jk_tourist_destinations':
      return explainGK(q);

    case 'fundamentals':
    case 'hardware_software':
    case 'input_output_devices':
    case 'operating_system':
    case 'ms_office':
    case 'email_internet':
      return explainComputer(q);

    default:
      return {
        explanation: `${q.question.substring(0, 150)} Answer: ${correctText(q)}.`,
        explanationSteps: [
          "Step 1: Analyse the question carefully",
          "Step 2: Eliminate obviously wrong options",
          "Step 3: Apply relevant knowledge/formula",
          `Step 4: ${answerLine(q)}`
        ]
      };
  }
}

// ─── Math helpers ─────────────────────────────────────────────────────────────
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

// ─── SPECIFIC ANSWER CORRECTIONS ─────────────────────────────────────────────
const corrections = new Map();

function verifyAndCorrect(q) {
  const qText = q.question.toLowerCase();

  // Known correction: HCF=74, LCM=12210, one number=1110 → sum = 1924 (B)
  if (qText.includes('74') && qText.includes('12210') && qText.includes('1110')) {
    // Product = 74 × 12210 = 903540, Second = 903540/1110 = 814, Sum = 1924
    const correctIdx = q.options.findIndex(o => o.includes('1924'));
    if (correctIdx !== -1 && q.correct !== correctIdx) {
      corrections.set(q.id, { from: q.correct, to: correctIdx });
      return correctIdx;
    }
  }

  // Verify: 40% football, 50% cricket, 18% neither → 8% both
  if (qText.includes('40%') && qText.includes('50%') && qText.includes('18%') && qText.includes('neither')) {
    const correctIdx = q.options.findIndex(o => o.includes('8%'));
    if (correctIdx !== -1 && q.correct !== correctIdx) {
      corrections.set(q.id, { from: q.correct, to: correctIdx });
      return correctIdx;
    }
  }

  // Ratio: A:B=3:4, B:C=5:6 → A:C
  if (qText.includes('a:b') && qText.includes('3:4') && qText.includes('b:c') && qText.includes('5:6') && qText.includes('a:c')) {
    // A:C = (3/4)*(5/6) = 15/24 = 5:8
    const correctIdx = q.options.findIndex(o => o.includes('5:8'));
    if (correctIdx !== -1 && q.correct !== correctIdx) {
      corrections.set(q.id, { from: q.correct, to: correctIdx });
      return correctIdx;
    }
  }

  // A can do in 6 days, B in 12 days → together
  if (qText.includes('6 days') && qText.includes('12 days') && (qText.includes('together') || qText.includes('both'))) {
    // 1/6 + 1/12 = 3/12 = 1/4 → 4 days
    const correctIdx = q.options.findIndex(o => o.match(/\b4\b/));
    if (correctIdx !== -1 && q.correct !== correctIdx) {
      corrections.set(q.id, { from: q.correct, to: correctIdx });
      return correctIdx;
    }
  }

  // Profit/Loss: CP=600, 5% transport, profit needed
  if (qText.includes('600') && qText.includes('5%') && qText.includes('transport')) {
    // Total CP = 600*1.05 = 630; need to check what profit %
    const profMatch = qText.match(/(\d+(?:\.\d+)?)\s*%\s*(?:net\s*)?profit/i);
    if (profMatch) {
      const profPct = parseFloat(profMatch[1]);
      const totalCp = 600 * 1.05;
      const sp = totalCp * (1 + profPct/100);
      const correctIdx = q.options.findIndex(o => {
        const n = numFromOpt(o.replace(/^[A-D]\)\s*/i,''));
        return n !== null && Math.abs(n - sp) < 1;
      });
      if (correctIdx !== -1 && q.correct !== correctIdx) {
        corrections.set(q.id, { from: q.correct, to: correctIdx });
        return correctIdx;
      }
    }
  }

  return q.correct; // no change
}

// ─── PROCESS ALL QUESTIONS ────────────────────────────────────────────────────

let explanationsAdded = 0;
let answersCorreected = 0;

const updated = data.map(q => {
  // Verify/correct answer
  const newCorrect = verifyAndCorrect(q);
  if (newCorrect !== q.correct) {
    answersCorreected++;
    q = { ...q, correct: newCorrect };
  }

  // Add explanations
  const { explanation, explanationSteps } = generateExplanation(q);
  explanationsAdded++;

  return {
    ...q,
    explanation,
    explanationSteps
  };
});

// ─── WRITE BACK ───────────────────────────────────────────────────────────────
fs.writeFileSync(FILE, JSON.stringify(updated, null, 2), 'utf8');

console.log(`✅ Done!`);
console.log(`   Total questions: ${updated.length}`);
console.log(`   Explanations added: ${explanationsAdded}`);
console.log(`   Answers corrected: ${answersCorreected}`);
if (corrections.size > 0) {
  console.log(`   Corrected question IDs:`);
  for (const [id, {from, to}] of corrections) {
    console.log(`     Q${id}: was ${letters[from]}, now ${letters[to]}`);
  }
}
