# Memory Anchors and Roots

A Memory Anchor connects an unfamiliar Korean word to something you already know. The reaction it should produce is: *“That sounds like X, and X goes with this meaning.”* It links three things at once: the Korean **sound**, the **meaning**, and a **familiar** word, phrase, situation, or reference.

An anchor is not an explanation of how the word is built. “기 gi (記) ‘record’ + 자 ja (者) ‘person’ → 기자” is useful research, and it belongs in **Roots**. Conjugation notes (“예쁘다 → 예뻐요. 으 drops.”) also belong in Roots.

What works for this learner was derived from their ratings: see [the feedback analysis](anchor-feedback-analysis.md). In short, the best anchors have one instantly familiar keyword that sounds like the head of the Korean word and already implies the meaning: light BULB → 밝아요 (bright), BALA → 빨라요 (fast), MORDOR → 멀어요 (far).

## Three candidates, one choice

Every card offers three candidates. In the app, all three show until the learner picks one; from then on only that anchor shows, with a small **Change** button to bring the others back. A choice is saved in this browser (`sori.anchors.v1` in localStorage, separate from Difficult/Known progress).

- The candidates take different routes when good routes exist: an everyday word, a concept from science, tech, music, sports, or gaming, and a pop-culture reference or another language.
- Ratings decide how much changes. ★★★★★ anchors are kept verbatim and preselected (`1*` in the data); ★★★★ keep their keyword with polished wording as candidate 1; ★★★ keep the working element; ★★ and ★ start over.
- Candidate ids are stable within a card. Polishing the wording keeps the id, and with it the learner's choice; a genuinely new idea gets a new id.
- Under the selected anchor, five small stars record how well it sticks. **None of these work?** lets the learner write their own anchor or ask for new ideas.
- One, three, and seven calendar days after a choice, the Meaning reveal asks whether the word came back. Two or more misses (and more misses than hits) with the same anchor show a gentle “try another?” nudge. The app never changes a choice by itself.
- The guide (?) downloads all of this as `sori-anchor-feedback-<date>.json`: choices, ratings, recall checks, custom anchors, and words that need new ideas. That file is the input for the next round of anchor improvements; the app has no backend that could generate candidates on its own.

## Writing an anchor

1. **Find the sound-alike.** Say the Korean word aloud and ask what it sounds like: an English, Spanish, or French word or phrase, a well-known name, a familiar sound. Match the actual Korean pronunciation, not the romanization (see rule 2 below).
2. **Link it to the meaning with one short, logical scene.** The meaning should follow naturally: NAPPA, the Dragon Ball Z villain → 나빠요, *bad*. Fast as a BALA (Spanish for bullet) → 빨라요, *fast*. ERROR, ERROR… this is hard → 어려워요, *difficult*. A scene that only works once explained is not good enough.
3. **End with the Korean reading** (→ *na-ppa-yo*) so the hook leads back to the real pronunciation. The audio is still the reference.

Pop-culture, tech, music, and sports references are welcome when they are genuinely well known (Dragon Ball Z, Star Wars, Dr. Dre, Bob Marley, Psy). They are not required: a plain situation (“Grandma always slips you some MONEY” → 할머니) is often better. Avoid obscure references, forced or cringeworthy links, and anything that could confuse two cards.

Special cases:

- **Loanwords:** the source word is the familiar thing. Name it and point out the sound changes: COFFEE → 커피 *keo-pi* (Korean has no f).
- **Phrases:** chain the hooks of the words inside, so each word's own anchor is reinforced: 날씨 ≈ NASTY weather + 가 + 더워요 ≈ hot DEHORS.
- **Cognates you already know:** when the real origin *is* the familiar thing, it can be the anchor: CHAI → 차, SENSEI → 선생님, BULGOGI → 고기, Tokyo's CHIKATETSU → 지하철역.
- **Breakdowns stay in Roots,** even as a bonus line or a literal translation that mirrors English (축 = kick + 구 = ball; 주말 = week + end). The anchor finds a sound hook instead: Saturday at the MALL → 주말 *ju-mal*.

## Labels and conventions

- **Phonetic mnemonic · EN / ES / FR / KO:** a sound-alike hook. The UI notes it is not the word's origin. KO means the hook is another Korean word with the same sound (배우, actor / 배우다, to learn).
- **Verified word components:** phrase chains and cognates of familiar words (CHAI, SENSEI), each resting on a verified fact. Every factual statement must be supported by the card's Roots record. Inside these anchors, **≈** marks a sound-alike, and the UI explains it.
- **Borrowed word:** a loanword whose source word is the anchor.
- CAPITALS mark the hook to picture.

## Four distinct kinds of information

- **Memory Anchor:** the hook described above. The reveal includes the source meaning as a retrieval prompt.
- **Roots:** researched origin, Hanja, lexical components, or morphology (including conjugation patterns), with source links.
- **Related vocabulary:** up to five existing cards, each with the specific shared component, its meaning, and the relationship type: shared Hanja, same word/stem, shared pattern, or same loanword.
- **Pronunciation:** the reading guide, independent of the anchor.

The Memory Anchor and Roots controls reveal independently. Pronunciation and the full Meaning section remain separate. Listening mode is a writing exercise and shows none of the four; its Learn button opens the word in Standard mode with the Memory Anchor already open.

## Editorial rules

1. Ask: “Would this make me think *that sounds like something I know*, and would that thing lead me to the meaning?” If not, keep looking.
2. Check the hook against the real Korean sound: 어 is the vowel in “cup,” 으 is an unrounded “oo,” 시 sounds like “shi,” initial ㄱ/ㄷ/ㅂ/ㅈ sit between g/k, d/t, b/p, and j/ch, and ㄹ is a flap between vowels.
3. Never present a shared syllable as a shared root. Homophones (공원 公 vs 공항 空, 배 pear vs 배구 排) stay apart in Roots. A Korean sound-alike hook must not imply a relationship.
4. Any fact inside an anchor must be supported by the card's Roots record. Add the source and note to `origin-reviews.json` first.
5. In Roots, verify both membership and meaning. The same Hanja can have different senses, so character identity alone is not sufficient.
6. Distinguish a modern morphological pattern from historical origin. Do not force older decompositions for native or nativized words.
7. Preserve `vocabulary.md` meanings and forms even when a dictionary entry differs. Document discrepancies.

## Editing data

- `src/data/memory-aids.ts`: one reviewed block per source card, and the only source of Memory Anchors. A `key|reading guide` line, then three indented candidates: `id|hook language|kind|anchor`, where kind is `sound`, `roots`, `loanword`, or `reading`, and `1*` marks a five-star default.
- `src/data/origin-reviews.json`: one record per **card ID**, including dictionary lemma, origin classification, source IDs, curated component IDs, and an optional note. Record an omission reason when there is no useful origin. The two unconfirmed origin lookups retain attempted URLs.
- `src/data/root-concepts.json`: semantic component identities. Hanja keys include the actual character, e.g. `hanja:書`. Lexical stems, grammatical patterns, and loanword components use different key namespaces.
- `src/data/origin-sources.json`: reviewed source titles and URLs. The research is static; study never calls a dictionary API.
- `src/data/roots.ts`: creates related-card edges only from explicitly curated component IDs. It does not infer roots from substrings or pronunciation.

Run `npm run data:validate`, `npm run build`, and `npm test` after changes. Automated checks catch coverage, placeholders, missing or duplicate candidates, two candidates built on the same hook, oversized anchors, factual anchors without sourced Roots, unsupported graph edges, and known homophone mistakes. They cannot tell whether a hook sticks. Every content edit still needs a human pass, ideally out loud with the audio, and the learner's recall checks are the real test.

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

