# Sori

A mobile-first Korean trainer built around Memory Anchors. Learn a few words and grammar points at a time in guided units, explore everything in the Library, and come back in Review just before you'd forget.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server binds to `0.0.0.0`; to use your phone on the same Wi-Fi, open the **Network** URL printed by Vite. Allow your computer's firewall to accept the connection if needed.

## Learn, Library, Review

Every concept, a word or a grammar point, is one card, and the same card, with the same Memory Anchor, appears in three places, switched with the bar at the bottom of the screen:

| Place | What it's for |
| --- | --- |
| **Learn** | Guided units: meet a few cards at a time, give each one an anchor, see it at work, then recall and use it. |
| **Library** | Every card, to explore: Vocabulary and Grammar, with every reveal, Listening, and search. |
| **Review** | What's due today, tests on anything, and the Difficult pile. The bar shows how many cards are due. |

Together they run the learning cycle: hear → form an anchor → understand in context → recall → apply → revisit. Scheduling, the recall log, and storage are described in [Learn, Library, Review](docs/learn-and-review.md).

### Learn

Fourteen units (83 cards), each pairing one or two grammar points with the words they put to work, so every unit ends with something to say. *Who you are* is -이에요/예요 and 은/는 with job words; later units cover where you go, what you did, plans and wishes, asking nicely, speech levels, and respectful words.

- A unit meets its cards two or three at a time: hear each one, choose or write its Memory Anchor, see it in a sentence, and, for grammar, how it attaches.
- After each group comes a short practice: every card's meaning, typed, then each card at work, in **Complete the sentence** or, for endings and tenses, **Build the form** on the unit's own words (먹다 → 먹었어요 in *What you did*). Practice is graded like a test, with hints at half a point.
- Practice answers schedule the cards in Review like any other answer: recalled without help, a card comes back in three days; with a hint or forgotten, tomorrow. The next unit is marked *Up next*, and anything due in Review shows above the units.

### Library

- **Vocabulary and Grammar**, switched with the tabs under the brand (in the header on wide screens). Each half keeps its own deck and place. The picker chooses a category or, for grammar, a whole collection (Particles, Connectors, Endings, Tenses, Speech levels, Honorifics); **Difficult only** narrows either to the Difficult pile. See [Grammar](docs/grammar-cards.md).
- **Standard:** Korean first, then optional pronunciation, Memory Anchor, Roots, and meaning. Each reveal is independent. A word's meaning comes with an example sentence that uses it, highlighted and playable. Grammar cards add a row of four tiles, so a closed card still fits one screen: **Examples** (three sentences with the studied piece highlighted, each playable), **Usage rules** (every form and when it's used, attachment, limits, exceptions), **Memory tricks**, and **Comparisons** with look-alikes (은/는 vs 이/가, -고 vs 그리고).
- **Memory Anchor:** a word's candidates are grouped in three kinds: **Sounds like** (sound-alikes in English, Spanish, French, Italian, Portuguese, or German), **Korean roots** (the word's verified parts, or the pattern or family it belongs to), and **Heard in Korean media** (the word sung or spoken in a real song or show: the line with the word highlighted, its English, **Play from** the second before the line, and the **Music video**; nothing loads from YouTube until you press play). They show until you pick the one that sticks; then only your pick shows, with a small Change button. Rate it, write your own, or ask for new ideas. Hooks in a language you haven't said you know wait under *More ideas in other languages*. Once a card has been tested, the anchor shows how it did while it was the one in use (*In tests and reviews: 2 of 3 recalled*), and each candidate shows its own tally. One, three, and seven days after a pick, Meaning asks whether you remembered the word; an anchor that keeps failing gets a gentle nudge, never an automatic switch.
- **Listening:** tap Normal or Slow, or **Show meaning** to recall the word from its English meaning instead (no Korean is shown). Write the word on the pad with a finger, pen, or mouse. Below it: **Pen** and **Eraser** (tap a stroke to erase just that stroke, or swipe across several), **Undo** (steps back through drawing, erasing, and clearing), and **Clear all**. Then **Reveal word** to see the correct Korean directly under your writing. The meaning and the word reveal independently. **Study** opens the same card in Standard mode with its Memory Anchor showing. The pad stores strokes as normalized points with timings; writing on it never swipes to another card.
- **Search** (the magnifier): Korean with or without spaces and hyphens, a dictionary form (먹다 finds 먹어요), or an English meaning or accepted synonym. A result opens its card in the Library.
- Swipe across the word, use Previous / Next, or press the left / right arrow keys. A completed deck reshuffles without immediately repeating the last card.
- Mark **Difficult** to revisit a card in the Difficult pile, and in Review today; **Known** removes a difficult mark. Tap an active mark to clear it.

### Review

- **Due today:** cards from Learn, tests, and Difficult marks come back on a spaced-repetition schedule. Recalled without help, a card moves up a box and waits longer (1, 3, 7, 14, 30, 60, then 120 days); with a hint, it stays; forgotten, it's back tomorrow. **Start review** asks up to 20, most overdue first, graded like a test, and the results say when they come back.
- **Tests** evaluate recall on the Library's current selection (**Change** picks another), one question at a time, mixing the question types that can ask the chosen cards:
  - **Korean → English:** type the meaning (for grammar, the meaning or the job: *but*, *topic marker*).
  - **English → Korean** (words only): write the word on the pad, with Pen, Eraser, Undo, and Clear all.
  - **Complete the sentence:** a sentence with the card blanked and the English below; pick one of four options, and the pick fills the blank. Grammar uses its example sentences, with wrong options that test real confusions; words use their example sentence, with three words of the same kind.
  - **Build the form** (endings, tenses, speech levels, -(으)시-): one of your words and the form wanted (먹다 → Past · polite); pick the right form from four, where the wrong ones are real mistakes (먹았어요). The review explains how the word takes the ending.
  - **Hint** gives a nudge that never states the answer, one at a time: your saved Memory Anchor with the meaning blanked out (Korean → English) or its sound keywords cut to a first letter (English → Korean), then a clue about the meaning or the word's shape (syllables and first sound). Choice questions start with a clue (the piece's job, the word's shape, or the rule for this word) and then offer **Fewer options**, which takes two wrong options away. Any hint makes a correct answer worth ½ point.
  - **Check answer** grades the answer for you. Typed meanings count with any sense, a reviewed synonym, another form (*swim* for swimming), or a small typo in a longer word; the meaning of a different word never counts (*warm* for 더워요 is 따뜻해요), and close or partial answers are your call, with the answer in view. Handwriting is read by Google's handwriting recognition (only the strokes are sent) and graded against the word, its dictionary form, and same-meaning words; when the reading is in doubt, you say which reading you wrote, or compare your writing with the answer, before anything is graded. If it can't be read (offline), you try again or judge it yourself. See [Reading handwritten Korean](docs/handwriting-recognition.md).
  - The review shows the correct answer next to yours (under your handwriting for written answers, with what was read), the points awarded (1, ½ with a hint, 0), the dictionary form, look-alikes that also count, a note, and audio. If the app misread your writing or missed a synonym, say so; your call can be undone until you move on. The running score sits beside the question count.
  - **Results** show points and percentage, how many were correct, correct with a hint, and incorrect, and every answer (your writing, what was read, hints used). **Retake test** asks the same cards again in a new order and new directions, with score, hints, and answers reset; **New test** prefers cards you haven't been tested on yet. Add incorrect cards to Difficult, or, testing from Difficult, mark cards answered without hints as Known.
  - Choose 10, 20, or all cards and which question types to use (only the types that can ask the chosen cards are offered); both are remembered. A test never repeats a card or prompt and skips look-alikes (채소/야채) unless it needs them. **End test** shows results for the questions answered so far. A running test or review stays where it is when you visit Learn or the Library, or reload.
  - Every graded answer, in a test, a review, or a lesson's practice, also reschedules its card and is logged with the anchor you had chosen.
- **Difficult:** each half's Difficult pile, to **Study** in the Library or **Test**.

### Languages

The 文A button in the header, or *Change languages* in Learn, says which languages you know. English, the app's language, is always on; the deck starts with English, Spanish, and French. Anchors whose hook is in one of your languages join the main list. Speakers of Italian, Portuguese, or German get an extra hook in their language on some cards (24, 31, and 33 cards so far), alongside the English, Spanish, and French ones.

### Saved progress

Marks, preferences, anchor choices, ratings, and recall checks, the Review schedule, the recall log, Learn progress, languages, and test settings live in localStorage. The current deck, and any running test, review, or lesson practice (including unchecked answers, hints, and readings), live in sessionStorage. There is no account or synchronization; different browser origins and devices have separate progress. The guide (?) downloads the anchor feedback as JSON (choices, ratings, recall checks, each anchor's tally in tests, and your languages) for the next round of anchor improvements. Every key is listed in [Learn, Library, Review](docs/learn-and-review.md#storage).

## Vocabulary

`vocabulary.md` is authoritative. **All 282 table rows** are included, along with the meaningful examples and category words in the prose:

| Import | Cards |
| --- | ---: |
| Table rows, with four alternative forms split into separate cards | 286 |
| Category vocabulary not already in the tables | 15 |
| Phrases outside the tables | 24 |
| **Total, across 17 categories** | **325** |

All 325 cards have reviewed reading guides and an origin record; **262** have a sourced Roots aid. Each word offers **five or six Memory Anchor candidates** where good ones exist (171 words; 80 have four and 74 three, because a slot stays empty rather than hold a weak candidate), 1,482 in all:

| Kind | Candidates | Example |
| --- | ---: | --- |
| Sounds like | 818: three per word, or two where a third would be weak (157 words) | A light BULB: bright → 밝아요; Siberian CHAGA — WHOA, YO! It's cold → 차가워요 |
| Korean roots | 325: one per word, 165 on verified parts and 160 on a pattern or word family | 예쁘다 → 예뻐요: the ㅡ drops, as in 바쁘다 → 바빠요 |
| Heard in Korean media | 339 on 199 words: 318 song lines by 122 artists and 21 show, film, and animation titles | BTS, 봄날 (Spring Day): “그 [봄]날이 올까”, played from 0:46 |

Each sound hook ties the Korean sound to its meaning through something familiar: a sound-alike in a language the learner knows, a well-known reference, or the source word of a loanword (light BULB → 밝아요, *bright*). Where a word genuinely breaks into meaningful parts, **one candidate explains them instead**, part by part, using only what its Roots record verifies: 공 (空) gong = AIR + 항 (港) hang = PORT → air-port; 말 mal = WORDS + 해요 hae-yo = DO → doing speech: to speak (122 cards; days of the week connect to the same planets as lunes or martes). The seven anchors the learner rated five stars are kept verbatim and preselected, and the learner's own examples (CHAGA, HIM + DURO, MASH, ILL, IORI) are kept verbatim. The principles come from the learner's own ratings; see [the feedback analysis](docs/anchor-feedback-analysis.md). Phrase cards chain the hooks of their words. The Memory Anchor reveal includes the meaning as a retrieval prompt; it is a learning aid.

Every word, all but the 24 phrases, has an **example sentence**: natural polite Korean with English, reusing the learner's vocabulary, with the word in brackets (하루에 [사과]를 하나 먹어요). It shows under Meaning, when Learn meets the word, and in Complete the sentence. The 301 sentences are in `src/data/word-examples.ts`.

**Memory Anchor** and **Roots** open independently. A sound-alike hook is labeled as a phonetic mnemonic. An anchor that rests on verified parts is labeled as such, with **≈** marking any sound-alike inside it; a loanword is labeled as a borrowed word. Word-building explanations and conjugation patterns live in Roots, which provides the research and up to five related cards, each explaining the shared component and its meaning. For example, 도서관 and 서점 share 서 (書), writing/books; 학교 and 교실 do not share a 교 root.

Media moments are never written from memory: each line is checked against the song's timed lyrics on LRCLIB, each upload is official and checked through YouTube's oEmbed, and a start second is kept only when the official audio is exactly as long as the timed track (307 of 339). Words without a genuine moment have none. New words go through the same pipeline: `npm run anchors:packets` (research packets), [the brief](docs/anchor-brief.md), `npm run anchors:apply`, and `npm run anchors:culture` (`--recheck` re-runs every check, since links rot).

See [Writing Memory Anchors](docs/memory-anchors.md) and [the full research audit](docs/roots-research.md). Sources are NIKL dictionary/advice pages and Wiktionary entries, with links inside Roots. Uncertain or unhelpful origins are omitted. No dictionary requests occur while studying.

The source parser is `src/data/source.ts`; its structured output is `src/data/vocabulary.generated.json`. `src/data/vocabulary.ts` combines that data with `memory-aids.ts` and the typed origin/component/source registries.

After changing the source:

```sh
npm run data:generate
# Review memory aids, origins, components, sources, and example sentences for new/changed entries.
npm run data:validate
```

The validator checks every Hangul table row, all Korean prose, exact source meanings, unique IDs, and reviewed memory-aid/reading-guide coverage. It also checks all origin reviews, evidence references, component identities, and related-card edges. It requires sourced Roots evidence for any factual anchor and allows intentionally absent roots. Each card retains its source line and original source text. See [Vocabulary notes](docs/vocabulary-notes.md) for interpretation decisions.

## Grammar

Six collections, written from research rather than a source table:

| Collection | Categories | Cards |
| --- | --- | ---: |
| Particles | Sentence roles 4 · Place & time 5 · People & together 5 · Focus & comparison 7 | 21 |
| Connectors | Adding & choosing 6 · Contrast 7 · Reason & purpose 6 · Condition & sequence 4 | 23 |
| Endings | To be 2 · Want, can, must 3 · Saying no 2 · Asking and suggesting 4 | 11 |
| Tenses | Present and past 2 · Future and ongoing 2 | 4 |
| Speech levels | 해요체 · 합니다체 · 반말 | 3 |
| Honorifics | Respect in grammar 2 · Respectful words 6 | 8 |
| **Total** | | **70** |

Each card has a reading guide, audio text (its forms, or short words built on an ending: 먹고, 가는데), every form and when it's used, three polite example sentences with English (210 in all), each with three wrong options and a one-line why, two to five usage rules, one to three memory tricks, comparisons with its look-alikes, one to three Memory Anchor candidates (three on 37 cards; fewer where no hook was strong enough), a test clue, and reviewed synonyms. **66** have a sourced Roots aid, and **41** get a root-based anchor because their record derives them from parts (그래 + 도 → 그래도, 밖 + 에 → 밖에, 반 (半) + 말 → 반말). Where the sources don't settle an origin (-는데, -(으)니까, 에게/한테, (이)랑), the record says so and the card keeps sound hooks only. In Roots, phrases link to the particles they use (날씨가 더워요 ↔ 이/가, 무슨 운동을 해요? ↔ 을/를).

**Build the form** practises 18 of them (every ending, every tense, 합니다체, 반말, and -(으)시-) on the learner's own words. `src/recall/conjugate.ts` builds each form from the dictionary form, irregular stems included (ㅂ, ㄷ, ㅅ, 르, ㅎ, ㅡ, ㄹ, and 하다), explains the steps, and supplies wrong options from real mistakes, never from another valid spelling. `src/data/conjugations.ts` says which words each card conjugates.

The content lives in `src/data/grammar.ts`, the `grammarEntries` block of `memory-aids.ts`, the origin JSON files, `recall-data.ts`, and `conjugations.ts`, keyed by card id (`particle:은/는`, `connector:그리고`, `ending:-고 싶어요`, `tense:-았/었어요`, `speech:반말`, `honorific:-(으)시-`). See [Grammar](docs/grammar-cards.md) for the card layers, the tests, and the writing standards.

## Audio

Audio uses the browser's Web Speech API only. It sets `ko-KR`, prefers a local Korean voice (the neutral Yuna voice when available), handles delayed `voiceschanged`, and cancels previous speech before starting another utterance. Normal is `0.85`; Slow is `0.6`. Navigating away from a card stops playback. Speech never starts without a tap or click.

There are no audio files, API keys, or external TTS requests from this application. Installed voices, pronunciation quality, and whether a system voice requires connectivity depend on the browser and OS. A Korean device voice gives the best result; this cannot be bundled with a web app. The app continues to work when speech is unsupported or fails.

Implementation references: [Web Speech voice loading](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesis/voiceschanged_event), [Vite](https://vite.dev/guide/), and [Tailwind's Vite integration](https://tailwindcss.com/docs/installation/using-vite).

## Checks

```sh
npm run build       # Data check, TypeScript, and production build
npm test            # Playwright (uses installed Google Chrome)
node scripts/check-speech.mjs  # Native speech probe; dev server must be running
```

Browser tests run at 375×667, 390×844, 430×932, and desktop sizes. They cover:

- **Learn, Library, Review:** the bottom bar; a first visit opening Learn; a whole unit (meeting each card, choosing an anchor, sentences, practice, the hand-off to Review); due cards, a review session and its rescheduling; the Difficult pile; search; languages and anchor tallies; word example sentences.
- **Logic, without a browser:** the spaced-repetition rules, marks, and damaged saves; the recall log and anchor tallies; Learn's steps and practice; search ranking; the conjugator on every word it serves (88 polite forms, plus a table of irregular stems and mistakes); Build the form on every card that uses it.
- **Library:** independent reveals; both modes; writing on the Listening pad (strokes, the stroke eraser, undo, clear all, palm rejection, no accidental swipes), the independent meaning and word reveals, and Study; category counts and filtering; saved marks; shuffle and navigation; gestures; missing speech support; grammar (switching halves keeps each deck, collections, per-half Difficult piles, every card's layers, playable examples, the shared anchor chooser, particle ↔ phrase links, phone fit); Roots and anchors (one root-based candidate per decomposable word, part-by-part layout, rated anchors kept, homophones never linked, evidence links, regressions for misleading shared syllables); the chooser's three groups; media moments (nothing contacts YouTube until play is pressed, the player starts at the checked second, playing a moment doesn't choose it, a chosen moment survives a reload).
- **Tests:** question generation over many seeded shuffles, answer keys, typed-answer grading (synonyms, typos, negation, other words' meanings), handwriting grading including the recognizer's recorded answers to 1,692 synthetic handwriting samples, hints that never state the answer for any anchor in any language or any media moment (a title like Bom Bom Bom never spells the word), scoring, every question type, doubtful readings, recognition failures and retries, corrections and undo, Enter handling, results, Retake, Difficult/Known marks, End test, resuming after leaving Review and reloading (including mid-reading), malformed saved tests, and phone fit; Complete the sentence options, saves, hints, and grading.
- **Data** (`npm run data:validate`, part of the build): every source row and line of Korean prose, ids, reading guides, anchors (for a word: two or three sound hooks and one roots or pattern candidate; for a grammar point: one to three; at most one more per extra language; every Korean word in a pattern reviewed), media moments (one bracketed form of the card's word, an official watch URL, evidence, and a start second only with the upload's length), origins and evidence, clues that never say the answer, accepted synonyms, the shape of every grammar card, every word's example sentence, and the Learn units.

Speech API behavior and the handwriting recognizer are mocked in the repeatable suite; the separate native probe checks actual start/end events for both rates. It cannot judge the sound subjectively or substitute for listening on a physical iPhone.

## Test modes

A test mode has two halves, both keyed by the same id:

- **Rule**, in `src/recall/questionRules.ts`. It holds no UI:
  - the answer kind (`text`, `ink`, or `choice`) and which cards the mode supports (English → Korean: words only; Complete the sentence: grammar, and words with an example sentence; Build the form: the cards in `conjugations.ts`);
  - what the learner sees (`promptKey`, so no prompt repeats);
  - the answer key (expected answer plus what else counts and why);
  - `evaluate`, which reads and grades an answer (synchronously, or as a promise for handwriting), `grade` for a reading the learner gives, and `hints`, subtlest first.
- **View**, in `src/components/testTypes.tsx`: labels, the prompt, the revealed solution, and which word notes the review adds.

Setup, generation, saving, the answer field, review, and results pick up a new mode automatically, and it starts switched on for existing users. Setup offers only the modes that can ask the chosen cards. A rule may also `prepare` a per-question `data` payload when the test is built, with `parseData` to validate it on restore; the answer key, evaluation, hints, prompt, and solution receive it. Complete the sentence uses it for the chosen sentence and its four options in display order, Build the form for the word and its four forms.

The pieces stay separate so later modes can replace one at a time:

- `src/recall/generate.ts` (pure, with injectable randomness) builds a test in three steps:
  - choose distinct cards, fresh ones first and look-alikes only when needed;
  - give each card a type, in balanced shares with no repeated prompt, placing first the cards that fewest modes can ask;
  - order the questions, with no more than 3 of one type in a row and look-alikes apart.
- `src/recall/practice.ts` builds a lesson's practice from the same rules: each card's meaning, then each card at work.
- `src/recall/answers.ts` holds the answer keys, which respect the speaker and the dictionary form.
- Validation, deterministic and separate per language:
  - `src/recall/english.ts` grades typed meanings: senses and optional brackets, forms (a light stem), spacing, British spellings, typos allowed by word length, negation, and a closed-vocabulary guard so another word's meaning is never a typo. Curated synonyms and clues are in `src/data/recall-data.ts`.
  - `src/recall/korean.ts` compares Hangul by letters (jamo) against the answer key.
  - `src/recall/conjugate.ts` builds and explains conjugated forms, and their likely mistakes.
- Recognition: `src/recall/handwriting.ts` holds an interchangeable `HandwritingRecognizer` (Google's handwriting engine today; an on-device model could replace it, see the [research](docs/handwriting-recognition.md)) and `gradeReading`, which turns its candidates into correct, incorrect, or a question for the learner.
- `src/recall/hints.ts` derives hints from the saved anchor and the card, masking the meaning and the word's own reading.
- `src/recall/scoring.ts` scores: 1 point, ½ with any hint, 0 when incorrect; answers still awaiting the learner never count.
- `src/hooks/useTestSession.ts` runs and saves a session (tests and reviews under one key, a lesson's practice under its own), reads handwriting in the background (once, even across reloads), records the learner's calls, and logs each graded answer once, with the anchor in use. `src/hooks/useReview.ts` keeps that log and reschedules the card (`src/recall/review.ts`).
- `src/components/TestView.tsx` renders setup, questions, hints, confirmations, review, and results.

Each answer stores the app's evaluation (`auto`: correct, incorrect, or uncertain, with what was read) apart from the learner's own call (`self`, plus a `corrected` reading for handwriting), and the hints used. The learner's call wins; an uncertain evaluation is never a grade on its own. Scores are always derived from the answers, so no question counts twice.

## Structure and future hosting

React + TypeScript + Vite + Tailwind CSS + Lucide. Static assets only; no backend, database, or authentication. At runtime it makes two kinds of request, both on demand: reading handwritten test answers (Google's keyless handwriting endpoint, ink only; without it, the learner judges written answers), and, only when the learner presses play on a media moment, YouTube's privacy-enhanced player (youtube-nocookie.com). `npm run build` writes the self-contained site to `dist/`, ready for a later static Cloudflare deployment. **Nothing has been deployed.** No Cloudflare resources or configuration are created in this version.

A web manifest, SVG icon, standalone display metadata, and iOS safe-area support are included. A service worker, raster home-screen icons, and offline caching are left for the PWA follow-up, so development does not accumulate stale cached versions. This version does not promise offline installation.
