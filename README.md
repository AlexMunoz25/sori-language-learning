# Sori

A mobile-first Korean trainer for vocabulary, connectors, and particles. Listen, make a sound association, reveal the meaning, see it at work in sentences, and revisit difficult cards.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server binds to `0.0.0.0`; to use your phone on the same Wi-Fi, open the **Network** URL printed by Vite. Allow your computer's firewall to accept the connection if needed.

## Study

- **Sections:** **Vocabulary**, **Connectors** (그리고, -지만, -아서/어서 …), and **Particles** (은/는, 이/가, 에서 …), switched with the tabs under the brand (in the header on wide screens). Each section has the same modes and tools and keeps its own place, category, and Difficult pile. See [Connectors and Particles](docs/grammar-cards.md).
- **Standard:** Korean first, then optional pronunciation, Memory Anchor, Roots, and meaning. Each reveal is independent. Connector and particle cards add a row of four tiles, so a closed card still fits one screen: **Examples** (three sentences with the studied piece highlighted, each playable), **Usage rules** (every form and when it's used, attachment, limits, exceptions), **Memory tricks**, and **Comparisons** with look-alikes (은/는 vs 이/가, -고 vs 그리고).
- **Memory Anchor:** three candidates per word until you pick the one that sticks; then only your pick shows, with a small Change button. Rate it, write your own, or ask for new ideas. One, three, and seven days after a pick, Meaning asks whether you remembered the word; an anchor that keeps failing gets a gentle nudge, never an automatic switch.
- **Listening:** tap Normal or Slow, or **Show meaning** to recall the word from its English meaning instead (no Korean is shown). Write the word on the pad with a finger, pen, or mouse. Below it: **Pen** and **Eraser** (tap a stroke to erase just that stroke, or swipe across several), **Undo** (steps back through drawing, erasing, and clearing), and **Clear all**. Then **Reveal word** to see the correct Korean directly under your writing. The meaning and the word reveal independently. **Learn** opens the same word in Standard mode with its Memory Anchor showing. The pad stores strokes as normalized points with timings, ready for handwriting recognition later; writing on it never swipes to another card.
- **Test:** evaluates recall. It draws from the current section, collection, and category (so the Difficult collection tests your difficult cards), asks one question at a time, and alternates randomly between **Korean → English** (type the meaning) and **English → Korean** (write the word on the pad, with Pen, Eraser, Undo, and Clear all). Connectors and particles take **Korean → English** and **Complete the sentence** instead: one of the card's sentences with its piece blanked and the English below; pick one of four options, and the review shows the full sentence and why it fits.
  - **Hint** gives a nudge that never states the answer, one at a time: your saved Memory Anchor with the meaning blanked out (Korean → English) or its sound keywords cut to a first letter (English → Korean), then a clue about the meaning or the word's shape (syllables and first sound). In Complete the sentence, a clue about the missing piece's job, then **Fewer options**, which takes two wrong options away. Any hint makes a correct answer worth ½ point.
  - **Check answer** grades the answer for you. Typed meanings count with any sense, a reviewed synonym, another form (*swim* for swimming), or a small typo in a longer word; the meaning of a different word never counts (*warm* for 더워요 is 따뜻해요), and close or partial answers are your call, with the answer in view. Handwriting is read by Google's handwriting recognition (only the strokes are sent) and graded against the word, its dictionary form, and same-meaning words; when the reading is in doubt, you say which reading you wrote, or compare your writing with the answer, before anything is graded. If it can't be read (offline), you try again or judge it yourself. See [Reading handwritten Korean](docs/handwriting-recognition.md).
  - The review shows the correct answer next to yours (under your handwriting for written answers, with what was read), the points awarded (1, ½ with a hint, 0), the dictionary form, look-alikes that also count, a note, and audio. If the app misread your writing or missed a synonym, say so; your call can be undone until you move on. The running score sits beside the question count.
  - **Results** show points and percentage, how many were correct, correct with a hint, and incorrect, and every answer (your writing, what was read, hints used). **Retake test** asks the same words again in a new order and new directions, with score, hints, and answers reset; **New test** prefers words you haven't been tested on yet. Add incorrect words to Difficult, or, testing from Difficult, mark words answered without hints as Known.
  - Choose 10, 20, or all words and which question types to use (only the types that can ask the chosen cards are offered); both are remembered. A test never repeats a word or prompt and skips look-alikes (채소/야채) unless it needs them. **End test** shows results for the questions answered so far. Arrow keys, the collection bar, and the category picker are paused during a test so nothing moves your deck.
- Choose a category to start a shuffled deck. Swipe across the word, use Previous / Next, or press the left / right arrow keys. A completed deck reshuffles without immediately repeating the last card.
- Mark **Difficult** to revisit words in the Difficult collection; **Known** removes a difficult mark. Tap an active mark to clear it.
- Marks, preferences, and anchor choices, ratings, and recall checks live in localStorage. The guide (?) downloads the anchor feedback as JSON for the next round of anchor improvements. The current deck and position, and the test in progress (including unchecked answers, hints, and readings), live in sessionStorage; test settings live in localStorage. There is no account or synchronization. Different browser origins/devices have separate progress.

## Vocabulary

`vocabulary.md` is authoritative. **All 282 table rows** are included, along with the meaningful examples and category words in the prose:

| Import | Cards |
| --- | ---: |
| Table rows, with four alternative forms split into separate cards | 286 |
| Category vocabulary not already in the tables | 15 |
| Phrases outside the tables | 24 |
| **Total, across 17 categories** | **325** |

All 325 cards have reviewed reading guides, **three Memory Anchor candidates**, and an origin record; **262** have a sourced Roots aid. Each anchor ties the Korean sound to its meaning through something familiar: an English, Spanish, or French sound-alike, a well-known reference, or the source word of a loanword (light BULB → 밝아요, *bright*). Where a word genuinely breaks into meaningful parts, **one candidate explains them instead**, part by part, using only what its Roots record verifies: 공 (空) gong = AIR + 항 (港) hang = PORT → air-port; 말 mal = WORDS + 해요 hae-yo = DO → doing speech: to speak (122 cards; days of the week connect to the same planets as lunes or martes). The seven anchors the learner rated five stars are kept verbatim and preselected. The principles come from the learner's own ratings; see [the feedback analysis](docs/anchor-feedback-analysis.md). Phrase cards chain the hooks of their words. The Memory Anchor reveal includes the meaning as a retrieval prompt; it is a learning aid.

**Memory Anchor** and **Roots** open independently. A sound-alike hook is labeled as a phonetic mnemonic. An anchor that rests on verified parts is labeled as such, with **≈** marking any sound-alike inside it; a loanword is labeled as a borrowed word. Word-building explanations and conjugation patterns live in Roots, which provides the research and up to five related cards, each explaining the shared component and its meaning. For example, 도서관 and 서점 share 서 (書), writing/books; 학교 and 교실 do not share a 교 root.

See [Writing Memory Anchors](docs/memory-anchors.md) and [the full research audit](docs/roots-research.md). Sources are NIKL dictionary/advice pages and Wiktionary entries, with links inside Roots. Uncertain or unhelpful origins are omitted. No dictionary requests occur while studying.

The source parser is `src/data/source.ts`; its structured output is `src/data/vocabulary.generated.json`. `src/data/vocabulary.ts` combines that data with `memory-aids.ts` and the typed origin/component/source registries.

After changing the source:

```sh
npm run data:generate
# Review memory aids, origins, components, and sources for new/changed entries.
npm run data:validate
```

The validator checks every Hangul table row, all Korean prose, exact source meanings, unique IDs, and reviewed memory-aid/reading-guide coverage. It also checks all origin reviews, evidence references, component identities, and related-card edges. It requires sourced Roots evidence for any factual anchor and allows intentionally absent roots. Each card retains its source line and original source text. See [Vocabulary notes](docs/vocabulary-notes.md) for interpretation decisions.

## Connectors and particles

Two sections written from research rather than a source table:

| Section | Categories | Cards |
| --- | --- | ---: |
| Connectors | Adding & choosing 6 · Contrast 7 · Reason & purpose 6 · Condition & sequence 4 | 23 |
| Particles | Sentence roles 4 · Place & time 5 · People & together 5 · Focus & comparison 7 | 21 |
| **Total** | | **44** |

Each card has a reading guide, audio text (its forms, or short words built on an ending: 먹고, 가는데), every form and when it's used, three polite example sentences with English (132 in all), each with three wrong options and a one-line why, two to four usage rules, one to three memory tricks, comparisons with its look-alikes, three Memory Anchor candidates, a test clue, and reviewed synonyms. **42** have a sourced Roots aid, and **19** get a root-based anchor because their record derives them from parts (그래 + 도 → 그래도, 밖 + 에 → 밖에, 붙 + 어 → 부터 from NIKL's history notes). Where the sources don't settle an origin (-는데, -(으)니까, 에게/한테, (이)랑), the record says so and the card keeps three sound hooks, as does 그리고, which no source splits. In Roots, phrases link to the particles they use (날씨가 더워요 ↔ 이/가, 무슨 운동을 해요? ↔ 을/를).

The content lives in `src/data/grammar.ts`, the `grammarEntries` block of `memory-aids.ts`, the origin JSON files, and `recall-data.ts`, keyed by card id (`connector:그리고`, `particle:은/는`). See [Connectors and Particles](docs/grammar-cards.md) for the card layers, the test, and the writing standards.

## Audio

Audio uses the browser's Web Speech API only. It sets `ko-KR`, prefers a local Korean voice (the neutral Yuna voice when available), handles delayed `voiceschanged`, and cancels previous speech before starting another utterance. Normal is `0.85`; Slow is `0.6`. Navigating away from a card stops playback. Speech never starts without a tap or click.

There are no audio files, API keys, or external TTS requests from this application. Installed voices, pronunciation quality, and whether a system voice requires connectivity depend on the browser and OS. A Korean device voice gives the best result; this cannot be bundled with a web app. The app continues to work when speech is unsupported or fails.

Implementation references: [Web Speech voice loading](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event), [Vite](https://vite.dev/guide/), and [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Checks

```sh
npm run build       # Source coverage, TypeScript, and production build
npm test            # Playwright (uses installed Google Chrome)
node scripts/check-speech.mjs  # Native speech probe; dev server must be running
```

Browser tests cover 375×667, 390×844, 430×932, and desktop layouts; independent reveals; both modes; writing on the Listening pad (strokes, the stroke eraser, undo, clear all, palm rejection, no accidental swipes), the independent meaning and word reveals, and Learn; Test mode (question generation over many seeded shuffles, answer keys, typed-answer grading with synonyms, typos, negation, and other words' meanings, handwriting grading including the recognizer's recorded answers to 1,692 synthetic handwriting samples, hints that never state the answer across all 1,107 anchors, scoring, both question types, doubtful readings, recognition failures and retries, corrections and undo, Enter handling, results, Retake, Difficult/Known marks, End test, resuming after mode switches and reloads including mid-reading, malformed saved tests, phone fit); the data check also requires a clue for every card that never says the answer, and that every reviewed synonym is accepted; root-based anchors (one per decomposable word, part-by-part layout, rated anchors kept, homophones never linked); category counts/filtering; saved marks; shuffle/navigation; gestures; missing speech support; Connectors and Particles (section switching that remembers each deck, per-section Difficult piles, every card's layers, playable examples, the shared anchor chooser, particle ↔ phrase links, Complete the sentence options, saves, hints, grading, and phone fit, and Korean → English hints that never give a connector or particle away); independently revealed Roots and Memory Anchors; evidence links; and regressions for misleading shared syllables. Speech API behavior and the handwriting recognizer are mocked in the repeatable suite; the separate native probe checks actual start/end events for both rates. It cannot judge the sound subjectively or substitute for listening on a physical iPhone.

## Test modes

A test mode has two halves, both keyed by the same id:

- **Rule**, in `src/recall/questionRules.ts`. It holds no UI:
  - the answer kind (`text`, `ink`, or `choice`) and which cards the mode supports (English → Korean: words only; Complete the sentence: connectors and particles);
  - what the learner sees (`promptKey`, so no prompt repeats);
  - the answer key (expected answer plus what else counts and why);
  - `evaluate`, which reads and grades an answer (synchronously, or as a promise for handwriting), `grade` for a reading the learner gives, and `hints`, subtlest first.
- **View**, in `src/components/testTypes.tsx`: labels, the prompt, the revealed solution, and which word notes the review adds.

Setup, generation, saving, the answer field, review, and results pick up a new mode automatically, and it starts switched on for existing users. Setup offers only the modes that can ask the chosen cards. A rule may also `prepare` a per-question `data` payload when the test is built, with `parseData` to validate it on restore; the answer key, evaluation, hints, prompt, and solution receive it. Complete the sentence uses it for the chosen sentence and its four options in display order.

The pieces stay separate so later modes can replace one at a time:

- `src/recall/generate.ts` (pure, with injectable randomness) builds a test in three steps:
  - choose distinct words, fresh ones first and look-alikes only when needed;
  - give each word a type, in balanced shares with no repeated prompt;
  - order the questions, with no more than 3 of one type in a row and look-alikes apart.
- `src/recall/answers.ts` holds the answer keys, which respect the speaker and the dictionary form.
- Validation, deterministic and separate per language:
  - `src/recall/english.ts` grades typed meanings: senses and optional brackets, forms (a light stem), spacing, British spellings, typos allowed by word length, negation, and a closed-vocabulary guard so another word's meaning is never a typo. Curated synonyms and clues are in `src/data/recall-data.ts`.
  - `src/recall/korean.ts` compares Hangul by letters (jamo) against the answer key.
- Recognition: `src/recall/handwriting.ts` holds an interchangeable `HandwritingRecognizer` (Google's handwriting engine today; an on-device model could replace it, see the [research](docs/handwriting-recognition.md)) and `gradeReading`, which turns its candidates into correct, incorrect, or a question for the learner.
- `src/recall/hints.ts` derives hints from the saved anchor and the card, masking the meaning and the word's own reading.
- `src/recall/scoring.ts` scores: 1 point, ½ with any hint, 0 when incorrect; answers still awaiting the learner never count.
- `src/hooks/useTestSession.ts` runs and saves the session, reads handwriting in the background (once, even across reloads), and records the learner's calls.
- `src/components/TestView.tsx` renders setup, questions, hints, confirmations, review, and results.

Each answer stores the app's evaluation (`auto`: correct, incorrect, or uncertain, with what was read) apart from the learner's own call (`self`, plus a `corrected` reading for handwriting), and the hints used. The learner's call wins; an uncertain evaluation is never a grade on its own. Scores are always derived from the answers, so no question counts twice.

## Structure and future hosting

React + TypeScript + Vite + Tailwind CSS + Lucide. Static assets only; no backend, database, or authentication. The one runtime request is reading handwritten test answers (Google's keyless handwriting endpoint, ink only); without it, the learner judges written answers. `npm run build` writes the self-contained site to `dist/`, ready for a later static Cloudflare deployment. **Nothing has been deployed.** No Cloudflare resources or configuration are created in this version.

A web manifest, SVG icon, standalone display metadata, and iOS safe-area support are included. A service worker, raster home-screen icons, and offline caching are left for the PWA follow-up, so development does not accumulate stale cached versions. This version does not promise offline installation.
