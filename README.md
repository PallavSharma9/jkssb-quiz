# JKSSB Junior Assistant Quiz App

A mobile-first practice quiz app built for candidates preparing for the **JKSSB Junior Assistant** examination. It covers all four sections of the syllabus with 2,112 questions, verified correct answers, and detailed step-by-step explanations.

---

## What You Are Studying

The JKSSB Junior Assistant exam tests four subjects. This app covers all of them:

| Section | Questions | Topics |
|---|---|---|
| General English | 445 | Comprehension, Grammar, Vocabulary, Idioms, Voice, Narration |
| General Awareness (J&K Focus) | 760 | J&K History, Economy, Tourism, Indian Culture, Current Events, Geography |
| Numerical & Reasoning Ability | 426 | Number System, Percentage, Average, Profit & Loss, Ratio, Time & Work, Speed, Coding-Decoding, Direction Sense, Blood Relations |
| Basic Concepts of Computers | 481 | Hardware, Software, OS, MS Office, Email & Internet |

**Total: 2,112 questions** across 41 topics.

---

## Features

- **Topic-wise practice** — pick any topic and start instantly
- **Instant feedback** — green for correct, red for wrong, after every answer
- **Step-by-step explanations** — every question shows a detailed explanation with actual calculations (not just the answer)
- **Bookmarks** — save any question with one tap to review later
- **Progress tracking** — see how many questions you have attempted per topic
- **Mobile-first design** — works on any phone browser, no app install needed

---

## Screenshots

> Coming soon

---

## Run It Locally

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/PallavSharma9/jkssb-quiz.git
cd jkssb-quiz

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
jkssb-quiz-app/
├── app/
│   ├── page.tsx              # Home screen — topic selection
│   ├── quiz/[topic]/         # Quiz page for each topic
│   └── bookmarks/            # Saved/bookmarked questions
├── data/
│   └── questions.json        # All 2,112 questions with answers & explanations
├── lib/
│   ├── units.ts              # Unit and topic metadata
│   ├── bookmarks.ts          # Bookmark logic (localStorage)
│   └── progress.ts           # Progress tracking (localStorage)
├── types/
│   └── index.ts              # TypeScript types
└── scripts/
    └── fix_all.js            # Script used to verify answers and generate explanations
```

---

## Tech Stack

- **[Next.js 14](https://nextjs.org/)** — React framework (App Router)
- **[Tailwind CSS](https://tailwindcss.com/)** — Styling
- **TypeScript** — Type safety
- All data is local — no backend, no login required

---

## Data Quality

Every question has been:
- Cross-verified for correct answer accuracy
- Given a specific explanation (not a generic template) — math questions show full arithmetic, English questions cite grammar rules, GK questions state the exact fact

---

## License

This project is for educational purposes. Question content is based on JKSSB exam pattern and publicly available material.
