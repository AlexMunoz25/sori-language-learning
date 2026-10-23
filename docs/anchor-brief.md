# Writing anchors for a word: the brief

The brief given to whoever writes Memory Anchors for a word, a person or an AI writer. It is how the 325 vocabulary cards got their candidates in October 2026, and how every new word should get them. For what anchors are and how the app shows them, see [Memory Anchors and Roots](memory-anchors.md).

Every vocabulary word offers **five or six** candidates, which the learner compares and picks from:

| Kind | Candidates | What it is |
| --- | --- | --- |
| Sounds like | 3 | A familiar word, name, or phrase in English, Spanish, French, Italian, Portuguese, or German that sounds like the Korean and leads to the meaning |
| Korean roots | 1 | How Korean builds the word: its verified parts, or the pattern or family it belongs to |
| Heard in Korean media | 0–2 | A real, checked moment where the word is sung or spoken |

## 1. Research packet

```sh
npm run anchors:packets -- anchors-work                       # every vocabulary word
npm run anchors:packets -- anchors-work "Verbs:마셔요" …      # or just these cards
```

`anchors-work/packet.json` gives each word its meaning, reading guide, forms (dictionary, polite, past, casual, future, and the conjugation rule, from the app's tested conjugator), its Roots record, its current candidates (`locked` ones were rated four or five stars by the learner), and its language anchors. `taken.json` lists every CAPITAL keyword in use and the cards using it; `vocab.json` lists every word, for patterns and families.

## 2. Sounds like: three candidates

What the learner rated five stars: a light BULB → 밝아요 (bright); fast as a BALA (es. bullet) → 빨라요; MORDOR is far, far away → 멀어요; PAPA is always busy → 바빠요; HUGE, YOUNG, SAD: three adjectives → 형용사; JAMMING cancelled? OOPS, no fun → 재미없어요. And the learner's own examples of the quality wanted: Siberian CHAGA — WHOA, YO! It's cold → 차가워요; HIM + DURO (es. hard): it's hard for him → 힘들어요; To DRINK it, I MASH it! → 마셔요; I'm ILL, sick of WORK! → 일해요; IORI Yagami (The King of Fighters) cooking dinner → 요리해요.

What failed: filler words that only carry a sound (YEP, Y'ALL), invented cause-and-effect stories, a keyword unrelated to the meaning (DOLLAR ≠ different), bare onomatopoeia, trivia, words a non-native speaker doesn't use daily (sulk, pout, pep). The full analysis: [anchor-feedback-analysis.md](anchor-feedback-analysis.md).

Every candidate passes five tests:

1. **Sound.** The keyword sounds like the head of the Korean word, ideally covering more syllables naturally. Judge it in the keyword's own language: Spanish j is a throaty h (JOYA is “hoya”), Portuguese ch is “sh”, Italian gi is “dj”, German w is “v”. Korean ㄹ between vowels is a flap, ㅓ is an open “uh”, ㅡ an unrounded “eu”, ㅃ ㄸ ㄲ ㅆ ㅉ tense.
2. **Meaning.** Saying only the keyword brings the meaning to mind.
3. **Familiar.** An adult Western learner knows it instantly: an everyday word, a famous name, film, game, song, brand, or concept.
4. **Short.** About ten words, under 140 characters with the closing sound mapping. A genuine expression beats a constructed sentence.
5. **Distinct.** Its keyword is used by no other card (`taken.json`), and the three take different routes: an everyday word, a pop-culture or tech/music/sports/gaming concept, another language.

Quality beats diversity: three strong candidates in two languages beat a weak third language, and a mixed-language hook (HIM + DURO) is welcome when natural. Look for sound-alikes in the dictionary form and the conjugated forms too, and when a hook uses another form, say so (“Dictionary form 차갑다 cha-gap-da: …”).

Format: hook words in CAPITALS; a word from another language tagged after it (`BALA (es. bullet)`, `JOLI (fr. pretty)`, `PIQUE (pt-BR. energy)`); optionally the sound mapping (`hep-bur ≈ ye-ppeo`); always ending with `→ <reading>.` The language is the hook's (`en`, `es`, `fr`, `it`, `pt`, `de`, or `mixed`); the kind is `sound`, or `loanword` when the hook is the actual source of a borrowed word (COFFEE → 커피).

## 3. Korean roots: one candidate

- If the word has a `roots` candidate (its verified parts, part by part), keep it; polish the wording at most, never its Korean or Hanja.
- Otherwise write one `pattern` candidate, from the first route that applies:
  1. **Conjugation pattern** for verbs and adjectives, from the packet's forms and rule, with other vocabulary words as examples: `예쁘다 → 예뻐요: the ㅡ drops before 어, as in 바쁘다 → 바빠요 and 아프다 → 아파요.`
  2. **Word family**: the word inside other words, from the Roots record or well-established everyday compounds: `물 = WATER, also in 눈물 (EYE + WATER: tears).`
  3. **Loanword pattern**: the source word and the regular change Korean makes, with other borrowed words from the vocabulary.
- Only true statements: no folk etymology, no shared syllable that is not the same morpheme (공원's 공 公 is not 공항's 空; 물건 物件 has nothing to do with 물). Hanja only if they are in the Roots record. Any Korean word that is neither a vocabulary word, a form of one, nor in the card's record goes in `newWords` with its meaning, to be reviewed into `src/data/family-words.ts`.

## 4. Review and hand back

Review every current candidate: `keep`, `polish` (same keyword, better wording, same id so a learner's choice survives), or `replace` (removed; its better successor goes in `add`). Use 1–5 stars honestly; replace ★1–2, keep ★4–5, keep a ★3 only when nothing better exists. Never touch a `locked` candidate. Only propose ★4–5.

```json
[{ "id": "Adjectives:차가워요",
   "review": { "1": { "stars": 4, "verdict": "keep" }, "2": { "stars": 2, "verdict": "replace" }, "3": { "stars": 4, "verdict": "polish", "text": "…" } },
   "add": [{ "kind": "sound", "language": "en", "form": "polite", "stars": 5, "text": "… → cha-ga-wo-yo.", "why": "…" },
           { "kind": "pattern", "language": "ko", "stars": 4, "text": "차갑다 → 차가워요: …", "why": "…" }],
   "newWords": {} }]
```

```sh
npm run anchors:apply -- candidates.json --dry   # check: 3 phonetic + 1 roots/pattern per word, unused keywords
npm run anchors:apply -- candidates.json         # write memory-aids.ts (and family-words.ts)
npm run data:validate
```

## 5. Heard in Korean media: up to two moments

A real moment where the word is sung or spoken in Korean, in the card's own sense (차 tea, not 차 car). Never from memory: every line is taken from a checkable source, and a word with no genuine moment gets none.

1. **Songs.** Find the word in a song's **timed lyrics** on [LRCLIB](https://lrclib.net) (its API gives each line's second and the track's length). Prefer the word in a famous song's title and chorus (BTS 봄날 → 봄; IU 금요일에 만나요 → 금요일), then a hook line in a well-known song.
2. **Titles.** A drama, film, show, or children's animation whose Korean title contains the word (슬기로운 의사생활 → 의사; 꼬마버스 타요 → 타요), confirmed by a source page (Wikipedia, the broadcaster's or Netflix's page).
3. **Uploads.** Official only: for a song, its **official audio** (the artist's Official Artist Channel or “Artist - Topic”, which carries the album recording, so the timed lyrics' seconds apply to it) and its official music video; for a title, an official trailer or clip. A Western scene with Korean subtitles is not Korean audio.

```json
[{ "card": "Seasons:봄", "media": "song", "title": "봄날 (Spring Day)", "by": "BTS", "year": 2017,
   "quote": "그리움들이 얼마나 눈처럼 내려야 그 [봄]날이 올까", "translation": "How much longing must fall like snow before that spring day comes?",
   "why": "BTS's best-loved song is named for a spring day.",
   "url": "https://www.youtube.com/watch?v=<official audio>", "video": "https://www.youtube.com/watch?v=<official MV>", "lrclib": 36767587 }]
```

The quote is the line (or the part of it around the word, ≤ 80 characters) exactly as heard, with the word's form in one pair of brackets; `why` is one short line for the learner. Then:

```sh
npm run anchors:culture -- moments.json [--lengths lengths.json]           # check: report only
npm run anchors:culture -- moments.json [--lengths lengths.json] --write   # save the ones that pass
npm run data:validate
```

The check confirms the line is in that LRCLIB record's timed lyrics and notes its second, confirms both uploads exist (YouTube oEmbed, which also says whether the app may embed them), and sets the start second, two seconds before the line, only when the official audio is as long as the timed track (±2 s). Upload lengths come from the YouTube Data API (`YOUTUBE_API_KEY`) or a `--lengths` file of `{ "videoId": seconds }`. Links rot: `npm run anchors:culture -- --recheck` re-runs every check on what's saved.
