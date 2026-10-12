# Connectors and Particles

Sori has three sections, switched with the tabs under the brand (in the header on wide screens): **Vocabulary**, **Connectors**, and **Particles**. Connectors link clauses and sentences (그리고, -지만, -아서/어서); particles mark what a word does in its sentence (은/는, 이/가, 에서). Both sections work exactly like Vocabulary, with the same three modes, anchors, Roots, Difficult pile, and tests, plus four layers that only grammar needs.

The goal is understanding, not only recall: what the item does, how it attaches, how it differs from its look-alikes, and seeing it at work in sentences built from the learner's own words.

## What a card shows

| Layer | What it holds |
| --- | --- |
| **Audio** | Normal and Slow, saying the forms (은, 는) or short words that use the item (가면, 먹으면): a bare ending can't be pronounced on its own. |
| **Pronunciation** | The reading guide, e.g. *eun / neun*, *-a-seo / -eo-seo*. |
| **Memory Anchor** | Three candidates, chosen and rated exactly like a word's. A root-based candidate appears only where the item's Roots record derives it from parts (그래 + 도, 밖 + 에); 그리고 has no sourced breakdown, so its three are sound hooks. |
| **Roots** | The researched origin with sources, and related cards: a particle links to the phrases that use it (이/가 ↔ 날씨가 더워요), a sentence connector to its clause ending (그리고 ↔ -고). |
| **Examples** | Three polite sentences with English, the studied piece highlighted. Each can be played. |
| **Usage rules** | Every form and when it's used (은 after a consonant, 는 after a vowel), then the rules: attachment, position, tense and register limits, and the common exceptions. |
| **Memory tricks** | Short, true shortcuts and patterns: a test you can run in your head, a contrast to picture. |
| **Comparisons** | Side by side with look-alikes: 은/는 vs 이/가, -고 vs 그리고, 에 vs 에서. |
| **Meaning** | The meaning, the anchor recall check, and Hide & try again, as for words. |

Examples, Usage rules, Memory tricks, and Comparisons sit in one row of tiles under Memory Anchor and Roots, so a closed card fits one screen, as a word's does; each tile opens its own panel, and open panels stack in tile order.

Each section keeps its own place, category, and Difficult pile: switching to Particles and back returns to the same word.

## Tests

- **Korean → English** works for connectors and particles too: the learner types the meaning or the job (*but*, *although*, *topic marker*, *as for*). Reviewed synonyms in `recall-data.ts` count, and the clue hint describes the job without naming it.
- **Complete the sentence** (connectors and particles only) shows one of the card's sentences with its piece blanked and the English underneath, and offers four options: the piece and three wrong ones. The pick fills the blank so the whole sentence can be read before checking. Hints: first the card's clue, then **Fewer options**, which takes two wrong options away; any hint makes a correct answer worth ½ point. After checking, the review marks the right option and the pick, shows the full sentence and why it fits, and plays it.
- **English → Korean** is for words only: connectors and particles share meanings (*and*: 그리고, -고, 하고), so the prompt would have several right answers.

Setup only offers the types that can ask the chosen cards, so a particle test never waits for handwriting.

## Writing the content

Content lives with the vocabulary's, keyed by card id (`connector:그리고`, `particle:은/는`):

- `src/data/grammar.ts`: meaning, category, audio text, forms, examples, rules, tricks, comparisons.
- `src/data/memory-aids.ts` (the `grammarEntries` block): reading guide and the three anchor candidates.
- `src/data/origin-reviews.json`, `root-concepts.json`, `origin-sources.json`: origin, components, sources.
- `src/data/recall-data.ts`: the test clue and accepted synonyms.

Standards:

1. **Examples** are natural polite (해요) Korean that reuse the learner's vocabulary. The bracket holds the piece exactly as written in that sentence: the particle (저[는]), the ending after the stem (비싸[지만], 먹[으면]), or what's left of it after a contracted stem (가[서]).
2. **Wrong options** fit the same slot and are clearly wrong for the sentence and its English. They test real confusions: a particle with another job (에 vs 에서), a connector with another logic (그래서 vs 하지만), or the attachment rule itself (책는 for 책은, at most one per sentence). Never a near-synonym that is also right (하지만 next to 그렇지만), and 은/는 vs 이/가 only where the sentence itself decides (누가 왔어요? 민수[가] 왔어요).
3. **Why** says in one line why the piece fits and the most tempting wrong option doesn't.
4. **Rules and tricks** must be true. No folk etymology; a pattern is offered as a pattern, not as history.
5. **Anchors** follow [Writing Memory Anchors](memory-anchors.md): one familiar keyword that sounds like the item and already means its job. Root-based candidates state only what the Roots record verifies.
6. **Origins** come from fetched dictionary entries (Wiktionary, the NIKL dictionaries). When an origin is unknown or contested, the record says so and the card gets no root-based anchor.

`npm run data:validate` checks the shape of every card: ids by section, categories unique to one section, Korean-only audio text, forms, exactly three examples with one bracketed piece that matches a form, three distinct wrong options and a why for each, two to five rules, one to three tricks, comparisons that point to real cards, three anchor candidates, a sourced origin record, a clue that never gives the answer away, and synonyms the grader accepts. It can't judge whether a sentence is natural or a trick is helpful: every content change still needs a read-through, ideally aloud with the audio.
