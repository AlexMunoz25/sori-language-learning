# Sori

A mobile-first Korean vocabulary trainer. Listen, make a sound association, reveal the meaning, and revisit difficult words.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

Open **http://localhost:5173**. The dev server binds to `0.0.0.0`; to use your phone on the same Wi-Fi, open the **Network** URL printed by Vite. Allow your computer's firewall to accept the connection if needed.

## Study

- **Standard:** Korean first, then optional pronunciation, Memory Anchor, Roots, and meaning. Each reveal is independent.
- **Memory Anchor:** three candidates per word until you pick the one that sticks; then only your pick shows, with a small Change button. Rate it, write your own, or ask for new ideas. One, three, and seven days after a pick, Meaning asks whether you remembered the word; an anchor that keeps failing gets a gentle nudge, never an automatic switch.
- **Listening:** tap Normal or Slow, or **Show meaning** to recall the word from its English meaning instead (no Korean is shown). Write the word on the pad with a finger, pen, or mouse. Below it: **Pen** and **Eraser** (tap a stroke to erase just that stroke, or swipe across several), **Undo** (steps back through drawing, erasing, and clearing), and **Clear all**. Then **Reveal word** to see the correct Korean directly under your writing. The meaning and the word reveal independently. **Learn** opens the same word in Standard mode with its Memory Anchor showing. The pad stores strokes as normalized points with timings, ready for handwriting recognition later; writing on it never swipes to another card.
- **Test:** evaluates recall, with no hints or anchors. It draws from the current collection and category (so the Difficult collection tests your difficult words), asks one question at a time, and alternates randomly between **Korean → English** (type the meaning) and **English → Korean** (write the word on the pad, with Pen, Eraser, Undo, and Clear all). **Check answer** (or **Show answer** when left blank) reveals the correct answer next to yours (under your handwriting for written answers), with the dictionary form, look-alikes that also count, a note, and audio. Say whether you **Remembered** or **Forgot** it, then **Next question**. Results show your score; add forgotten words to Difficult, or mark remembered ones Known when testing from the Difficult collection. Choose 10, 20, or all words and which question types to use; both are remembered. A test never repeats a word or prompt, skips look-alikes (채소/야채) unless it needs them, and the next test prefers words you haven't been tested on yet. **End test** shows results for the questions answered so far. Arrow keys, the collection bar, and the category picker are paused during a test so nothing moves your deck.
- Choose a category to start a shuffled deck. Swipe across the word, use Previous / Next, or press the left / right arrow keys. A completed deck reshuffles without immediately repeating the last card.
- Mark **Difficult** to revisit words in the Difficult collection; **Known** removes a difficult mark. Tap an active mark to clear it.
- Marks, preferences, and anchor choices, ratings, and recall checks live in localStorage. The guide (?) downloads the anchor feedback as JSON for the next round of anchor improvements. The current deck and position, and the test in progress (including unchecked answers), live in sessionStorage; test settings live in localStorage. There is no account or synchronization. Different browser origins/devices have separate progress.

## Vocabulary

`vocabulary.md` is authoritative. **All 282 table rows** are included, along with the meaningful examples and category words in the prose:

| Import | Cards |
| --- | ---: |
| Table rows, with four alternative forms split into separate cards | 286 |
| Category vocabulary not already in the tables | 15 |
| Phrases outside the tables | 24 |
| **Total, across 17 categories** | **325** |

All 325 cards have reviewed reading guides, **three Memory Anchor candidates**, and an origin record; **262** have a sourced Roots aid. Each anchor ties the Korean sound to its meaning through something familiar: an English, Spanish, or French sound-alike, a well-known reference, or the source word of a loanword (light BULB → 밝아요, *bright*). The six anchors the learner rated five stars are kept verbatim and preselected. The principles come from the learner's own ratings; see [the feedback analysis](docs/anchor-feedback-analysis.md). Phrase cards chain the hooks of their words. The Memory Anchor reveal includes the meaning as a retrieval prompt; it is a learning aid.

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

Browser tests cover 375×667, 390×844, 430×932, and desktop layouts; independent reveals; both modes; writing on the Listening pad (strokes, the stroke eraser, undo, clear all, palm rejection, no accidental swipes), the independent meaning and word reveals, and Learn; Test mode (question generation over many seeded shuffles, answer keys, both question types, Enter handling, results and Difficult/Known marks, End test, resuming after mode switches and reloads, malformed saved tests, phone fit); category counts/filtering; saved marks; shuffle/navigation; gestures; missing speech support; independently revealed Roots and Memory Anchors; evidence links; and regressions for misleading shared syllables. Speech API behavior is mocked in the repeatable suite; the separate native probe checks actual start/end events for both rates. It cannot judge the sound subjectively or substitute for listening on a physical iPhone.

## Test modes

A test mode has two halves, both keyed by the same id:

- **Rule**, in `src/recall/questionRules.ts`. It holds no UI:
  - the answer kind (`text` or `ink`) and which cards the mode supports;
  - what the learner sees (`promptKey`, so no prompt repeats);
  - the answer key (expected answer plus what else counts and why).
- **View**, in `src/components/testTypes.tsx`: labels, the prompt, the revealed solution, and which word notes the review adds.

Setup, generation, saving, the answer field, review, and results pick up a new mode automatically, and it starts switched on for existing users. A rule may also `prepare` a per-question `data` payload when the test is built (e.g. multiple-choice options) with `parseData` to validate it on restore; the prompt and solution receive it.

The pieces stay separate so later modes can replace one at a time:

- `src/recall/generate.ts` (pure, with injectable randomness) builds a test in three steps:
  - choose distinct words, fresh ones first and look-alikes only when needed;
  - give each word a type, in balanced shares with no repeated prompt;
  - order the questions, with no more than 3 of one type in a row and look-alikes apart.
- `src/recall/answers.ts` holds the answer keys, which respect the speaker and the dictionary form.
- `src/hooks/useTestSession.ts` runs and saves the session.
- `src/components/TestView.tsx` renders setup, questions, review, and results.

Each answer stores the learner's own judgement (`self`) apart from the app's (`auto`, today only for blank answers), so handwriting recognition or similarity scoring can write `auto` later without overwriting what the learner decided.

## Structure and future hosting

React + TypeScript + Vite + Tailwind CSS + Lucide. Static assets only; no backend, database, authentication, or runtime API dependency. `npm run build` writes the self-contained site to `dist/`, ready for a later static Cloudflare deployment. **Nothing has been deployed.** No Cloudflare resources or configuration are created in this version.

A web manifest, SVG icon, standalone display metadata, and iOS safe-area support are included. A service worker, raster home-screen icons, and offline caching are left for the PWA follow-up, so development does not accumulate stale cached versions. This version does not promise offline installation.
