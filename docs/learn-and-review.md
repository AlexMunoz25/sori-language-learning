# Learn, Library, Review

Sori is built around Memory Anchors, with Korean grammar as the structure that makes them usable. Every concept, a word or a grammar point, is one card with a stable id, and the same card, with the same anchor, shows up in all three places:

| Place | What it's for |
| --- | --- |
| **Learn** | Guided units: meet a few cards at a time, give each one an anchor, see it at work, then recall and use it. |
| **Library** | Everything, to explore: Vocabulary and Grammar, card by card, with every reveal, Listening, and search. |
| **Review** | What's due today, any test you like, and the Difficult pile. |

The learning cycle runs through them: **hear → form an anchor → understand in context → recall → apply → revisit**.

## Learn

A unit (`src/data/units.ts`) pairs one or two grammar points with the words they put to work, so a finished unit ends with something to say: *Who you are* is 은/는 and -이에요/예요 with job words. `stepsOf(unit)` turns it into steps:

1. **Intro**: the goal and the cards to come.
2. **Meet** each card, in groups of two or three: the Korean with audio and reading guide, the meaning (this is learning, not testing), the **anchor chooser** (the same one as in the Library: pick, rate, or write your own), one sentence with the card highlighted and playable, and for grammar how it attaches.
3. **Practice** after each group, built by `buildPractice` (`src/recall/practice.ts`): first each card's meaning (typed, Korean → English), then each card at work: Complete the sentence, or Build the form for endings and tenses, built on one of the unit's own words when one fits. Questions are graded exactly like a test, with hints at half a point, and a summary follows.
4. **Done**: every card is now in Review. Practice answers schedule cards like any other answer (recalled without help, back in three days; with a hint or forgotten, tomorrow), and a card the practice didn't reach starts tomorrow.

Progress is kept per unit (`sori.learn.v1`): the current step, and the day it was finished. A practice runs in its own test session (`sori.learnTest.v1`), so it never replaces a test in Review, and leaving half-way keeps it as it was. Every unit's cards must exist and have a sentence to meet them in; the data check enforces both.

## Review

### Spaced repetition

`src/recall/review.ts` schedules every card Leitner-style. A card sits in a box, and the box sets how many days pass before it is due again:

| Box | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Days | 0 | 1 | 3 | 7 | 14 | 30 | 60 | 120 |

- **Recalled without help**: up a box. A first answer like this skips straight to box 2.
- **With a hint**: the same box (at least box 1).
- **Forgotten**: back to box 1, due tomorrow.
- **Not due yet**: an extra test never moves a card up, so cramming can't stretch the intervals; forgetting still brings it back tomorrow.
- **Marks**: Difficult makes a card due today in an early box; Known schedules a confirming check a week out for a card Review hasn't seen.
- **Lessons**: practice answers count like any other; a card a finished unit's practice didn't reach starts in box 1.

Days are local calendar days: a card due "tomorrow" comes back after midnight, not after 24 hours. Due cards are sorted most overdue first, then least known, and a review session asks up to 20 at a time with the question types switched on in the test settings.

### Tests and the Difficult pile

The test builder works as before, on the Library's current selection (change it from the builder), with results that can add incorrect cards to Difficult or, from the Difficult pile, mark cards Known. A running test or review stays where it is when you go to the Library and back, or reload.

## The recall log and anchor evidence

Every graded answer, from a test, a review, or a lesson's practice, is logged once (`sori.recall.v1`, the latest 4,000) with the card, the question type, the outcome (correct, with a hint, incorrect), and **the Memory Anchor the learner had chosen when it was asked**. The same entry reschedules the card. From the log:

- each anchor shows how its card did while it was the one in use: *In tests and reviews: 2 of 3 recalled · 1 with a hint*, and every candidate in the chooser shows its own tally;
- the anchor feedback download (? → Download anchor feedback) includes those tallies with the choices, ratings, recall checks, and the learner's languages, for the next round of anchor improvements.

With one learner, a tally is a hint, not a statistic: it says which anchor has been working for *you*. Across learners, the same log would answer which kinds of anchor help recall, but that needs accounts and a server, which Sori doesn't have.

## Languages

The learner says which languages they know (the 文A button in the header, or Learn's *Change languages*). English, the app's language, is always on; the deck starts with English, Spanish, and French. A Memory Anchor whose hook is in another language waits under *More ideas in other languages* instead of in the main list; English hooks, verified roots, loanwords, and mixed hooks always show, and the anchor in use always shows. See [Writing Memory Anchors](memory-anchors.md) for how language anchors are written.

## Storage

Everything stays in the browser; there is no account or sync.

| Key | Where | What |
| --- | --- | --- |
| `sori.progress.v1` | localStorage | Known and Difficult marks |
| `sori.preferences.v1` | localStorage | Destination, Library mode and selection per half |
| `sori.anchors.v1` | localStorage | Anchor choices, custom anchors, ratings, recall checks |
| `sori.review.v1` | localStorage | Each card's box and due day |
| `sori.recall.v1` | localStorage | The recall log |
| `sori.learn.v1` | localStorage | Each unit's step and finish day |
| `sori.languages.v1` | localStorage | Languages the learner knows |
| `sori.testPreferences.v1` | localStorage | Test length and question types |
| `sori.session.v1` | sessionStorage | The Library deck and position |
| `sori.test.v1`, `sori.learnTest.v1` | sessionStorage | The running test or review, and the running lesson practice |
