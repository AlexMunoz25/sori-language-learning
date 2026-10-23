import type { AnchorCandidate, MemoryAid } from '../types/vocabulary'

// One block per card: `key|reading guide`, then indented Memory Anchor candidates
// `id|hook language|kind|text`. Candidate ids are stable within a card: polishing keeps
// the id (and the learner's selection); a genuinely new idea gets a new id.
// `id*` marks a five-star anchor that stays selected until the learner picks another.
// Each anchor links the Korean sound to its meaning through something familiar; see
// docs/anchor-feedback-analysis.md. Etymology lives in origin-reviews.json.
// Anchors of kind roots may only state what the card's Roots record supports; ≈ marks a sound-alike inside them.
// Anchors of kind pattern state a true Korean pattern or word family (예쁘다 → 예뻐요, like 바쁘다 → 바빠요); every Korean
// word in them is a card, a form of one, in the card's Roots record, or in family-words.ts. Cultural anchors live in
// culture-anchors.ts, with their evidence.
// Full item ids distinguish homographs (가요 in Music versus Verbs).
const entries = `
예뻐요|ye-ppeo-yo
  1|en|sound|Pretty as Audrey HEPBURN: hep-bur ≈ ye-ppeo → ye-ppeo-yo.
  2|es|sound|“ESPEJO, espejo…” (es. mirror, mirror): who's the prettiest? → ye-ppeo-yo.
  3|fr|sound|Elle EST BELLE (fr. she's beautiful): é-bel ≈ ye-ppeo → ye-ppeo-yo.
  4|ko|pattern|예쁘다 → 예뻐요: the ㅡ drops, and after 예 it takes 어, as in 슬프다 → 슬퍼요; after ㅏ it takes 아: 바쁘다 → 바빠요.
잘생겼어요|jal-saeng-gyeo-sseo-yo
  1|en|sound|A sharp JAWLINE: the classic handsome look → jaw-l ≈ 잘 jal → jal-saeng-gyeo-sseo-yo.
  4|ko|roots|잘 jal = WELL + 생겼어요 saeng-gyeo-sseo-yo = LOOKS → good-looking: handsome. With 못 (poorly) instead: ugly.
  5|en|sound|Prince CHARMING: char-ming ≈ jal-saeng → jal-saeng-gyeo-sseo-yo.
못생겼어요|mot-ssaeng-gyeo-sseo-yo
  1|fr|sound|MOCHE (fr. ugly) ≈ 못 mot → mot-ssaeng-gyeo-sseo-yo.
  4|ko|roots|못 mot = POORLY + 생겼어요 saeng-gyeo-sseo-yo = LOOKS → looks poorly: ugly. With 잘 (well) instead: handsome.
  3|en|sound|Ugly as a MONSTER: mon-s ≈ mot-ss → mot-ssaeng-gyeo-sseo-yo.
귀여워요|gwi-yeo-wo-yo
  1|ja|sound|Anime's KAWAII (cute): k-wa-ii ≈ gwi-yeo → gwi-yeo-wo-yo.
  2|en|sound|So cute you go all GOOEY inside → gwi-yeo-wo-yo.
  3|en|sound|A baby PENGUIN waddling: pen-GWIN ≈ gwi → gwi-yeo-wo-yo.
  4|ko|pattern|귀엽다 → 귀여워요: ㅂ becomes 우, and 우 + 어 = 워, as in 무섭다 → 무서워요 and 쉽다 → 쉬워요.
날씬해요|nal-ssin-hae-yo
  1|en|sound|Slim and NAIL-THIN: nal ≈ NAIL, ssin ≈ THIN → nal-ssin-hae-yo.
  3|en|sound|The iPod NANO, famously slim: na ≈ nal → nal-ssin-hae-yo.
  4|ko|pattern|날씬하다 → 날씬해요: every 하다 word turns 하 into 해, as in its opposite 뚱뚱하다 → 뚱뚱해요.
뚱뚱해요|ttung-ttung-hae-yo
  1|en|sound|TUNGSTEN: one of the densest, heaviest metals → ttung-ttung-hae-yo.
  2|en|sound|Weighs a TON, a TON: chubby → ttung-ttung-hae-yo.
  3|es|sound|Gordo como un TONEL (es. a barrel): ton ≈ ttung → ttung-ttung-hae-yo.
  4|ko|pattern|뚱뚱하다 → 뚱뚱해요: every 하다 word turns 하 into 해, as in its opposite 날씬하다 → 날씬해요.
바빠요|ba-ppa-yo
  1*|mixed|sound|PAPA is always busy → ba-ppa-yo. It even rhymes: 아빠 바빠요, “Dad is busy.”
  2|en|sound|BACK-to-BACK meetings all day: busy → ba-ppa-yo.
  3|en|sound|BEBOP: busy, rapid-fire jazz → ba-ppa-yo.
  4|ko|pattern|바쁘다 → 바빠요: the ㅡ drops, and after 바 (ㅏ) it takes 아, as in 나쁘다 → 나빠요 and 아프다 → 아파요.
피곤해요|pi-gon-hae-yo
  1|en|sound|Your PEAK is GONE: tired → pi-gon-hae-yo.
  4|ko|roots|피곤 pi-gon = TIREDNESS + 해요 hae-yo = BE → be tired. The same 해요 makes 행복해요, be happy.
  5|en|sound|A big YAWN, so tired: big-yawn ≈ pi-gon → pi-gon-hae-yo.
아파요|a-pa-yo
  1|en|sound|“AH, PA(in)!” → a-pa-yo. Koreans really yell 아파! when something hurts.
  2|en|sound|An UPPERcut to the jaw: it hurts → a-pa-yo.
  3|en|sound|APPendicitis: it really hurts → a-pa-yo.
  4|ko|pattern|아프다 → 아파요: the ㅡ drops, and after ㅏ it takes 아, as in 바쁘다 → 바빠요; elsewhere 어: 슬프다 → 슬퍼요.
슬퍼요|seul-peo-yo
  1|fr|sound|Tout SEUL (fr. all alone): sad → seul-peo-yo.
  2|en|sound|In a SLUMP, feeling down → seul-peo-yo.
  3|es|sound|SUFRO (es. I'm suffering): sad → seul-peo-yo.
  4|ko|pattern|슬프다 → 슬퍼요: the ㅡ drops, and after 슬 it takes 어, as in 예쁘다 → 예뻐요; after ㅏ it takes 아: 아프다 → 아파요.
행복해요|haeng-bo-kae-yo
  1|en|sound|Happy: HANGing in a hammock with a BOOK → haeng-bo-kae-yo.
  2|en|sound|A HUG and a gift BOX: happy → haeng-bo-kae-yo.
  4|ko|roots|행복 haeng-bok = HAPPINESS + 해요 hae-yo = BE → be happy. The same 해요 makes 피곤해요, be tired.
무서워요|mu-seo-wo-yo
  1|es|sound|Night at the MUSEUM (es. el MUSEO), exhibits alive after dark: scary → mu-seo-wo-yo.
  2|en|sound|The JAWS MUSIC (dun-dun…): mu-sic ≈ mu-seo → scary → mu-seo-wo-yo.
  3|ko|pattern|무섭다 → 무서워요: ㅂ becomes 우, and 우 + 어 = 워. Mind 무거워요 (heavy): only ㅅ vs ㄱ tells them apart.
재미있어요|jae-mi-i-sseo-yo
  1|en|sound|Bob Marley's “JAMMING”: jamming IS SO fun! → jae-mi-i-sseo-yo.
  4|ko|roots|재미 jae-mi = FUN + 있어요 i-sseo-yo = THERE IS → there's fun: fun, interesting. 없어요 (there isn't) makes it boring.
  3|fr|sound|« J'AIME ! » (fr. I love it!): so much fun → jae-mi-i-sseo-yo.
  5|fr|sound|« Je M'AMUSE ! » (fr. having fun!): je-m’a ≈ jae-mi → jae-mi-i-sseo-yo.
재미없어요|jae-mi-eop-sseo-yo
  1*|en|sound|JAMMING cancelled? OOPS, no fun → jae-mi-eop-sseo-yo: boring.
  2|en|sound|GAME OVER: the fun is gone → jae-mi-eop-sseo-yo.
  4|ko|roots|재미 jae-mi = FUN + 없어요 eop-sseo-yo = THERE ISN'T → no fun: boring. 있어요 (there is) makes it fun.
  5|es|sound|¡Che, me ABURRO! (es. ugh, so bored): che-me-ab ≈ jae-mi-eop → jae-mi-eop-sseo-yo.
좋아요|jo-a-yo
  1|en|sound|Good things bring JOY → jo-a-yo (the ㅎ is silent).
  3|fr|sound|JOIE de vivre (fr. joy of living): good → jo-a-yo.
  4|fr|sound|« CHOUETTE ! » (fr. great!): shwe ≈ jwa, 좋아 said fast → jo-a-yo.
  5|ko|pattern|좋다 → 좋아요: ㅗ takes 아 and the ㅎ goes silent (jo-a-yo); 좋아 + 해요 gives 좋아해요, to like.
나빠요|na-ppa-yo
  1|en|sound|NAPPA, the Dragon Ball Z villain: a bad guy → na-ppa-yo.
  2|en|sound|A kidNAPPER: the worst kind of bad guy → nap-per ≈ na-ppa → na-ppa-yo.
  3|en|sound|Bad idea? “NAH, PASS.” → na-ppa-yo.
  4|ko|pattern|나쁘다 → 나빠요: the ㅡ drops, and after ㅏ it takes 아, as in 바쁘다 → 바빠요 and 아프다 → 아파요.
커요|keo-yo
  2|en|sound|The COLOSSAL Titan (Attack on Titan): big → keo-yo.
  3|en|sound|King KONG: big → keo-yo.
  4|en|sound|The Grand CANYON, as big as it gets: kan-yon ≈ 커요 → keo-yo.
  5|ko|pattern|크다 → 커요: a one-syllable stem drops its ㅡ and takes 어, like 쓰다 → 써요 (to write).
작아요|ja-ga-yo
  1|en|sound|The headphone MINI-JACK, the small one: jack ≈ 작 jak → ja-ga-yo.
  2|en|sound|JACK-JACK, the tiny Incredibles baby → 작 jak → ja-ga-yo.
  3|es|sound|Me queda CHICO (es. it's too small for me): chi-co ≈ ja-ga → ja-ga-yo.
  4|ko|pattern|작다 → 작아요, said ja-ga-yo: ㅏ takes 아 and the ㄱ slides onto it, as in 같아요 ga-ta-yo.
길어요|gi-reo-yo
  1|en|sound|A GIRAFFE's long neck: gi-raf ≈ gi-reo → gi-reo-yo.
  2|en|sound|KILOmeters long: ki-lo ≈ gi-reo → gi-reo-yo.
  3|en|sound|KILL Bill was so long it came in two volumes → 길 gil → gi-reo-yo.
  4|ko|pattern|길다 → 길어요: ㅣ takes 어, but its opposite 짧다 has ㅏ: 짧아요.
짧아요|jjal-ba-yo
  1|en|sound|A JAB is the shortest punch → 짧 jjalb → jjal-ba-yo.
  3|en|sound|CHOP it: cut short → chop ≈ 짧 jjalb → jjal-ba-yo.
  4|ko|pattern|짧다 → 짧아요, said jjal-ba-yo: the ㄹ stays and the ㅂ slides onto 아, as in 얇아요 yal-ba-yo and 넓어요 neol-beo-yo.
넓어요|neol-beo-yo
  1|en|sound|Lots of (N)ELBOW room: spacious → neol-beo-yo.
  2|es|sound|Una NAVE industrial (es. warehouse): na-be ≈ neol-beo, pure open space → neol-beo-yo.
  3|en|sound|A NEBULA, light-years wide → neol-beo-yo.
  4|ko|pattern|넓다 → 넓어요, said neol-beo-yo: the ㄹ stays and the ㅂ slides onto 어, as in 짧아요 jjal-ba-yo and 얇아요 yal-ba-yo.
좁아요|jo-ba-yo
  1|en|sound|A SHOEBOX apartment: so cramped → jo-ba-yo.
  3|en|sound|A CHOKEPOINT: the narrow pass every map has → choke-p ≈ jo-b → jo-ba-yo.
  4|ko|pattern|좁다 → 좁아요: this ㅂ stays, unlike 춥다 → 추워요; ㅗ takes 아, as in 좋다 → 좋아요.
두꺼워요|du-kkeo-wo-yo
  1|en|sound|A TOUCAN's thick beak → du-kkeo-wo-yo.
  2|en|sound|A puffy DUCK-down jacket: thick → du-kkeo-wo-yo.
  3|en|sound|Thick DOUGH for a deep-dish pizza → du-kkeo-wo-yo.
  4|ko|pattern|두껍다 → 두꺼워요: ㅂ becomes 우, and 우 + 어 = 워; its opposite 얇다 → 얇아요 keeps its ㅂ.
얇아요|yal-ba-yo
  1|en|sound|WALLPAPER: paper-thin → (w)al-pa ≈ yal-ba → yal-ba-yo.
  3|en|sound|A silicon WAFER: wafer-thin → wa-fer ≈ yal-ba → yal-ba-yo.
  4|ko|pattern|얇다 → 얇아요, said yal-ba-yo: the ㄹ stays and the ㅂ slides onto 아, as in 짧아요 jjal-ba-yo and 넓어요 neol-beo-yo.
무거워요|mu-geo-wo-yo
  1|en|sound|Lifting a full Oktoberfest beer MUG: heavy! → mu-geo-wo-yo.
  2|es|sound|MUCHO peso (es. lots of weight): heavy → mu-geo-wo-yo.
  3|es|sound|PESO MUERTO (es. deadlift, dead weight): the heaviest lift → muer ≈ mu-geo → mu-geo-wo-yo.
  4|ko|pattern|무겁다 → 무거워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 가볍다 → 가벼워요.
가벼워요|ga-byeo-wo-yo
  1|es|sound|Light as a GAVIOTA (es. seagull) → ga-byeo-wo-yo.
  2|en|sound|A CARBON-fiber bike: featherlight → ga-byeo-wo-yo.
  3|es|sound|Un GLOBO (es. balloon) floating away: light → ga-byeo-wo-yo.
  4|ko|pattern|가볍다 → 가벼워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 무겁다 → 무거워요.
가까워요|ga-kka-wo-yo
  1|en|sound|KAKAOTalk, Korea's chat app, keeps friends close → ga-kka-wo-yo.
  2|en|sound|A GECKO clings close to the wall → ga-kka-wo-yo.
  3|es|sound|¡Ven ACÁ! (es. come over here, close to me): a-ká ≈ (g)a-kka → ga-kka-wo-yo.
  4|ko|pattern|가깝다 → 가까워요: ㅂ becomes 우, and 우 + 어 = 워; its opposite 멀다 → 멀어요 is regular.
멀어요|meo-reo-yo
  1*|en|sound|MORDOR is far, far away → 멀 meol → meo-reo-yo.
  2|en|sound|MARS: the faraway red planet → 멀 meol → meo-reo-yo.
  3|en|sound|A desert MIRAGE: always far away → meo-reo-yo.
  4|ko|pattern|멀다 → 멀어요: ㅓ takes 어, while its opposite 가깝다 → 가까워요 is ㅂ-irregular.
같아요|ga-ta-yo
  1|es|sound|A copycat GATA (es. cat) does the same → ga-ta-yo.
  2|ja|sound|A karate KATA: everyone repeats the same moves → ga-ta-yo.
  3|en|sound|Cookie-CUTTER houses, every one the same: cut-ter ≈ ga-ta → ga-ta-yo.
  4|ko|pattern|같다 → 같아요, said ga-ta-yo: the ㅌ slides onto 아; put 똑 (exactly) in front and you get 똑같아요.
똑같아요|ttok-ga-ta-yo
  1|en|sound|TikTOK copycats: everyone does the exact same dance → ttok-ga-ta-yo.
  4|ko|roots|똑 ttok = EXACTLY + 같아요 ga-ta-yo = SAME → exactly the same. Without 똑, 같아요 is just same.
  3|es|sound|¡TOCAYO! (es. your exact same name): to-ca ≈ ttok-ga → ttok-ga-ta-yo.
달라요|dal-la-yo
  1|en|sound|Δ DELTA means difference: del-ta ≈ dal-la → dal-la-yo.
  2|es|sound|DALTÓNICO (es. color-blind): sees colors differently → dal-to ≈ dal-la → dal-la-yo.
  3|en|sound|“DARE to be different”: dare ≈ dal → dal-la-yo.
  4|ko|pattern|다르다 → 달라요: 르 turns into ㄹ + 라, as in 빠르다 → 빨라요 (fast).
빨라요|ppal-la-yo
  1*|es|sound|Fast as a BALA (es. bullet) → ppal-la-yo.
  2|en|sound|A peregrine FALCON, the fastest animal: fal ≈ ppal → ppal-la-yo.
  3|en|sound|Usain BOLT, the fastest man alive → ppal-la-yo.
  4|ko|pattern|빠르다 → 빨라요: 르 turns into ㄹ + 라, as in 다르다 → 달라요 (different).
느려요|neu-ryeo-yo
  1|en|sound|NO RUSH, take it slow → neu-ryeo-yo.
  2|es|sound|A NORIA (es. Ferris wheel) turns so slowly → neu-ryeo-yo.
  3|en|sound|“NEARLY done…” says the progress bar, for an hour: slow → neu-ryeo-yo.
  4|ko|pattern|느리다 → 느려요: ㅣ + 어 merge into ㅕ, as in 마시다 → 마셔요 and 기다리다 → 기다려요.
쉬워요|swi-wo-yo
  1|en|sound|Easy as flipping a SWITCH → swi-wo-yo.
  2|en|sound|SWISH! Nothing but net: an easy shot → swi-wo-yo.
  3|en|sound|Dictionary form 쉽다 swip-da: a 4–0 SWEEP, the easiest win → swi-wo-yo.
  4|ko|pattern|쉽다 → 쉬워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 어렵다 → 어려워요.
어려워요|eo-ryeo-wo-yo
  1|en|sound|ERROR, ERROR… this is hard → eo-ryeo-wo-yo.
  2|en|sound|ERROR… WHOA, so hard → eo-ryeo-wo-yo.
  3|es|sound|Se me hace cuesta ARRIBA (es. it’s an uphill climb, hard): a-rri-ba ≈ eo-ryeo-wo → eo-ryeo-wo-yo.
  4|ko|pattern|어렵다 → 어려워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 쉽다 → 쉬워요.
힘들어요|him-deu-reo-yo
  5|mixed|sound|HIM + DURO (es. hard): it's hard for him → him-deu-reo-yo.
  1|en|sound|Climbing the HIMalayas: exhausting → him-deu-reo-yo.
  2|en|sound|A HUNDRED burpees: exhausting → him-deu-reo-yo.
  4|ko|roots|힘 him = STRENGTH + 들어요 deu-reo-yo = IT TAKES → it takes strength: hard, tiring.
깨끗해요|kkae-kkeu-tae-yo
  1|en|sound|Clear the CACHE and COOKIES: a clean browser → kkae-kkeu-tae-yo.
  2|en|sound|Spotless: it CAN'T GET any cleaner → kkae-kkeu-tae-yo.
  3|mixed|sound|A KÄRCHER pressure washer: spotless → kär-cher ≈ kkae-kkeu → kkae-kkeu-tae-yo.
  4|ko|pattern|깨끗하다 → 깨끗해요, said kkae-kkeu-tae-yo: 하 → 해, and ㅅ + ㅎ sounds ㅌ, as in 따뜻해요 tta-tteu-tae-yo.
더러워요|deo-reo-wo-yo
  1|en|sound|Cleats caked in mud after a rain match: DIRTY ≈ deo-reo → deo-reo-wo-yo.
  2|en|sound|A muddy DIRT ROAD: dirty → deo-reo-wo-yo.
  3|en|sound|DORITOS dust on your fingers: dirty → deo-reo-wo-yo.
  4|ko|pattern|더럽다 → 더러워요: ㅂ becomes 우, and 우 + 어 = 워, as in 어둡다 → 어두워요 and 시끄럽다 → 시끄러워요.
조용해요|jo-yong-hae-yo
  1|en|sound|Zoom call: “JOE, YOU'RE ON mute!” Total silence → jo-yong-hae-yo.
  3|en|sound|The librarian: “JOE, YOUNG man… shh!” → jo-yong-hae-yo.
  4|ko|pattern|조용하다 → 조용해요: every 하다 word turns 하 into 해, as in 시원하다 → 시원해요 and 깨끗하다 → 깨끗해요.
시끄러워요|si-kkeu-reo-wo-yo
  1|en|sound|A SQUEAKY door: so noisy → si-kkeu-reo-wo-yo.
  2|en|sound|Fans SCREAM at the concert: so noisy! s-k-r ≈ si-kkeu-reo → si-kkeu-reo-wo-yo.
  3|es|sound|A summer CIGARRA (es. cicada): deafening all day! si-ga-rra ≈ si-kkeu-reo → si-kkeu-reo-wo-yo.
  4|ko|pattern|시끄럽다 → 시끄러워요: ㅂ becomes 우, and 우 + 어 = 워, as in 더럽다 → 더러워요 and 무섭다 → 무서워요.
밝아요|bal-ga-yo
  1*|en|sound|A light BULB: bright → 밝 balk → bal-ga-yo.
  2|en|sound|Stadium lights at a night BALLGAME: bright → bal-ga-yo.
  3|en|sound|Lava from a VOLCANO glows bright: vol-ca ≈ bal-ga → bal-ga-yo.
  4|ko|pattern|밝다 → 밝아요, said bal-ga-yo: the ㄹ stays and the ㄱ slides onto 아. In 밝다 the ㄹ goes silent: bak-tta.
어두워요|eo-du-wo-yo
  1|en|sound|In the (SH)ADOWS it’s dark: (sh)a-dow ≈ eo-du-wo → eo-du-wo-yo.
  2|en|sound|AT DUSK it gets dark: uh-dusk ≈ eo-du → eo-du-wo-yo.
  3|en|sound|The ADDAMS Family house: curtains shut, all dark. ad-am ≈ eo-du → eo-du-wo-yo.
  4|ko|pattern|어둡다 → 어두워요: ㅂ becomes 우, and 우 + 어 = 워; its opposite 밝다 → 밝아요 is regular.
더워요|deo-wo-yo
  1|en|sound|DEATH VALLEY, the hottest place on Earth → deo-wo-yo.
  2|fr|sound|Il fait chaud DEHORS (fr. it's hot outside) → deo-wo-yo.
  3|en|sound|Outside feels like THE OVEN → deo-wo-yo.
  4|ko|pattern|덥다 → 더워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 춥다 → 추워요.
추워요|chu-wo-yo
  1|en|sound|Cold, sniffly ACHOO WEAther: choo-wea ≈ chu-wo → chu-wo-yo.
  2|en|sound|Shivering like a CHIHUAHUA: chi-wa ≈ chu-wo → chu-wo-yo.
  3|fr|sound|Une CHUTE de neige (fr. a snowfall): brr! → chu-wo-yo.
  4|ko|pattern|춥다 → 추워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 덥다 → 더워요.
뜨거워요|tteu-geo-wo-yo
  1|es|sound|“¡TE QUEMAS!” (es. careful, you'll burn yourself!) → tteu-geo-wo-yo.
  2|en|sound|Don't TOUCH, it's hot! touch ≈ 뜨거 tteu-geo → tteu-geo-wo-yo.
  3|en|sound|TIGER Balm: hot on the skin → tteu-geo-wo-yo.
  4|ko|pattern|뜨겁다 → 뜨거워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 차갑다 → 차가워요.
차가워요|cha-ga-wo-yo
  3|en|sound|Siberian CHAGA — WHOA, YO! It's cold → cha-ga-wo-yo.
  1|en|sound|CHUG an ice-cold drink → cha-ga-wo-yo.
  2|en|sound|A cocktail SHAKER full of ice: cold to the touch → cha-ga-wo-yo.
  4|ko|pattern|차갑다 → 차가워요: ㅂ becomes 우, and 우 + 어 = 워, like its opposite 뜨겁다 → 뜨거워요.
따뜻해요|tta-tteu-tae-yo
  1|fr|sound|Couvre TA TÊTE (fr. cover your head) to stay warm → tta-tteu-tae-yo.
  2|en|sound|A TEDDY bear hug: warm and cozy → tta-tteu-tae-yo.
  3|es|sound|“¡TÁPATE bien!” (es. wrap up warm): ta-pa-te ≈ tta-tteu-tae → tta-tteu-tae-yo.
  4|ko|pattern|따뜻하다 → 따뜻해요, said tta-tteu-tae-yo: 하 → 해, and ㅅ + ㅎ sounds ㅌ, as in 깨끗해요 kkae-kkeu-tae-yo.
시원해요|si-won-hae-yo
  1|en|sound|A cool SEA WIND: refreshing → si-won-hae-yo.
  3|en|sound|A SWIM ON a hot day: refreshing → si-won-hae-yo.
  4|en|sound|A sip of SCHWEPPES: ahh, so refreshing! shwe ≈ shi-wo(n) → si-won-hae-yo.
  5|ko|pattern|시원하다 → 시원해요: every 하다 word turns 하 into 해, as in 따뜻하다 → 따뜻해요 and 조용하다 → 조용해요.
싸요|ssa-yo
  1|en|sound|On SALE: cheap! → ssa-yo. Hit the ss hard; soft-s 사요 means “buy.”
  2|fr|sound|ÇA coûte rien (fr. it costs nothing): cheap → ssa-yo.
  3|en|sound|SAVE 90%: dirt cheap → ssa-yo.
  4|ko|pattern|싸다 → 싸요: ㅏ + 아 merge into one ㅏ, as in 사다 → 사요 (to buy). Only the tense ㅆ makes it cheap.
비싸요|bi-ssa-yo
  1|es|sound|Expensive? Put it on the VISA (“bi-sa” in Spanish) → bi-ssa-yo.
  2|es|sound|A PICASSO painting: worth millions → bi-ssa-yo.
  3|en|sound|VIP SEATS: pricey → bi-ssa-yo.
  4|ko|pattern|비싸다 → 비싸요: ㅏ + 아 merge into one ㅏ, as in 가다 → 가요 and 만나다 → 만나요.
매워요|mae-wo-yo
  1|en|sound|SRIRACHA MAYO: spicy → mae-wo-yo.
  2|en|sound|“MAYDAY! My mouth's on fire!” → mae-wo-yo.
  3|en|sound|MY WOK is on fire: a spicy stir-fry → mae-wo-yo.
  4|ko|pattern|맵다 → 매워요: ㅂ becomes 우, and 우 + 어 = 워, as in 덥다 → 더워요 and 쉽다 → 쉬워요.
맛있어요|ma-si-sseo-yo
  1|es|sound|Delicious? ¡MÁS, SÍ! (es. more, yes!) → ma-si-sseo-yo.
  4|ko|roots|맛 mat = TASTE + 있어요 i-sseo-yo = THERE IS → it has taste: delicious. 없어요 (there isn't) makes it not delicious.
  5|en|sound|A MASTERCHEF judge takes a bite: delicious! mas ≈ ma-si → ma-si-sseo-yo.
  6|en|sound|Dictionary form 맛있다 ma-sit-da: a MUST-EAT dish, so delicious → ma-si-sseo-yo.
맛없어요|ma-deop-sseo-yo
  1|en|sound|Gordon Ramsay, MAD and UPSET: “It's bland!” → ma-deop-sseo-yo.
  4|ko|roots|맛 mat = TASTE + 없어요 eop-sseo-yo = THERE ISN'T → no taste: not delicious. 있어요 (there is) makes it delicious.
  3|en|sound|Tastes like MUD: mud ≈ 맛 mat → ma-deop-sseo-yo.
  5|es|sound|¡Me DA ASCO! (es. it’s gross!): me-da-as ≈ ma-deop-sse → ma-deop-sseo-yo.
Verbs:가요|ga-yo
  1|en|sound|Ready, set, GO! Said with an “ah”: 가 ga → ga-yo.
  2|en|sound|Step on the GAS: go! → ga-yo.
  3|en|sound|“Go-go-GADGET!”, Inspector Gadget’s call: go, go → ga-yo.
  4|ko|pattern|가다 → 가요: the stem already ends in ㅏ, so the ending’s 아 merges into it, as in 자다 → 자요, 사다 → 사요 and 타다 → 타요.
와요|wa-yo
  1|en|sound|“Come this WAY!” → wa-yo.
  2|en|sound|WAVE someone over: come here! → wa-yo.
  3|en|sound|Past form 왔어요 wa-sseo-yo: a friend comes in, “WASSUP!” → wa-yo.
  4|ko|pattern|오다 → 와요: ㅗ + 아 fuse into ㅘ, as in 보다 → 봐요; ㅜ + 어 does the same in 주다 → 줘요.
다녀요|da-nyeo-yo
  1|en|sound|DANIEL-san goes to Miyagi's dojo every day → da-nyeo-yo.
  2|es|sound|DE NUEVO (es. again), day after day: de-nue ≈ da-nyeo → da-nyeo-yo.
  3|ko|pattern|다니다 → 다녀요: ㅣ + 어 fuse into ㅕ (니 + 어 → 녀), as in 마시다 → 마셔요 and 기다리다 → 기다려요.
먹어요|meo-geo-yo
  1|en|roots|MUKBANG, the online eating shows, comes from 먹 meok, “eat” → meo-geo-yo.
  2|en|sound|MUNCH on some snacks: eat → meo-geo-yo.
  3|en|sound|Gremlins rule: never feed the MOGWAI after midnight → meo-geo-yo.
  4|en|sound|Take one MEGA BITE: eat! mega ≈ 먹어 meo-geo → meo-geo-yo.
마셔요|ma-syeo-yo
  4|en|sound|To DRINK it, I MASH it! → ma-syeo-yo.
  1|en|sound|Drink a MATCHA latte → ma-syeo-yo.
  3|fr|sound|Étancher MA SOIF (fr. quench my thirst): ma-soi ≈ ma-syeo → ma-syeo-yo.
  5|ko|pattern|마시다 → 마셔요: ㅣ + 어 fuse into ㅕ (시 + 어 → 셔), as in 다니다 → 다녀요 and 가르치다 → 가르쳐요.
자요|ja-yo
  1|en|sound|Put on your paJAmas: time to sleep → ja-yo.
  2|en|sound|A JAW-cracking yawn: time to sleep → ja-yo.
  3|es|sound|“¡A la cama, YA!” (es. to bed, now!) → ja-yo.
  4|ko|pattern|자다 → 자요: the stem’s ㅏ absorbs the ending’s 아, as in 가다 → 가요 and 타다 → 타요.
가르쳐요|ga-reu-chyeo-yo
  1|en|sound|A GURU CHEERS on his students: teaching → ga-reu-chyeo-yo.
  2|en|sound|Dictionary form 가르치다: ga-reu-chi ≈ KARATE, a sensei teaching a class → ga-reu-chyeo-yo.
  3|fr|sound|CORRIGER les copies (fr. correct the papers): co-rri-ger ≈ ga-reu-chyeo → ga-reu-chyeo-yo.
  4|ko|pattern|가르치다 → 가르쳐요: ㅣ + 어 fuse into ㅕ (치 + 어 → 쳐), as in 마시다 → 마셔요 and 기다리다 → 기다려요.
배워요|bae-wo-yo
  1|es|sound|“¡Ah, ya VEO!” (es. oh, I see!): that's learning → bae-wo-yo.
  3|en|sound|PAVLOV's dog learned: bell means dinner → bae-wo-yo.
  4|en|sound|A Jedi PADAWAN, the apprentice who learns: pa…wan ≈ bae-wo → bae-wo-yo.
  5|ko|pattern|배우다 → 배워요: ㅜ + 어 fuse into ㅝ (우 + 어 → 워), as in 주다 → 줘요.
봐요|bwa-yo
  1|fr|sound|Je VOIS (fr. I see) → bwa-yo: to see / watch.
  2|fr|sound|VOILÀ! (fr. look, there it is) → bwa-yo.
  3|es|sound|¡Qué BUENA VISTA! (es. what a view!): bue ≈ 봐 bwa → bwa-yo.
  4|ko|pattern|보다 → 봐요: ㅗ + 아 fuse into ㅘ (보 + 아 → 봐), as in 오다 → 와요.
만나요|man-na-yo
  1|en|sound|“MAN, NICE to meet you!” → man-na-yo.
  2|en|sound|A one-on-one with your MANAGER: meeting → man-na-yo.
  3|es|sound|“¡Nos vemos MAÑANA!” (es. see you tomorrow!): meeting again → man-na-yo.
  4|ko|pattern|만나다 → 만나요: the stem’s ㅏ absorbs the ending’s 아, as in 일어나다 → 일어나요 and 사다 → 사요.
읽어요|il-geo-yo
  1|es|sound|A gripping story: “¿Y LUEGO?” (es. and then?), keep reading → il-geo-yo.
  2|fr|sound|IL LIT (fr. he reads) → 읽 il(k) → il-geo-yo.
  3|en|sound|ILLEGIBLE handwriting: too hard to read → il-geo-yo (hard g).
  4|ko|pattern|읽다 → 읽어요: last vowel ㅣ takes 어요, and before a vowel ㄺ splits into l + g: il-geo-yo, as in 밝아요 bal-ga-yo.
써요|sseo-yo
  1|en|sound|Write an ESSAY: es-SAY ≈ sseo → sseo-yo.
  2|fr|sound|« ÇA S'ÉCRIT comment ? » (fr. how do you write that?) → sseo-yo.
  3|es|sound|Escribir un ENSAYO (es. essay): en-sa-yo ≈ sseo-yo → sseo-yo.
  4|ko|pattern|쓰다 → 써요: the ㅡ drops before 어, as in 크다 → 커요; with a syllable before it, that vowel decides: 바쁘다 → 바빠요.
쇼핑해요|syo-ping-hae-yo
  1|ko|roots|쇼핑 syo-ping = SHOPPING + 해요 hae-yo = DO → do shopping: to shop.
  2|en|loanword|SHOP till your card goes PING → syo-ping-hae-yo.
  3|en|loanword|Black Friday SHOPPING spree → syo-ping-hae-yo.
  4|en|loanword|SHOPPING, Korean style: sho → 쇼 syo, -pping → 핑 ping → syo-ping-hae-yo.
청소해요|cheong-so-hae-yo
  1|en|sound|Grab a CHUNK of SOAP: cleaning time → cheong-so-hae-yo.
  2|en|sound|Weekend CHORES, SO much cleaning → cheong-so-hae-yo.
  4|ko|roots|청소 cheong-so = CLEANING + 해요 hae-yo = DO → do the cleaning: to clean.
  5|pt|sound|Limpar o CHÃO (pt. clean the floor): chão ≈ 청 cheong → cheong-so-hae-yo.
운동해요|un-dong-hae-yo
  1|es|sound|Counting reps: “¡UN, DOS…!” → un-dong-hae-yo.
  2|en|sound|Treadmill ON… workout DONE → un-dong-hae-yo.
  4|ko|roots|운동 un-dong = EXERCISE + 해요 hae-yo = DO → do exercise. Its 동 (動) is the movement in 동사, verb.
기다려요|gi-da-ryeo-yo
  1|en|sound|The GUITARIST is still tuning… wait → gi-da-ryeo-yo.
  2|es|sound|“¡QUIETO, espera!” (es. hold still, wait!): quie-to ≈ gi-da → gi-da-ryeo-yo.
  3|en|sound|Waiting for GODOT, who never comes: go-do ≈ 기다 gi-da → gi-da-ryeo-yo.
  4|ko|pattern|기다리다 → 기다려요: ㅣ + 어 fuse into ㅕ (리 + 어 → 려), as in 다니다 → 다녀요 and 마시다 → 마셔요.
요리해요|yo-ri-hae-yo
  5|en|sound|IORI Yagami (The King of Fighters) cooking dinner → yo-ri-hae-yo.
  1|en|sound|Cooking dinner: a fried egg’s YOLK over RICE → yo-ri-hae-yo.
  4|ko|roots|요리 yo-ri = COOKING + 해요 hae-yo = DO → do the cooking: to cook. A 요리사 is a cook.
  3|ja|sound|Japanese RYŌRI (cooking), as in Iron Chef's “Ryōri no Tetsujin” → yo-ri-hae-yo.
일해요|il-hae-yo
  5|en|sound|I'm ILL, sick of WORK! → il-hae-yo.
  4|ko|roots|일 il = WORK + 해요 hae-yo = DO → do work: to work.
  6|it|sound|IL LAVORO (it. work): il ≈ 일 il → il-hae-yo.
  7|en|sound|Back on the hamster WHEEL: work, work, work → il-hae-yo.
공부해요|gong-bu-hae-yo
  1|en|sound|KUNG FU ≈ gong-bu: hours of disciplined practice, like studying → gong-bu-hae-yo.
  2|en|sound|The GONG rings: hit the BOOKS → gong-bu-hae-yo.
  4|ko|roots|공부 gong-bu = STUDY + 해요 hae-yo = DO → do study: to study.
  5|en|sound|Back on CAMPUS: time to study. cam-pus ≈ 공부 gong-bu → gong-bu-hae-yo.
타요|ta-yo
  1|en|sound|Take a TAXI → ta-yo.
  2|en|sound|Ride the TARDIS through time → ta-yo.
  3|en|sound|TAKE the bus → ta-yo.
  4|ko|pattern|타다 → 타요: the stem’s ㅏ absorbs the ending’s 아, as in 가다 → 가요 and 자다 → 자요.
말해요|mal-hae-yo
  1|en|sound|SMALL TALK: 말 mal, talk → mal-hae-yo, to speak.
  2|es|sound|MALHABLADO (es. foul-mouthed: speaks badly): mal ≈ 말 mal → mal-hae-yo.
  4*|ko|roots|말 mal = WORDS + 해요 hae-yo = DO → doing speech: to speak.
울어요|u-reo-yo
  2|es|sound|LA LLORONA, the weeping woman: llo-ro ≈ u-reo → u-reo-yo.
  3|en|sound|A wolf HOWLS, a baby wails → 울 ul → u-reo-yo.
  4|en|sound|Alice cries a POOL of tears: (p)ool ≈ 울 ul → u-reo-yo.
  5|ko|pattern|울다 → 울어요: last vowel ㅜ takes 어요 and the ㄹ stays, as in 멀다 → 멀어요 and 길다 → 길어요; future: 울 거예요.
웃어요|u-seo-yo
  1|en|sound|What a (H)OOT! → 웃 ut → u-seo-yo, to laugh.
  3|en|sound|A smile is U-shaped: U ≈ 웃 u → u-seo-yo.
  4|fr|sound|Dites OUISTITI ! (fr. say cheese!): oui-sti ≈ 웃어 u-seo → u-seo-yo.
  5|ko|pattern|웃다 → 웃어요: last vowel ㅜ takes 어요 and the ㅅ slides into it: u-seo-yo, like 씻다 → 씻어요 ssi-seo-yo.
좋아해요|jo-a-hae-yo
  1|en|sound|It SPARKS JOY (Marie Kondo): you like it → jo-a-hae-yo.
  4|ko|roots|좋 jo = GOOD + 아해요 a-hae-yo = TO FEEL → to feel good about: to like. 싫어해요 (hate) is built the same way.
  5|en|sound|Your top CHOICE, the one you like: choi ≈ 좋아 jo-a → jo-a-hae-yo.
사랑해요|sa-rang-hae-yo
  1|en|sound|Propose to SARAH with a RING → sa-rang-hae-yo, the K-pop “saranghae.”
  2|en|sound|K-pop finger hearts say “SARANGHAE”: I love you → sa-rang-hae-yo.
  4|ko|roots|사랑 sa-rang = LOVE + 해요 hae-yo = DO → do love: to love.
  5|en|sound|A SERENADE under her window: se-re-na ≈ sa-rang, love → sa-rang-hae-yo.
싫어해요|si-reo-hae-yo
  1|en|sound|SHEER disgust → 싫어 shi-reo → si-reo-hae-yo.
  4|ko|roots|싫 sil = HATEFUL + 어해요 eo-hae-yo = TO FEEL → to feel it's hateful: to hate. 좋아해요 (like) is built the same way.
  5|en|sound|SHERE KHAN hates man (The Jungle Book): shere ≈ 싫어 shi-reo → si-reo-hae-yo.
  6|en|sound|ZERO stars from me: I hate it. ze-ro ≈ 싫어 shi-reo → si-reo-hae-yo.
씻어요|ssi-seo-yo
  1|en|sound|Wash the SHEETS → 씻 ssit → ssi-seo-yo.
  2|en|sound|SHE SOAPS up her hands: washing → ssi-seo-yo.
  3|ja|sound|SHISEIDO face wash: shi-sei ≈ ssi-seo → ssi-seo-yo.
  4|ko|pattern|씻다 → 씻어요: last vowel ㅣ takes 어요 and the final ㅅ slides over: ssi-seo-yo, like 웃다 → 웃어요.
샤워해요|sya-wo-hae-yo
  1|ko|roots|샤워 sya-wo = SHOWER + 해요 hae-yo = DO → do a shower: to take a shower.
  2|en|loanword|Singing in the SHOWER → sya-wo-hae-yo.
  3|en|loanword|Reddit's SHOWER THOUGHTS → sya-wo-hae-yo.
  4|en|loanword|SHOWER, Korean style: sha-wer → 샤워 sya-wo → sya-wo-hae-yo.
들어요|deu-reo-yo
  1|en|sound|Listen to Dr. DRE on your Beats → deu-reo-yo.
  2|fr|sound|Jouer D'OREILLE (fr. play by ear): listen → deu-reo-yo.
  3|en|sound|Ear pressed to the DOOR, listening in: door ≈ 들어 deu-reo → deu-reo-yo.
  4|ko|pattern|듣다 → 들어요: ㄷ turns into ㄹ before a vowel, as in 걷다 → 걸어요; regular 받다 → 받아요 keeps its ㄷ.
걸어요|geo-reo-yo
  1|en|sound|A runway GIRL walks the catwalk → 걸 geol → geo-reo-yo.
  2|en|sound|A slow stroll through an art GALLERY → geo-reo-yo.
  3|en|sound|A GORILLA's knuckle-walk → geo-reo-yo.
  4|ko|pattern|걷다 → 걸어요: ㄷ turns into ㄹ before a vowel, as in 듣다 → 들어요.
사요|sa-yo
  1|en|sound|At checkout: “SAYOnara, cash!” You just bought it → sa-yo.
  2|en|sound|Buy a SODA: 사다 sa-da → sa-yo.
  3|en|sound|SAY YES to the dress: you buy it → sa-yo.
  4|ko|pattern|사다 → 사요: the stem’s ㅏ absorbs the ending’s 아, as in 가다 → 가요 and 만나다 → 만나요.
만들어요|man-deu-reo-yo
  1|en|sound|The MAN DREW it: he made it → man-deu-reo-yo.
  2|en|sound|The MANDALORIAN's Armorer forges new armor: making → man-deu-reo-yo.
  3|es|sound|Hecho a MANO (es. handmade): ma-no ≈ 만 man → man-deu-reo-yo.
  4|ko|pattern|만들다 → 만들어요: ㅡ takes 어요 and the ㄹ stays. Future: 만들 거예요, with no 을, unlike 먹을 거예요.
일어나요|i-reo-na-yo
  1|en|sound|“Get up EARLY, NOW!” → i-reo-na-yo.
  2|en|sound|Sleeping Beauty AURORA finally wakes up → i-reo-na-yo.
  3|en|sound|The ALARM rings: get up! a-lar ≈ 일어 i-reo → i-reo-na-yo.
  4|ko|pattern|일어나다 → 일어나요: the stem’s ㅏ absorbs the ending’s 아, as in 만나다 → 만나요 and 가다 → 가요.
줘요|jwo-yo
  1|fr|sound|Give a JOUET (fr. toy) → jwo-yo.
  2|fr|sound|JOYEUX Noël (fr.): time to give presents → jwo-yo.
  3|en|sound|Drop a coin in the tip JAR: give → jwo-yo.
  4|ko|pattern|주다 → 줘요: ㅜ + 어 fuse into ㅝ (주 + 어 → 줘), as in 배우다 → 배워요.
받아요|ba-da-yo
  1|es|sound|At a BODA (es. wedding) you receive gifts → ba-da-yo.
  2|en|sound|Achievement unlocked: you receive a BADGE → ba-da-yo.
  3|en|sound|PAYDAY: you receive your salary. pay-day ≈ 받아 ba-da → ba-da-yo.
  4|ko|pattern|받다 → 받아요: last vowel ㅏ takes 아요 and the ㄷ stays, unlike 듣다 → 들어요 and 걷다 → 걸어요.
엊그제|eot-kkeu-je
  1|en|sound|“Just the OTHER DAY…” → eot-kkeu-je: the day before yesterday.
  3|fr|sound|L'AUTRE JOUR (fr. the other day): autre ≈ eot-kkeu, jour ≈ je → eot-kkeu-je.
  4|en|sound|Two days AGO: a-go ≈ eot-kkeu → eot-kkeu-je.
  5|ko|pattern|엊 = 어제 YESTERDAY, shortened (as in 엊저녁, last night) + 그제 = the day before yesterday → yesterday and the day before.
어제|eo-je
  1|es|sound|AYER, yesterday in Spanish → eo-je.
  2|fr|sound|Every French diary starts “HIER, J'AI…” (yesterday, I…) → eo-je.
  3|ko|pattern|어제 shrinks to 엊 before another time word: 엊그제 (the day before yesterday) and 엊저녁 (last night).
오늘|o-neul
  1|en|sound|“ONLY TODAY!” → o-neul.
  2|en|sound|“OH, a NEW day!” That's today → o-neul.
  3|ko|pattern|오늘 = TODAY, also in 오늘날 (today + 날 day: nowadays). In a row: 어제, 오늘, 내일, 모레.
내일|nae-il
  1|en|sound|“NAH, I'LL do it tomorrow” → nae-il.
  2|en|sound|“Good NIGHT, see you tomorrow!”: night ≈ nae → nae-il.
  4|ko|roots|내 (來) nae = COMING + 일 (日) il = DAY → the coming day: tomorrow.
모레|mo-re
  1|en|sound|Tomorrow, then one MORE day → mo-re.
  2|de|sound|ÜBERMORGEN (de. the day after tomorrow): mor ≈ mo-re → mo-re.
  3|ko|pattern|모레 = the day after tomorrow; 내일모레 (TOMORROW + the day after) means 'any day now', the mirror of 엊그제.
월요일|wo-ryo-il
  1|en|sound|A WOLF howls at the moon (월 wol) → wo-ryo-il: Monday.
  2|en|sound|Monday blues: WORRY, feel ILL → wo-ryo-il.
  4|ko|roots|월 (月) wol = MOON + 요일 yo-il = DAY → the Moon's day: Monday, like lunes and lundi.
화요일|hwa-yo-il
  1|en|sound|Mars, god of WAR: war ≈ hwa → hwa-yo-il, Tuesday.
  2|en|sound|Taco Tuesday: “WHOA, YO, spicy!” → hwa-yo-il.
  4|ko|roots|화 (火) hwa = FIRE, MARS + 요일 yo-il = DAY → Mars's day: Tuesday, like martes.
수요일|su-yo-il
  1|en|sound|Midweek: SO, YOU'LL make it to Friday → su-yo-il, Wednesday.
  2|en|sound|Hump-day SOUP: halfway through the week → su-yo-il.
  4|ko|roots|수 (水) su = WATER, MERCURY + 요일 yo-il = DAY → Mercury's day: Wednesday, like miércoles.
목요일|mo-gyo-il
  1|en|sound|THOR's day: Thor MOCKS Loki every Thursday → 목 mok → mo-gyo-il.
  2|en|sound|Throwback Thursday: MOCK your old photos → mo-gyo-il.
  4|ko|roots|목 (木) mok = WOOD, JUPITER + 요일 yo-il = DAY → Jupiter's day: Thursday, like jueves.
금요일|geu-myo-il
  1|en|sound|TGIF! “COME, YO, payday drinks on me!” → geu-myo-il.
  4|ko|roots|금 (金) geum = GOLD, VENUS + 요일 yo-il = DAY → Venus's day: Friday, like viernes.
  5|de|sound|Freitagabend, endlich GEMÜTLICH (de. cozy): gemüt ≈ geu-myo → geu-myo-il.
토요일|to-yo-il
  2|en|sound|Saturday road trip in the TOYOTA → to-yo-il.
  4|ko|roots|토 (土) to = EARTH, SATURN + 요일 yo-il = DAY → Saturn's day: Saturday.
  5|en|sound|Sábado, the Sabbath, the day off from TOIL: toil ≈ to-yo-il → to-yo-il.
일요일|i-ryo-il
  1|en|sound|Sunday sunshine ILLUMINATES everything → i-ryo-il.
  2|en|sound|Lazy Sunday: “I REALLY chill” → i-ryo-il.
  4|ko|roots|일 (日) il = SUN + 요일 yo-il = DAY → the Sun's day: Sunday.
평일|pyeong-il
  1|en|sound|Weekdays: Slack PINGs all day → pyeong-il.
  2|en|sound|Just a PLAIN, ordinary day: a weekday → pyeong-il.
  4|ko|roots|평 (平) pyeong = ORDINARY + 일 (日) il = DAY → an ordinary day: weekday.
  5|en|sound|A Warcraft PEON: “Work, work!” Monday to Friday: pe-on ≈ pyeong → pyeong-il.
주말|ju-mal
  1|en|sound|Saturday at the MALL: the weekend! mall ≈ mal → ju-mal.
  2|en|sound|A JUMANJI movie marathon all weekend → ju-mal.
  4|ko|roots|주 (週) ju = WEEK + 말 (末) mal = END → week-end, word for word.
농구|nong-gu
  1|en|sound|“NO GOOD!” The shot rims out → nong-gu.
  4|ko|roots|농 (籠) nong = BASKET + 구 (球) gu = BALL → basket-ball, word for word.
  3|en|sound|The Denver NUGGETS: nug ≈ nong → nong-gu.
축구|chuk-kku
  1|en|sound|CHUCK Norris roundhouse-kicks the ball → chuk-kku.
  2|es|sound|“¡CHUTA!” (es. shoot!) yells the crowd → chuk-kku.
  4|ko|roots|축 (蹴) chuk = KICK + 구 (球) gu = BALL → kick-ball: soccer, football.
  5|pt|sound|O JOGO bonito (pt. the beautiful game: football): jo-go ≈ chuk-kku → chuk-kku.
야구|ya-gu
  1|en|sound|Fans yell “YA, GO!” as the batter sprints → ya-gu.
  4|ko|roots|야 (野) ya = FIELD + 구 (球) gu = BALL → field ball: baseball. Same 野 as 야채.
  5|en|sound|The New York YANKEES: yank ≈ ya-gu → ya-gu.
수영|su-yeong
  1|en|sound|Swimming keeps you SO YOUNG → su-yeong.
  2|es|sound|“¡SOY UN pez!” (es. I'm a fish!): swimming → su-yeong.
  4|ko|roots|수 (水) su = WATER + 영 (泳) yeong = SWIMMING → swimming in water. Same 水 as 수요일.
  5|en|sound|Pack your SWIMSUIT: swim ≈ su-yeong → su-yeong.
태권도|tae-kkwon-do
  1|en|sound|TAEKWONDO, Korea's martial art: the same word → tae-kkwon-do.
  4|ko|roots|태권 (跆拳) tae-kkwon = FOOT AND FIST + 도 (道) do = WAY → the way of foot and fist: taekwondo.
  5|en|sound|TEKKEN and its taekwondo kickers: tek-ken ≈ tae-kkwon → tae-kkwon-do.
골프|gol-peu
  1|en|loanword|GOLF. Korean has no f, so f → ㅍ p, plus eu → gol-peu.
  2|es|sound|Every swing is a GOLPE (es. stroke): golpe ≈ gol-peu → gol-peu.
  3|en|loanword|Tiger Woods' GOLF → gol-peu.
  4|ko|pattern|From English golf: f → ㅍ p, as in 커피 coffee and 판타지 fantasy, and a final consonant gets an extra eu, as in 테니스 tennis.
탁구|tak-kku
  1|en|sound|TAK, TAK: the ping-pong ball's click → tak-kku.
  2|fr|sound|Du TAC AU TAC (fr. quick-fire back-and-forth): a ping-pong rally → tak-kku.
  4|ko|roots|탁 (卓) tak = TABLE + 구 (球) gu = BALL → table ball: table tennis.
요가|yo-ga
  1|en|loanword|YOGA → yo-ga, the same word.
  3|en|loanword|YOGA said with Spanish vowels, not English yoh-guh → yo-ga.
  4|en|sound|Master YODA, cross-legged and calm: yo-da ≈ yo-ga → yo-ga.
  5|ko|pattern|From Sanskrit yoga, via English: each open syllable carries over one to one, 요가 yo-ga, like 바나나 banana and 키위 kiwi.
마라톤|ma-ra-ton
  1|en|loanword|MARATHON / maratón. Korean has no th → ma-ra-ton.
  2|es|loanword|MARATÓN (es.): the same three syllables → ma-ra-ton.
  3|en|loanword|42.195 km of MARATHON → ma-ra-ton.
  4|ko|pattern|From marathon: Korean has no th, so it becomes ㅌ t here, and ㄷ d in 스무디 smoothie.
테니스|te-ni-seu
  1|en|loanword|TENNIS, plus a final eu → te-ni-seu.
  2|es|loanword|TENIS (es.): te-nis → te-ni-seu.
  3|en|loanword|Nadal's TENNIS → te-ni-seu.
  4|ko|pattern|From tennis: a final s gets an extra eu, giving 스 seu, as in 주스 juice and 댄스 dance.
배구|bae-gu
  1|en|sound|Beach volleyball on the BAY → bae-gu.
  2|ja|sound|HAIKYU!!, the volleyball anime, is the same word (排球) → bae-gu.
  4|ko|roots|배 (排) bae = VOLLEY + 구 (球) gu = BALL → volley-ball. Not the 배 of pear.
  5|de|sound|BAGGERN (de. the forearm pass in volleyball): bag-ge ≈ bae-gu → bae-gu.
배드민턴|bae-deu-min-teon
  1|en|loanword|BADMINTON → bae-deu-min-teon.
  2|es|loanword|BÁDMINTON (es.) → bae-deu-min-teon.
  3|en|loanword|BAD-MIN-TON, with bad split in two: bae-deu, min, teon → bae-deu-min-teon.
  4|ko|pattern|From badminton: bad → bae-deu, like hand → haen-deu in 핸드폰: a becomes ae, and a final d gets an extra eu.
달리기|dal-li-gi
  1|en|sound|DALL·E only RUNS on GPUs → dal-li-gi.
  2|es|sound|“¡DALE, DALE!” (es. go, go!) cheering a runner → dal-li-gi.
  4|ko|roots|달리 dal-li = RUN + 기 gi = -ING → running.
  5|de|sound|“DALLI, dalli!” (de. hurry up!): dal-li ≈ 달리 → dal-li-gi.
복싱|bok-ssing
  1|en|loanword|BOXING → bok-ssing.
  2|en|loanword|Rocky's BOXING → bok-ssing.
  3|es|loanword|BOXEO (es.) / BOXE (fr.) → bok-ssing.
  4|ko|pattern|From boxing: x = k + s splits across syllables (복 + 싱), and -ing stays -ing, as in 쇼핑해요 (shopping + do).
헬스|hel-sseu
  1|en|loanword|From HEALTH club: Koreans call gym training 헬스 → hel-sseu.
  2|en|sound|Leg day is HELL: hell ≈ hel → hel-sseu.
  3|en|loanword|The gym is your daily HEALTH potion → hel-sseu.
  4|ko|pattern|헬스 = gym training, from English HEALTH club; + 장 jang = place → 헬스장, the gym.
봄|bom
  1|en|sound|Flowers B(L)OOM in spring → bom.
  3|en|sound|Spring: a BOOM of new life → bom.
  4|de|sound|BAUMBLÜTE (de. trees in blossom): baum ≈ 봄 bom → bom.
  5|ko|pattern|봄 = SPRING, also in 봄비 (spring + 비 rain) and 봄바람 (spring + 바람 wind: a spring BREEZE).
여름|yeo-reum
  1|en|sound|“YO, RUM!” on the beach: summer → yeo-reum.
  2|en|sound|All winter you YEARN for summer → yeo-reum.
  3|ko|pattern|여름 = SUMMER, also in 여름방학 (summer + school BREAK: summer vacation) and 한여름 (MIDSUMMER).
가을|ga-eul
  1|en|sound|Autumn GALES blow the leaves down → ga-eul.
  2|en|sound|Halloween GHOULS: autumn → ga-eul.
  3|mixed|sound|Leaves CAER (es. fall) in the FALL: ca-er ≈ ga-eul → ga-eul.
  4|ko|pattern|가을 = AUTUMN, also in 초가을 (early autumn) and 늦가을 (late autumn); 늦 as in 늦다, to be late.
겨울|gyeo-ul
  1|en|sound|A CRUEL winter → gyeo-ul.
  2|en|sound|Bundled up in WOOL for winter: wool ≈ (gyeo-)ul → gyeo-ul.
  3|en|sound|CURLING, the Winter Olympics ice sport: curl ≈ gyeo-ul → gyeo-ul.
  4|ko|pattern|겨울 = WINTER, also in 겨울잠 (winter + SLEEP: hibernation; 잠 as in 자요) and 한겨울 (MIDWINTER).
빨간색|ppal-gan-saek
  1|en|sound|The Lady in Red's BALL GOWN → ppal-gan-saek.
  2|es|sound|¡PELIGRO! (es. danger): red warning signs → ppal-gan-saek.
  4|ko|roots|빨간 ppal-gan = RED + 색 (色) saek = COLOR → red-colored: red. 색 ends every color word.
  5|en|sound|Red VALENTINE roses and hearts: val ≈ ppal → ppal-gan-saek.
주황색|ju-hwang-saek
  4|ko|roots|주황 (朱黃) ju-hwang = VERMILION-YELLOW + 색 (色) saek = COLOR → red meets yellow: orange.
  3|en|sound|Naruto's orange JUMPSUIT → ju-hwang-saek.
  5|it|sound|ZUCCA (it. pumpkin), Halloween orange: zuc ≈ ju → ju-hwang-saek.
노란색|no-ran-saek
  1|en|sound|NO RAIN, just yellow sunshine → no-ran-saek.
  4|ko|roots|노란 no-ran = YELLOW + 색 (色) saek = COLOR → yellow-colored: yellow.
  5|en|sound|A yellow sticky NOTE: note ≈ no → no-ran-saek.
초록색|cho-rok-saek
  1|en|sound|CHLOROphyll makes leaves green: chlo-ro ≈ cho-rok → cho-rok-saek.
  2|en|sound|SHREK, the green ogre: shrek ≈ cho-rok → cho-rok-saek.
  4|ko|roots|초 (草) cho = GRASS + 록 (綠) rok = GREEN + 색 (色) saek = COLOR → grass-green. Same 綠 as 녹차.
  5|en|sound|A green Irish SHAMROCK: sham-rock ≈ cho-rok → cho-rok-saek.
파란색|pa-ran-saek
  1|en|sound|PARASAIL over the deep blue sea → pa-ran-saek.
  2|en|sound|Avatar's blue Na'vi of PANDORA → pa-ran-saek.
  4|ko|roots|파란 pa-ran = BLUE + 색 (色) saek = COLOR → blue-colored: blue.
남색|nam-saek
  1|en|sound|Navy blue's NAMESAKE is the Royal Navy uniform: name-sake ≈ nam-saek → nam-saek.
  4|ko|roots|남 (藍) nam = INDIGO + 색 (色) saek = COLOR → indigo: navy blue. Not 남 (男), male.
  5|en|sound|A NAVY SEAL: navy seal ≈ nam-saek → nam-saek.
보라색|bo-ra-saek
  1|en|sound|Wonka's Violet BEAUREgarde turns purple: BEAU-RE ≈ bo-ra → bo-ra-saek.
  4|ko|roots|보라 bo-ra = PURPLE + 색 (色) saek = COLOR → purple-colored: purple.
  5|it|sound|VIOLA (it. purple): vio-la ≈ bo-ra → bo-ra-saek.
  6|es|sound|MORADO (es. purple): mo-ra ≈ bo-ra → bo-ra-saek.
흰색|huin-saek
  1|en|sound|“WHEE!” Sledding on white snow → huin-saek.
  2|en|sound|WHITE, said with a breathy h: hwi → huin-saek.
  4|ko|roots|흰 huin = WHITE + 색 (色) saek = COLOR → white-colored: white.
검은색|geo-meun-saek
  4|ko|roots|검은 geo-meun = BLACK + 색 (色) saek = COLOR → black-colored: black.
  2|en|sound|GUNMETAL black: gun-me ≈ geo-meun → geo-meun-saek.
  3|en|sound|GOTHAM at night: Batman's black city → geo-meun-saek.
회색|hoe-saek
  2|en|sound|A big gray WHALE: whale ≈ 회 hoe → hoe-saek.
  4|ko|roots|회 (灰) hoe = ASH + 색 (色) saek = COLOR → ash-colored: gray.
  5|en|sound|A gray-and-white HUSKY: hus-ky ≈ hoe-saek → hoe-saek.
분홍색|bun-hong-saek
  1|fr|sound|ROSE BONBON is French for candy pink: bonbon ≈ bun-hong → bun-hong-saek.
  2|en|sound|The pink battery BUNNY (Duracell, Energizer) → bun-hong-saek.
  4|ko|roots|분홍 (粉紅) bun-hong = POWDER-RED + 색 (色) saek = COLOR → powdered red: pink. 紅 is the red of 홍차.
갈색|gal-saek
  1|es|sound|Brown like a GALLETA (es. cookie) → gal-saek.
  4|ko|roots|갈 (褐) gal = BROWN + 색 (色) saek = COLOR → brown-colored: brown.
  5|fr|sound|A golden-brown GALETTE (fr. butter biscuit): ga-lette ≈ gal → gal-saek.
하늘색|ha-neul-saek
  1|en|sound|Not a cloud in the sky: “HA, NULL!” ha-null ≈ ha-neul → ha-neul-saek.
  4|ko|roots|하늘 ha-neul = SKY + 색 (色) saek = COLOR → sky-colored: light blue.
  3|en|sound|HONOLULU skies: light blue → ha-neul-saek.
  5|de|sound|HIMMELBLAU (de. sky blue): himmel ≈ ha-neul → ha-neul-saek.
베이지색|be-i-ji-saek
  1|ko|roots|베이지 be-i-ji = BEIGE + 색 (色) saek = COLOR → beige-colored: beige.
  2|en|loanword|BEIGE office walls → be-i-ji-saek.
  3|fr|loanword|BEIGE, the French word: bèje → be-i-ji-saek.
  4|pt|sound|BEGE (pt. beige): bé-ji ≈ be-i-ji → be-i-ji-saek.
사과|sa-gwa
  1|en|sound|The apple SAGA: Eve, Newton, Snow White → sa-gwa.
  2|en|sound|Carl SAGAN's apple pie: “first, invent the universe” → sa-gwa.
  3|ko|pattern|사과 = apple, as in 사과주스 (apple juice) and 사과나무 (apple tree). A different 사과, same sound, means apology.
포도|po-do
  1|fr|sound|BORDEAUX wine starts as grapes → po-do.
  2|pt|sound|PORTO wine, pressed from grapes: por-to ≈ po-do → po-do.
  3|ko|pattern|포도 = grape, as in 포도주스 (grape juice). Drop the 스 and 포도주 is wine: its 주 means alcohol, as in 맥주.
바나나|ba-na-na
  1|es|loanword|BANANA (es.), said the Spanish way: three open a's → ba-na-na.
  2|en|loanword|The Minions yelling “BA-NA-NA!” → ba-na-na.
  3|en|loanword|Mario Kart's BANANA peel → ba-na-na.
  4|ko|pattern|From English banana: every a is a full ㅏ, never a soft uh, as in 드라마 drama and 마라톤 marathon.
딸기|ttal-gi
  1|fr|sound|A TARTE aux fraises (fr. strawberry tart): tarte ≈ ttal → ttal-gi.
  2|en|sound|The AI test: TALLY the r's in STRAWBERRY → ttal-gi.
  3|en|sound|A frozen strawberry DAIQUIRI: dai-qui ≈ ttal-gi → ttal-gi.
  4|ko|pattern|딸기 = strawberry, as in 딸기우유 (strawberry + 우유 milk): Korea's classic pink strawberry milk.
수박|su-bak
  1|en|sound|A watermelon is SOOO BIG → su-bak.
  2|en|sound|SUIKA Game: merge fruit after fruit up to the giant watermelon → su-bak.
  3|ko|pattern|수박 = watermelon, as in 수박주스 (watermelon juice) and 수박씨 (watermelon seed).
망고|mang-go
  1|en|loanword|MANGO → mang-go, the same word.
  2|es|loanword|MANGO (es.): same word, same vowels → mang-go.
  3|en|loanword|Thai MANGO sticky rice → mang-go.
  4|ko|pattern|From English mango: the long o of go becomes a plain ㅗ, as in 콜라 cola and 요가 yoga.
오렌지|o-ren-ji
  1|en|loanword|ORANGE: the final ge gets its own beat, 지 ji → o-ren-ji.
  2|fr|sound|ORANGINA, the fizzy orange soda: o-ran-gi(-na) ≈ o-ren-ji → o-ren-ji.
  3|de|loanword|ORANGE (de.), said in three beats: o-ran-zhe ≈ o-ren-ji → o-ren-ji.
  4|ko|pattern|From English orange: a final j sound takes ㅣ instead of ㅡ, so -nge → 지, as in 베이지색 (beige).
배|bae
  1|en|sound|A PEAR, minus the r: pe(ar) → bae.
  2|es|sound|PERA (es. pear), cut short: pe(ra) → bae.
  3|fr|sound|Poire BELLE-Hélène, the classic pear dessert: belle → bae.
  4|ko|pattern|배 = pear, as in 배나무 (pear tree). Not the 배 of 배구 (volleyball) or 배우 (actor): same sound, other words.
복숭아|bok-ssung-a
  1|en|sound|Bowser's BOSS SONG: “Peaches, Peaches, Peaches!” → bok-ssung-a.
  2|en|sound|Peach BLOSSOM → bok-ssung-a.
  3|ko|pattern|복숭아 = peach, as in 복숭아꽃 (peach blossom) and 복숭아뼈 (peach bone: the ankle bone).
키위|ki-wi
  1|en|loanword|KIWI → ki-wi.
  2|en|loanword|New Zealand's KIWI, bird and fruit → ki-wi.
  3|ko|pattern|From English kiwi: k, t, p become the puffed ㅋ, ㅌ, ㅍ, as in 테니스 tennis and 팝 pop.
레몬|re-mon
  1|en|loanword|LEMON → re-mon. Korean ㄹ covers both l and r.
  2|es|loanword|LIMÓN (es.): li-mon ≈ re-mon.
  3|en|loanword|A science-class LEMON battery → re-mon.
  4|ko|pattern|레몬 lemon and 로맨틱 romantic start with the same ㄹ: Korean has one letter for both l and r.
체리|che-ri
  1|en|loanword|CHERRY → che-ri.
  2|en|loanword|The CHERRY on top → che-ri.
  3|en|loanword|git CHERRY-PICK → che-ri.
  4|ko|pattern|From English cherry: an r between vowels is one ㄹ (체리), an l is two (콜라 cola, 발라드 ballad).
콜라|kol-la
  1|en|loanword|COLA → kol-la.
  2|en|loanword|Coca-COLA → kol-la.
  3|es|loanword|COLA (es.): ko-la → kol-la.
  4|ko|pattern|From English cola: an l between vowels is written ㄹㄹ so it stays an l, as in 발라드 ballad and 일렉트로닉.
사이다|sa-i-da
  1|en|loanword|From CIDER, but in Korea it's lemon-lime soda, like Sprite → sa-i-da.
  2|en|loanword|CIDER, with sai split in two: sai-der → sa-i-da.
  3|ko|pattern|From English cider: the long i splits into two beats, 사이 sa-i, as in 아이스크림 ice cream.
커피|keo-pi
  1|en|loanword|COFFEE. Korean has no f, so f → ㅍ p → keo-pi.
  2|en|loanword|KOPI, coffee in Indonesian (as in kopi luwak) → keo-pi.
  3|en|sound|A CUP of coffee: cup has 커's exact vowel → keo-pi.
  4|ko|pattern|From English coffee: Korean has no f, so f → ㅍ, as in 카페 café, 골프 golf, and 판타지 fantasy.
녹차|nok-cha
  1|en|sound|Old NOKIA screens glowed green + CHAI, tea → nok-cha, green tea.
  2|en|sound|The Hulk KNOCKS back a green tea → nok-cha.
  4|ko|roots|녹 (綠) nok = GREEN + 차 (茶) cha = TEA → green tea, word for word. Same 綠 as 초록색.
홍차|hong-cha
  1|en|sound|HONG Kong milk tea is made with black tea → hong-cha.
  4|ko|roots|홍 (紅) hong = RED + 차 (茶) cha = TEA → “red tea,” named for its reddish brew: black tea.
  3|en|sound|HONG Kong high tea, CHA in hand → hong-cha.
오렌지주스|o-ren-ji-ju-seu
  1|en|loanword|ORANGE + JUICE → o-ren-ji-ju-seu.
  2|en|loanword|OJ: O for o-ren-ji, J for ju-seu → o-ren-ji-ju-seu.
  3|ko|pattern|오렌지 orange + 주스 juice, two borrowed words; swap in 포도 grape and you get 포도주스.
포도주스|po-do-ju-seu
  1|en|sound|BORDEAUX grapes (포도 po-do) + JUICE → po-do-ju-seu.
  2|pt|sound|PORTO grapes (포도 po-do) + JUICE → po-do-ju-seu.
  3|en|roots|포도 po-do = GRAPE + 주스 ju-seu = JUICE → grape juice, word for word; 주스 is English juice.
버블티|beo-beul-ti
  2|en|loanword|BUBBLE TEA, a.k.a. boba → beo-beul-ti.
  3|en|loanword|BUBBLE's u is exactly 어, the cup vowel → beo-beul-ti.
  4|ko|pattern|From English bubble tea: the uh sound of bubble and cup becomes ㅓ, as in 컴퓨터 computer.
우유|u-yu
  1|en|sound|Milk mustache: “OOH, YOU got milk!” → u-yu.
  4|ko|roots|우 (牛) u = COW + 유 (乳) yu = MILK → cow's milk: milk.
  3|ko|sound|Korea's iconic BANANA MILK: 바나나 우유 → u-yu.
스무디|seu-mu-di
  1|en|loanword|SMOOTHIE → seu-mu-di (th → d).
  2|en|loanword|A post-workout SMOOTHIE → seu-mu-di.
  3|ko|pattern|From English smoothie: an s before a consonant gets ㅡ (sm → 스무), as in 아이스크림 ice cream.
맥주|maek-jju
  1|en|sound|Brewers MAKE JUICE out of barley → maek-jju: beer.
  2|ko|sound|CHIMAEK night: fried CHIcken + MAEKju, beer → maek-jju.
  3|ko|roots|maek = BARLEY + 주 ju = ALCOHOL, as in SOJU → barley alcohol: beer.
물|mul
  1|fr|sound|MOULES (fr. mussels) live in water → mul.
  2|fr|sound|MOUILLÉ (fr. wet): soaked in water → mul.
  3|en|sound|MURKY pond water → mul.
  4|ko|pattern|물 = water, also in 눈물 (eye + water: tears) and 물고기 (water + 고기 meat: fish).
차|cha
  1|en|roots|CHAI → cha. Both come from the same Chinese word for tea, 茶.
  2|ja|sound|Japanese O-CHA, the tea at every sushi bar → cha.
  3|pt|sound|Portuguese CHÁ: the same tea word → cha.
주스|ju-seu
  2|en|loanword|JUICE plus a soft eu after the s → ju-seu.
  3|en|loanword|JUICY already has two beats: ju-sy → ju-seu.
  4|ko|pattern|From English juice: a final consonant gets ㅡ, as in 치즈 cheese, 댄스 dance, and 테니스 tennis.
한국 음식|han-guk eum-sik
  2|en|roots|K-FOOD, spelled out: 한국 Korea + 음식 food → han-guk eum-sik.
  3|en|sound|Korean BBQ night: HAN-COOK style, “MMM, CHIC!” → han-guk eum-sik.
  4|en|sound|Korean barbecue: every bite HAND-COOKED at your own table → han-guk eum-sik.
중국 음식|jung-guk eum-sik
  2|en|roots|중국 jung-guk = China + 음식 eum-sik = food → Chinese food, word for word.
  3|en|sound|ZHONGGUO's dumplings: “MMM, CHIC!” → jung-guk eum-sik.
  4|en|sound|Street Fighter's CHUN-LI, the fighter from China: chun ≈ jung → jung-guk eum-sik.
일본 음식|il-bon eum-sik
  1|fr|sound|Sushi? “IL est BON!” (fr. it's good) → 일본 il-bon, Japan + 음식 eum-sik, food.
  2|en|roots|일본 Japan + 음식 food → il-bon eum-sik.
  3|en|sound|NIPPON, Japan's own name: nip-pon ≈ il-bon, + 음식 food → il-bon eum-sik.
서양 음식|seo-yang eum-sik
  2|en|roots|서양 (西洋: 西 west + 洋 ocean) the West + 음식 food → seo-yang eum-sik.
  3|en|sound|HOMESICK in Seoul? You crave Western food → seo-yang eum-sik.
  4|en|sound|Steak frites, pasta: “MMM, CHIC!”, the Western plate → seo-yang eum-sik.
고기|go-gi
  1|en|roots|Korean BBQ BULGOGI = 불 bul, fire + 고기 go-gi, meat.
  2|en|sound|GO GRILL some meat → go-gi.
  3|en|sound|KOBE beef, the world's best-known meat: ko-be → go-gi.
채소|chae-so
  1|en|sound|Bok CHOY, SO green → chae-so: vegetables.
  2|ko|sound|JAPCHAE, glass noodles with mixed veggies: its CHAE means vegetables → chae-so.
  4|ko|roots|채 (菜) chae = VEGETABLE + 소 (蔬) so = VEGETABLE → greens on greens: vegetables. 菜 is also in 야채.
야채|ya-chae
  1|en|sound|YAMS and CHARD: two vegetables → ya-chae.
  2|ja|sound|Japanese YASAI (vegetables), the same word: ya-sai → ya-chae.
  4|ko|roots|야 (野) ya = FIELD + 채 (菜) chae = VEGETABLE → field greens: vegetables. Same 野 as 야구.
면|myeon
  1|en|sound|Chow MEIN, fried noodles: mein ≈ myeon → noodles.
  2|en|sound|Shin RAMYUN noodles: …myun → 면 myeon, noodles.
  3|ko|pattern|면 = noodles, the 면 at the end of 라면 (ramyeon) and 냉면 (cold noodles).
빵|ppang
  1|es|loanword|PAN (es.), PAIN (fr.) → ppang: bread. It came via Japanese pan, from Portuguese pão.
  2|ja|loanword|Japanese PANKO (bread crumbs): pan = bread → ppang.
  3|pt|loanword|PÃO (pt. bread), the word Japan borrowed: nasal pão ≈ ppang → ppang.
  4|ko|pattern|빵 = bread, as in 빵집 (bread + 집 house: bakery) and 식빵 (sliced white bread).
아이스크림|a-i-seu-keu-rim
  2|en|loanword|“I scream, you scream, we all scream for ICE CREAM” → a-i-seu-keu-rim.
  3|en|loanword|ICE CREAM, one Korean beat per sound: a-i-seu-keu-rim.
  4|ko|pattern|From English ice cream: each extra consonant gets ㅡ, ice → 아이스, cream → 크림, as in 스무디 smoothie.
치즈|chi-jeu
  2|en|loanword|“Say CHEESE!” → chi-jeu.
  3|en|loanword|CHEESE: the final z becomes ㅈ + soft eu → chi-jeu.
  4|en|sound|CHEESY nachos: chee-zy ≈ chi-jeu, already two beats → chi-jeu.
  5|ko|pattern|From English cheese: a final z sound becomes 즈, with ㅡ, as in 재즈 jazz.
밥|bap
  1|en|roots|BIBIMBAP is “mixed rice”: 밥 bap = rice, and by extension a meal.
  3|ko|sound|GIMBAP, the seaweed rice roll: its BAP is the rice → bap.
  4|it|sound|È pronta la PAPPA! (it. food's ready!): pappa ≈ bap → bap.
김치|gim-chi
  1|en|sound|KIMCHI: English took the word from Korean → gim-chi, with a soft g.
  2|en|sound|Say “KIMCHI!” for Korean photos, like “CHEESE!” → gim-chi.
  3|ko|pattern|김치 = kimchi, as in 김치찌개 (kimchi stew) and 김치볶음밥 (kimchi fried rice: 볶음 stir-fry + 밥 rice).
계란|gye-ran
  1|en|sound|Hens eat GRAIN, then lay eggs → gye-ran.
  2|fr|sound|QUICHE LORRAINE, the egg tart: quiche ≈ gye, -raine ≈ ran → gye-ran.
  4|ko|roots|계 (鷄) gye = CHICKEN + 란 (卵) ran = EGG → a chicken's egg: egg.
닭고기|dak-kko-gi
  1|en|sound|Chicken thighs are DARK meat: DARK ≈ 닭 dak + 고기 go-gi (bulGOGI) → chicken.
  4|ko|roots|닭 dak = CHICKEN + 고기 go-gi = MEAT → chicken meat: chicken.
  3|ko|sound|BULDAK noodles = fire + 닭 chicken, like BULGOGI = fire + meat → dak-kko-gi.
생선|saeng-seon
  1|en|sound|Fresh SALMON on the plate → saeng-seon: fish (as food).
  2|ko|sound|Flip SENSEI's 선생 (teacher) and you get 생선: fish → saeng-seon.
  3|ko|pattern|생선 = fish as food, as in 생선구이 (grilled fish); a fish swimming in water is 물고기.
공포 영화|gong-po yeong-hwa
  2|en|sound|GONG + POltergeist: a horror movie → gong-po yeong-hwa.
  3|en|roots|공포 (恐怖) gong-po = FEAR + 영화 yeong-hwa = movie → a fear movie: horror movie.
  4|en|sound|The CONJURING, a modern horror classic: con ≈ gong → gong-po yeong-hwa.
  5|es|sound|Watching it con PAVOR (es. with dread): con-pa ≈ gong-po → gong-po yeong-hwa.
로맨틱 영화|ro-maen-tik yeong-hwa
  1|en|roots|ROMANTIC + 영화 ≈ “YOU WANNA see a movie?” → romantic movie.
  2|en|loanword|ROMANTIC in Korean beats: ro-maen-tik, with the a of man → ro-maen-tik yeong-hwa.
  3|fr|loanword|Un film ROMANTIQUE (fr.): ro-man-tik, the same -tik ending → ro-maen-tik yeong-hwa.
  4|en|loanword|Titanic, The Notebook: the classic ROMANTIC movie night → ro-maen-tik yeong-hwa.
코미디 영화|ko-mi-di yeong-hwa
  1|en|roots|COMEDY + 영화 ≈ “YOU WANNA see a movie?” → comedy.
  2|fr|loanword|Une COMÉDIE (fr.): ko-mé-di, the same three beats → ko-mi-di yeong-hwa.
  3|es|loanword|COMEDIA (es.): ko-me-dia ≈ ko-mi-di → ko-mi-di yeong-hwa.
  4|en|loanword|Jim Carrey, Mr. Bean: pure COMEDY → ko-mi-di yeong-hwa.
판타지 영화|pan-ta-ji yeong-hwa
  1|en|roots|FANTASY (f → p) + 영화 ≈ “YOU WANNA see a movie?” → fantasy movie.
  2|en|loanword|FANTASY: Korean has no f, so f → ㅍ p, and -sy → 지 ji → pan-ta-ji yeong-hwa.
  3|es|loanword|FANTASÍA (es.): fan-ta-sí ≈ pan-ta-ji → pan-ta-ji yeong-hwa.
  4|en|loanword|The Lord of the Rings, peak FANTASY → pan-ta-ji yeong-hwa.
SF 영화|e-seu-e-peu yeong-hwa
  1|en|roots|S-F for sci-fi, said e-seu e-peu, + 영화 ≈ “YOU WANNA see a movie?”
  2|en|loanword|SF, letter by letter: es → e-seu, ef → e-peu, since Korean has no f → e-seu-e-peu yeong-hwa.
  3|fr|loanword|Un film de SF (fr.): French also says the letters, ès-èf → e-seu-e-peu yeong-hwa.
  4|en|loanword|Star Wars, Interstellar: classic SF → e-seu-e-peu yeong-hwa.
액션 영화|aek-ssyeon yeong-hwa
  1|en|roots|ACTION + 영화 ≈ “YOU WANNA see a movie?” → action movie.
  2|en|loanword|ACTION: the -tion ending becomes 션 syeon → aek-ssyeon yeong-hwa.
  3|en|loanword|“Lights, camera, ACTION!” → aek-ssyeon yeong-hwa.
  4|es|loanword|Una película de ACCIÓN (es.): ak-sión ≈ aek-ssyeon → aek-ssyeon yeong-hwa.
애니메이션|ae-ni-me-i-syeon
  1|en|loanword|ANIMATION: the a of cat is 애, and -tion becomes 션 → ae-ni-me-i-syeon.
  2|en|loanword|ANIME is short for ANIMATION → ae-ni-me-i-syeon.
  3|en|loanword|Pixar ANIMATION → ae-ni-me-i-syeon.
  4|ko|pattern|From English animation: -tion becomes 션 syeon, as in 액션 영화 (action movie).
다큐멘터리|da-kyu-men-teo-ri
  2|en|loanword|DOCUMENTARY in an American accent: DAH-kyu-men-tuh-ree → da-kyu-men-teo-ri.
  3|es|loanword|DOCUMENTAL (es.) ≈ da-kyu-men-teo-ri.
  4|en|loanword|A David Attenborough DOCUMENTARY → da-kyu-men-teo-ri.
  5|ko|pattern|From English documentary: the unstressed -ta- becomes 터 teo, as in 컴퓨터 computer.
드라마|deu-ra-ma
  1|en|loanword|DRAMA → deu-ra-ma, as in K-drama.
  2|en|loanword|DRAMA: Korean splits the dr with a soft eu → deu-ra-ma.
  3|es|loanword|DRAMA (es.): the same word → deu-ra-ma.
  4|ko|pattern|From English drama: Korean breaks the dr cluster with ㅡ, 드 + 라, as in 클래식 classic and 일렉트로닉 electronic.
댄스|daen-seu
  2|en|loanword|K-pop DANCE practice → daen-seu.
  3|en|loanword|DANCE, with a soft eu after the s → daen-seu.
  4|es|loanword|DANZA (es.), the Latin American way: dan-sa ≈ daen-seu → daen-seu.
  5|ko|pattern|From English dance: the a of cat becomes ㅐ, as in 랩 rap and 애니메이션 animation.
힙합|hip-hap
  2|en|loanword|Old-school HIP-HOP beats → hip-hap.
  3|en|loanword|HIP-HOP, with an “ah”: hip-hap.
  4|ko|pattern|From English hip-hop, said the American way: hop ≈ hahp, so o → ㅏ, as in 팝 pop and 락 rock.
락|rak
  1|en|loanword|ROCK → rak. Same word as 록.
  2|en|loanword|ROCK 'n' roll, said with an “ah” → rak.
  3|en|loanword|Queen's “We Will ROCK You” → rak.
  4|ko|pattern|락 and 록 are the same rock: 락 follows the American ah, like 팝 pop; 록 keeps the o and is the standard spelling.
록|rok
  1|en|loanword|ROCK → rok, the standard spelling.
  2|en|loanword|ROCK with a round British o → rok (락 is the American “rahk”).
  3|es|loanword|ROCK (es.), said with an o → rok.
  4|ko|pattern|From English rock: a final k after a short vowel closes the syllable as ㄱ, no ㅡ, as in 클래식 classic.
일렉트로닉|il-lek-teu-ro-nik
  1|en|sound|ELECTRONIC, with ㅡ splitting the tr: lek-teu-ro → il-lek-teu-ro-nik.
  2|en|sound|ELECTRONIC dance music (EDM) → il-lek-teu-ro-nik.
  3|es|sound|ELECTRÓNICA (es.) → il-lek-teu-ro-nik.
  4|ko|pattern|From English electronic: an l between vowels doubles to ㄹㄹ (il-lek), as in 콜라 cola and 발라드 ballad.
발라드|bal-la-deu
  1|en|sound|BALLAD: Korean doubles the l to keep it an l, bal-la → bal-la-deu.
  2|fr|sound|BALLADE (fr.): the slow love song → bal-la-deu.
  3|es|sound|BALADA (es.) → bal-la-deu.
  4|ko|pattern|From English ballad: a final d takes ㅡ and becomes 드, as in 핸드폰 hand phone.
랩|raep
  1|en|loanword|RAP → raep.
  2|en|loanword|Eminem-speed RAP → raep.
  3|en|loanword|RAP battle → raep.
  4|ko|pattern|From English rap: a final p closes the syllable as ㅂ, no ㅡ, as in 팝 pop and 힙합 hip-hop.
팝|pap
  2|en|loanword|POP music, with an “ah” → pap.
  3|en|loanword|K-POP's POP → pap.
  4|en|loanword|Michael Jackson, the King of POP → pap.
  5|ko|pattern|팝 = pop, also in 케이팝 (K + pop) and 팝송 (pop song: Western pop hits).
Music:가요|ga-yo
  1|en|sound|Lady GAGA, YO: pop music → ga-yo. Same sound as 가요, “go.”
  3|ko|roots|가 (歌) ga = SONG + 요 (謠) yo = SONG → songs everyone sings: pop. Not 가요, go. Same 歌 as 가수.
  4|en|sound|KARAOKE night, belting the pop hits everyone knows → ga-yo.
케이팝|ke-i-pap
  2|en|loanword|BTS, BLACKPINK: K-POP → ke-i-pap.
  3|en|loanword|K + POP, letter then word → ke-i-pap.
  4|ko|pattern|In 케이팝 the letter K is read by its English name, 케이 ke-i, as in 알앤비 R&B.
재즈|jae-jeu
  2|en|loanword|A smoky JAZZ club → jae-jeu.
  3|en|loanword|JAZZ, in two beats: jae-jeu.
  4|en|sound|JAZZY: jaz-zy ≈ jae-jeu, already two beats → jae-jeu.
  5|ko|pattern|From English jazz: the a of cat becomes ㅐ and the zz becomes 즈, as in 댄스 dance and 치즈 cheese.
클래식|keul-lae-sik
  1|en|loanword|CLASSIC(al) → keul-lae-sik.
  2|en|loanword|CLASSICAL music: Bach, Mozart → keul-lae-sik.
  3|es|loanword|CLÁSICA (es.) → keul-lae-sik.
  4|ko|pattern|From English classic: the cl cluster splits with ㅡ, 클 + 래, as in 아이스크림 ice cream.
알앤비|al-aen-bi
  1|en|loanword|R & B, said “ar-and-bee” → al-aen-bi.
  2|en|loanword|R&B slow jams → al-aen-bi.
  3|en|loanword|Usher, Beyoncé, The Weeknd: R&B → al-aen-bi.
  4|ko|pattern|From English R&B: letters are read by name, R → 알, & → 앤, B → 비, as in 케이팝 (the letter K).
여자|yeo-ja
  1|en|sound|Tarzan: “Me Tarzan, YOU JANE” → yeo-ja: woman.
  2|ko|sound|K-dramas' YEOJA-CHINGU (여자친구) means girlfriend → yeo-ja: woman.
  4|ko|roots|여 (女) yeo = FEMALE + 자 (子) ja = PERSON → a female person: woman. Same 女 as 여동생.
  5|es|sound|“¿Y ELLA?” (es. and her?), the woman: y-ella ≈ yeo-ja → yeo-ja.
남자|nam-ja
  1|en|sound|NAM is MAN spelled backwards → nam-ja: man.
  2|ko|sound|K-dramas' NAMJA-CHINGU (남자친구) means boyfriend → nam-ja: man.
  4|ko|roots|남 (男) nam = MALE + 자 (子) ja = PERSON → a male person: man. Same 男 as 남동생.
할아버지|ha-ra-beo-ji
  1|es|sound|“¡HOLA, ABUELO!” (es. hi, grandpa!): hola-abue ≈ ha-ra-beo → ha-ra-beo-ji.
  2|ko|roots|할 hal = GRAND + 아버지 a-beo-ji = FATHER → grand-father, word for word.
  3|en|sound|Grandpa's big HAIRY BEARD → ha-ra-beo-ji.
  4|en|sound|Grandpa always has HARIBO for the grandkids: ha-ri-bo ≈ ha-ra-beo → ha-ra-beo-ji.
할머니|hal-meo-ni
  1|en|sound|Grandma keeps the family in HARMONY: har-mo-ny ≈ hal-meo-ni.
  2|en|sound|Grandma always slips you some MONEY: hal-MONEY → hal-meo-ni.
  3|en|sound|Encanto's grandma, Abuela ALMA: al-ma ≈ hal-meo → hal-meo-ni.
  4|ko|pattern|할머니 GRANNY; add 외 (mom's side) for 외할머니, maternal grandma. Its 할 (grand-) is the one in 할아버지.
외할아버지|oe-ha-ra-beo-ji
  2|mixed|sound|The other WAY (외 oe), mom's side: “¡HOLA, ABUELO!” → oe-ha-ra-beo-ji.
  4|ko|roots|외 (外) oe = OUTSIDE, MOM'S SIDE + 할아버지 ha-ra-beo-ji = GRANDFATHER → maternal grandfather.
  5|es|sound|AFUERA (es. outside): mom's side is the outside family; a-fue-ra ≈ oe-ha-ra → oe-ha-ra-beo-ji.
외할머니|oe-hal-meo-ni
  2|en|sound|The other WAY (외 oe), mom's side: grandma's MONEY → oe-hal-meo-ni.
  4|ko|roots|외 (外) oe = OUTSIDE, MOM'S SIDE + 할머니 hal-meo-ni = GRANDMOTHER → maternal grandmother.
  5|es|sound|FUERA (es. outside): grandma on mom's side, the outside family; fue ≈ oe → oe-hal-meo-ni.
아버지|a-beo-ji
  2|mixed|sound|Father ABRAHAM (“Padre Abraham”): a-bra ≈ a-beo → a-beo-ji.
  3|es|sound|“¡A VER, HIJO!” (es. let's see, son), dad's classic opener: a-ver ≈ a-beo → a-beo-ji.
  4|ko|pattern|할 (grand-) + 아버지 = 할아버지, GRANDPA; with 외 (mom's side): 외할아버지. Everyday word for dad: 아빠.
어머니|eo-meo-ni
  1|en|sound|“Uh, MOMMY!” → eo-meo-ni: mother.
  2|en|sound|Mom is OMNIpresent, she sees everything: om-ni ≈ eo-meo-ni.
  3|pt|sound|“Ó MÃE!” (pt. hey, mother!): ó-mãe ≈ eo-meo → eo-meo-ni.
  4|ko|pattern|Two words for mother: 어머니 (formal) and 엄마 (everyday), the same pair as 아버지 and 아빠 for father.
아빠|a-ppa
  1|en|sound|PAPA minus the first p → a-ppa: dad.
  3|en|sound|Avatar's flying bison APPA, carrying the family like a dad → a-ppa.
  4|ko|pattern|아빠 is the everyday word for dad; the formal one is 아버지. Rhyme: 아빠 바빠요, Dad is busy.
엄마|eom-ma
  1|mixed|sound|MAMA / MAMÁ / MAMAN → eom-ma: mom.
  2|en|sound|In Korean dramas, kids calling “UM-MA!” for mom → eom-ma.
  3|it|sound|“MAMMA MIA!” (it. my mother!) → eom-ma.
  4|ko|pattern|엄마 is the everyday word for mom, 어머니 the formal one. Her mother is your 외할머니: 외 marks mom's side.
형|hyeong
  1|en|sound|BTS's younger members call the older ones HYUNG → hyeong (said by guys).
  2|en|sound|Big bro: HE's not YOUNG anymore → hyeong (said by guys).
  3|ko|pattern|형 = older brother, for guys; girls say 오빠. Respectful 형님 adds the same 님 as 선생님.
누나|nu-na
  1|en|sound|Nuns are called “Sister”: NUN-a → nu-na, a guy's older sister.
  3|en|sound|K-drama crush on an older woman: “NOONA!” → nu-na.
  4|fr|sound|Big sis babysits: your NOUNOU (fr. nanny) tonight, nou-nou ≈ nu-na → nu-na.
  5|ko|pattern|누나 = older sister, for guys; girls say 언니. For an older brother: 형 (guys), 오빠 (girls).
오빠|o-ppa
  1|en|sound|Psy's “OPPA Gangnam Style”: oppa = big brother, said by women → o-ppa.
  2|ko|sound|아빠 (PAPA) with an O for Older: big brother, said by women → o-ppa.
  3|en|sound|Big bro is always OP (overpowered) when you're little → o-ppa.
  4|ko|pattern|오빠 = older brother, for girls; guys say 형. For an older sister: 언니 (girls), 누나 (guys).
언니|eon-ni
  1|fr|sound|Ma sœur AÎNÉE (fr. my older sister) → eon-ni, said by women.
  2|en|sound|Big sis calls you HONEY → (h)eon-ni.
  3|en|sound|K-pop fans call older girls UNNIE → eon-ni.
  4|ko|pattern|언니 = older sister, for girls; guys say 누나. For an older brother: 오빠 (girls), 형 (guys).
남동생|nam-dong-saeng
  1|en|sound|NAM (MAN backwards) + 동생, your DOWNSIZED copy → younger brother.
  2|en|sound|NAM (man) + DON'T SNITCH, little bro → nam-dong-saeng.
  3|ko|roots|남 (男) nam = MALE + 동생 dong-saeng = YOUNGER SIBLING → younger brother. Same 男 as 남자.
여동생|yeo-dong-saeng
  1|en|sound|여 (YOU JANE, woman) + 동생, your DOWNSIZED copy → younger sister.
  2|en|sound|여 (YOU JANE, woman) + “DON'T SNITCH!” → yeo-dong-saeng: little sister.
  3|ko|roots|여 (女) yeo = FEMALE + 동생 dong-saeng = YOUNGER SIBLING → younger sister. Same 女 as 여자.
동생|dong-saeng
  1|en|sound|Your DOWNSIZED copy: the younger sibling → dong-saeng.
  2|en|sound|“DON'T SNITCH!”: what you tell your little sibling → dong-saeng.
  4|ko|roots|동 (同) dong = SAME + 생 (生) saeng = BIRTH → same birth, a sibling; Korean uses it for the younger one.
  5|fr|sound|Your little sibling is ton SANG (fr. your blood): ton sang ≈ dong-saeng → dong-saeng.
남편|nam-pyeon
  1|en|sound|Her man, her CHAMPION: cham-pion ≈ nam-pyeon → nam-pyeon.
  2|en|sound|“My NUMBER ONE”: num-ber-one ≈ nam-pyeon → husband.
  3|es|sound|Your eNAMORADO (es. sweetheart), now your husband → nam-pyeon.
  4|ko|pattern|남 (男) nam = MAN, as in 남자 and 남동생; its 편 doesn't recur, so learn 남편 whole. Wife: 아내.
아내|a-nae
  1|fr|sound|She wears the ANNEAU (fr. ring) → a-nae: wife.
  2|es|sound|Your wife's ANILLO (es. ring) → a-nae.
  3|en|sound|A wedding ANNIversary with your wife → a-nae.
  4|ko|pattern|아내 WIFE pairs with 남편, husband. In casual talk many say 와이프, from English wife.
아들|a-deul
  1|en|sound|Your son grows into an ADULT → a-deul.
  2|en|sound|Your son: A little DUDE → a-deul.
  3|en|sound|Kratos's son ATREUS (God of War): “BOY!” → a-deul.
  4|ko|pattern|아들 (son) + 딸 (daughter) = 아들딸, sons and daughters: all your CHILDREN.
딸|ttal
  1|en|sound|DAUGHter, cut short: daugh ≈ ttal → ttal.
  2|en|sound|Your daughter shot up so TALL → ttal.
  3|fr|sound|TA FILLE (fr. your daughter): ta ≈ ttal → ttal.
  4|ko|pattern|딸바보 = 딸 DAUGHTER + 바보 FOOL: a dad who's crazy about his daughter.
부모님|bu-mo-nim
  1|en|sound|Your parents' generation: the BOOMERS (“OK, boomer!”), boo-mer ≈ bu-mo → bu-mo-nim.
  2|en|sound|PAPA + MOM: bu-mo ≈ pa-mom → bu-mo-nim.
  4|ko|roots|부 (父) bu = FATHER + 모 (母) mo = MOTHER + 님 nim = RESPECT → honored father and mother: parents.
가족|ga-jok
  1|en|sound|Family dinner: Dad's GOT JOKES → ga-jok.
  2|ja|sound|KAZOKU, the Japanese word for family → ga-jok.
  3|ko|pattern|가족 + 여행 (trip) = 가족여행, a family TRIP; 가족 + 사진 (photo) = 가족사진, a family PHOTO.
책|chaek
  1|en|sound|CHECK out a book from the library → chaek.
  2|en|sound|Chapter after CHAPTER: a book → chaek.
  3|en|sound|A book of short stories by CHEKHOV: chek ≈ chaek → chaek.
  4|ko|pattern|책 (冊) chaek = book. The same 冊 is in 공책 (notebook: an empty book) and 책상 (desk: a platform for books).
공책|gong-chaek
  1|ko|roots|공 (空) gong = EMPTY + 책 (冊) chaek = BOOK → an empty book, ready to fill: notebook.
  2|en|sound|To-do lists: GOING to CHECK it all off in my notebook → gong-chaek.
  3|en|sound|A COMPACT notebook for your bag: com-pact ≈ gong-chaek → gong-chaek.
핸드폰|haen-deu-pon
  1|en|loanword|HAND + PHONE: a phone in your hand → haen-deu-pon.
  2|en|loanword|Konglish HAND PHONE = cellphone → haen-deu-pon.
  3|en|loanword|Thumb and pinky out, “call me”: your HAND as a PHONE → haen-deu-pon.
  4|ko|pattern|From English hand + phone: a final consonant takes ㅡ eu (핸드), as in 마트 from mart, and ph/f becomes ㅍ p (폰), as in 카페 from café.
컴퓨터|keom-pyu-teo
  1|en|loanword|COMPUTER → keom-pyu-teo.
  2|en|loanword|A gaming COMPUTER → keom-pyu-teo.
  3|es|sound|COMPUTADORA (es. computer): com-pu-ta ≈ keom-pyu-teo → keom-pyu-teo.
  4|ko|pattern|From English computer: the r drops and the ‘uh’ sounds become ㅓ eo (컴 keom, 터 teo), as in 엔지니어 from engineer.
시계|si-gye
  1|en|sound|A SEIKO watch → si-gye.
  2|en|sound|The CPU clock CYCLE: tick, tick → si-gye.
  4|ko|roots|시 (時) si = TIME + 계 (計) gye = MEASURE → a time measurer: watch, clock. Same 時 as 시간.
  5|en|sound|Open a watch and see the GEARS turning: see-gears ≈ si-gye → si-gye.
창문|chang-mun
  1|en|sound|Through your window, the MOON changes night by night: change-moon ≈ chang-mun → chang-mun.
  3|en|sound|Open a window to change the MOOD: change-mood ≈ chang-mun → chang-mun.
  4|ko|pattern|창 chang = window + 문 mun = door → 창문, window. 문 alone is a door; 창가 is the spot by the window.
칠판|chil-pan
  1|en|sound|A CHALK PANEL → chil-pan: blackboard.
  4|ko|roots|칠 (漆) chil = LACQUER, PAINT + 판 (板) pan = BOARD → a painted board: blackboard.
  3|en|sound|Nails on a blackboard send a CHILL down your spine → chil-pan.
책상|chaek-ssang
  1|en|sound|At the studio mixing desk: CHECK the SONG one more time → chaek-ssang.
  2|en|sound|The hotel CHECK-IN desk → chaek-ssang.
  4|ko|roots|책 (冊) chaek = BOOK + 상 (床) ssang = PLATFORM → a platform for books: desk.
의자|ui-ja
  1|fr|sound|“OUI, JE m'assois” (fr. yes, I'll sit down) → ui-ja.
  2|en|sound|A WHEELCHAIR is still a chair: wee-chair → ui-ja.
  3|en|sound|Pull up a chair to the OUIJA board → ui-ja.
  4|ko|pattern|의자 ui-ja = CHAIR, also in 흔들의자 (rocking chair: 흔들 = rocking) and 안락의자 (armchair: 안락 = comfort).
필통|pil-tong
  1|en|sound|FILL it with a TON of pens → pil-tong: pencil case.
  2|en|sound|Your PILOT pens live in the pencil case → pil-tong.
  4|ko|roots|필 (筆) pil = WRITING TOOL + 통 (筒) tong = TUBE → a tube for pens: pencil case. Same 筆 as 연필.
  5|en|sound|Drop the pencil case and the pens SPILL everywhere: spill ≈ pil → pil-tong.
펜|pen
  1|en|loanword|PEN → pen, the same word.
  2|en|loanword|The PEN is mightier than the sword → pen.
  3|en|loanword|Pen-and-paper RPG night: grab a PEN → pen.
  4|ko|pattern|펜 = pen, also in 볼펜 (ball + pen: a ballpoint, the everyday word) and 형광펜 (highlighter: 형광 = fluorescent).
지우개|ji-u-gae
  2|en|sound|JIU-jitsu for mistakes: wipe them out → ji-u-gae.
  4|ko|roots|지우 ji-u = ERASE + 개 gae = TOOL → an erasing tool: eraser.
  5|en|sound|Stuck on a test question, you CHEW the eraser on your pencil: chew ≈ ji-u → ji-u-gae.
지갑|ji-gap
  1|en|sound|“GEE, a GAP!” My wallet's empty → ji-gap.
  4|ko|roots|지 (紙) ji = PAPER + 갑 (匣) gap = CASE → a case for paper: wallet.
  3|en|sound|G PAY, the wallet on your phone: g-pay ≈ ji-gap → ji-gap.
돈|don
  1|es|sound|“Poderoso caballero es DON DINERO” (es. money rules) → don.
  2|en|sound|A DONation is money → don.
  3|ko|pattern|돈 don = money, also in 용돈 (pocket money, an allowance) and 잔돈 (small change).
여권|yeo-kkwon
  2|en|sound|With a passport, YOU CAN go anywhere → yeo-kkwon.
  4|ko|roots|여 (旅) yeo = TRAVEL + 권 (券) kkwon = TICKET → a travel document: passport. Same 旅 as 여행.
  5|en|sound|Lost your passport abroad? Call your CONSULATE: your-con ≈ yeo-kkwon → yeo-kkwon.
가방|ga-bang
  1|fr|sound|Un CABAS (fr. tote bag): ca-bas ≈ ga-bang → ga-bang.
  3|en|sound|A Dolce & GABBANA bag: gab-ba ≈ ga-bang → ga-bang.
  4|de|sound|Das GEPÄCK (de. luggage): ge-päck ≈ ga-bang → ga-bang.
  5|ko|pattern|가방 = bag, from Japanese kaban (n → ㅇ, as pan became 빵). Also in 책가방 (책 book + 가방: a school bag).
연필|yeon-pil
  1|en|sound|Sharpen a pencil and the wood PEELs → yeon-pil, which rhymes with pen-cil.
  4|ko|roots|연 (鉛) yeon = LEAD + 필 (筆) pil = WRITING TOOL → a lead writing tool: pencil. Same 筆 as 필통.
  3|en|sound|A YOUNG PUPIL's first pencil → yeon-pil.
종이|jong-i
  2|en|sound|JOT it on paper → jong-i.
  3|fr|sound|Du papier JAUNI (fr. old yellowed paper): jau-ni ≈ jong-i → jong-i.
  4|ko|pattern|종이 jong-i = paper, also in 종이컵 (paper cup) and 색종이 (colored paper, with the 색 of 빨간색).
열쇠|yeol-ssoe
  1|en|sound|The key to YOUR SAFE → yeol-ssoe.
  4|ko|roots|열 yeol = OPEN + 쇠 ssoe = METAL → metal that opens: key.
  3|en|sound|YALE, the classic lock-and-key brand: yale ≈ yeol → yeol-ssoe.
안경|an-gyeong
  1|en|sound|Hipster ANGULAR frames: ang-gyu ≈ an-gyeong → an-gyeong.
  2|es|sound|ANTEOJOS (es. glasses) start the same way → an-gyeong.
  4|ko|roots|안 (眼) an = EYE + 경 (鏡) gyeong = MIRROR, LENS → eye lenses: glasses. Not the 경 of 경찰.
우산|u-san
  1|en|sound|Raining? “USE AN umbrella!” → u-san.
  2|fr|sound|“OÙ SONT les parapluies ?” (fr. where are the umbrellas?) → u-san.
  4|ko|roots|우 (雨) u = RAIN + 산 (傘) san = UMBRELLA → a rain umbrella: umbrella.
선생님|seon-saeng-nim
  1|en|roots|SENSEI → seon-saeng-nim. Same word (先生), plus 님 for respect.
  2|en|sound|Teachers have a SIXTH SENSE for who didn't study → seon-saeng-nim.
  3|en|sound|SON, SING it again: the music teacher → seon-saeng-nim.
  4|fr|sound|Un ENSEIGNANT (fr. teacher): en-sei-gnant ≈ seon-saeng-nim → seon-saeng-nim.
학생|hak-ssaeng
  1|en|sound|A student HACKing away to become a SENSEI → hak-ssaeng.
  2|en|sound|Students at a HACKathon → hak-ssaeng.
  4|ko|roots|학 (學) hak = LEARNING + 생 (生) ssaeng = LEARNER → a learner: student. Same 學 as 학교.
회사원|hoe-sa-won
  1|en|sound|The WAY SAD ONE at the office → hoe-sa-won, office worker.
  4|ko|roots|회사 (會社) hoe-sa = COMPANY + 원 (員) won = MEMBER → a company member: office worker.
  3|en|sound|A HUAWEI badge, 9-to-5: an office worker → hoe-sa-won.
의사|ui-sa
  1|en|sound|“WE SAY ‘ahh’” for the doctor → ui-sa.
  2|fr|sound|The doctor presses: “OUI, ÇA fait mal ?” (fr. does that hurt?) → ui-sa.
  4|ko|roots|의 (醫) ui = MEDICINE + 사 (師) sa = PROFESSIONAL → a medical professional: doctor. 師 also ends 약사.
  5|es|sound|¿Un HUESO roto? (es. a broken bone?) Off to the doctor: hue-so ≈ ui-sa → ui-sa.
간호사|gan-ho-sa
  1|en|sound|The nurse CAN HOLD the SAline drip → gan-ho-sa.
  4|ko|roots|간호 (看護) gan-ho = CARING FOR PATIENTS + 사 (師) sa = PROFESSIONAL → a care professional: nurse.
  3|fr|sound|Latex GANTS (fr. gloves) on: the nurse is ready → gan-ho-sa.
배우|bae-u
  1|en|sound|Curtain call: the actors take a BOW → bae-u.
  2|en|sound|“BRAVO!” The audience cheers the actor → bae-u.
  3|ko|pattern|배우 ACTOR, as in 영화배우 (movie actor). 배우다 (to learn) only sounds the same: no link.
경찰|gyeong-chal
  1|en|sound|Cops on a GANG CHASE → gyeong-chal: police officer.
  2|fr|sound|Un GENDARME (fr. police officer): gen-dar ≈ gyeong-chal → gyeong-chal.
  3|en|sound|Riot police keep crowd CONTROL: con-trol ≈ gyeong-chal → gyeong-chal.
  4|ko|pattern|경찰 POLICE, as in 경찰서 (police STATION) and 경찰관 (police officer). Not the 경 of 안경 (glasses).
군인|gu-nin
  1|en|sound|A soldier: GUN IN hand → gu-nin.
  2|en|sound|A Few GOOD MEN: the Marines → gu-nin.
  4|ko|roots|군 (軍) gun = MILITARY + 인 (人) in = PERSON → a military person: soldier.
가수|ga-su
  1|en|sound|Lady GAGA, SUperstar singer → ga-su.
  4|ko|roots|가 (歌) ga = SONG + 수 (手) su = SKILLED PERFORMER → a song performer: singer. Same 歌 as 가요 (pop).
  3|it|sound|Enrico CARUSO, the legendary tenor: ca-ru-so ≈ ga-su → ga-su.
  5|fr|sound|Elle GAZOUILLE (fr. she warbles like a bird): a born singer, ga-zou ≈ ga-su → ga-su.
요리사|yo-ri-sa
  1|en|sound|YOLK, RICE and SAUCE: the chef at work → yo-ri-sa.
  2|en|sound|“Chef, YOUR RISOTTO is perfect!” → yo-ri-sa.
  4|ko|roots|요리 yo-ri = COOKING + 사 (師) sa = PROFESSIONAL → a cooking professional: chef. Same 요리 as 요리해요.
기자|gi-ja
  1|en|sound|A GIZMODO reporter breaks a tech scoop → gi-ja.
  4|ko|roots|기 (記) gi = RECORD + 자 (者) ja = PERSON → a person who records: reporter.
  3|en|sound|A GAZETTE reporter (es. gaceta): ga-zette ≈ gi-ja → gi-ja.
주부|ju-bu
  1|en|sound|JUGGLING a BUsy home: homemaker → ju-bu.
  2|en|sound|Running a home is a full-time JOB: ju-bu.
  3|en|sound|CHORES and the BUdget: running a home → ju-bu.
  4|ko|pattern|주부 HOMEMAKER, often in full: 가정주부, with 가정 (HOUSEHOLD) in front.
엔지니어|en-ji-ni-eo
  1|en|sound|ENGINEER → en-ji-ni-eo. That's you!
  2|es|sound|INGENIERO (es.) → en-ji-ni-eo.
  3|fr|sound|INGÉNIEUR (fr. engineer): in-gé-nieur ≈ en-ji-ni-eo → en-ji-ni-eo.
  4|ko|pattern|From English engineer: the r-colored ending becomes 어, as in 컴퓨터 (computer) and 샤워해요 (shower).
개발자|gae-bal-jja
  1|en|sound|First command of the day: GIT PULL → gae-bal-jja.
  4|ko|roots|개발 (開發) gae-bal = DEVELOPMENT + 자 (者) jja = PERSON → a person who develops: developer. Same 者 as 기자.
  3|en|sound|Shipping the GAME BUILD: developers → gae-bal-jja.
  5|en|sound|A clacky mechanical KEYBOARD, every developer's tool: key-bo ≈ gae-bal → gae-bal-jja.
변호사|byeon-ho-sa
  1|en|sound|Your case is BEYOND HOPE, SIR? Call a lawyer → byeon-ho-sa.
  4|ko|roots|변호 (辯護) byeon-ho = LEGAL DEFENSE + 사 (士) sa = SCHOLAR → a learned defender: lawyer.
  3|en|sound|Divorce: “BYE, HONEY, SEE you in court” → byeon-ho-sa.
약사|yak-ssa
  1|en|sound|The pharmacist hands you YUCKy medicine → yak-ssa.
  4|ko|roots|약 (藥) yak = MEDICINE + 사 (師) ssa = PROFESSIONAL → a medicine professional: pharmacist. Same 藥 as 약국.
  5|fr|sound|« Pour la toux, Y'A ÇA » (fr. for a cough, there's this): the pharmacist → yak-ssa.
학교|hak-kkyo
  1|en|sound|HOGWARTS, the most famous school: hog ≈ hak → hak-kkyo.
  4|ko|roots|학 (學) hak = LEARNING + 교 (校) kkyo = SCHOOL → a school for learning: school. Same 學 as 학생.
  3|ja|sound|Anime's GAKKŌ (school) is the same word: gak-kō ≈ hak-kkyo.
교실|gyo-sil
  1|en|sound|“GO SIT!” says the teacher in the classroom → gyo-sil.
  4|ko|roots|교 (敎) gyo = TEACHING + 실 (室) sil = ROOM → a teaching room: classroom. Not 학교's 교 (校).
  3|ja|sound|Assassination Classroom, in Japanese Ansatsu KYŌSHITSU: kyo-shi ≈ gyo-sil → gyo-sil.
집|jip
  1|en|sound|Your home's ZIP code → jip.
  2|fr|sound|A GÎTE (fr. holiday home, a place to stay) → jip: home.
  3|en|sound|Your JEEP is in the driveway: you're home → jip.
  4|ko|pattern|집 jip = HOUSE, also a shop: 빵집 (bread house: a bakery) and 중국집 (China house: a Chinese restaurant).
서점|seo-jeom
  1|en|sound|Rows of shelves? SEARCH 'EM: a bookstore → seo-jeom.
  2|en|sound|Dr. SEUSS books on every shelf: seuss ≈ seo → seo-jeom.
  4|ko|roots|서 (書) seo = BOOKS + 점 (店) jeom = SHOP → a book shop: bookstore. Same 書 as 도서관.
화장실|hwa-jang-sil
  1|en|sound|WASHING up at the sink → hwa-jang-sil, restroom.
  2|en|sound|Halftime rush: WHAT a JAM at the restroom → hwa-jang-sil.
  4|ko|roots|화장 (化粧) hwa-jang = MAKEUP + 실 (室) sil = ROOM → the makeup room, like a “powder room”: restroom.
식당|sik-ttang
  1|en|sound|A SIT-DOWN restaurant: sit-down ≈ sik-ttang → sik-ttang.
  2|en|sound|“Table for SIX, please”: eating out → sik-ttang, restaurant.
  4|ko|roots|식 (食) sik = EATING + 당 (堂) ttang = HALL → an eating hall: restaurant. Same 食 as 음식.
편의점|pyeo-ni-jeom
  4|ko|roots|편의 (便宜) pyeo-ni = CONVENIENCE + 점 (店) jeom = SHOP → convenience store, word for word.
  2|ja|sound|Japan's KONBINI, the 24/7 store: bi-ni ≈ pyeo-ni → pyeo-ni-jeom.
  3|it|sound|Grab a PANINI at the 24/7 convenience store → pyeo-ni-jeom.
백화점|bae-kwa-jeom
  4|ko|roots|백 (百) baek = HUNDRED + 화 (貨) hwa = GOODS + 점 (店) jeom = SHOP → a hundred-goods shop: department store.
  2|en|sound|BAGS, WATCHES, JEWELRY, all under one roof → bae-kwa-jeom, department store.
  3|en|sound|BLACK FRIDAY sales at the department store → bae-kwa-jeom.
은행|eun-haeng
  1|en|sound|Cash IN HAND, straight from the bank → eun-haeng.
  2|en|sound|ING, the orange Dutch bank: ING ≈ 은 eun → eun-haeng.
  3|en|sound|Your INHERITANCE, safe in the bank → eun-haeng.
  4|ko|pattern|은행 eun-haeng = BANK. Add 원 (member) for 은행원, a bank clerk, built just like 회사원, an office worker.
공원|gong-won
  1|en|sound|Let's GO ON a walk in the park → gong-won.
  2|en|sound|Frisbee in the park: “GO LONG!” → gong-won.
  4|ko|roots|공 (公) gong = PUBLIC + 원 (園) won = GARDEN → a public garden: park.
병원|byeong-won
  1|en|sound|BEEN WOUNDed? Off to the hospital → byeong-won.
  2|es|sound|Get well soon: ¡que te pongas BIEN! (es.) → byeong-won, hospital.
  4|ko|roots|병 (病) byeong = ILLNESS + 원 (院) won = INSTITUTION → an institution for illness: hospital. Not 공원's 원 (園).
약국|yak-kkuk
  1|en|sound|“YUCK, COUGH syrup!” → yak-kkuk, pharmacy.
  4|ko|roots|약 (藥) yak = MEDICINE + 국 (局) kkuk = ESTABLISHMENT → a medicine shop: pharmacy. Same 藥 as 약사.
  3|ko|sound|Where the 약사 (pharmacist, YUCKy medicine) works → yak-kkuk, pharmacy.
공항|gong-hang
  1|en|sound|GONE flying from the HANGAR → gong-hang: airport.
  2|es|sound|¡CON GANAS de volar! (es. itching to fly) → gong-hang, airport.
  4|ko|roots|공 (空) gong = AIR + 항 (港) hang = PORT → air-port, word for word.
미용실|mi-yong-sil
  1|en|sound|“Make ME look YOUNG!” at the hair salon → mi-yong-sil.
  2|fr|sound|Une coupe MI-LONGUE (fr. mid-length cut) at the salon → mi-yong-sil.
  4|ko|roots|미용 (美容) mi-yong = BEAUTY CARE + 실 (室) sil = ROOM → a beauty room: hair salon. Same 室 as 교실.
지하철역|ji-ha-cheol-lyeok
  1|en|sound|Loyal HACHIKŌ waited at the station every day: ha-chi ≈ ha-cheol → ji-ha-cheol-lyeok.
  2|ja|sound|Tokyo's CHIKATETSU (subway) is the same word: chi-ka-te ≈ ji-ha-cheol → ji-ha-cheol-lyeok.
  3|ko|roots|지하 (地下) ji-ha = UNDERGROUND + 철 (鐵) cheol = IRON + 역 (驛) yeok = STATION → the underground iron road's station: subway station.
카페|ka-pe
  1|fr|loanword|CAFÉ. Korean has no f, so f → ㅍ p → ka-pe.
  2|fr|loanword|A Parisian sidewalk CAFÉ → ka-pe.
  3|es|loanword|CAFÉ con leche (es.) → ka-pe.
  4|ko|pattern|카페 is French café and 커피 is English coffee: one drink, borrowed twice. Korean has no f, so f → ㅍ p in both.
회사|hoe-sa
  1|en|sound|Monday at the company: WAY SAD → hoe-sa.
  2|en|sound|HUAWEI, the tech giant: a company → hoe-sa.
  3|es|sound|HUELGA (es. strike) at the company → hoe-sa.
  4|ko|pattern|회사 (會社) hoe-sa = company. Add 원 (member) and you get 회사원, an office worker.
도서관|do-seo-gwan
  1|fr|sound|Pull an old DOSSIER from the library archives → do-seo-gwan.
  4|ko|roots|도서 (圖書) do-seo = BOOKS + 관 (館) gwan = BUILDING → a building of books: library. Same 書 as 서점.
  3|en|sound|DOSTOEVSKY lines every library shelf → do-seo-gwan.
  5|en|sound|You DOZE off over a book in the quiet library: doze ≈ do-seo → do-seo-gwan.
마트|ma-teu
  1|en|loanword|MART, plus a final eu → ma-teu: supermarket.
  2|en|loanword|WalMART → ma-teu.
  3|en|loanword|The MART down the street → ma-teu.
  4|ko|pattern|From English mart: the r drops and the final t takes ㅡ eu (트), as in 골프 from golf and 주스 from juice.
시장|si-jang
  1|en|sound|CHEAP JUNK at the flea market → si-jang.
  2|en|sound|CHIANG MAI's famous night markets → si-jang.
  4|ko|roots|시 (市) si = MARKET + 장 (場) jang = PLACE → a market place: market. Not 시계's 시 (時).
헬스장|hel-sseu-jang
  1|en|sound|The gym: a HEALTH JUNGLE → hel-sseu-jang.
  2|en|sound|Leg day is HELL at the gym → hel-sseu-jang.
  3|ko|roots|헬스 hel-sseu = WORKOUT, FROM HEALTH + 장 (場) jang = PLACE → a workout place: gym. Same 場 as 시장.
무슨|mu-seun
  1|en|sound|“What kind of MOOSE is that?” → mu-seun.
  2|en|sound|What kind of MUSHROOM: Mario's red one or the green 1-UP? → mu-seun.
  3|fr|sound|MOUSSEUX or still? (fr. sparkling wine): what kind? → mu-seun.
  4|ko|pattern|무슨 goes before a noun to ask what KIND: 무슨 음식 (what food?), 무슨 운동을 해요? (what sport do you do?)
제일|je-il
  1|en|sound|The MOST wanted end up in JAIL → je-il: the most.
  4|ko|roots|제 (第) je = ORDER + 일 (一) il = ONE → number one: the most.
  3|fr|sound|« J'AI LE plus de points ! » (fr. I've got the most points!) → je-il.
많이|ma-ni
  1|en|sound|MANY → ma-ni: a lot.
  4|ko|roots|많 man = MANY, MUCH + 이 i = -LY → 많다 (many) as an adverb: a lot.
  3|es|sound|Un MONTÓN (es. a heap, loads) → ma-ni: a lot.
여행|yeo-haeng
  1|en|sound|Backpacking from YOUTH HOSTEL to hostel → yeo-haeng.
  2|ja|sound|A night in a Japanese RYOKAN (travelers' inn): ryo ≈ yeo → yeo-haeng.
  4|ko|roots|여 (旅) yeo = TRAVEL + 행 (行) haeng = GOING → going traveling: travel, trip. Same 旅 as 여권.
한국|han-guk
  1|en|sound|HAN-COOK: the land of Korean BBQ → han-guk, Korea.
  2|en|sound|HANGUL, Korea's own alphabet → han-guk.
  4|ko|roots|한 (韓) han = KOREA + 국 (國) guk = COUNTRY → the Korean country: Korea. Same 國 as 중국 (China).
  5|en|sound|HANBOK, Korea's traditional dress: han-bok ≈ han-guk → han-guk.
커피숍|keo-pi-syop
  1|en|loanword|COFFEE SHOP → keo-pi-syop.
  2|en|loanword|Central Perk, the Friends COFFEE SHOP → keo-pi-syop.
  3|en|loanword|A Starbucks COFFEE SHOP → keo-pi-syop.
  4|ko|pattern|From English coffee shop: f becomes ㅍ p, as in 커피, and sh becomes ㅅ + y, as in 쇼핑해요 (shopping).
형용사|hyeong-yong-sa
  1*|en|sound|HUGE, YOUNG, SAD: three adjectives → hyeong-yong-sa, adjective.
  4|ko|roots|형용 (形容) hyeong-yong = APPEARANCE + 사 (詞) sa = WORD → a describing word: adjective. Same 詞 as 동사.
  3|es|sound|JOVEN, LLENO, SANO (es. young, full, healthy): adjectives → hyeong-yong-sa.
동사|dong-sa
  1|en|sound|Verbs are for DOING STUFF → dong-sa.
  2|en|sound|DON'T SAY it, DO it → dong-sa, verb.
  4|ko|roots|동 (動) dong = ACTION + 사 (詞) sa = WORD → an action word: verb. Same 動 as 운동.
  5|fr|sound|DANSER (fr. to dance) is itself a verb: dan-sé ≈ 동사 dong-sa → dong-sa.
시간|si-gan
  1|en|sound|Time flies: SEE it, GONE! → si-gan.
  2|mixed|sound|One SECOND (es. SEGUNDO), the unit of time → si-gan.
  4|ko|roots|시 (時) si = TIME + 간 (間) gan = INTERVAL → a span of time: time. Same 時 as 시계.
요일|yo-il
  1|en|sound|“YO, I'LL see you Monday!” → yo-il, day of the week (월요일, 화요일…).
  2|en|roots|The -DAY of MonDAY, TuesDAY: every Korean weekday ends in 요일 → yo-il.
  3|es|sound|¿Y HOY, qué día es? (es. and today, what day is it?) → yo-il.
운동|un-dong
  1|es|sound|Counting reps: “¡UN, DOS…!” → un-dong, exercise.
  2|en|sound|Your workout is still UNDONE: go exercise → un-dong.
  3|en|sound|ENDORPHINS kick in after a workout → un-dong, exercise.
  4|ko|pattern|운동 (運動) = sport, exercise; its 동 (動) = MOVEMENT, as in 동사 (verb, an action word); + 해요 → 운동해요.
계절|gye-jeol
  1|fr|sound|Quel JOLI printemps ! (fr. what a lovely spring): a season → gye-jeol.
  2|en|sound|Nature's yearly SCHEDULE: spring, summer, fall, winter → gye-jeol.
  4|ko|roots|계 (季) gye = SEASON + 절 (節) jeol = PERIOD → a period of the year: season.
  5|en|sound|Migrating GAZELLE herds follow the seasons: ga-zelle ≈ gye-jeol → gye-jeol.
색깔|saek-kkal
  1|en|sound|A color SCALE → saek-kkal: color.
  2|en|sound|SKITTLES: taste the rainbow of colors → saek-kkal.
  4|ko|roots|색 (色) saek = COLOR + 깔 kkal = LOOK, QUALITY → color. 色 ends every color word, like 회색.
  5|en|sound|The color SPECTRUM: spec ≈ saek → saek-kkal.
과일|gwa-il
  1|en|sound|A GUAVA is a fruit → gwa-il.
  3|es|sound|GUANÁBANA (es. soursop), a tropical fruit → gwa-il.
  4|ko|pattern|과일 = fruit, as in 과일가게 (fruit shop) and 무슨 과일 (what fruit).
음료|eum-nyo
  1|en|sound|Ice-cold Coca-Cola: ENJOY! → eum-nyo, drink.
  2|es|sound|¡UN MOJITO, por favor! (es.) → eum-nyo, a drink.
  4|ko|roots|음 (飮) eum = DRINKING + 료 (料) nyo = MATERIAL → drinking material: beverage. Same 飮 as 음식.
음식|eum-sik
  1|en|sound|“MMM… CHIC!” An elegant plate of food → eum-sik.
  2|en|sound|HUMMUS and pita: food → eum-sik.
  4|ko|roots|음 (飮) eum = DRINKING + 식 (食) sik = EATING → drinking and eating: food.
영화|yeong-hwa
  1|en|sound|“YOU WANNA see a movie?” → yeong-hwa.
  2|fr|sound|« ON VA au ciné ? » (fr. shall we go to the movies?): on-va ≈ yeong-hwa.
  4|ko|roots|영 (映) yeong = PROJECT + 화 (畫) hwa = PICTURE → a projected picture: movie.
음악|eu-mak
  1|en|sound|Music is what YOU MAKE → eu-mak.
  2|es|sound|“¡Eh, MACARENA!”: the song everyone knows → eu-mak, music.
  4|ko|roots|음 (音) eum = SOUND + 악 (樂) ak = MUSIC → sound made into music: music. Not 음식's 음 (飮).
물건|mul-geon
  1|en|sound|A MULTI-TOOL: one object, many uses → mul-geon.
  2|en|sound|A MILLION little things → mul-geon, objects.
  3|en|sound|Concert MERCHANDISE, a table full of things to buy: mer-chan ≈ mul-geon → mul-geon.
  4|ko|pattern|물건 mul-geon: its 물 means thing, not water. The same 물 is in 동물 (animal, a moving thing) and 선물 (gift).
직업|ji-geop
  1|en|sound|Land a GIG: a job → ji-geop, occupation.
  2|fr|sound|JE GAGNE ma vie (fr. I earn my living) → ji-geop, occupation.
  3|en|sound|Writing ad JINGLES for a living → ji-geop.
  4|ko|pattern|Asked as 직업이 뭐예요? (what's your job?); answer with the job + 이에요/예요: 엔지니어예요, 개발자예요.
장소|jang-so
  1|en|sound|Musical chairs: CHANGE SPOTS! → jang-so, place.
  4|ko|roots|장 (場) jang = PLACE + 소 (所) so = PLACE → a place, said twice: place. Same 場 as 시장.
  3|en|sound|SHANGRI-LA, the dream place: shang ≈ jang → jang-so.
날씨가 더워요|nal-ssi-ga deo-wo-yo
  2|en|roots|날씨 weather + 가 (subject marker after a vowel) + 더워요 hot → The weather is hot.
  3|fr|sound|Il fait chaud DEHORS (fr. it’s hot outside): de-hors ≈ 더워 deo-wo → nal-ssi-ga deo-wo-yo.
  4|en|sound|“Hot in Herre” by NELLY: nel-ly ≈ 날씨 nal-ssi, it’s hot → nal-ssi-ga deo-wo-yo.
커피가 뜨거워요|keo-pi-ga tteu-geo-wo-yo
  2|en|roots|커피 coffee + 가 (subject marker after a vowel) + 뜨거워요 hot to the touch → The coffee is hot.
  3|en|sound|COFFEE TO-GO: careful, it’s hot! to-go ≈ 뜨거 tteu-geo → keo-pi-ga tteu-geo-wo-yo.
  4|es|sound|First sip of 커피: “¡TE QUEMAS!” (es. you’ll burn yourself!) → keo-pi-ga tteu-geo-wo-yo.
날씨가 추워요|nal-ssi-ga chu-wo-yo
  2|en|roots|날씨 weather + 가 (subject marker after a vowel) + 추워요 cold → The weather is cold.
  3|en|sound|NASTY weather? ACHOO! nas-ty ≈ 날씨 nal-ssi → nal-ssi-ga chu-wo-yo.
  4|en|sound|NARNIA, where it’s always winter: nar ≈ 날 nal → nal-ssi-ga chu-wo-yo.
물이 차가워요|mu-ri cha-ga-wo-yo
  2|en|roots|물 water + 이 (subject marker after a consonant) + 차가워요 cold to the touch → The water is cold.
  3|fr|sound|MOULES (fr. mussels) from ice-cold sea water: moules ≈ 물 mul → mu-ri cha-ga-wo-yo.
  4|en|sound|CHUG a glass of ice-cold water: chug ≈ 차가 cha-ga → mu-ri cha-ga-wo-yo.
한국어를 배워요|han-gu-geo-reul bae-wo-yo
  1|es|sound|Korean class: “¡Ah, ya VEO!” (es. oh, I see!) → han-gu-geo-reul bae-wo-yo.
  2|en|sound|BABBEL, the language-learning app: bab ≈ 배 bae → han-gu-geo-reul bae-wo-yo.
  3|ko|roots|한국어 = 한국 Korea + 어 (語) language, as in 영어 English; 를 marks the object after a vowel → I learn Korean.
영어를 가르쳐요|yeong-eo-reul ga-reu-chyeo-yo
  1|en|sound|The English GURU CHEERS on the class → yeong-eo-reul ga-reu-chyeo-yo.
  2|es|sound|Yo ENSEÑO inglés (es. I teach English): yo en ≈ 영 yeong → yeong-eo-reul ga-reu-chyeo-yo.
  3|ko|roots|영어 (英語) English: its 어 (語) means language, as in 한국어 Korean; 를 marks the object after a vowel → I teach English.
무슨 운동을 해요?|mu-seun un-dong-eul hae-yo
  2|en|roots|무슨 what kind of + 운동 sport + 을 (object marker after a consonant) 해요 do → What sport do you do?
  3|en|sound|Nice MUSCLES! What sport do you do? mus ≈ 무슨 mu-seun → mu-seun un-dong-eul hae-yo.
  4|es|sound|Counting “¡UN, DOS…!” reps at the gym: what sport? → mu-seun un-dong-eul hae-yo.
저는 수영을 해요|jeo-neun su-yeong-eul hae-yo
  2|en|roots|저는 as for me (topic marker after a vowel) + 수영 swimming + 을 해요 do → I swim.
  3|en|sound|Swimming keeps me SO YOUNG → jeo-neun su-yeong-eul hae-yo.
  4|fr|sound|« Moi, je NAGE » (fr. me, I swim): je ≈ 저 jeo → jeo-neun su-yeong-eul hae-yo.
무슨 색깔을 좋아해요?|mu-seun saek-kka-reul jo-a-hae-yo
  2|en|roots|무슨 what kind of + 색깔 color + 을 (object marker after a consonant) + 좋아해요 like → What color do you like?
  3|en|sound|Buying a MUSTANG: which color do you like? mus ≈ 무슨 → mu-seun saek-kka-reul jo-a-hae-yo.
  4|en|sound|CHOOSE a color, the one you like: choo ≈ 좋 jo → mu-seun saek-kka-reul jo-a-hae-yo.
파란색을 좋아해요|pa-ran-sae-geul jo-a-hae-yo
  2|en|roots|파란색 blue + 을 (object marker after a consonant) + 좋아해요 like → I like blue.
  3|en|sound|A PARASAIL over the deep blue sea: that’s my color → pa-ran-sae-geul jo-a-hae-yo.
  4|en|sound|Blue skies bring me JOY → pa-ran-sae-geul jo-a-hae-yo.
밥 먹어요|bam meo-geo-yo
  2|en|roots|밥 rice / meal + 먹어요 eat: I'm having a meal. Said bam meo-geo-yo.
  3|en|sound|A MUKBANG of BIBIMBAP: time to eat → bam meo-geo-yo.
  4|es|sound|¡VAMOS a comer! (es. let’s eat!): va-mos ≈ 밥 bam → bam meo-geo-yo.
엔지니어예요|en-ji-ni-eo-ye-yo
  2|en|roots|엔지니어 engineer + 예요 am (polite “am/is/are” after a vowel) → I am an engineer.
  3|en|loanword|ENGINEER? YEAH-YO, that’s me → en-ji-ni-eo-ye-yo.
  4|fr|sound|Je suis INGÉNIEUR (fr. I am an engineer): in-gé-nieur ≈ en-ji-ni-eo → en-ji-ni-eo-ye-yo.
개발자예요|gae-bal-jja-ye-yo
  2|en|roots|개발자 developer + 예요 am (polite “am/is/are” after a vowel) → I am a developer.
  3|en|sound|CABLES and JAVA all day: ca-bles ≈ 개발 gae-bal, ja ≈ 자 → gae-bal-jja-ye-yo.
  4|en|sound|A clacky mechanical KEYBOARD: that’s a developer. key-board ≈ 개발 → gae-bal-jja-ye-yo.
무슨 음식|mu-seun eum-sik
  2|en|roots|무슨 what kind of + 음식 food → what kind of food.
  3|en|sound|What kind of food? Chocolate MOUSSE! mousse ≈ 무슨 mu-seun → mu-seun eum-sik.
  4|en|sound|“MMM… CHIC!” What kind of food is this? → mu-seun eum-sik.
무슨 운동|mu-seun un-dong
  2|en|roots|무슨 what kind of + 운동 sport, exercise → what sport.
  3|es|sound|¿Qué deporte? MUSCULACIÓN (es. weight training): mus ≈ 무슨 → mu-seun un-dong.
  4|en|sound|What sport? MUAY THAI! mu-ay ≈ 무 mu → mu-seun un-dong.
무슨 영화|mu-seun yeong-hwa
  2|en|roots|무슨 what kind of + 영화 movie → what kind of movie.
  3|en|sound|What kind of movie? A MUSICAL! mu-si ≈ 무슨 mu-seun → mu-seun yeong-hwa.
  4|en|sound|“YOU WANNA see a movie?” What kind? → mu-seun yeong-hwa.
무슨 음악|mu-seun eu-mak
  2|en|roots|무슨 what kind of + 음악 music → what kind of music.
  3|en|sound|What kind of music? MUSE, the rock band! muse ≈ 무슨 → mu-seun eu-mak.
  4|en|sound|Music is what you MAKE: what kind? → mu-seun eu-mak.
무슨 색깔|mu-seun saek-kkal
  2|en|roots|무슨 what kind of + 색깔 color → what color.
  3|en|sound|What color? MUSTARD yellow! mus ≈ 무슨 → mu-seun saek-kkal.
  4|en|sound|Pick one from the color SCALE: what color? → mu-seun saek-kkal.
무슨 과일|mu-seun gwa-il
  2|en|roots|무슨 what kind of + 과일 fruit → what fruit.
  3|en|sound|What fruit? A GUAVA? → mu-seun gwa-il.
  4|en|sound|What fruit? MUSCAT grapes! mus ≈ 무슨 → mu-seun gwa-il.
무슨 음료|mu-seun eum-nyo
  2|en|roots|무슨 what kind of + 음료 drink → what drink.
  3|en|sound|Ice-cold and ready to ENJOY: what drink? → mu-seun eum-nyo.
  4|en|sound|What drink? A MOSCOW MULE! mos ≈ 무슨 → mu-seun eum-nyo.
무슨 계절|mu-seun gye-jeol
  2|en|roots|무슨 what kind of + 계절 season → what season.
  3|en|sound|What season? MONSOON season! mon-soon ≈ 무슨 mu-seun → mu-seun gye-jeol.
  4|en|sound|Migrating GAZELLES: what season is it? → mu-seun gye-jeol.
제일 좋아해요|je-il jo-a-hae-yo
  2|en|roots|제일 the most + 좋아해요 like → like the most / favorite.
  3|fr|sound|Mon CHOUCHOU (fr. my favorite): chou ≈ 좋 jo → je-il jo-a-hae-yo.
  4|en|sound|The MOST-wanted end up in JAIL: like the most → je-il jo-a-hae-yo.
무슨 음식을 제일 좋아해요?|mu-seun eum-si-geul je-il jo-a-hae-yo
  2|en|roots|무슨 음식 what food + 을 (object marker after a consonant) + 제일 the most + 좋아해요 like → What food do you like the most?
  3|en|sound|Your favorite food? MOUSSAKA? mous-sa ≈ 무슨 → mu-seun eum-si-geul je-il jo-a-hae-yo.
  4|en|sound|Which dish is your crown JEWEL? jew-el ≈ 제일 → mu-seun eum-si-geul je-il jo-a-hae-yo.
한국 음식을 제일 좋아해요|han-guk eum-si-geul je-il jo-a-hae-yo
  2|en|roots|한국 음식 Korean food + 을 (object marker after a consonant) + 제일 the most + 좋아해요 like → I like Korean food the most.
  3|en|sound|HAN-COOK: Korean cooking is my favorite → han-guk eum-si-geul je-il jo-a-hae-yo.
  4|fr|sound|Mon JOYAU (fr. my jewel): Korean food! joyau ≈ 좋아요 → han-guk eum-si-geul je-il jo-a-hae-yo.
`

// Connectors and particles, keyed by card id. A root-based candidate appears only where the card's Roots record
// derives the item from its parts (그래 + 도, 밖 + 에); where it doesn't (그리고, 은/는), all three are sound hooks.
const grammarEntries = `
connector:그리고|geu-ri-go
  1|es|sound|The letter Y GRIEGA: in Spanish, Y means AND → geu-ri-go.
  2|en|sound|AGGREGATE: add this AND that together → geu-ri-go.
  3|en|sound|GRAB-'N'-GO: the 'N' is AND → geu-ri-go.
connector:-고|-go
  1|en|sound|LEGO bricks: snap one action onto the next → -go.
  2|en|sound|It takes two to TANGO: this one AND that one → -go.
  3|en|sound|GOSSIP: 'and then… and then…', one thing after another → -go.
connector:또|tto
  1|en|sound|BASIC's GOTO: jump back and run it AGAIN: go-to ≈ 또 → tto.
  2|en|sound|DITTO: the same again, me too → tto.
  3|en|sound|An OSTINATO: the same figure again and again → tto.
connector:또는|tto-neun
  1|ko|roots|또 tto = ALSO + 는 neun = AS FOR (TOPIC) → word for word ‘also, as for’: or.
  2|fr|sound|TÔT OU TARD (fr. sooner OR later): tôt ou ≈ 또는 → tto-neun.
  3|en|sound|TOGGLE: flip between this option or that one → tto-neun.
connector:아니면|a-ni-myeon
  1|ko|roots|아니 a-ni = NOT (BE) + 면 myeon = IF → if not this: or.
  2|en|sound|20 Questions: ANIMAL, vegetable, OR mineral? → a-ni-myeon.
  3|en|sound|Pick ANY one: this OR that → a-ni-myeon.
connector:-거나|-geo-na
  2|es|sound|GANAR O PERDER (es. win or lose) → -geo-na.
  3|ja|sound|Japanese KANA: hiragana OR katakana → -geo-na.
connector:하지만|ha-ji-man
  1|ko|roots|하 ha = DO + 지만 ji-man = BUT → does, but…: but, however.
  2|en|sound|HOWEVER starts with the same 'ha' → ha-ji-man.
  3|en|sound|Just one HITCH: yes, BUT… → ha-ji-man.
connector:그렇지만|geu-reo-chi-man
  1|ko|roots|그렇 geu-reo = BE SO + 지만 chi-man = BUT → that is so, but…: nevertheless.
  2|en|sound|GRANTED, BUT…: you admit the point, then push back → geu-reo-chi-man.
  3|es|sound|CLARO, PERO… (es. sure, but…) → geu-reo-chi-man.
connector:그런데|geu-reon-de
  1|ko|roots|그렇 geu-reo = BE SO + 은데 eun-de = BUT → that is so, but…: but, by the way.
  2|fr|sound|Le GRAND DÉTOUR (fr. the big detour): the talk changes course → geu-reon-de.
connector:-지만|-ji-man
  1|en|sound|JIMINY Cricket, Pinocchio's conscience: 'yes, BUT…' → -ji-man.
  2|en|sound|The GYM membership: paid for it, BUT never go → -ji-man.
connector:-는데|-neun-de / -eun-de / -n-de
  1|en|sound|'I WONDER…': a soft lead-in before the real question → -neun-de.
  2|en|sound|The UNDERSCORE: background music under a scene → -neun-de.
  3|es|sound|Música de FONDO (es. background music) → -neun-de.
connector:그래도|geu-rae-do
  1|ko|roots|그래 geu-rae = BE SO + 도 do = EVEN → even so: still, anyway.
  2|fr|sound|MALGRÉ TOUT (fr. despite it all): still, anyway → geu-rae-do.
  3|en|sound|REGARDLESS: you do it anyway → geu-rae-do.
connector:-아도/어도|-a-do / -eo-do
  1|ko|roots|-어 eo = LINKING FORM + 도 do = EVEN → even when…: even if, even though.
  2|en|sound|Even THOUGH: though ≈ do, and that's the meaning → -a-do / -eo-do.
  3|en|sound|Nike's JUST DO IT: do it even if it's hard → -a-do / -eo-do.
connector:그래서|geu-rae-seo
  1|ko|roots|그래 geu-rae = BE SO + 서 seo = AND SO → it's like that, and so: therefore.
  2|fr|sound|GRÂCE À ÇA (fr. thanks to that): the result follows → geu-rae-seo.
  3|en|sound|GRAVITY: that's why the apple falls → geu-rae-seo.
connector:그러니까|geu-reo-ni-kka
  1|ko|roots|그러 geu-reo = BE SO + 니까 ni-kka = SINCE → since it's so: so, that's why.
  2|en|sound|On the GROUNDS that…: here's the reason → geu-reo-ni-kka.
connector:왜냐하면|wae-nya-ha-myeon
  1|ko|roots|왜 wae = WHY + 냐 nya = QUESTION + 하 ha = SAY + 면 myeon = IF → if you ask why: because.
  2|en|sound|WHY NOT? Because… here comes the reason → wae-nya-ha-myeon.
  3|en|sound|Because I'm only HUMAN → wae-nya-ha-myeon.
connector:-아서/어서|-a-seo / -eo-seo
  1|en|sound|Its last syllable, seo, sounds like SO, and so is its job → -a-seo / -eo-seo.
  2|es|sound|ASÍ QUE (es. so, therefore): a-sí ≈ a-seo → -a-seo / -eo-seo.
  3|en|sound|An ASSIST: one move sets up the next → -a-seo / -eo-seo.
connector:-(으)니까|-eu-ni-kka / -ni-kka
  1|fr|sound|Its kka ≈ CAR, French for because → -eu-ni-kka / -ni-kka.
  2|en|sound|Down for TECHNICAL reasons: tech-ni-cal ≈ ni-kka → -eu-ni-kka / -ni-kka.
  3|en|sound|'CUZ, the casual because: kka ≈ 'cuz → -eu-ni-kka / -ni-kka.
connector:-(으)러|-eu-reo / -reo
  1|en|sound|Run an ERRAND: head out to get something done → -eu-reo / -reo.
  2|es|sound|PARA (es. in order to) ends in ra ≈ reo → -eu-reo / -reo.
  3|en|sound|A coffee RUN: going out to get coffee → -eu-reo / -reo.
connector:그러면|geu-reo-myeon
  1|ko|roots|그러 geu-reo = DO OR BE SO + 면 myeon = IF → if so: then, in that case.
  2|en|sound|GREMLINS rules: feed them after midnight? Then trouble → geu-reo-myeon.
  3|en|sound|proGRAMMING logic: IF this, THEN that → geu-reo-myeon.
connector:-(으)면|-eu-myeon / -myeon
  1|en|sound|John Lennon's IMAGINE: picture an 'if…' → -eu-myeon / -myeon.
  3|en|sound|It rhymes with WHEN, one of its meanings → -eu-myeon / -myeon.
connector:그다음에|geu-da-eu-me
  1|ko|roots|그 geu = THAT + 다음 da-eum = NEXT + 에 e = AT (TIME) → at the next thing after that: then.
  2|en|sound|The CODA: the part that comes after → geu-da-eu-me.
  3|en|sound|The PODIUM: first place, then the next, then the next → geu-da-eu-me.
connector:-고 나서|-go na-seo
  1|ko|roots|-고 go = AND + 나 na = DONE + 서 seo = THEN → and, once done, then: after.
  2|en|sound|NASA: countdown done, then liftoff → -go na-seo.
  3|en|sound|Dinner first, then I'm GONNA SEE a movie → -go na-seo.
particle:은/는|eun / neun
  1|en|sound|The topic is something already KNOWN: known ≈ 는 → eun / neun.
  2|en|sound|UNLIKE the others: un ≈ 은, the contrast marker → eun / neun.
  3|en|sound|First ANNOUNCE what you're talking about: -nounce ≈ 는 → eun / neun.
particle:이/가|i / ga
  1|en|sound|The EGO, the 'I' who acts: e-go ≈ i-ga, the subject marker → i / ga.
  2|en|sound|Who ate my NOUGAT? 누가 is who + 가, the subject marker → i / ga.
  3|en|sound|Who's IT? In tag, IT is the one who chases: it ≈ 이, the doer → i / ga.
particle:을/를|eul / reul
  1|fr|sound|Je LE prends (fr. I take it): le ≈ 를, the object of the verb → eul / reul.
  2|en|sound|Fishing: REEL in the catch, the thing acted on: reel ≈ 를 → eul / reul.
  3|en|sound|ROLL the dice: the dice are what you roll, the object: roll ≈ 를 → eul / reul.
particle:의|ui / e
  1|fr|sound|C'est à LUI (fr. it's his): lui ≈ 의, the 's of Korean → ui / e.
  2|en|sound|LUIGI'S Mansion: u-i ≈ 의, the 's that marks the owner → ui / e.
particle:에|e
  1|es|sound|EN casa (es. at home): en ≈ 에, at a place or time → e.
  2|en|sound|AIM at the target: aim ≈ 에, at / to → e.
  3|en|sound|See you at EIGHT: eight ≈ 에, at a time → e.
particle:에서|e-seo
  1|en|sound|An ESPORTS arena, where the action happens: e-s ≈ 에서 → e-seo.
  2|en|sound|ESCAPE FROM Alcatraz: es ≈ 에서, from a place → e-seo.
  3|ko|roots|에 e = AT + 서 seo = BEING AT → being at a place: where an action happens, or from.
particle:부터|bu-teo
  1|en|sound|Computers BOOT up: everything starts from there: boot ≈ 부터 → bu-teo.
  2|en|sound|Press the START BUTTON: from here on: but-ton ≈ 부터 → bu-teo.
  3|ko|roots|붙 but = STICK + 어 eo = -ING → 'sticking', today's 붙어, said just like 부터: from.
particle:까지|kka-ji
  1|fr|sound|JUSQU'À (fr. until): -squ'à ≈ 까 → kka-ji.
  2|en|sound|Up to the CAP, the limit: cap ≈ 까 → kka-ji.
particle:(으)로|eu-ro / ro
  1|en|sound|A ROUTER sends data toward its destination: rou ≈ 로 → eu-ro / ro.
  2|en|sound|ROW toward the shore: row ≈ 로, direction and means → eu-ro / ro.
  3|fr|sound|Tous les chemins mènent à ROME (fr.): ro ≈ 로, the way toward → eu-ro / ro.
particle:에게/한테|e-ge / han-te
  1|en|sound|HAND it TO him: hand-to ≈ 한테, giving to a person → e-ge / han-te.
  3|en|sound|Send it to your AGENT: a-gen ≈ 에게, to a person → e-ge / han-te.
particle:에게서/한테서|e-ge-seo / han-te-seo
  1|en|sound|Fresh EGGS from the hen: eggs ≈ 에게서, from an animal → e-ge-seo / han-te-seo.
  2|en|sound|Cookies from AUNTIE'S: auntie's ≈ 한테서, from a person → e-ge-seo / han-te-seo.
  3|ko|roots|한테 han-te = TO A PERSON + 서 seo = FROM → 'from' a person.
particle:와/과|wa / gwa
  1|en|sound|Holmes and WATSON, always together: wat ≈ 와 → wa / gwa.
  2|en|sound|A GUARDIAN always goes with you: gua ≈ 과 → wa / gwa.
  3|en|sound|A WALTZ is danced with a partner: wal ≈ 와 → wa / gwa.
particle:하고|ha-go
  1|en|sound|HALF-AND-HALF pizza: this and that together: half ≈ 하 → ha-go.
  2|en|sound|HAGRID always tags along with Harry: hag ≈ 하고 → ha-go.
  3|ko|roots|하 ha = DO, SAY + 고 go = AND → literally 'doing… and': and, with.
particle:(이)랑|i-rang / rang
  1|en|sound|The POWER RANGERS always team up: rang ≈ 랑, together → i-rang / rang.
  2|en|sound|HANG out with friends: hang ≈ 랑, the casual 'with' → i-rang / rang.
  3|en|sound|Come ALONG, you're with me: long ≈ 랑 → i-rang / rang.
particle:도|do
  1|en|sound|Me TOO: too ≈ 도 → do.
  2|en|sound|A DUET: you sing, and I sing too: du ≈ 도 → do.
  3|en|sound|A DOUBLE scoop: chocolate, and vanilla too: dou ≈ 도 → do.
particle:만|man
  1|en|sound|A ONE-MAN band: only one player: man ≈ 만 → man.
  2|fr|sound|SEULEMENT (fr. only): -ment ≈ 만 → man.
  3|en|sound|A MONOPOLY: only one company sells it: mon ≈ 만 → man.
particle:밖에|ba-kke
  1|en|sound|Travel with only a BACKPACK, nothing else: back ≈ 밖 → ba-kke.
  2|fr|sound|Une BAGATELLE (fr. a trifle): just that little, nothing more → ba-kke.
  3|ko|roots|밖 bak = OUTSIDE + 에 e = AT → 'outside of this', with a negative: only this.
particle:보다|bo-da
  1|en|sound|BETTER than: bet-ter ≈ 보다 → bo-da.
  2|en|sound|A speed BOOST: faster than before: boo ≈ 보 → bo-da.
  3|ko|roots|보 bo = SEE + 다가 da-ga = AFTER → after seeing A, B is more…: than.
particle:처럼|cheo-reom
  1|en|sound|CHARADES: act like a cat or a robot: cha-ra ≈ 처러 → cheo-reom.
  2|en|sound|A CHAMELEON looks just like its background: cha ≈ 처 → cheo-reom.
particle:마다|ma-da
  1|es|sound|CADA día (es. every day): cada rhymes with 마다 → ma-da.
  2|en|sound|MAP() runs on every item in a list: map ≈ 마 → ma-da.
  3|en|sound|Every MONDAY, like clockwork: mon-day ≈ 마다 → ma-da.
particle:(이)나|i-na / na
  1|en|sound|EENIE, MEENIE… pick one or the other: ee-nie ≈ 이나 → i-na / na.
  2|en|sound|ANNA or Elsa? Pick one sister: an-na ≈ 이나 → i-na / na.
ending:-이에요/예요|-i-e-yo / -ye-yo
  1|ko|roots|이 i = BE + 에요 e-yo = POLITE ENDING → 'be', said politely: A is B.
  2|en|sound|A EQUALS B: ee-quals ≈ 이 i → -i-e-yo / -ye-yo.
ending:아니에요|a-ni-e-yo
  1|ko|roots|아니 a-ni = NOT (BE) + 에요 e-yo = POLITE ENDING → is not, said politely: A is not B.
ending:-고 싶어요|-go si-peo-yo
  1|ko|roots|-고 go = INTENT (OLD -고져) + 싶 sip = WANT + 어요 eo-yo = POLITE ENDING → want to (do). Not the 'and' 고.
ending:-(으)ㄹ 수 있어요/없어요|-(eu)l ssu i-sseo-yo / eop-sseo-yo
  1|ko|roots|을 eul = NOT YET DONE + 수 (手) su = WAY + 있어요 i-sseo-yo = THERE IS → a way exists: can. 없어요: no way, can't.
  2|en|sound|A SWISS ARMY KNIFE can do anything: swiss ≈ 수 있 → -(eu)l ssu i-sseo-yo.
ending:-아야/어야 해요|-a-ya / -eo-ya hae-yo
  1|ko|roots|-어야 eo-ya = ONLY IF + 해요 hae-yo = DO → only if you do it: have to, must.
  2|es|sound|Ya HAY QUE irse (es. we have to go now): ya hay ≈ 야 해 → -a-ya / -eo-ya hae-yo.
ending:안|an
  1|ko|roots|아니 a-ni = NOT + 하 ha = DO → 'not do', now 않다 (the long form). 안 is 아니 squeezed: not.
ending:못|mot
  1|ko|roots|못 mot = CANNOT + 하 ha = DO → 못하다, can't do: the long form 먹지 못해요. Same 못 as 못생겼어요.
  2|en|sound|A castle MOAT: you can't get across → mot.
ending:-(으)세요|-eu-se-yo / -se-yo
  1|ko|roots|시 si = RESPECT + 어요 eo-yo = POLITE ENDING → merged into 세요: a polite, respectful please.
  2|es|sound|SEÑOR (es. sir): se-ñor ≈ 세요, the respectful ask → -eu-se-yo / -se-yo.
ending:-지 마세요|-ji ma-se-yo
  1|ko|roots|-지 ji = NEGATION FORM + 마 ma = STOP + 세요 se-yo = PLEASE → please stop doing it: please don't.
  2|fr|sound|Ne fais JAMAIS ça ! (fr. never do that!): ja-mais ≈ 지 마 → -ji ma-se-yo.
ending:-아/어 주세요|-a ju-se-yo / -eo ju-se-yo
  1|ko|roots|-어 eo = LINKING FORM + 주 ju = GIVE + 세요 se-yo = PLEASE → please 'give' me the action: do it for me.
  2|es|sound|¡AYÚDAME! (es. help me!): a-yú ≈ 아 주 → -a ju-se-yo / -eo ju-se-yo.
ending:-(으)ㄹ까요?|-eul-kka-yo / -l-kka-yo
  1|ko|roots|을 eul = NOT YET DONE + 까 kka = QUESTION + 요 yo = POLITE → a polite question about what's not done yet: shall we?
tense:-아요/어요|-a-yo / -eo-yo
  1|es|sound|AHORA (es. now): a-o ≈ 아요 a-yo, the 'now' ending → -a-yo / -eo-yo.
  2|ko|roots|-어 eo = LINKING FORM + 요 yo = POLITE → the verb's linking form, made polite: the present tense.
tense:-았/었어요|-a-sseo-yo / -eo-sseo-yo
  1|fr|sound|Le PASSÉ composé (fr. past tense): passé ≈ 았어 a-sseo → -a-sseo-yo / -eo-sseo-yo.
  2|es|sound|HACE un año (es. a year ago): ha-ce ≈ 았어 a-sseo → -a-sseo-yo / -eo-sseo-yo.
  3|ko|roots|-어 eo = LINKING FORM + 있 it = BE, EXIST → 'exists, having done it': did, the past.
tense:-(으)ㄹ 거예요|-eul kkeo-ye-yo / -l kkeo-ye-yo
  1|en|sound|I WILL be there: will ≈ 을 eul, the future → -eul kkeo-ye-yo / -l kkeo-ye-yo.
  2|ko|roots|을 eul = NOT YET DONE + 거 kkeo = THING + 예요 ye-yo = IS → 'is a thing yet to happen': will, going to.
tense:-고 있어요|-go i-sseo-yo
  1|en|sound|Work still ONGOING: going ≈ 고 있 go-i… → -go i-sseo-yo.
  2|ko|roots|-고 go = AND + 있어요 i-sseo-yo = IS (THERE) → 'doing, and still at it': -ing, in progress.
speech:해요체|hae-yo-che
  1|en|sound|A friendly HELLO, polite to anyone: hel-lo ≈ 해요 hae-yo → hae-yo-che.
  2|ko|roots|해요 hae-yo = DOES (POLITE) + 체 (體) che = STYLE → the '해요' style: everyday polite speech.
speech:합니다체|ham-ni-da-che
  1|en|sound|A HUMBLE, formal tone: hum ≈ 합 ham → ham-ni-da-che.
  2|ko|roots|습 seum = RESPECT + 니 ni = NOW, POLITELY + 다 da = STATEMENT → a respectful, polite statement: formal style.
speech:반말|ban-mal
  1|en|sound|BANTER with your friends: ban ≈ 반 → ban-mal.
  2|ko|roots|반 (半) ban = HALF + 말 mal = SPEECH → 'half speech', neither raised nor lowered: casual speech.
honorific:-(으)시-|-eu-si- / -si-
  1|en|sound|Your CEO, who gets respect: see ≈ 시 si → -eu-si- / -si-.
honorific:께서/께|kke-seo / kke
  1|en|sound|The KAISER himself did it: kai-ser ≈ 께서 kke-seo → kke-seo / kke.
honorific:드리다|deu-ri-da
  1|en|sound|Pay TRIBUTE to the king: tri ≈ 드리 deu-ri → deu-ri-da.
  2|es|sound|DAR (es. to give): dar ≈ 드리 deu-ri → deu-ri-da.
  3|ko|roots|들 deul = ENTER + 이 i = MAKE → 'make it go in': to give, humbly.
honorific:드시다|deu-si-da
  1|en|sound|Time for DESSERT: de-ss ≈ 드시 deu-si → deu-si-da.
  2|es|sound|El DESAYUNO (es. breakfast): de-sa ≈ 드시 deu-si → deu-si-da.
  3|ko|roots|들 deul = HOLD, LIFT + 시 si = RESPECT → 들다 is also a polite 'eat': eat, drink (honorific).
honorific:주무시다|ju-mu-si-da
  1|fr|sound|JE ME couche (fr. I go to bed): je me ≈ 주무 ju-mu → ju-mu-si-da.
honorific:계시다|gye-si-da
  1|en|sound|A GUEST staying at your place: gues ≈ 계시 gye-si → gye-si-da.
honorific:성함|seong-ham
  1|en|sound|Your SURNAME, please: sur-name ≈ 성함 seong-ham → seong-ham.
  2|ko|roots|성 (姓) seong = FAMILY NAME + 함 (銜) ham = TITLE → your family name and title: name (honorific).
honorific:연세|yeon-se
  1|en|sound|An EON, an age: eon ≈ 연 yeon → yeon-se.
  2|ko|roots|연 (年) yeon = YEAR + 세 (歲) se = YEAR OF AGE → the years someone has: age (honorific).
`

const languages = ['en', 'es', 'fr', 'pt', 'it', 'de', 'ja', 'zh', 'ko', 'mixed']
const kinds = ['sound', 'reading', 'roots', 'loanword', 'pattern']

function parseAids(text: string): Record<string, MemoryAid> {
  const result: Record<string, MemoryAid> = {}
  let current: MemoryAid | undefined
  for (const line of text.trim().split('\n')) {
    if (!line.startsWith('  ')) {
      const [key, pronunciation, ...rest] = line.split('|')
      if (rest.length || !key || !pronunciation) throw new Error(`Invalid memory aid: ${line}`)
      if (result[key]) throw new Error(`Duplicate memory aid: ${key}`)
      current = result[key] = { pronunciation, anchors: [] }
      continue
    }
    const fields = line.trim().split('|')
    const [id, language, kind, anchor] = fields
    if (!current || fields.length !== 4 || !/^\d+\*?$/.test(id) || !languages.includes(language) || !kinds.includes(kind) || !anchor.trim()) {
      throw new Error(`Invalid anchor candidate: ${line}`)
    }
    current.anchors.push({
      id: id.replace('*', ''), text: anchor.trim(),
      kind: kind as AnchorCandidate['kind'], language: language as AnchorCandidate['language'],
      ...(id.endsWith('*') ? { preselected: true } : {}),
    })
  }
  return result
}

/**
 * Anchors for learners who know one more language, keyed like the blocks above: at most one per card and language,
 * written by speakers' sound rules (Italian, Portuguese, German). The app shows them first to those learners and keeps
 * them one tap away for everyone else; the core one to three above stay the same for all.
 */
const languageEntries = `
가벼워요
  it1|it|sound|Light as a GABBIANO (it. seagull): gab-bia ≈ ga-byeo → ga-byeo-wo-yo.
귀여워요
  de1|de|sound|A fluffy KÜKEN (de. baby chick), so cute: kü ≈ 귀 gwi → gwi-yeo-wo-yo.
나빠요
  pt1|pt|sound|NÃO PRESTA (pt. it's no good): não-pres ≈ na-ppa → na-ppa-yo.
더러워요
  de1|de|sound|DRECKIG (de. dirty): dre ≈ deo-reo → deo-reo-wo-yo.
더워요
  de1|de|sound|DAUERHITZE (de. a heat wave that won't end): dau-er ≈ deo-wo → deo-wo-yo.
똑같아요
  de1|de|sound|Your DOPPELGÄNGER (de. exact lookalike): dop(pel)gän ≈ ttok-ga → ttok-ga-ta-yo.
뚱뚱해요
  it1|it|sound|TONDO TONDO (it. round and plump): ton-do ≈ ttung → ttung-ttung-hae-yo.
뜨거워요
  pt1|pt|sound|“Cuidado, TÁ QUENTE!” (pt. careful, it's hot!): tá-quen ≈ tteu-geo → tteu-geo-wo-yo.
매워요
  de1|de|sound|Fiery MEERRETTICH (de. horseradish): meer ≈ mae-wo → mae-wo-yo.
멀어요
  pt1|pt|sound|MORO LONGE (pt. I live far away): mo-ro ≈ meo-reo → meo-reo-yo.
못생겼어요
  it1|it|sound|Brutto come un MOSTRO (it. ugly as a monster): mos ≈ 못 mot → mot-ssaeng-gyeo-sseo-yo.
  pt1|pt|sound|Um MOSTRENGO (pt. a hideous creature): mos-tren-go ≈ mot-ssaeng-gyeo → mot-ssaeng-gyeo-sseo-yo.
빨라요
  it1|it|sound|Fast as a PALLOTTOLA (it. bullet): pal-lo ≈ ppal-la → ppal-la-yo.
싸요
  it1|it|sound|I SALDI (it. the sales): sal ≈ 싸 ssa, all cheap → ssa-yo.
아파요
  pt1|pt|sound|Vai APANHAR! (pt. you'll get a beating): ouch, it hurts → a-pa-yo.
좋아요
  it1|it|sound|GIOIA (it. joy): gio-ia ≈ jo-a → jo-a-yo.
  pt1|pt|sound|“Tudo JOIA!” (pt-BR. all good!): jo-ia ≈ jo-a → jo-a-yo.
커요
  de1|de|sound|A KOLOSS (de. colossus, a giant): ko ≈ 커 keo → keo-yo.
피곤해요
  pt1|pt|sound|Estou SEM PIQUE (pt-BR. I've got no energy left): pi-que ≈ pi-gon → pi-gon-hae-yo.
힘들어요
  de1|de|sound|A HINDERNISLAUF (de. obstacle race) wears you out: hin-der ≈ him-deu-r → him-deu-reo-yo.
물
  pt1|pt|sound|MOLHADO (pt. wet), soaked in water: mo-lh ≈ 물 mul → mul.
오렌지주스
  de1|de|sound|ORANGENSAFT (de. orange juice): o-ransch ≈ o-ren-ji → o-ren-ji-ju-seu.
커피
  it1|it|sound|Il CAFFÈ (it. coffee) → keo-pi.
  pt1|pt|sound|Um CAFEZINHO (pt. a little black coffee): ca-fé ≈ keo-pi → keo-pi.
  de1|de|sound|KAFFEE (de. coffee), with p for f: kaf-fe ≈ keo-pi → keo-pi.
딸
  pt1|pt|sound|TAL mãe, TAL filha (pt. like mother, like daughter): tal ≈ 딸 ttal → ttal.
아내
  it1|it|sound|L'ANELLO (it. the ring) on your wife's finger: a-nel ≈ a-nae → a-nae.
  pt1|pt|sound|Your wife's ANEL (pt. wedding ring): a-nel ≈ a-nae → a-nae.
면
  pt1|pt|sound|MIOJO (pt-BR. instant noodles): mio ≈ myeo → myeon.
빵
  it1|it|sound|Il PANE (it. bread): pan ≈ 빵 ppang → ppang.
아이스크림
  de1|de|sound|Ein EIS (de. an ice cream): eis ≈ a-i-s → a-i-seu-keu-rim.
레몬
  it1|it|sound|LIMONE (it. lemon): li-mo ≈ re-mon → re-mon.
  pt1|pt|sound|LIMÃO (pt. lemon): li-mão ≈ re-mon → re-mon.
체리
  it1|it|sound|CILIEGIA (it. cherry): ci-lie ≈ che-ri → che-ri.
엔지니어
  it1|it|sound|INGEGNERE (it. engineer): in-ge-gne ≈ en-ji-ni → en-ji-ni-eo.
  pt1|pt|sound|ENGENHEIRO (pt. engineer): en-ge-nhei ≈ en-ji-ni → en-ji-ni-eo.
  de1|de|sound|INGENIEUR (de. engineer): in-zhe-niör ≈ en-ji-ni-eo → en-ji-ni-eo.
다큐멘터리
  it1|it|sound|DOCUMENTARIO (it. documentary) → da-kyu-men-teo-ri.
  de1|de|sound|A DOKU (de. documentary): do-ku ≈ da-kyu → da-kyu-men-teo-ri.
드라마
  it1|it|sound|Un DRAMMA (it. drama) → deu-ra-ma.
  pt1|pt|sound|DORAMA (pt-BR. Asian TV drama): do-ra-ma ≈ deu-ra-ma → deu-ra-ma.
로맨틱 영화
  it1|it|sound|Un film ROMANTICO (it. romantic) + 영화, movie → ro-maen-tik yeong-hwa.
애니메이션
  it1|it|sound|ANIMAZIONE (it. animation): a-ni-ma-zio ≈ ae-ni-me-i-syeon → ae-ni-me-i-syeon.
  pt1|pt|sound|ANIMAÇÃO (pt. animation): a-ni-ma-ção ≈ ae-ni-me-i-syeon → ae-ni-me-i-syeon.
액션 영화
  it1|it|sound|Un film d'AZIONE (it. action movie): a-zio ≈ aek-ssyeon → aek-ssyeon yeong-hwa.
  pt1|pt|sound|Filme de AÇÃO (pt. action movie): a-ção ≈ aek-ssyeon → aek-ssyeon yeong-hwa.
코미디 영화
  it1|it|sound|Una COMMEDIA (it. comedy) + 영화, movie → ko-mi-di yeong-hwa.
  de1|de|sound|KOMÖDIE (de. comedy): ko-mö-di ≈ ko-mi-di → ko-mi-di yeong-hwa.
댄스
  pt1|pt|sound|DANÇA (pt. dance): dan-ça ≈ daen-seu → daen-seu.
  de1|de|sound|TANZ (de. dance): tanz ≈ daen-s → daen-seu.
발라드
  it1|it|sound|Una BALLATA (it. ballad): bal-la-ta ≈ bal-la-deu → bal-la-deu.
일렉트로닉
  it1|it|sound|Musica ELETTRONICA (it. electronic music) → il-lek-teu-ro-nik.
  de1|de|sound|ELEKTRONIK (de. electronics), almost syllable for syllable → il-lek-teu-ro-nik.
클래식
  it1|it|sound|Musica CLASSICA (it. classical music): clas-si ≈ keul-lae-sik → keul-lae-sik.
  de1|de|sound|KLASSIK (de. classical music): klas-sik ≈ keul-lae-sik → keul-lae-sik.
컴퓨터
  pt1|pt|sound|COMPUTADOR (pt. computer): com-pu-ta ≈ keom-pyu-teo → keom-pyu-teo.
펜
  it1|it|sound|La PENNA (it. pen) → pen.
핸드폰
  de1|de|sound|Your HANDY (de. cellphone): hen-di ≈ haen-deu → haen-deu-pon.
마트
  de1|de|sound|The SUPERMARKT (de. supermarket): -markt ≈ ma-teu → ma-teu.
골프
  pt1|pt|sound|GOLFE (pt. golf), two beats like the Korean: gol-fe ≈ gol-peu → gol-peu.
마라톤
  it1|it|sound|La MARATONA (it. marathon): ma-ra-to ≈ ma-ra-ton → ma-ra-ton.
축구
  pt1|pt|sound|CHUTEIRA (pt. football boot): chu-t ≈ chuk-k → chuk-kku.
엊그제
  de1|de|sound|VORGESTERN (de. the day before yesterday): (v)or-ge ≈ eot-kkeu → eot-kkeu-je.
가르쳐요
  pt1|pt|sound|A CARTILHA (pt. the primer that teaches kids to read): car-ti ≈ ga-reu-chi (pt-BR) → ga-reu-chyeo-yo.
기다려요
  de1|de|sound|GEDULD (de. patience) is all about waiting: ge-dul ≈ gi-da-r → gi-da-ryeo-yo.
마셔요
  de1|de|sound|Lift a MASSKRUG (de. liter beer mug) and drink: mass ≈ ma-sy → ma-syeo-yo.
배워요
  pt1|pt|sound|O BEABÁ (pt. the ABCs), the first thing you learn: be-a ≈ bae-wo → bae-wo-yo.
  de1|de|sound|Vokabeln PAUKEN (de. cramming vocab): pau ≈ 배우 bae-u → bae-wo-yo.
봐요
  pt1|pt|sound|Que BOA VISTA! (pt. what a view!): boa ≈ bwa → bwa-yo.
샤워해요
  de1|de|sound|A SCHAUER (de. rain shower) pours down: schau-er ≈ sya-wo → sya-wo-hae-yo.
싫어해요
  de1|de|sound|The SCHIRI (de. referee), whom every fan hates: schi-ri ≈ si-reo → si-reo-hae-yo.
운동해요
  pt1|pt|sound|Counting reps: “UM, DOIS…” (pt. one, two…): um-dois ≈ un-dong → un-dong-hae-yo.
자요
  pt1|pt|sound|“JÁ pra cama!” (pt. to bed, right now!): já ≈ ja → ja-yo.
connector:-고 나서
  de1|de|sound|NACH (de. after): nach ≈ 나서 na-seo → -go na-seo.
connector:-아서/어서
  de1|de|sound|ALSO (de. so, therefore): al-so ≈ a-seo → -a-seo / -eo-seo.
connector:그래서
  pt1|pt|sound|GRAÇAS A ISSO (pt. thanks to that): gra-ça ≈ geu-rae-seo, the result follows → geu-rae-seo.
connector:왜냐하면
  de1|de|sound|WEIL (de. because): wei ≈ 왜 wae → wae-nya-ha-myeon.
음식
  de1|de|sound|An IMBISS (de. snack stand, a quick bite): im ≈ 음 eum → eum-sik.
particle:에
  pt1|pt|sound|EM casa (pt. at home): em ≈ 에, at a place or time → e.
particle:에게/한테
  de1|de|sound|In gute HÄNDE (de. into good hands): hän-de ≈ 한테 han-te → e-ge / han-te.
`

/** Adds the language anchors to the cards they belong to. */
function withLanguageAnchors(aids: Record<string, MemoryAid>, text: string) {
  let current: MemoryAid | undefined
  for (const line of text.trim().split('\n').filter(Boolean)) {
    if (!line.startsWith('  ')) {
      current = aids[line.trim()]
      if (!current) throw new Error(`Language anchors for an unknown card: ${line}`)
      continue
    }
    const [id, language, kind, anchor] = line.trim().split('|')
    if (!current || !/^(it|pt|de)1$/.test(id) || id.slice(0, 2) !== language || kind !== 'sound' || !anchor?.trim()) throw new Error(`Invalid language anchor: ${line}`)
    current.anchors.push({ id, text: anchor.trim(), kind: 'sound', language: language as AnchorCandidate['language'] })
  }
  return aids
}

export const memoryAids = withLanguageAnchors(parseAids(`${entries.trim()}\n${grammarEntries.trim()}`), languageEntries)
