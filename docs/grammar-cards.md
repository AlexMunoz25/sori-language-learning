# Grammar

The Library's **Grammar** half holds six collections, chosen from the picker one at a time, by category, or all at once as *All grammar*:

| Collection | What it holds | For example |
| --- | --- | --- |
| **Particles** | What a word does in its sentence | 은/는, 이/가, 에서 |
| **Connectors** | Links between clauses and sentences | 그리고, -지만, -아서/어서 |
| **Endings** | What a sentence does: be, want, can, must, say no, ask, suggest | -이에요/예요, -고 싶어요, -(으)세요 |
| **Tenses** | When it happens | -았/었어요, -(으)ㄹ 거예요, -고 있어요 |
| **Speech levels** | How polite to sound | 해요체, 합니다체, 반말 |
| **Honorifics** | Respect for the person you talk about | -(으)시-, 께서/께, 드시다 |

Grammar cards work exactly like words, with the same modes, anchors, Roots, Difficult pile, and tests, plus four layers that only grammar needs. In Learn, they lead most units: each is met with a sentence and how it attaches, then practised, on the unit's own words where they fit.

The goal is understanding, not only recall: what the item does, how it attaches, how it differs from its look-alikes, and seeing it at work in sentences built from the learner's own words.

## What a card shows

| Layer | What it holds |
| --- | --- |
| **Audio** | Normal and Slow, saying the forms (은, 는) or short words that use the item (가면, 먹으면): a bare ending can't be pronounced on its own. |
| **Pronunciation** | The reading guide, e.g. *eun / neun*, *-a-seo / -eo-seo*. |
| **Memory Anchor** | One to three candidates, chosen and rated exactly like a word's: a weak candidate never fills a slot. A root-based candidate appears only where the item's Roots record derives it from parts (그래 + 도, 밖 + 에, 반 (半) + 말); 그리고 has no sourced breakdown, so its candidates are sound hooks. Speakers of Italian, Portuguese, or German may get one more in their language. |
| **Roots** | The researched origin with sources, and related cards: a particle links to the phrases that use it (이/가 ↔ 날씨가 더워요), a sentence connector to its clause ending (그리고 ↔ -고). |
| **Examples** | Three polite sentences with English, the studied piece highlighted. Each can be played. |
| **Usage rules** | Every form and when it's used (은 after a consonant, 는 after a vowel), then the rules: attachment, position, tense and register limits, and the common exceptions. |
| **Memory tricks** | Short, true shortcuts and patterns: a test you can run in your head, a contrast to picture. |
| **Comparisons** | Side by side with look-alikes: 은/는 vs 이/가, -고 vs 그리고, 에 vs 에서, 해요체 vs 합니다체. |
| **Meaning** | The meaning, the anchor recall check, and Hide & try again, as for words. |

Examples, Usage rules, Memory tricks, and Comparisons sit in one row of tiles under Memory Anchor and Roots, so a closed card fits one screen, as a word's does; each tile opens its own panel, and open panels stack in tile order.

Vocabulary and Grammar each keep their own place, selection, and Difficult pile: switching to Grammar and back returns to the same word.

## Tests

- **Korean → English** works for grammar too: the learner types the meaning or the job (*but*, *although*, *topic marker*, *as for*). Reviewed synonyms in `recall-data.ts` count, and the clue hint describes the job without naming it.
- **Complete the sentence** shows one of the card's sentences with its piece blanked and the English underneath, and offers four options: the piece and three wrong ones. The pick fills the blank so the whole sentence can be read before checking. Hints: first the card's clue, then **Fewer options**, which takes two wrong options away; any hint makes a correct answer worth ½ point. After checking, the review marks the right option and the pick, shows the full sentence and why it fits, and plays it. Words take this test too, with their example sentence and three words of the same kind as options.
- **Build the form** asks 18 cards: every ending and tense, 합니다체, 반말, and -(으)시-. It shows one of the learner's words in its dictionary form and the form wanted (듣다 → Past · polite) and offers four forms: the right one and three real mistakes (들었어요; 듣었어요, 들어요, 들을 거예요). Hints: first the rule for this word (듣다 is ㄷ-irregular: ㄷ becomes ㄹ before a vowel), never the finished form, then Fewer options. The review explains the steps and plays the form. 해요체 isn't asked: its form is the present tense card's.
- **English → Korean** is for words only: grammar cards share meanings (*and*: 그리고, -고, 하고), so the prompt would have several right answers.

Setup only offers the types that can ask the chosen cards, so a grammar test never waits for handwriting.

## Writing the content

Content lives with the vocabulary's, keyed by card id (`particle:은/는`, `connector:그리고`, `ending:-고 싶어요`, `tense:-았/었어요`, `speech:반말`, `honorific:-(으)시-`):

- `src/data/grammar.ts`: meaning, collection, category, audio text, forms, examples, rules, tricks, comparisons.
- `src/data/memory-aids.ts`: the reading guide and one to three anchor candidates in the `grammarEntries` block; hooks for speakers of other languages in `languageEntries`.
- `src/data/origin-reviews.json`, `root-concepts.json`, `origin-sources.json`: origin, components, sources.
- `src/data/recall-data.ts`: the test clue and accepted synonyms.
- `src/data/conjugations.ts`: for each card Build the form can ask, the form to build and which words it applies to: verbs, adjectives, or job nouns, without the ones that don't fit (no "please don't like it" for -지 마세요; no 먹다 for -(으)세요, since 먹다 has its own respectful word, 드시다).
- `src/recall/conjugate.ts`: how every form is built, irregular stems included (ㅂ, ㄷ, ㅅ, 르, ㅎ, ㅡ, ㄹ, 하다), and the mistakes it offers.

Standards:

1. **Examples** are natural polite (해요) Korean that reuse the learner's vocabulary; speech-level cards use their own level. The bracket holds the piece exactly as written in that sentence: the particle (저[는]), the ending after the stem (비싸[지만], 먹[으면]), what's left of it after a contracted stem (가[서]), or, where the ending fuses with the stem, the whole word (부산에 [갔어요]). Respectful words are bracketed whole, in the form the sentence uses (저녁 [드세요]).
2. **Wrong options** fit the same slot and are clearly wrong for the sentence and its English. They test real confusions: a particle with another job (에 vs 에서), a connector with another logic (그래서 vs 하지만), the attachment rule itself (책는 for 책은, at most one per sentence), or for a fused ending another form of the same word (가았어요, 가요, 갈 거예요 for 갔어요). Never a near-synonym that is also right (하지만 next to 그렇지만), and 은/는 vs 이/가 only where the sentence itself decides (누가 왔어요? 민수[가] 왔어요).
3. **Why** says in one line why the piece fits and the most tempting wrong option doesn't.
4. **Rules and tricks** must be true. No folk etymology; a pattern is offered as a pattern, not as history. Definitions follow the dictionaries: 반말 is speech that neither raises nor lowers the listener (Standard Korean Dictionary), not "speech cut short".
5. **Anchors** follow [Writing Memory Anchors](memory-anchors.md): one familiar keyword that sounds like the item and already means its job. Root-based candidates state only what the Roots record verifies. One strong candidate beats three with a weak one among them.
6. **Origins** come from fetched dictionary entries (Wiktionary, the NIKL dictionaries). When an origin is unknown or contested, the record says so and the card gets no root-based anchor.

`npm run data:validate` checks the shape of every card: ids by collection (`particle:`, `connector:`, `ending:`, `tense:`, `speech:`, `honorific:`), categories that belong to one collection, Korean-only audio text, one to five forms, exactly three examples with one bracketed piece that matches a form (or, for endings that fuse with their stem, ends like one), three distinct wrong options and a why for each, two to five rules, one to three tricks, one to three comparisons that point to real cards, one to three anchor candidates, a sourced origin record, a clue that never gives the answer away, and synonyms the grader accepts. The tests check every form Build the form can ask, and that none of its mistakes is another valid spelling. None of this can judge whether a sentence is natural or a trick is helpful: every content change still needs a read-through, ideally aloud with the audio.
