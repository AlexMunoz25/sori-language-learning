# Memory Anchors and Roots

A Memory Anchor connects an unfamiliar Korean word to something you already know. The reaction it should produce is: *“That sounds like X, and X goes with this meaning.”* It links three things at once: the Korean **sound**, the **meaning**, and a **familiar** word, phrase, situation, reference, or moment.

Every vocabulary word offers five or six candidates of three kinds, so the learner can pick the route that works for them:

| Kind | Candidates | Example (밝아요, bright; 봄, spring) |
| --- | --- | --- |
| **Sounds like** | 3 | A light BULB: bright → bal-ga-yo |
| **Korean roots** | 1 | 공 (空) gong = AIR + 항 (港) hang = PORT → air-port; or a pattern: 예쁘다 → 예뻐요 like 바쁘다 → 바빠요 |
| **Heard in Korean media** | 0–2 | BTS, 봄날 (Spring Day): “그 [봄]날이 올까”, played from the moment |

What works for this learner was derived from their ratings: see [the feedback analysis](anchor-feedback-analysis.md). In short, the best sound hooks have one instantly familiar keyword that sounds like the head of the Korean word and already implies the meaning: light BULB → 밝아요 (bright), BALA → 빨라요 (fast), MORDOR → 멀어요 (far). How each kind is written, step by step, is in [the brief](anchor-brief.md).

## Five or six candidates, one choice

A vocabulary word has three sound hooks, one Korean-roots candidate, and up to two verified media moments; grammar cards keep one to three candidates, as before. A slot stays empty rather than hold a weak candidate: a word with no genuine media moment gets none, and a word whose third sound hook would be a stretch keeps two.

In the app, the candidates show grouped by kind (**Sounds like**, **Korean roots**, **Heard in Korean media**) until the learner picks one; from then on only that anchor shows, with a small **Change** button to bring the others back. A choice is saved in this browser (`sori.anchors.v1` in localStorage, separate from Difficult/Known progress), and the same anchor follows the card into Learn, the Library, and Review.

- The three sound hooks take different routes when good routes exist: an everyday word, a concept from science, tech, music, sports, or gaming, and a pop-culture reference or another language.
- Ratings decide how much changes. ★★★★★ anchors are kept verbatim and preselected (`1*` in the data); ★★★★ keep their keyword; ★★★ keep the working element; ★★ and ★ start over. The learner's own example anchors are kept verbatim.
- Candidate ids are stable within a card. Polishing the wording keeps the id, and with it the learner's choice; a genuinely new idea gets a new id. Media moments are `c1` and `c2`.
- Under the selected anchor, five small stars record how well it sticks. **None of these work?** lets the learner write their own anchor or ask for new ideas.
- One, three, and seven calendar days after a choice, the Meaning reveal asks whether the word came back. Two or more misses (and more misses than hits) with the same anchor show a gentle “try another?” nudge. The app never changes a choice by itself.
- Every graded answer, in a test, a review, or a lesson's practice, is logged with the anchor in use. The selected anchor shows how its card did since (*In tests and reviews: 2 of 3 recalled · 1 with a hint*), and each candidate in the chooser shows its own tally. See [Learn, Library, Review](learn-and-review.md).
- The guide (?) downloads all of this as `sori-anchor-feedback-<date>.json`: choices, ratings, recall checks, test tallies per anchor, custom anchors, the learner's languages, and words that need new ideas. That file is the input for the next round of anchor improvements; the app has no backend that could generate candidates on its own.

## Languages

A hook only works in a language you know. The learner picks their languages (English is always on; the deck starts with English, Spanish, and French), and **Sounds like** lists the hooks in English, mixed hooks, loanwords, and those languages; the rest wait under **More ideas in other languages**, one tap away, never hidden for good. Korean roots and media moments show for everyone. The anchor in use always shows.

A sound hook may be in any of six languages: English, Spanish, French, Italian, Portuguese, or German, judged by that language's own sound rules (Spanish *j* = h, Portuguese *ch* = sh, Italian *ci* = chi, German *w* = v). Beside a card's own candidates, `languageEntries` in `memory-aids.ts` holds extra hooks written for speakers of Italian, Portuguese, or German: at most one per card and language (`it1`, `pt1`, `de1`), shown first to those learners.

## Sounds like: writing a hook

1. **Find the sound-alike.** Say the Korean word aloud and ask what it sounds like: a word or phrase in a language you know, a well-known name, a familiar sound. Match the actual Korean pronunciation, not the romanization (see rule 2 below). Try the dictionary form and the conjugated forms too: 차갑다 *cha-gap-da* and 차가워요 *cha-ga-wo-yo* suggest different hooks. A hook built on another form says so.
2. **Link it to the meaning with one short, logical scene.** The meaning should follow naturally: NAPPA, the Dragon Ball Z villain → 나빠요, *bad*. Fast as a BALA (Spanish for bullet) → 빨라요, *fast*. Siberian CHAGA — WHOA, YO! It's cold → 차가워요. A scene that only works once explained is not good enough.
3. **End with the Korean reading** (→ *na-ppa-yo*) so the hook leads back to the real pronunciation. The audio is still the reference.

Pop-culture, tech, music, gaming, and sports references are welcome when they are genuinely well known (Dragon Ball Z, The King of Fighters, Star Wars, Bob Marley, Psy). A plain situation (“Grandma always slips you some MONEY” → 할머니) is often better. Avoid obscure references, forced or cringeworthy links, and anything that could confuse two cards.

- **Loanwords:** the source word is the familiar thing. Name it and point out the sound changes: COFFEE → 커피 *keo-pi* (Korean has no f).
- **Phrases:** chain the hooks of the words inside, so each word's own anchor is reinforced: 날씨 ≈ NASTY weather + 가 + 더워요 ≈ hot DEHORS.
- **Cognates you already know:** when the real origin *is* the familiar thing, it can be the hook: CHAI → 차, SENSEI → 선생님, BULGOGI → 고기.
- **Grammar:** the hook carries the item's job rather than a word's meaning: something that sounds like 도 and means *also*, like 만 and means *only*, like *JAMAIS* and means *please don't* (-지 마세요). See [Grammar](grammar-cards.md).

## Korean roots: how Korean builds the word

One candidate per word explains the word itself, so it holds across the deck (空 in 공항 and 공책, 師 in 의사, 약사, and 요리사):

- **Root-based** (kind `roots`), when the card's Roots record breaks the word into meaningful parts (Hanja, a native compound, a noun + 하다 / 있다 / 없다, a stem + a word-forming ending): part by part, `Korean (Hanja) reading = MEANING + … → gloss`. 공 (空) gong = AIR + 항 (港) hang = PORT → air-port; 말 mal = WORDS + 해요 hae-yo = DO → doing speech: to speak. Point to another card only when the two really share the component (“Same 綠 as 초록색”), and warn where a syllable only sounds the same (“Not 공원's 원 (園)”).
- **Pattern** (kind `pattern`), when there are no parts to show: the conjugation pattern the word follows, with other words that follow it (예쁘다 → 예뻐요: the ㅡ drops before 어, as in 바쁘다 → 바빠요); the family it belongs to (물, water, in 눈물, eye-water: tears); or, for a loanword, the regular change Korean makes (f → ㅍ, a final consonant takes 으), with other borrowed words from the deck.
- **Never forced:** a part is never given a meaning the record doesn't state, a shared syllable is never presented as a shared root, and a mnemonic is never presented as history.

## Heard in Korean media: real moments

A media moment is the word heard in context: sung in a song, spoken in a show, or in the Korean title of a drama, film, or children's animation. It is the one kind of anchor that is never invented. Each lives in `src/data/culture-anchors.json` with what it was checked against, and the data check refuses one without its evidence:

- **The line is real.** A song's line is taken from its **timed lyrics** on LRCLIB (`lrclib:<record>@<second>` in the evidence); a title is confirmed by a source page. The word in brackets must be the card's word or one of its forms, in the card's own sense.
- **The upload is official and alive.** For a song, its **official audio** (the artist's Official Artist Channel or “Artist - Topic”, which carries the album recording) and its official music video; for a title, an official trailer or clip. YouTube's oEmbed confirms each one exists and whether the app may embed it. A Western scene with Korean subtitles doesn't count: the audio must be Korean.
- **The second is checked.** The moment starts two seconds before the line only when the official audio is exactly as long as the timed track (`length:<seconds>`, ±2 s), so the lyrics' seconds are that upload's seconds. Otherwise the link opens at 0:00.

In the app, a moment shows the line with the word highlighted, its English, and what it is (*BTS · 봄날 (Spring Day) · 2017*), with **Play from** the second just before the line, and **Music video**. Nothing loads from YouTube until the learner presses play: the player is an embed from `youtube-nocookie.com`, created on that tap and removed on **Close**. An upload that can't be embedded opens on YouTube instead. A moment's hints are its line in English with the meaning blanked (Korean → English) and the song's English title (English → Korean), never its Korean.

Links rot: `npm run anchors:culture -- --recheck` re-runs every check. See [the brief](anchor-brief.md) for finding and checking moments.

## Labels and conventions

- **Phonetic mnemonic · EN / ES / FR / IT / PT / DE / MIXED / KO:** a sound-alike hook, labelled with the language of its hook. The UI notes it is not the word's origin. KO means the hook is another Korean word with the same sound (배우, actor / 배우다, to learn).
- **Verified word components:** root-based anchors, phrase chains, and cognates of familiar words (CHAI, SENSEI), each resting on a verified fact in the card's Roots record. Root-based anchors show one part per line; inside other anchors, **≈** marks a sound-alike, and the UI explains it.
- **Korean pattern:** a conjugation pattern, word family, or loanword change.
- **Borrowed word:** a loanword whose source word is the anchor.
- **Song / Drama / Film / TV show / Animation · who:** a media moment, labelled as a real moment with the day it was checked.
- CAPITALS mark the hook to picture.

## Four distinct kinds of information

- **Memory Anchor:** the candidates described above. The reveal includes the source meaning as a retrieval prompt.
- **Roots:** researched origin, Hanja, lexical components, or morphology (including conjugation patterns), with source links.
- **Related vocabulary:** up to five existing cards, each with the specific shared component, its meaning, and the relationship type: shared Hanja, same word/stem, shared pattern, or same loanword.
- **Pronunciation:** the reading guide, independent of the anchor.

The Memory Anchor and Roots controls reveal independently. Pronunciation and the full Meaning section remain separate. Listening mode is a writing exercise and shows none of the four; its Study button opens the word in Standard mode with the Memory Anchor already open. In Learn, a card's anchor chooser is part of meeting it.

## Editorial rules

1. Ask: “Would this make me think *that sounds like something I know*, and would that thing lead me to the meaning?” If not, keep looking.
2. Check the hook against the real Korean sound: 어 is the vowel in “cup,” 으 is an unrounded “oo,” 시 sounds like “shi,” initial ㄱ/ㄷ/ㅂ/ㅈ sit between g/k, d/t, b/p, and j/ch, and ㄹ is a flap between vowels.
3. Never present a shared syllable as a shared root. Homophones (공원 公 vs 공항 空, 배 pear vs 배구 排) stay apart in Roots. A Korean sound-alike hook must not imply a relationship.
4. Any fact inside an anchor must be supported: root-based anchors by the card's Roots record (every Hanja in the record, every Korean piece from the card, its note and components, or a card that shares a component); pattern anchors by the deck (every Korean word is a card, a form of one, in the card's record, or reviewed in `family-words.ts`); media moments by their evidence.
5. A media moment uses the word in the card's sense: 차 is tea, not car; 배 is a pear, not a stomach. A famous title with the word in passing beats an obscure song with it in the chorus only if the learner is likely to know it.
6. In Roots, verify both membership and meaning. The same Hanja can have different senses, so character identity alone is not sufficient.
7. Distinguish a modern morphological pattern from historical origin. Do not force older decompositions for native or nativized words.
8. Preserve `vocabulary.md` meanings and forms even when a dictionary entry differs. Document discrepancies.

## Editing data

- `src/data/memory-aids.ts`: one reviewed block per card (grammar in `grammarEntries`, keyed by card id), the source of written anchors. A `key|reading guide` line, then indented candidates: `id|hook language|kind|anchor`, where kind is `sound`, `roots`, `pattern`, `loanword`, or `reading`, and `1*` marks a five-star default. `languageEntries` adds the extra-language hooks: a key line, then `it1|it|sound|anchor` and the like. `npm run anchors:apply` edits it from reviewed candidates.
- `src/data/culture-anchors.json`: media moments by card id, written by `npm run anchors:culture` after it checks them: `media`, `title`, `by`, `year`, `quote` (the word in brackets), `translation`, `why`, `url` (the official audio or clip), `start`, `video` (a song's music video), `embed`, `evidence`, and `checked`.
- `src/data/family-words.ts`: reviewed Korean words outside the deck that pattern anchors may cite.
- `src/data/origin-reviews.json`: one record per **card ID**, including dictionary lemma, origin classification, source IDs, curated component IDs, and an optional note. Record an omission reason when there is no useful origin. The two unconfirmed origin lookups retain attempted URLs.
- `src/data/root-concepts.json`: semantic component identities. Hanja keys include the actual character, e.g. `hanja:書`. Lexical stems, grammatical patterns, and loanword components use different key namespaces.
- `src/data/origin-sources.json`: reviewed source titles and URLs. The research is static; study never calls a dictionary API.
- `src/data/roots.ts`: creates related-card edges only from explicitly curated component IDs. It does not infer roots from substrings or pronunciation.

The pipeline for a new word: `npm run anchors:packets` (research packet) → write candidates by [the brief](anchor-brief.md) → `npm run anchors:apply` → find and check media moments with `npm run anchors:culture` → `npm run data:validate`, `npm run build`, and `npm test`. Automated checks catch coverage, placeholders, the number of candidates of each kind, two candidates built on the same hook (and `anchors:apply` refuses a new keyword of three letters or more that another card already uses, except between a phrase and its own words), oversized anchors, factual anchors without sourced Roots, unreviewed Korean in a pattern, media moments without evidence or whose bracket isn't the word, start seconds that weren't checked against their upload, unsupported graph edges, and known homophone mistakes. They cannot tell whether a hook sticks. Every content edit still needs a human pass, ideally out loud with the audio, and the learner's recall checks are the real test.

See [the research audit](roots-research.md) for sources, limitations, and the review of all 325 cards.

---

# NEXT PHASE

## Memory Anchor Selection — UX Improvement

I think it would be better to **always offer 3 Memory Anchor candidates**, even when the existing anchor is already reasonably good, and let the user decide which one works best.

### 1. Three Anchor Options

- Display **3 different Memory Anchors** for each word.
    
- Each anchor should explore a meaningful association, ideally using different approaches such as phonetics, wordplay, familiar concepts, or cultural references.
    
- For highly rated anchors (★★★★ or ★★★★★), preserve the original as one of the options rather than unnecessarily replacing it.
    
- Let the user select whichever anchor feels most memorable.
    

### 2. Selection and Simplified UI

Once the user selects an anchor:

- **Keep only the selected anchor visible.**
    
- Automatically hide the other two options.
    
- Make the selected anchor the default for that vocabulary word.
    
- Persist the selection so it remains saved across sessions.
    

The goal is to avoid visual clutter. Once an anchor is chosen, the user should see only the association they want to memorize.

### 3. Subtle Reselection Option

Add a **small, unobtrusive button or icon** near the selected anchor, such as "Change" or a subtle refresh icon.

When clicked:

- Reveal the other two original candidates.
    
- Allow the user to select a different anchor.
    
- Optionally provide a way to generate new alternatives if none of the three works.
    
- Hide the unselected anchors again once a new selection is made.
    

This is important because an anchor might initially seem memorable but prove ineffective after a few days of practice.

### 4. Connect Selection With Memory Performance

Keep track of which anchor the user selected and how successfully they recall the word during subsequent reviews (1, 3, and 7 days).

If an anchor consistently fails to help with recall, the app can subtly suggest trying another one, without automatically changing the user's selection.

### Core UX Principle

**Offer choices during discovery, but simplicity during learning.**

The user should be able to explore different associations when needed, but once they've selected one, the interface should remain clean and focused on memorization.

The entire experience should feel lightweight, intuitive, and fast, not like a complicated configuration process.

Use the following rating system to understand my feedback and improve the Memory Anchors accordingly:

**★★★★★ = Perfect**  
The anchor works extremely well. Keep it exactly as it is.

**★★★★ = Almost perfect**  
The main idea is strong. Don't replace the anchor or change its core concept. Just polish the connection, make it more natural, or improve how it relates to the Korean word's meaning.

**★★★ = Good starting point**  
The anchor has a promising approach, but the chosen words, sounds, or associations aren't memorable enough. Keep the general idea, but find stronger connections that actually stick.

**★★ = Needs significant improvement**  
The approach has some potential, but the association isn't effective. Try a different word, rhyme, phrase, or familiar concept. Explore other languages, including Portuguese, Japanese, Chinese, or German, if they offer better phonetic connections.

**★ = Completely rethink**  
The anchor doesn't work. Start from scratch and find an entirely different association. Experiment with other words, rhymes, concepts, languages, or recognizable cultural references until you find something genuinely memorable.

**Important:** Don't prioritize cleverness over memorability. Every anchor must connect the Korean pronunciation to its actual meaning through something familiar. A phonetic resemblance alone isn't enough if the association has nothing to do with the meaning.

---
### Specific feedback

---

**재미있어요**

Current anchor:  
"Bob Marley's 'JAMMING': pure fun → jae-mi-i-sseo-yo"

**Rating: ★★★★**

The Bob Marley reference is a good idea because "JAMMING" sounds somewhat similar to "재미" (jae-mi), and it's a recognizable cultural reference.

However, the connection feels a bit forced. Bob Marley and "Jamming" don't directly communicate the meaning of 재미있어요 (interesting/fun/enjoyable).

**Keep the Bob Marley / Jamming concept, but improve the semantic connection.** Find a more natural way to associate the song with having fun or enjoying something, so both the pronunciation and meaning become easier to recall.

This is exactly what I mean by polishing a four-star anchor rather than replacing it entirely.

---

## 밝아요 ★★★★★

## 슬퍼요 ★★★  
SULK and POUT are very unknown words could work, change if there are better words

## 뚱뚱해요 ★
possible alternative
TTUNG-TTUNG → TUNGsten → Dense, heavy → Fat / Chubby
find more 

## 예뻐요 ★

## 어두워요 ★


## 피곤해요 ★★★ 
change PEP with PEAK, your PEAK is GONE


## 빨라요  ★★★★★


## 맛없어요 ★★★ 
the "mad" part is good, the rest not



## 날씬해요 ★★★★
"Nail" is good but if theres a better one change it 
something that also integrates "씬"

## 추워요★★★★
the ACHOO is more lees good, but i dont know, maybe achoo wea(ther) ?
not sure, try find better, if not stays

## 느려요★★★
Neural is very far from slow -- the idea is good, because tells a simple story, but if something closer exists change it



## 형용사 ★★★★★

## 깨끗해요 ★★★ 
cake cut is far from clean, feels forced, still good, just change if theres a better one


## 좋아요 ★★★★


## 뜨거워요 ★


## 멀어요 ★★★★★
this is perfect, you can maybe add another place that is far with similar sound, just to complement but only if exists, Mordor is great 

## 달라요 ★

## 작아요 ★

## 얇아요 ★

## 매워요 ★★★
the mayo thing is good, but lets find more


## 재미없어요 ★★★★★


## 쉬워요 ★★★

## 어려워요 ★★★★
the error word its great but the phrase a bit weird, find more, explore 


## 바빠요 ★★★★★


## 똑같아요★★★★

## 잘생겼어요 ★★★

