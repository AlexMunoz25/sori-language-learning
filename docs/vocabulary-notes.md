# Source audit and interpretation

The original `vocabulary.md` is unchanged. English meanings are imported verbatim from the tables. Source provenance is stored on each card. The 16 original categories are preserved; the Spanish title of section 16 is displayed as **Useful words**, and prose examples use **Useful phrases**.

## Decisions

- **(똑)같다 / (똑)같아요:** split into 같다 → 같아요 and 똑같다 → 똑같아요. Both retain the original row and meaning.
- **채소 / 야채**, **락 / 록**, and **팝 / 가요:** each alternative has its own card and keeps the same source meaning. This also allows unambiguous audio playback.
- **가요:** the Verbs and Music cards have separate IDs and distinct memory aids. Neither overwrites the other.
- **잘생겼다 / 못생겼다:** the source's dictionary-form column is preserved exactly, along with 잘생겼어요 / 못생겼어요. No silent grammatical edits were made.
- **형 / 누나 / 오빠 / 언니:** speaker information is retained and displayed with the meaning. The source's “anyone” designation for younger siblings is also retained.
- **배:** the primary meaning remains “pear.” The prose's other senses, “boat” and “stomach/belly,” are preserved in its note.
- **밥:** the cooked rice / everyday meal distinction is preserved in a note; 밥 먹어요 has its own phrase card.
- **배우 / 배우다:** both remain separate, with a disambiguation note available after meaning reveal.
- **★ entries:** every starred entry is included, with a `sourceExtra` flag recording the source's distinction. This flag is unrelated to the learner's Difficult mark.
- **Headings:** 15 Korean category words not already in the tables are included as additional noun cards in their corresponding categories. 가족 already exists as a table card. This is why, for example, the 35-row Verbs section contains 36 cards including 동사; that noun has no fabricated conjugation.
- **24 prose examples:** translated using their adjacent source explanations, retaining Korean particles and pronouns. Sentence-final periods are omitted from card titles; original lines remain in `sourceText`.
- **Grammar ending introduction:** -아요 / -어요 / -해요 are grammar fragments, represented in the polite forms rather than standalone vocabulary cards.
- **무슨 + noun:** retained as a note on 무슨; all eight concrete examples have individual cards.
- **그래서:** the final “그래서:” is an editorial transition (“so”), not a study entry. This reviewed exclusion is explicit in `proseNotes`.
- Repeated prose mentions of 배우다, 가르치다, 배우, 배, and 밥 link conceptually to their existing cards/notes rather than duplicate cards.

Reading guides approximate spoken sounds, including common linking/assimilation (e.g. 읽어요 → il-geo-yo, 음료 → eum-nyo, 밥 먹어요 → bam meo-geo-yo). They are teaching aids, not IPA or strict character-by-character transliteration. Korean spelling is never replaced by a mnemonic.

## Memory-aid and origin review

All 325 cards have a reviewed origin record and three Memory Anchor candidates. See [the editorial standard](memory-anchors.md) and [research audit](roots-research.md). Sound-alike mnemonics, verified components, borrowed words, and related vocabulary are labeled separately; conjugation patterns appear in Roots, not as anchors. All shared-word links explain a real component and its meaning; matching syllables alone never create a link.

The build fails on missing source rows or reviews, stale generated data, missing pronunciation guides, duplicate IDs, missing evidence references, unsupported relationship edges, or oversized cues. A Roots section can intentionally be absent. These checks establish coverage and structural consistency; they do not replace linguistic review.

The source gloss for **엊그제** remains “the day before yesterday.” The consulted Wiktionary entry glosses it more broadly as “a few days ago”; no historical decomposition or altered source meaning was introduced.
