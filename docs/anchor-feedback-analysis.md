# What makes a Memory Anchor work for this learner

Analysis of the first round of ratings (October 2026): 27 anchors rated 1–5 stars, with comments. The principles at the end drive every anchor candidate in `src/data/memory-aids.ts`.

## The ratings

| Stars | Word | Anchor that was rated | What the rating tells us |
| --- | --- | --- | --- |
| ★★★★★ | 밝아요 bright | A light BULB: bright → 밝 balk → bal-ga-yo. | An everyday object whose whole purpose is the meaning. 밝 ≈ bulb. |
| ★★★★★ | 빨라요 fast | Fast as a BALA (es. bullet) → ppal-la-yo. | A native-language word that *is* the archetype of fast, with an exact sound match. |
| ★★★★★ | 멀어요 far | MORDOR is far, far away → 멀 meol → meo-reo-yo. | An iconic place whose defining trait is distance. |
| ★★★★★ | 바빠요 busy | PAPA is always busy → ba-ppa-yo. It even rhymes: 아빠 바빠요. | A universal word, a familiar truth, and a rhyme with Korean already known. |
| ★★★★★ | 형용사 adjective | HUGE, YOUNG, SAD: three adjectives → hyeong-yong-sa. | The sound-alike words are themselves examples of the meaning. |
| ★★★★★ | 재미없어요 boring | JAMMING cancelled? OOPS, no fun → jae-mi-eop-sseo-yo. | Two hooks map the two parts of the word (fun + none), and the scene literally means “no fun.” |
| ★★★★ | 어려워요 difficult | Compile ERROR after ERROR: difficult → eo-ryeo-wo-yo. | ERROR is ideal: a familiar technical word that means trouble. The wrapper phrase is clunky. |
| ★★★★ | 추워요 cold | Cold weather? ACHOO! → chu-wo-yo. | Good sound; the cold → sneeze link works; only the first syllable is covered. |
| ★★★★ | 날씬해요 slim | Slim as a nail: NAIL-THIN → nal-ssin-hae-yo. | NAIL works; 씬 should be part of something natural, not a made-up compound. |
| ★★★★ | 좋아요 good | Good things bring JOY → jo-a-yo. | Strong and simple. |
| ★★★★ | 똑같아요 exactly the same | TikTOK trends: everyone does EXACTLY the same dance. | Strong modern reference whose essence is copying. |
| ★★★★ | 재미있어요 fun | Bob Marley's “JAMMING”: pure fun. | Recognizable and sounds right, but “pure fun” is asserted, not felt. |
| ★★★ | 슬퍼요 sad | Sad: you SULK and POUT. | Right meaning, but *sulk* and *pout* are not everyday words for a non-native English speaker. |
| ★★★ | 피곤해요 tired | Tired: all your PEP is GONE. | GONE works; *pep* is not familiar. Learner proposed PEAK. |
| ★★★ | 맛없어요 not delicious | Gordon Ramsay gets MAD: “OOPS, it's bland!” | MAD works; the rest does not. |
| ★★★ | 느려요 slow | Training a NEURAL net on a laptop CPU: sooo slow. | A short scene is fine, but *neural* has nothing to do with slowness. |
| ★★★ | 깨끗해요 clean | A clean CAKE CUT. | A cake cut is too far from “clean.” |
| ★★★ | 매워요 spicy | SPICY MAYO. | The sound is promising; the link to heat needs strengthening. |
| ★★★ | 쉬워요 easy | An easy win, a 4–0 SWEEP. | Promising, not strong. |
| ★★★ | 잘생겼어요 handsome | JOLLY good-looking! | *Jolly* does not suggest handsome. |
| ★ | 뚱뚱해요 fat | Tap a big belly like a kick drum: TTUNG-TTUNG! | Onomatopoeia plus an invented scene. Learner proposed TUNGsten (dense, heavy). |
| ★ | 예뻐요 pretty | Is she pretty? “YEP, a BEAUty!” | YEP is a filler word carrying sound but no meaning. |
| ★ | 어두워요 dark | UNDERground: no sun, all dark. | Weak sound match and an indirect meaning. |
| ★ | 뜨거워요 hot to touch | Even a TOUGH GUY drops a hot pan. | An invented story; the keyword has nothing to do with heat. |
| ★ | 달라요 different | DOLLAR vs euro: different money. | The keyword does not mean different; the contrast is forced. |
| ★ | 작아요 small | JOCKeys are small. | Feels like trivia, not an instinct. |
| ★ | 얇아요 thin | “Y'ALL BEware, the ice is thin!” | Slang filler words plus a contrived sentence. |

## The pattern

Every ★★★★★ anchor has one familiar keyword that already *means* the target before any explanation: a bulb is brightness, a bullet is speed, Mordor is distance. The phrase around it is short and adds nothing the keyword can't carry.

The ★★★★ anchors have the right keyword but a flaw in the wrapper: clunky wording (ERROR), an asserted rather than felt link (JAMMING), or a syllable left out (ACHOO, NAIL-THIN). The keyword carries most of the value; polishing the wrapper is the fix.

The ★★★ anchors fail on one specific dimension while passing others: an unfamiliar word (sulk, pout, pep), a familiar domain with the wrong concept (neural ≠ slow), or a long semantic distance (cake cut ≠ clean). The working element should be kept (MAD, GONE, MAYO, NAIL).

The ★ anchors share the failure modes to avoid: filler words chosen only for sound (yep, y'all), invented cause-and-effect stories (a tough guy dropping a pan), keywords unrelated to the meaning (dollar ≠ different), and bare onomatopoeia without a real concept behind it.

## Principles for every candidate

1. **Instantly familiar keyword.** Everyday English, Spanish, or French, or a reference everyone knows (Mordor, Bob Marley, TikTok). Common beats clever. Avoid idiomatic or literary English that a fluent non-native speaker may not use daily (sulk, pout, pep, jolly, y'all).
2. **The keyword embodies the meaning.** Test: say only the keyword. Does the meaning come to mind without explanation? (bulb → bright, bullet → fast, Δ delta → difference, tungsten → dense and heavy, error → difficult.)
3. **Sound match on the head of the word**, ideally covering more syllables naturally (NAIL + 씬, ACHOO + 워). No filler words whose only job is to carry a sound.
4. **One short, natural phrase** (about 10 words). No invented stories, no chains of three ideas, no explanations.
5. **Domains earn their place through meaning.** Science, engineering, programming, music, sports, gaming, and pop culture are welcome when the concept itself carries the meaning (tungsten, error, Mordor), not just because the domain is familiar (neural ≠ slow).
6. **Bonus structure.** Hooks that map the parts of the word (JAMMING + OOPS → fun + none) or words that are examples of the meaning (HUGE, YOUNG, SAD → adjective) are especially strong.
7. **Keep what worked.** In a partly successful anchor, preserve the working element and rebuild the rest.
8. **Never** Hanja or grammar explanations as the hook (they live in Roots), childish or exaggerated phrasing, stereotypes, or references that need to be learned first.

## Three candidates per word

The three candidates take different routes to the meaning when good routes exist: an everyday word or phrase, a concept from science/tech/music/sports/gaming, and a pop-culture reference or another language. They are never three wordings of one idea unless that idea is exceptionally strong (loanwords, where the source word is the anchor).

Ratings decide how much changes: ★★★★★ anchors are kept verbatim as the default (and pre-selected); ★★★★ keep their keyword with polished wording as candidate 1; ★★★ keep the working element and add stronger alternatives; ★★ and ★ start from scratch, following the learner's own suggestion when given.

Each candidate is checked against five questions before it is saved: Does the keyword really sound like the Korean? Does it lead naturally to the meaning? Would the learner recognize it instantly? Can it be recalled in a few seconds? Does it stand out from the other cards' hooks?
