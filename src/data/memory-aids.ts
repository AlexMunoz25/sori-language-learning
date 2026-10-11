import type { AnchorCandidate, MemoryAid } from '../types/vocabulary'

// One block per card: `key|reading guide`, then indented Memory Anchor candidates
// `id|hook language|kind|text`. Candidate ids are stable within a card: polishing keeps
// the id (and the learner's selection); a genuinely new idea gets a new id.
// `id*` marks a five-star anchor that stays selected until the learner picks another.
// Each anchor links the Korean sound to its meaning through something familiar; see
// docs/anchor-feedback-analysis.md. Etymology lives in origin-reviews.json.
// Anchors of kind roots may only state what the card's Roots record supports; ≈ marks a sound-alike inside them.
// Full item ids distinguish homographs (가요 in Music versus Verbs).
const entries = `
예뻐요|ye-ppeo-yo
  1|en|sound|Audrey HEPBURN, the icon of pretty: hep-bur ≈ ye-ppeo → ye-ppeo-yo.
  2|es|sound|“ESPEJO, espejo…” (es. mirror, mirror): who's the prettiest? → ye-ppeo-yo.
  3|fr|sound|Elle EST BELLE (fr. she's beautiful): é-bel ≈ ye-ppeo → ye-ppeo-yo.
잘생겼어요|jal-saeng-gyeo-sseo-yo
  1|en|sound|A sharp JAWLINE: the classic handsome look → jaw-l ≈ 잘 jal → jal-saeng-gyeo-sseo-yo.
  2|fr|sound|Un JOLI garçon (fr. a good-looking guy): joli ≈ jal → jal-saeng-gyeo-sseo-yo.
  3|en|sound|Fresh haircut and hair GEL: looking sharp → jal-saeng-gyeo-sseo-yo.
못생겼어요|mot-ssaeng-gyeo-sseo-yo
  1|fr|sound|MOCHE (fr. ugly) ≈ 못 mot → mot-ssaeng-gyeo-sseo-yo.
  2|en|sound|NOT good-looking: 못 mot ≈ NOT → mot-ssaeng-gyeo-sseo-yo: ugly.
  3|en|sound|Ugly as a MONSTER: mon-s ≈ mot-ss → mot-ssaeng-gyeo-sseo-yo.
귀여워요|gwi-yeo-wo-yo
  1|ja|sound|Anime's KAWAII (cute): k-wa-ii ≈ gwi-yeo → gwi-yeo-wo-yo.
  2|en|sound|So cute you go all GOOEY inside → gwi-yeo-wo-yo.
  3|en|sound|A baby PENGUIN waddling: pen-GWIN ≈ gwi → gwi-yeo-wo-yo.
날씬해요|nal-ssin-hae-yo
  1|en|sound|Slim and NAIL-THIN: nal ≈ NAIL, ssin ≈ THIN → nal-ssin-hae-yo.
  2|en|sound|NO SINful desserts: staying slim → nal-ssin-hae-yo.
  3|en|sound|The iPod NANO, famously slim: na ≈ nal → nal-ssin-hae-yo.
뚱뚱해요|ttung-ttung-hae-yo
  1|en|sound|TUNGSTEN: one of the densest, heaviest metals → ttung-ttung-hae-yo.
  2|en|sound|Weighs a TON, a TON → ttung-ttung-hae-yo: chubby.
  3|es|sound|Gordo como un TONEL (es. a barrel): ton ≈ ttung → ttung-ttung-hae-yo.
바빠요|ba-ppa-yo
  1*|mixed|sound|PAPA is always busy → ba-ppa-yo. It even rhymes: 아빠 바빠요, “Dad is busy.”
  2|en|sound|BACK-to-BACK meetings all day: busy → ba-ppa-yo.
  3|en|sound|BEBOP: busy, rapid-fire jazz → ba-ppa-yo.
피곤해요|pi-gon-hae-yo
  1|en|sound|Your PEAK is GONE: tired → pi-gon-hae-yo.
  2|en|sound|The PITCH COUNT hits 100: the pitcher is tired → pi-gon-hae-yo.
  3|en|sound|Battery at PI percent (3.14%), energy GONE → pi-gon-hae-yo.
아파요|a-pa-yo
  1|en|sound|“AH, PA(in)!” → a-pa-yo. Koreans really yell 아파! when something hurts.
  2|en|sound|An UPPERcut to the jaw: it hurts → a-pa-yo.
  3|en|sound|APPendicitis: it really hurts → a-pa-yo.
슬퍼요|seul-peo-yo
  1|fr|sound|Tout SEUL (fr. all alone): sad → seul-peo-yo.
  2|en|sound|In a SLUMP, feeling down → seul-peo-yo.
  3|es|sound|SUFRO (es. I'm suffering): sad → seul-peo-yo.
행복해요|haeng-bo-kae-yo
  1|en|sound|Happy: HANGing in a hammock with a BOOK → haeng-bo-kae-yo.
  2|en|sound|A HUG and a gift BOX: happy → haeng-bo-kae-yo.
  3|en|sound|The happiness HANDBOOK: hand-book ≈ haeng-bok → haeng-bo-kae-yo.
무서워요|mu-seo-wo-yo
  1|es|sound|Night at the MUSEUM (es. el MUSEO), exhibits alive after dark: scary → mu-seo-wo-yo.
  2|en|sound|The JAWS MUSIC (dun-dun…): mu-sic ≈ mu-seo → scary → mu-seo-wo-yo.
  3|en|sound|Even elephants are scared of a MOUSE → mu-seo-wo-yo.
재미있어요|jae-mi-i-sseo-yo
  1|en|sound|Bob Marley's “JAMMING”: jamming IS SO fun! → jae-mi-i-sseo-yo.
  2|en|sound|A JAMAICA vacation: so much fun → jae-mi-i-sseo-yo.
  3|fr|sound|« J'AIME ! » (fr. I love it!): so much fun → jae-mi-i-sseo-yo.
재미없어요|jae-mi-eop-sseo-yo
  1*|en|sound|JAMMING cancelled? OOPS, no fun → jae-mi-eop-sseo-yo: boring.
  2|en|sound|GAME OVER: the fun is gone → jae-mi-eop-sseo-yo.
  3|es|sound|“¡YA ME HARTÉ!” (es. I'm fed up): boring → jae-mi-eop-sseo-yo.
좋아요|jo-a-yo
  1|en|sound|Good things bring JOY → jo-a-yo (the ㅎ is silent).
  2|en|sound|Korean YouTube's LIKE button literally says 좋아요 → jo-a-yo.
  3|fr|sound|JOIE de vivre (fr. joy of living): good → jo-a-yo.
나빠요|na-ppa-yo
  1|en|sound|NAPPA, the Dragon Ball Z villain: a bad guy → na-ppa-yo.
  2|en|sound|A kidNAPPER: the worst kind of bad guy → nap-per ≈ na-ppa → na-ppa-yo.
  3|en|sound|Bad idea? “NAH, PASS.” → na-ppa-yo.
커요|keo-yo
  1|ko|sound|A Venti COFFEE: 커피 커요, “the coffee is big.” 커 keo = big → keo-yo.
  2|en|sound|The COLOSSAL Titan (Attack on Titan): big → keo-yo.
  3|en|sound|King KONG: big → keo-yo.
작아요|ja-ga-yo
  1|en|sound|The headphone MINI-JACK, the small one: jack ≈ 작 jak → ja-ga-yo.
  2|en|sound|JACK-JACK, the tiny Incredibles baby → 작 jak → ja-ga-yo.
  3|es|sound|Me queda CHICO (es. it's too small for me): chi-co ≈ ja-ga → ja-ga-yo.
길어요|gi-reo-yo
  1|en|sound|A GIRAFFE's long neck: gi-raf ≈ gi-reo → gi-reo-yo.
  2|en|sound|KILOmeters long: ki-lo ≈ gi-reo → gi-reo-yo.
  3|en|sound|KILL Bill was so long it came in two volumes → 길 gil → gi-reo-yo.
짧아요|jjal-ba-yo
  1|en|sound|A JAB is the shortest punch → 짧 jjalb → jjal-ba-yo.
  2|es|sound|CHAPARRO (es. shorty): cha-pa ≈ jjal-ba → jjal-ba-yo.
  3|en|sound|CHOP it: cut short → chop ≈ 짧 jjalb → jjal-ba-yo.
넓어요|neol-beo-yo
  1|en|sound|Lots of (N)ELBOW room: spacious → neol-beo-yo.
  2|es|sound|Una NAVE industrial (es. warehouse): na-be ≈ neol-beo, pure open space → neol-beo-yo.
  3|en|sound|A NEBULA, light-years wide → neol-beo-yo.
좁아요|jo-ba-yo
  1|en|sound|A SHOEBOX apartment: so cramped → jo-ba-yo.
  2|en|sound|CHEWBAcca ducking through the Falcon's narrow corridors → jo-ba-yo.
  3|en|sound|A CHOKEPOINT: the narrow pass every map has → choke-p ≈ jo-b → jo-ba-yo.
두꺼워요|du-kkeo-wo-yo
  1|en|sound|A TOUCAN's thick beak → du-kkeo-wo-yo.
  2|en|sound|A puffy DUCK-down jacket: thick → du-kkeo-wo-yo.
  3|en|sound|Thick DOUGH for a deep-dish pizza → du-kkeo-wo-yo.
얇아요|yal-ba-yo
  1|en|sound|WALLPAPER: paper-thin → (w)al-pa ≈ yal-ba → yal-ba-yo.
  2|en|sound|A single strand of YARN: thin → yal-ba-yo.
  3|en|sound|A silicon WAFER: wafer-thin → wa-fer ≈ yal-ba → yal-ba-yo.
무거워요|mu-geo-wo-yo
  1|en|sound|Lifting a full Oktoberfest beer MUG: heavy! → mu-geo-wo-yo.
  2|es|sound|MUCHO peso (es. lots of weight): heavy → mu-geo-wo-yo.
  3|es|sound|PESO MUERTO (es. deadlift, dead weight): the heaviest lift → muer ≈ mu-geo → mu-geo-wo-yo.
가벼워요|ga-byeo-wo-yo
  1|es|sound|Light as a GAVIOTA (es. seagull) → ga-byeo-wo-yo.
  2|en|sound|A CARBON-fiber bike: featherlight → ga-byeo-wo-yo.
  3|es|sound|Un GLOBO (es. balloon) floating away: light → ga-byeo-wo-yo.
가까워요|ga-kka-wo-yo
  1|en|sound|KAKAOTalk, Korea's chat app, keeps friends close → ga-kka-wo-yo.
  2|en|sound|A GECKO clings close to the wall → ga-kka-wo-yo.
  3|en|sound|“GOTCHA!” Close enough to grab → ga-kka-wo-yo.
멀어요|meo-reo-yo
  1*|en|sound|MORDOR is far, far away → 멀 meol → meo-reo-yo.
  2|en|sound|MARS: the faraway red planet → 멀 meol → meo-reo-yo.
  3|en|sound|A desert MIRAGE: always far away → meo-reo-yo.
같아요|ga-ta-yo
  1|es|sound|A copycat GATA (es. cat) does the same → ga-ta-yo.
  2|ja|sound|A karate KATA: everyone repeats the same moves → ga-ta-yo.
  3|en|sound|Every airport GATE looks the same → ga-ta-yo.
똑같아요|ttok-ga-ta-yo
  1|en|sound|TikTOK copycats: everyone does the exact same dance → ttok-ga-ta-yo.
  2|en|sound|TICK-TOCK: two clocks in perfect sync → ttok-ga-ta-yo.
  3|es|sound|¡TOCAYO! (es. your exact same name): to-ca ≈ ttok-ga → ttok-ga-ta-yo.
달라요|dal-la-yo
  1|en|sound|Δ DELTA means difference: del-ta ≈ dal-la → dal-la-yo.
  2|es|sound|DALTÓNICO (es. color-blind): sees colors differently → dal-to ≈ dal-la → dal-la-yo.
  3|en|sound|“DARE to be different”: dare ≈ dal → dal-la-yo.
빨라요|ppal-la-yo
  1*|es|sound|Fast as a BALA (es. bullet) → ppal-la-yo.
  2|en|sound|A peregrine FALCON, the fastest animal: fal ≈ ppal → ppal-la-yo.
  3|en|sound|Usain BOLT, the fastest man alive → ppal-la-yo.
느려요|neu-ryeo-yo
  1|en|sound|NO RUSH, take it slow → neu-ryeo-yo.
  2|es|sound|A NORIA (es. Ferris wheel) turns so slowly → neu-ryeo-yo.
  3|en|sound|“NEARLY done…” says the progress bar, for an hour: slow → neu-ryeo-yo.
쉬워요|swi-wo-yo
  1|en|sound|Easy as flipping a SWITCH → swi-wo-yo.
  2|en|sound|SWISH! Nothing but net: an easy shot → swi-wo-yo.
  3|en|sound|A 4–0 SWEEP: the easiest series ever → swi-wo-yo.
어려워요|eo-ryeo-wo-yo
  1|en|sound|ERROR, ERROR… this is hard → eo-ryeo-wo-yo.
  2|en|sound|ERROR… WHOA, so hard → eo-ryeo-wo-yo.
  3|es|sound|¡Qué HORROR de examen! (es. what a nightmare exam): hard → eo-ryeo-wo-yo.
힘들어요|him-deu-reo-yo
  1|en|sound|Climbing the HIMalayas: exhausting → him-deu-reo-yo.
  2|en|sound|A HUNDRED burpees: exhausting → him-deu-reo-yo.
  3|en|sound|HURDLES, lap after lap: exhausting → him-deu-reo-yo.
깨끗해요|kkae-kkeu-tae-yo
  1|en|sound|Clear the CACHE and COOKIES: a clean browser → kkae-kkeu-tae-yo.
  2|en|sound|Spotless: it CAN'T GET any cleaner → kkae-kkeu-tae-yo.
  3|mixed|sound|A KÄRCHER pressure washer: spotless → kär-cher ≈ kkae-kkeu → kkae-kkeu-tae-yo.
더러워요|deo-reo-wo-yo
  1|en|sound|Cleats caked in mud after a rain match: DIRTY ≈ deo-reo → deo-reo-wo-yo.
  2|en|sound|A muddy DIRT ROAD: dirty → deo-reo-wo-yo.
  3|en|sound|DORITOS dust on your fingers: dirty → deo-reo-wo-yo.
조용해요|jo-yong-hae-yo
  1|en|sound|Zoom call: “JOE, YOU'RE ON mute!” Total silence → jo-yong-hae-yo.
  2|es|sound|“¡JO, YO me callo!” (es. fine, I'll be quiet) → jo-yong-hae-yo.
  3|en|sound|The librarian: “JOE, YOUNG man… shh!” → jo-yong-hae-yo.
시끄러워요|si-kkeu-reo-wo-yo
  1|en|sound|A SQUEAKY door: so noisy → si-kkeu-reo-wo-yo.
  2|en|sound|CHICKENS at dawn: so noisy → si-kkeu-reo-wo-yo.
  3|en|sound|SHRIEKING feedback from the amp: noisy → si-kkeu-reo-wo-yo.
밝아요|bal-ga-yo
  1*|en|sound|A light BULB: bright → 밝 balk → bal-ga-yo.
  2|en|sound|Stadium lights at a night BALLGAME: bright → bal-ga-yo.
  3|en|sound|Lava from a VOLCANO glows bright: vol-ca ≈ bal-ga → bal-ga-yo.
어두워요|eo-du-wo-yo
  1|en|sound|Deep in the (SH)ADOWS: a-dow ≈ eo-du-wo → dark.
  2|en|sound|AT DUSK it gets dark: uh-dusk ≈ eo-du → eo-du-wo-yo.
  3|en|sound|UH-OH, DOOM: pitch-black corridors → eo-du-wo-yo.
더워요|deo-wo-yo
  1|en|sound|DEATH VALLEY, the hottest place on Earth → deo-wo-yo.
  2|fr|sound|Il fait chaud DEHORS (fr. it's hot outside) → deo-wo-yo.
  3|en|sound|Outside feels like THE OVEN → deo-wo-yo.
추워요|chu-wo-yo
  1|en|sound|Cold, sniffly ACHOO WEAther: choo-wea ≈ chu-wo → chu-wo-yo.
  2|en|sound|Shivering like a CHIHUAHUA: chi-wa ≈ chu-wo → chu-wo-yo.
  3|fr|sound|Une CHUTE de neige (fr. a snowfall): brr! → chu-wo-yo.
뜨거워요|tteu-geo-wo-yo
  1|es|sound|“¡TE QUEMAS!” (es. careful, you'll burn yourself!) → tteu-geo-wo-yo.
  2|en|sound|Don't TOUCH, it's hot! touch ≈ 뜨거 tteu-geo → tteu-geo-wo-yo.
  3|en|sound|TIGER Balm: hot on the skin → tteu-geo-wo-yo.
차가워요|cha-ga-wo-yo
  1|en|sound|CHUG an ice-cold drink → cha-ga-wo-yo.
  2|en|sound|A cocktail SHAKER full of ice: cold to the touch → cha-ga-wo-yo.
  3|en|sound|JÄGER shots, served ice-cold → cha-ga-wo-yo.
따뜻해요|tta-tteu-tae-yo
  1|fr|sound|Couvre TA TÊTE (fr. cover your head) to stay warm → tta-tteu-tae-yo.
  2|en|sound|A TEDDY bear hug: warm and cozy → tta-tteu-tae-yo.
  3|es|sound|“¡TÁPATE bien!” (es. wrap up warm): ta-pa-te ≈ tta-tteu-tae → tta-tteu-tae-yo.
시원해요|si-won-hae-yo
  1|en|sound|A cool SEA WIND: refreshing → si-won-hae-yo.
  2|es|sound|“¡SÍ, UN helado!” (es. yes, an ice cream!): refreshing → si-won-hae-yo.
  3|en|sound|A SWIM ON a hot day: refreshing → si-won-hae-yo.
싸요|ssa-yo
  1|en|sound|On SALE: cheap! → ssa-yo. Hit the ss hard; soft-s 사요 means “buy.”
  2|fr|sound|ÇA coûte rien (fr. it costs nothing): cheap → ssa-yo.
  3|en|sound|SAVE 90%: dirt cheap → ssa-yo.
비싸요|bi-ssa-yo
  1|es|sound|Expensive? Put it on the VISA (“bi-sa” in Spanish) → bi-ssa-yo.
  2|es|sound|A PICASSO painting: worth millions → bi-ssa-yo.
  3|en|sound|VIP SEATS: pricey → bi-ssa-yo.
매워요|mae-wo-yo
  1|en|sound|SRIRACHA MAYO: spicy → mae-wo-yo.
  2|en|sound|“MAYDAY! My mouth's on fire!” → mae-wo-yo.
  3|en|sound|MY WOK is on fire: a spicy stir-fry → mae-wo-yo.
맛있어요|ma-si-sseo-yo
  1|es|sound|Delicious? ¡MÁS, SÍ! (es. more, yes!) → ma-si-sseo-yo.
  2|en|sound|The MASTERCHEF judges: delicious! → ma-si-sseo-yo.
  3|en|sound|Creamy MASHED potatoes: delicious → ma-si-sseo-yo.
맛없어요|ma-deop-sseo-yo
  1|en|sound|Gordon Ramsay, MAD and UPSET: “It's bland!” → ma-deop-sseo-yo.
  2|en|sound|MATT DAMON's potatoes in The Martian: bland → ma-deop-sseo-yo.
  3|en|sound|Tastes like MUD: mud ≈ 맛 mat → ma-deop-sseo-yo.
Verbs:가요|ga-yo
  1|en|sound|Ready, set, GO! Said with an “ah”: 가 ga → ga-yo.
  2|en|sound|Step on the GAS: go! → ga-yo.
  3|en|sound|The horse breaks into a GALLOP: go! → ga-yo.
와요|wa-yo
  1|en|sound|“Come this WAY!” → wa-yo.
  2|en|sound|WAVE someone over: come here! → wa-yo.
  3|en|sound|On the WALKIE-talkie: “Come in!” → wa-yo.
다녀요|da-nyeo-yo
  1|en|sound|DANIEL-san goes to Miyagi's dojo every day → da-nyeo-yo.
  2|es|sound|Going DE NUEVO, again and again (es.): attending regularly → da-nyeo-yo.
  3|en|sound|The DONUT shop regular, there every single morning → da-nyeo-yo.
먹어요|meo-geo-yo
  1|en|sound|MUKBANG, the online eating shows, comes from 먹 meok, “eat” → meo-geo-yo.
  2|en|sound|MUNCH on some snacks: eat → meo-geo-yo.
  3|en|sound|Gremlins rule: never feed the MOGWAI after midnight → meo-geo-yo.
마셔요|ma-syeo-yo
  1|en|sound|Drink a MATCHA latte → ma-syeo-yo.
  2|en|sound|A drink from the vending MACHINE: ma-shi ≈ ma-syeo → ma-syeo-yo.
  3|fr|sound|Étancher MA SOIF (fr. quench my thirst): ma-soi ≈ ma-syeo → ma-syeo-yo.
자요|ja-yo
  1|en|sound|Put on your paJAmas: time to sleep → ja-yo.
  2|en|sound|A JAW-cracking yawn: time to sleep → ja-yo.
  3|es|sound|“¡A la cama, YA!” (es. to bed, now!) → ja-yo.
가르쳐요|ga-reu-chyeo-yo
  1|en|sound|A GURU CHEERS on his students: teaching → ga-reu-chyeo-yo.
  2|en|sound|GURU-JI, the respectful “teacher” in yoga: gu-ru-ji ≈ ga-reu-chi → ga-reu-chyeo-yo.
  3|en|sound|A mentor's CAREER CHAT: teaching → ga-reu-chyeo-yo.
배워요|bae-wo-yo
  1|es|sound|“¡Ah, ya VEO!” (es. oh, I see!): that's learning → bae-wo-yo.
  2|en|sound|BUDDHA's path: learning → 배우다 bae-u-da → bae-wo-yo.
  3|en|sound|PAVLOV's dog learned: bell means dinner → bae-wo-yo.
봐요|bwa-yo
  1|fr|sound|Je VOIS (fr. I see) → bwa-yo: to see / watch.
  2|fr|sound|VOILÀ! (fr. look, there it is) → bwa-yo.
  3|fr|sound|Au reVOIR (fr. see you again) → bwa-yo.
만나요|man-na-yo
  1|en|sound|“MAN, NICE to meet you!” → man-na-yo.
  2|en|sound|A one-on-one with your MANAGER: meeting → man-na-yo.
  3|es|sound|“Let's meet MAÑANA” → man-na-yo.
읽어요|il-geo-yo
  1|es|sound|A gripping story: “¿Y LUEGO?” (es. and then?), keep reading → il-geo-yo.
  2|fr|sound|IL LIT (fr. he reads) → 읽 il(k) → il-geo-yo.
  3|en|sound|ILLEGIBLE handwriting: too hard to read → il-geo-yo (hard g).
써요|sseo-yo
  1|en|sound|Write an ESSAY: es-SAY ≈ sseo → sseo-yo.
  2|fr|sound|« ÇA S'ÉCRIT comment ? » (fr. how do you write that?) → sseo-yo.
  3|en|sound|A fountain pen hisses SSSS across the page: writing → sseo-yo.
쇼핑해요|syo-ping-hae-yo
  1|en|loanword|SHOPPING + 해요 “do” → syo-ping-hae-yo.
  2|en|loanword|SHOP till your card goes PING → syo-ping-hae-yo.
  3|en|loanword|Black Friday SHOPPING spree → syo-ping-hae-yo.
청소해요|cheong-so-hae-yo
  1|en|sound|Grab a CHUNK of SOAP: cleaning time → cheong-so-hae-yo.
  2|en|sound|Weekend CHORES, SO much cleaning → cheong-so-hae-yo.
  3|fr|sound|“Range ta CHAMBRE !” (fr. tidy your room): cleaning day → cheong-so-hae-yo.
운동해요|un-dong-hae-yo
  1|es|sound|Counting reps: “¡UN, DOS…!” → un-dong-hae-yo.
  2|en|sound|Treadmill ON… workout DONE → un-dong-hae-yo.
  3|en|sound|Your workout is still UNDONE: go exercise → un-dong-hae-yo.
기다려요|gi-da-ryeo-yo
  1|en|sound|The GUITARIST is still tuning… wait → gi-da-ryeo-yo.
  2|es|sound|“¡QUIETO, espera!” (es. hold still, wait!): quie-to ≈ gi-da → gi-da-ryeo-yo.
  3|es|sound|Waiting under her balcony with a GUITARRA (es. guitar) → gi-da-ryeo-yo.
요리해요|yo-ri-hae-yo
  1|en|sound|Cooking: fry a YOLK over RICE → yo-ri-hae-yo.
  2|en|sound|“YO, RICE is ready!” Dinner's cooking → yo-ri-hae-yo.
  3|ja|sound|Japanese RYŌRI (cooking), as in Iron Chef's “Ryōri no Tetsujin” → yo-ri-hae-yo.
일해요|il-hae-yo
  1|en|sound|Skipping the party: “Sorry, I'LL HAve to work” → il-hae-yo.
  2|fr|sound|IL travaille (fr. he works) → il-hae-yo.
  3|en|sound|Working so hard you get ILL → il-hae-yo.
공부해요|gong-bu-hae-yo
  1|en|sound|KUNG FU ≈ gong-bu: hours of disciplined practice → to study.
  2|en|sound|The GONG rings: hit the BOOKS → gong-bu-hae-yo.
  3|es|sound|Study hard, “¡CON BUENAS notas!” (es. with good grades) → gong-bu-hae-yo.
타요|ta-yo
  1|en|sound|Take a TAXI → ta-yo.
  2|en|sound|Ride the TARDIS through time → ta-yo.
  3|en|sound|TAKE the bus → ta-yo.
말해요|mal-hae-yo
  1|en|sound|SMALL TALK: 말 mal, talk → mal-hae-yo, to speak.
  2|es|sound|MALHABLADO (es. foul-mouthed): mal-ha ≈ mal-hae → to speak.
  3|en|sound|MALCOLM X, the famous speaker → mal-hae-yo.
울어요|u-reo-yo
  1|en|sound|Alice cries a (P)OOL of tears → 울 ul → u-reo-yo.
  2|es|sound|LA LLORONA, the weeping woman: llo-ro ≈ u-reo → u-reo-yo.
  3|en|sound|A wolf HOWLS, a baby wails → 울 ul → u-reo-yo.
웃어요|u-seo-yo
  1|en|sound|What a (H)OOT! → 웃 ut → u-seo-yo, to laugh.
  2|en|sound|“OOH, SO funny!” → u-seo-yo.
  3|en|sound|A smile is U-shaped: U ≈ 웃 u → u-seo-yo.
좋아해요|jo-a-hae-yo
  1|en|sound|It SPARKS JOY (Marie Kondo): you like it → jo-a-hae-yo.
  2|en|sound|Smash that LIKE button: 좋아요 (JOY) → jo-a-hae-yo, to like.
  3|en|sound|Friends' JOEY: “How you doin'?” means I like you → jo-a-hae-yo.
사랑해요|sa-rang-hae-yo
  1|en|sound|Propose to SARAH with a RING → sa-rang-hae-yo, the K-pop “saranghae.”
  2|en|sound|K-pop finger hearts say “SARANGHAE”: I love you → sa-rang-hae-yo.
  3|en|sound|In love, your heart is SOARING → sa-rang-hae-yo.
싫어해요|si-reo-hae-yo
  1|en|sound|SHEER disgust → 싫어 shi-reo → si-reo-hae-yo.
  2|en|sound|SHE RAN from the broccoli: she hates it → si-reo-hae-yo.
  3|en|sound|Korean YouTube's DISLIKE button says 싫어요 → si-reo-hae-yo.
씻어요|ssi-seo-yo
  1|en|sound|Wash the SHEETS → 씻 ssit → ssi-seo-yo.
  2|en|sound|SHE SOAPS up her hands: washing → ssi-seo-yo.
  3|ja|sound|SHISEIDO face wash: shi-sei ≈ ssi-seo → ssi-seo-yo.
샤워해요|sya-wo-hae-yo
  1|en|loanword|SHOWER + 해요 “do” → sya-wo-hae-yo.
  2|en|loanword|Singing in the SHOWER → sya-wo-hae-yo.
  3|en|loanword|Reddit's SHOWER THOUGHTS → sya-wo-hae-yo.
들어요|deu-reo-yo
  1|en|sound|Listen to Dr. DRE on your Beats → deu-reo-yo.
  2|fr|sound|Jouer D'OREILLE (fr. play by ear): listen → deu-reo-yo.
  3|en|sound|Listen to the DRUMmer's groove → deu-reo-yo.
걸어요|geo-reo-yo
  1|en|sound|A runway GIRL walks the catwalk → 걸 geol → geo-reo-yo.
  2|en|sound|A slow stroll through an art GALLERY → geo-reo-yo.
  3|en|sound|A GORILLA's knuckle-walk → geo-reo-yo.
사요|sa-yo
  1|en|sound|At checkout: “SAYOnara, cash!” You just bought it → sa-yo.
  2|en|sound|Buy a SODA: 사다 sa-da → sa-yo.
  3|en|sound|SAY YES to the dress: you buy it → sa-yo.
만들어요|man-deu-reo-yo
  1|en|sound|The MAN DREW it: he made it → man-deu-reo-yo.
  2|en|sound|The MANDALORIAN's armorer forging beskar: making → man-deu-reo-yo.
  3|en|sound|A luthier making a MANDOLIN by hand → man-deu-reo-yo.
일어나요|i-reo-na-yo
  1|en|sound|“Get up EARLY, NOW!” → i-reo-na-yo.
  2|en|sound|Sleeping Beauty AURORA finally wakes up → i-reo-na-yo.
  3|en|sound|IRON MAN suits up: get up, let's go → i-reo-na-yo.
줘요|jwo-yo
  1|fr|sound|Give a JOUET (fr. toy) → jwo-yo.
  2|fr|sound|JOYEUX Noël (fr.): time to give presents → jwo-yo.
  3|en|sound|Drop a coin in the tip JAR: give → jwo-yo.
받아요|ba-da-yo
  1|es|sound|At a BODA (es. wedding) you receive gifts → ba-da-yo.
  2|en|sound|Achievement unlocked: you receive a BADGE → ba-da-yo.
  3|en|sound|Package delivered, BADA-BING: received → ba-da-yo.
엊그제|eot-kkeu-je
  1|en|sound|“Just the OTHER DAY…” → eot-kkeu-je: the day before yesterday.
  2|es|sound|EL OTRO DÍA (es. the other day): otro-día ≈ eot-kkeu-je.
  3|fr|sound|L'AUTRE JOUR (fr. the other day): lotr-jour ≈ eot-kkeu-je → eot-kkeu-je.
어제|eo-je
  1|es|sound|AYER, yesterday in Spanish → eo-je.
  2|fr|sound|Every French diary starts “HIER, J'AI…” (yesterday, I…) → eo-je.
  3|fr|sound|“OH, J'AI oublié…” (fr. oh, I forgot): that was yesterday → eo-je.
오늘|o-neul
  1|en|sound|“ONLY TODAY!” → o-neul.
  2|en|sound|“OH, a NEW day!” That's today → o-neul.
  3|en|sound|Shaq O'NEAL plays tonight: today's game → o-neul.
내일|nae-il
  1|en|sound|“NAH, I'LL do it tomorrow” → nae-il.
  2|en|sound|“Good NIGHT, I'LL see you tomorrow” → nae-il.
  3|en|sound|Tomorrow's sunrise over the NILE → nae-il.
모레|mo-re
  1|en|sound|Tomorrow, then one MORE day → mo-re.
  2|en|sound|The MORNING after tomorrow → mo-re.
  3|en|sound|MOORE's law, in days: two days out → mo-re.
월요일|wo-ryo-il
  1|en|sound|A WOLF howls at the moon (월 wol): MOON-day → Monday, like lunes / lundi.
  2|en|sound|Monday blues: WORRY, feel ILL → wo-ryo-il.
  3|en|sound|Monday WARRIOR, back to the grind → wo-ryo-il.
화요일|hwa-yo-il
  1|en|sound|Mars, god of WAR, owns martes / mardi: war ≈ hwa → hwa-yo-il, Tuesday.
  2|en|sound|Taco Tuesday: “WHOA, YO, spicy!” → hwa-yo-il.
  3|en|sound|Tuesday's planet Mars glows like fire: WHOA → hwa-yo-il.
수요일|su-yo-il
  1|en|sound|Midweek: SO, YOU'LL make it to Friday → su-yo-il, Wednesday.
  2|en|sound|Hump-day SOUP: halfway through the week → su-yo-il.
  3|en|sound|A SURFER on liquid MERCURY: mercredi / miércoles → su-yo-il.
목요일|mo-gyo-il
  1|en|sound|THOR's day: Thor MOCKS Loki every Thursday → 목 mok → mo-gyo-il.
  2|en|sound|Throwback Thursday: MOCK your old photos → mo-gyo-il.
  3|en|sound|Thursday-night MOCKtails: the weekend's almost here → mo-gyo-il.
금요일|geu-myo-il
  1|en|sound|TGIF! “COME, YO, payday drinks on me!” → geu-myo-il.
  2|en|sound|Friday night: GAMER mode on → geu-myo-il.
  3|en|sound|Venus, the brightest GEM in the night sky: viernes / vendredi → geu-myo-il.
토요일|to-yo-il
  1|en|sound|Saturday gardening: TOEs in the soil (토 to) → to-yo-il.
  2|en|sound|Saturday road trip in the TOYOTA → to-yo-il.
  3|en|sound|Saturday morning: cartoons and TOYS → to-yo-il.
일요일|i-ryo-il
  1|en|sound|Sunday sunshine ILLUMINATES everything → i-ryo-il.
  2|en|sound|Lazy Sunday: “I REALLY chill” → i-ryo-il.
  3|en|sound|Sunday alarm? “EARLY? YO, I'LL sleep in” → i-ryo-il.
평일|pyeong-il
  1|en|sound|Weekdays: Slack PINGs all day → pyeong-il.
  2|en|sound|Just a PLAIN, ordinary day: a weekday → pyeong-il.
  3|en|sound|PAYING the bills: working weekdays → pyeong-il.
주말|ju-mal
  1|en|sound|Saturday at the MALL: ju-MAL → weekend.
  2|en|sound|A JUMANJI movie marathon all weekend → ju-mal.
  3|en|sound|No ZOOM ALL weekend, no work calls → ju-mal.
농구|nong-gu
  1|en|sound|“NO GOOD!” The shot rims out → nong-gu.
  2|en|sound|NO GUARD on him: wide-open layup → nong-gu.
  3|en|sound|The Denver NUGGETS: nug ≈ nong → nong-gu.
축구|chuk-kku
  1|en|sound|CHUCK Norris roundhouse-kicks the ball → chuk-kku.
  2|es|sound|“¡CHUTA!” (es. shoot!) yells the crowd → chuk-kku.
  3|en|sound|GOAL! The net SHOOK → chuk-kku.
야구|ya-gu
  1|en|sound|Fans yell “YA, GO!” as the batter sprints → ya-gu.
  2|en|sound|“YANKEES, GO!”: ya…go → ya-gu.
  3|ja|sound|Ohtani's sport in Japan is YAKYŪ: ya-kyu ≈ ya-gu.
수영|su-yeong
  1|en|sound|Swimming keeps you SO YOUNG → su-yeong.
  2|es|sound|“¡SOY UN pez!” (es. I'm a fish!): swimming → su-yeong.
  3|en|sound|SUIT UP, YOUNG swimmer: into the pool → su-yeong.
태권도|tae-kkwon-do
  1|en|sound|TAEKWONDO, Korea's martial art: the same word → tae-kkwon-do (foot + fist + way).
  2|en|sound|The DO of judo and aikido means “way”: TAEKWONDO, the way of kicks → tae-kkwon-do.
  3|en|sound|Say it the Korean way, with a hard kk: TAE-KKWON-DO.
골프|gol-peu
  1|en|loanword|GOLF. Korean has no f, so f → ㅍ p, plus eu → gol-peu.
  2|es|sound|Every swing is a GOLPE (es. stroke): golpe ≈ gol-peu → golf.
  3|en|loanword|Tiger Woods' GOLF → gol-peu.
탁구|tak-kku
  1|en|sound|TAK, TAK: the ping-pong ball's click → tak-kku.
  2|fr|sound|Du TAC AU TAC (fr. quick-fire back-and-forth): a ping-pong rally → tak-kku.
  3|en|sound|Tiny and white like a TIC TAC: the ping-pong ball → tak-kku.
요가|yo-ga
  1|en|loanword|YOGA → yo-ga, the same word.
  2|en|loanword|Downward dog in YOGA class → yo-ga.
  3|en|loanword|YOGA with Spanish vowels: yo-ga.
마라톤|ma-ra-ton
  1|en|loanword|MARATHON / maratón. Korean has no th → ma-ra-ton.
  2|es|loanword|MARATÓN (es.): the same three syllables → ma-ra-ton.
  3|en|loanword|42.195 km of MARATHON → ma-ra-ton.
테니스|te-ni-seu
  1|en|loanword|TENNIS, plus a final eu → te-ni-seu.
  2|es|loanword|TENIS (es.): te-nis → te-ni-seu.
  3|en|loanword|Nadal's TENNIS → te-ni-seu.
배구|bae-gu
  1|en|sound|Beach volleyball on the BAY → bae-gu.
  2|ja|sound|HAIKYU!!, the volleyball anime, is the same word (排球) → bae-gu.
  3|en|sound|BAGGY shorts and beach volleyball → bae-gu.
배드민턴|bae-deu-min-teon
  1|en|loanword|BADMINTON → bae-deu-min-teon.
  2|es|loanword|BÁDMINTON (es.) → bae-deu-min-teon.
  3|en|loanword|BAD-MIN-TON: one Korean beat per piece → bae-deu-min-teon.
달리기|dal-li-gi
  1|en|sound|DALL·E only RUNS on GPUs: 달리 dal-li = run → dal-li-gi, running.
  2|es|sound|“¡DALE, DALE!” (es. go, go!) cheering a runner → dal-li-gi.
  3|en|sound|Salvador DALÍ running late, his clock melting → dal-li-gi.
복싱|bok-ssing
  1|en|loanword|BOXING → bok-ssing.
  2|en|loanword|Rocky's BOXING → bok-ssing.
  3|es|loanword|BOXEO (es.) / BOXE (fr.) → bok-ssing.
헬스|hel-sseu
  1|en|loanword|From HEALTH club: Koreans call gym training 헬스 → hel-sseu.
  2|en|sound|Leg day is HELL: hel-sseu → gym training.
  3|en|loanword|The gym is your daily HEALTH potion → hel-sseu.
봄|bom
  1|en|sound|Flowers B(L)OOM in spring → bom.
  2|en|sound|BAMBI's first spring → bom.
  3|en|sound|Spring: a BOOM of new life → bom.
여름|yeo-reum
  1|en|sound|“YO, RUM!” on the beach: summer → yeo-reum.
  2|en|sound|All winter you YEARN for summer → yeo-reum.
  3|es|sound|“¡YO RUMBEO!” (es. I'm partying): summer nights → yeo-reum.
가을|ga-eul
  1|en|sound|Autumn GALES blow the leaves down → ga-eul.
  2|en|sound|Halloween GHOULS: autumn → ga-eul.
  3|en|sound|Autumn soccer: GOAL! → ga-eul.
겨울|gyeo-ul
  1|en|sound|A CRUEL winter → gyeo-ul.
  2|en|sound|Bundled up in WOOL: (gyeo-)UL → winter.
  3|en|sound|“GEE, WOOL socks weather”: winter → gyeo-ul.
빨간색|ppal-gan-saek
  1|en|sound|The Lady in Red's BALL GOWN → ppal-gan-saek.
  2|es|sound|¡PELIGRO! (es. danger): red warning signs → ppal-gan-saek.
  3|en|sound|A red PELICAN? No: a red BALLOON… → ppal-gan-saek.
주황색|ju-hwang-saek
  1|en|sound|A glass of orange JUICE → ju-hwang-saek.
  2|en|sound|JUGGLING oranges → ju-hwang-saek.
  3|en|sound|Naruto's orange JUMPSUIT → ju-hwang-saek.
노란색|no-ran-saek
  1|en|sound|NO RAIN, just yellow sunshine → no-ran-saek.
  2|en|sound|Yellow sun, NO RAINcoat needed → no-ran-saek.
  3|en|sound|Bright yellow: NO RANT, just sunshine → no-ran-saek.
초록색|cho-rok-saek
  1|en|sound|CHLOROphyll makes leaves green: chlo-ro ≈ cho-rok → cho-rok-saek.
  2|en|sound|SHREK, the green ogre: shrek ≈ cho-rok → cho-rok-saek.
  3|en|sound|Green frogs CROAK → cho-rok-saek.
파란색|pa-ran-saek
  1|en|sound|PARASAIL over the deep blue sea → pa-ran-saek.
  2|en|sound|Avatar's blue Na'vi of PANDORA → pa-ran-saek.
  3|en|sound|A PARACHUTE drifting down a blue sky → pa-ran-saek.
남색|nam-saek
  1|en|sound|Every NAVY ship carries a NAMESAKE: name-sake ≈ nam-saek → navy blue.
  2|en|sound|NAvy blue: NAvy ≈ NAM → nam-saek.
  3|en|sound|NAM-SAEK ≈ NAME-SAKE: navy officers' dress-blue uniforms → nam-saek.
보라색|bo-ra-saek
  1|en|sound|Wonka's Violet BEAUREgarde turns purple: BEAU-RE ≈ bo-ra → bo-ra-saek.
  2|en|sound|A purple VIOLA flower (v → b, l → r) → bo-ra-saek.
  3|en|sound|BORA BORA's purple sunsets → bo-ra-saek.
흰색|huin-saek
  1|en|sound|“WHEE!” Sledding on white snow → huin-saek.
  2|en|sound|WHITE, said with a breathy h: hwi → huin-saek.
  3|en|sound|A WHEAT-flour white kitchen → huin-saek.
검은색|geo-meun-saek
  1|en|sound|Old GUM on the sidewalk turns black → geo-meun-saek.
  2|en|sound|GUNMETAL black: gun-me ≈ geo-meun → geo-meun-saek.
  3|en|sound|GOTHAM at night: Batman's black city → geo-meun-saek.
회색|hoe-saek
  1|en|sound|Gandalf the Grey on the bridge: “No WAY you pass!” → hoe-saek.
  2|en|sound|A big gray WHALE: whale ≈ 회 hoe → hoe-saek.
  3|en|sound|A dull gray HUE → hoe-saek.
분홍색|bun-hong-saek
  1|fr|sound|ROSE BONBON is French for candy pink: bonbon ≈ bun-hong → bun-hong-saek.
  2|en|sound|A pink BUNNY → bun-hong-saek.
  3|en|sound|PINK PONG? A pink ping-pong ball: bun-hong → bun-hong-saek.
갈색|gal-saek
  1|es|sound|Brown like a GALLETA (es. cookie) → gal-saek.
  2|en|sound|A GALLON of black coffee… brown → gal-saek.
  3|en|sound|GALLOPING brown horse → gal-saek.
하늘색|ha-neul-saek
  1|en|sound|An empty sky: “HA, NULL!” → 하늘 ha-neul, sky → sky blue, like Spanish CELESTE.
  2|en|sound|HALLELUJAH, a clear sky: light blue → ha-neul-saek.
  3|en|sound|HONOLULU skies: light blue → ha-neul-saek.
베이지색|be-i-ji-saek
  1|en|loanword|BEIGE + 색 saek, “color” → be-i-ji-saek.
  2|en|loanword|BEIGE office walls → be-i-ji-saek.
  3|fr|loanword|BEIGE, the French word: bèje → be-i-ji-saek.
사과|sa-gwa
  1|en|sound|The apple SAGA: Eve, Newton, Snow White → sa-gwa.
  2|en|sound|Carl SAGAN's apple pie: “first, invent the universe” → sa-gwa.
  3|ko|sound|Korean bonus: 사과 also means “sorry”, so bring an apple to apologize → sa-gwa.
포도|po-do
  1|fr|sound|BORDEAUX wine starts as grapes → po-do.
  2|pt|sound|PORTO wine, pressed from grapes: por-to ≈ po-do → po-do.
  3|es|sound|PODAR (es. prune) the vines for better grapes → po-do.
바나나|ba-na-na
  1|es|loanword|BANANA, said the Spanish way: ba-na-na.
  2|en|loanword|The Minions yelling “BA-NA-NA!” → ba-na-na.
  3|en|loanword|Mario Kart's BANANA peel → ba-na-na.
딸기|ttal-gi
  1|fr|sound|A TARTE aux fraises (fr. strawberry tart): tarte ≈ ttal → ttal-gi.
  2|en|sound|The AI test: TALLY the r's in STRAWBERRY → ttal-gi.
  3|en|sound|A frozen strawberry DAIQUIRI: dai-qui ≈ ttal-gi → ttal-gi.
수박|su-bak
  1|en|sound|A watermelon is SOOO BIG → su-bak.
  2|ja|sound|SUIKA Game's biggest fruit: the watermelon (ja. suika) → su-bak.
  3|en|sound|A SUPER BIG summer melon → su-bak.
망고|mang-go
  1|en|loanword|MANGO → mang-go, the same word.
  2|es|loanword|MANGO (es.): same word, same vowels → mang-go.
  3|en|loanword|Thai MANGO sticky rice → mang-go.
오렌지|o-ren-ji
  1|en|loanword|ORANGE → o-ren-ji.
  2|ja|loanword|Japanese says ORENJI too → o-ren-ji.
  3|en|loanword|ORANGE plus a final i: or-ange → o-ren-ji.
배|bae
  1|en|sound|A PEAR, minus the r: pe(ar) → bae.
  2|es|sound|PERA (es. pear), cut short: pe(ra) → bae.
  3|fr|sound|Poire BELLE-Hélène, the classic pear dessert: belle → bae.
복숭아|bok-ssung-a
  1|en|sound|Bowser's BOSS SONG: “Peaches, Peaches, Peaches!” → bok-ssung-a.
  2|en|sound|Peach BLOSSOM → bok-ssung-a.
  3|en|sound|Peach trees BLOSSOMING pink in spring: blo-ssom-ing → bok-ssung-a.
키위|ki-wi
  1|en|loanword|KIWI → ki-wi.
  2|en|loanword|New Zealand's KIWI, bird and fruit → ki-wi.
  3|en|loanword|KIWI in two even, unstressed beats → ki-wi.
레몬|re-mon
  1|en|loanword|LEMON → re-mon. Korean ㄹ covers both l and r.
  2|es|loanword|LIMÓN (es.): li-mon ≈ re-mon.
  3|en|loanword|A science-class LEMON battery → re-mon.
체리|che-ri
  1|en|loanword|CHERRY → che-ri.
  2|en|loanword|The CHERRY on top → che-ri.
  3|en|loanword|git CHERRY-PICK → che-ri.
콜라|kol-la
  1|en|loanword|COLA → kol-la.
  2|en|loanword|Coca-COLA → kol-la.
  3|es|loanword|COLA (es.): ko-la → kol-la.
사이다|sa-i-da
  1|en|loanword|From CIDER, but in Korea it's lemon-lime soda, like Sprite → sa-i-da.
  2|en|loanword|CIDER, with sai split in two: sai-der → sa-i-da.
  3|en|loanword|Ask for CIDER in Seoul and you get lemon-lime soda → sa-i-da.
커피|keo-pi
  1|en|loanword|COFFEE. Korean has no f, so f → ㅍ p → keo-pi.
  2|en|loanword|KOPI, coffee in Indonesian (as in kopi luwak) → keo-pi.
  3|en|sound|A CUP of coffee: cup has 커's exact vowel → keo-pi.
녹차|nok-cha
  1|en|sound|Old NOKIA screens glowed green + CHAI, tea → nok-cha, green tea.
  2|en|sound|The Hulk KNOCKS back a green tea → nok-cha.
  3|en|sound|Like MATCHA, NOK-CHA is a green tea → nok-cha.
홍차|hong-cha
  1|en|sound|HONG Kong milk tea is made with black tea → hong-cha.
  2|en|sound|HONG Kong milk tea + CHAI (tea): it's brewed from black tea → hong-cha.
  3|en|sound|HONG Kong high tea, CHA in hand → hong-cha.
오렌지주스|o-ren-ji-ju-seu
  1|en|loanword|ORANGE + JUICE → o-ren-ji-ju-seu.
  2|en|loanword|OJ: O for o-ren-ji, J for ju-seu → o-ren-ji-ju-seu.
  3|en|loanword|ORANGE (o-ren-ji) + JUICE (ju-seu) → o-ren-ji-ju-seu.
포도주스|po-do-ju-seu
  1|en|sound|BORDEAUX grapes (포도 po-do) + JUICE → po-do-ju-seu.
  2|pt|sound|PORTO grapes (포도 po-do) + JUICE → po-do-ju-seu.
  3|en|roots|Grape JUICE: 포도 grapes + 주스 juice → po-do-ju-seu.
버블티|beo-beul-ti
  1|en|loanword|BUBBLE TEA → beo-beul-ti.
  2|en|loanword|BUBBLE TEA, a.k.a. boba → beo-beul-ti.
  3|en|loanword|BUBBLE's u is exactly 어, the cup vowel → beo-beul-ti.
우유|u-yu
  1|en|sound|Milk mustache: “OOH, YOU got milk!” → u-yu.
  2|es|sound|A cow's UBRE (es. udder): u ≈ 우 → u-yu, milk.
  3|ko|sound|Korea's iconic BANANA MILK: 바나나 우유 → u-yu.
스무디|seu-mu-di
  1|en|loanword|SMOOTHIE → seu-mu-di (th → d).
  2|en|loanword|A post-workout SMOOTHIE → seu-mu-di.
  3|en|loanword|SMOOTHIE, sounded out: s-moo-di → seu-mu-di.
맥주|maek-jju
  1|en|sound|Brewers MAKE JUICE out of barley → maek-jju: beer.
  2|ko|sound|CHIMAEK night: fried CHIcken + MAEKju, beer → maek-jju.
  3|ko|roots|Like SOJU, MAEK-JU ends in 주, booze → maek-jju: beer.
물|mul
  1|fr|sound|MOULES (fr. mussels) live in water → mul.
  2|fr|sound|MOUILLÉ (fr. wet): soaked in water → mul.
  3|en|sound|MURKY pond water → mul.
차|cha
  1|en|roots|CHAI → cha. Both come from the same Chinese word for tea, 茶.
  2|ja|sound|Japanese O-CHA, the tea at every sushi bar → cha.
  3|pt|sound|Portuguese CHÁ: the same tea word → cha.
주스|ju-seu
  1|en|loanword|JUICE → ju-seu.
  2|en|loanword|JUICE plus a soft eu after the s → ju-seu.
  3|en|loanword|JUICY already has two beats: ju-sy → ju-seu.
한국 음식|han-guk eum-sik
  1|en|roots|한국 ≈ HAN-COOK (Korea) + 음식 ≈ “MMM, CHIC!” (food) → Korean food.
  2|en|roots|K-FOOD, spelled out: 한국 Korea + 음식 food → han-guk eum-sik.
  3|en|sound|Korean BBQ night: HAN-COOK style, “MMM, CHIC!” → han-guk eum-sik.
중국 음식|jung-guk eum-sik
  1|en|roots|중국 ≈ ZHONGGUO, China's own name + 음식 ≈ “MMM, CHIC!” (food) → Chinese food.
  2|en|roots|Takeout tonight: 중국 China + 음식 food → jung-guk eum-sik.
  3|en|sound|ZHONGGUO's dumplings: “MMM, CHIC!” → jung-guk eum-sik.
일본 음식|il-bon eum-sik
  1|fr|sound|Sushi? “IL est BON!” (fr. it's good) → 일본 il-bon, Japan + 음식 eum-sik, food.
  2|en|roots|일본 Japan + 음식 food → il-bon eum-sik.
  3|ja|roots|NIPPON, Japan's own name: nip-pon ≈ il-bon + 음식 ≈ “MMM, CHIC!” → Japanese food.
서양 음식|seo-yang eum-sik
  1|en|roots|서양 the West + 음식 ≈ “MMM, CHIC!” (food): steak frites, pasta → Western food.
  2|en|roots|서양 the West + 음식 food → seo-yang eum-sik.
  3|en|roots|Across the WEST, steak and pasta: 서양 seo-yang + 음식 eum-sik → Western food.
고기|go-gi
  1|en|roots|Korean BBQ BULGOGI = 불 bul, fire + 고기 go-gi, meat.
  2|en|sound|GO GRILL some meat → go-gi.
  3|en|sound|KOBE beef, the world's best-known meat: ko-be → go-gi.
채소|chae-so
  1|en|sound|Bok CHOY, SO green → chae-so: vegetables.
  2|ko|sound|JAPCHAE, glass noodles with mixed veggies: its CHAE means vegetables → chae-so.
  3|es|sound|CHAYOTE (es.), the green squash: cha ≈ chae → chae-so.
야채|ya-chae
  1|en|sound|YAMS and CHARD: two vegetables → ya-chae.
  2|ja|sound|Japanese YASAI (vegetables), the same word: ya-sai → ya-chae.
  3|mixed|sound|YAMS + the CHAE of JAPCHAE (veggies) → ya-chae.
면|myeon
  1|en|sound|Chow MEIN, fried noodles: mein ≈ myeon → noodles.
  2|en|sound|Shin RAMYUN noodles: …myun → 면 myeon, noodles.
  3|ja|sound|RAMEN is ra-MYEON in Korean: 면 myeon = noodles.
빵|ppang
  1|es|loanword|PAN (es.), PAIN (fr.) → ppang: bread. It came via Japanese pan, from Portuguese pão.
  2|ja|loanword|Japanese PANKO (bread crumbs): pan = bread → ppang.
  3|es|loanword|Spanish PAN, said with a tight, puff-free p (≈ ㅃ) → ppang.
아이스크림|a-i-seu-keu-rim
  1|en|loanword|ICE CREAM → a-i-seu-keu-rim.
  2|en|loanword|“I scream, you scream, we all scream for ICE CREAM” → a-i-seu-keu-rim.
  3|en|loanword|ICE CREAM, one Korean beat per sound: a-i-seu-keu-rim.
치즈|chi-jeu
  1|en|loanword|CHEESE → chi-jeu.
  2|en|loanword|“Say CHEESE!” → chi-jeu.
  3|en|loanword|CHEESE: the final z becomes ㅈ + soft eu → chi-jeu.
밥|bap
  1|en|roots|BIBIMBAP is “mixed rice”: 밥 bap = rice, and by extension a meal.
  2|ko|sound|The classic Korean greeting “밥 먹었어?”: “had your rice?” means “had a meal?” → bap.
  3|ko|sound|GIMBAP, the seaweed rice roll: its BAP is the rice → bap.
김치|gim-chi
  1|en|sound|KIMCHI: English took the word from Korean → gim-chi, with a soft g.
  2|en|sound|Say “KIMCHI!” for Korean photos, like “CHEESE!” → gim-chi.
  3|en|sound|Korean homes keep a separate kimchi fridge → gim-chi.
계란|gye-ran
  1|en|sound|Hens eat GRAIN, then lay eggs → gye-ran.
  2|fr|sound|QUICHE LORRAINE, the egg tart: quiche ≈ gye, -raine ≈ ran → gye-ran.
  3|en|sound|GRAIN-fed hens, fresh eggs → gye-ran.
닭고기|dak-kko-gi
  1|en|sound|Chicken thighs are DARK meat: DARK ≈ 닭 dak + 고기 go-gi (bulGOGI) → chicken.
  2|en|sound|Chicken TACOs: ta-co ≈ dak-ko → dak-kko-gi.
  3|ko|sound|BULDAK noodles = fire + 닭 chicken, like BULGOGI = fire + meat → dak-kko-gi.
생선|saeng-seon
  1|en|sound|Fresh SALMON on the plate → saeng-seon: fish (as food).
  2|ko|sound|Flip SENSEI's 선생 (teacher) and you get 생선: fish → saeng-seon.
  3|en|sound|SALMON or SARDINES: fish on your plate → saeng-seon.
공포 영화|gong-po yeong-hwa
  1|en|roots|공포 ≈ a GONG tolls in a POE horror tale + 영화 ≈ “YOU WANNA see a movie?” → horror movie.
  2|en|sound|GONG + POltergeist: a horror movie → gong-po yeong-hwa.
  3|en|roots|공포 (terror) + 영화 (movie) → horror movie.
로맨틱 영화|ro-maen-tik yeong-hwa
  1|en|roots|ROMANTIC + 영화 ≈ “YOU WANNA see a movie?” → romantic movie.
  2|en|roots|Date night: a ROMANTIC film (영화) → ro-maen-tik yeong-hwa.
  3|en|roots|Korean rom-com night: 로맨틱 영화 → ro-maen-tik yeong-hwa.
코미디 영화|ko-mi-di yeong-hwa
  1|en|roots|COMEDY + 영화 ≈ “YOU WANNA see a movie?” → comedy.
  2|en|roots|A COMEDY night at the movies (영화) → ko-mi-di yeong-hwa.
  3|es|roots|COMEDIA (es.) ≈ ko-mi-di + 영화 (movie) → comedy.
판타지 영화|pan-ta-ji yeong-hwa
  1|en|roots|FANTASY (f → p) + 영화 ≈ “YOU WANNA see a movie?” → fantasy movie.
  2|en|roots|Lord of the Rings-style FANTASY film (영화) → pan-ta-ji yeong-hwa.
  3|es|roots|FANTASÍA (es.) ≈ pan-ta-ji + 영화 (movie) → fantasy movie.
SF 영화|e-seu-e-peu yeong-hwa
  1|en|roots|S-F for sci-fi, said e-seu e-peu, + 영화 ≈ “YOU WANNA see a movie?”
  2|fr|roots|French says “un film de SF” too: S-F + 영화 (movie) → e-seu-e-peu yeong-hwa.
  3|en|roots|Star Wars is SF (sci-fi) + 영화 (movie) → e-seu-e-peu yeong-hwa.
액션 영화|aek-ssyeon yeong-hwa
  1|en|roots|ACTION + 영화 ≈ “YOU WANNA see a movie?” → action movie.
  2|en|roots|“Lights, camera, ACTION!” + 영화 (movie) → aek-ssyeon yeong-hwa.
  3|en|roots|A John Wick action movie: 액션 영화 → aek-ssyeon yeong-hwa.
애니메이션|ae-ni-me-i-syeon
  1|en|loanword|ANIMATION → ae-ni-me-i-syeon.
  2|en|loanword|ANIME is short for ANIMATION → ae-ni-me-i-syeon.
  3|en|loanword|Pixar ANIMATION → ae-ni-me-i-syeon.
다큐멘터리|da-kyu-men-teo-ri
  1|en|loanword|DOCUMENTARY → da-kyu-men-teo-ri.
  2|en|loanword|DOCUMENTARY in an American accent: DAH-kyu-men-tuh-ree → da-kyu-men-teo-ri.
  3|es|loanword|DOCUMENTAL (es.) ≈ da-kyu-men-teo-ri.
드라마|deu-ra-ma
  1|en|loanword|DRAMA → deu-ra-ma, as in K-drama.
  2|en|loanword|DRAMA: Korean splits the dr with a soft eu → deu-ra-ma.
  3|es|loanword|DRAMA (es.): the same word → deu-ra-ma.
댄스|daen-seu
  1|en|loanword|DANCE → daen-seu.
  2|en|loanword|K-pop DANCE practice → daen-seu.
  3|en|loanword|DANCE, with a soft eu after the s → daen-seu.
힙합|hip-hap
  1|en|loanword|HIP-HOP → hip-hap.
  2|en|loanword|Old-school HIP-HOP beats → hip-hap.
  3|en|loanword|HIP-HOP, with an “ah”: hip-hap.
락|rak
  1|en|loanword|ROCK → rak. Same word as 록.
  2|en|loanword|ROCK 'n' roll, said with an “ah” → rak.
  3|en|loanword|Queen's “We Will ROCK You” → rak.
록|rok
  1|en|loanword|ROCK → rok, the standard spelling.
  2|en|loanword|ROCK with a round British o → rok (락 is the American “rahk”).
  3|es|loanword|ROCK (es.), said with an o → rok.
일렉트로닉|il-lek-teu-ro-nik
  1|en|sound|ELECTRONIC → il-lek-teu-ro-nik.
  2|en|sound|ELECTRONIC dance music (EDM) → il-lek-teu-ro-nik.
  3|es|sound|ELECTRÓNICA (es.) → il-lek-teu-ro-nik.
발라드|bal-la-deu
  1|en|sound|BALLAD → bal-la-deu.
  2|fr|sound|BALLADE (fr.): the slow love song → bal-la-deu.
  3|es|sound|BALADA (es.) → bal-la-deu.
랩|raep
  1|en|loanword|RAP → raep.
  2|en|loanword|Eminem-speed RAP → raep.
  3|en|loanword|RAP battle → raep.
팝|pap
  1|en|loanword|POP → pap.
  2|en|loanword|POP music, with an “ah” → pap.
  3|en|loanword|K-POP's POP → pap.
Music:가요|ga-yo
  1|en|sound|Lady GAGA, YO: pop music → ga-yo. Same sound as 가요, “go.”
  2|en|sound|GAGA-style pop hits on the radio → ga-yo.
  3|ko|sound|The 가 of 가수 (singer, GAGA SUperstar): songs → ga-yo.
케이팝|ke-i-pap
  1|en|loanword|K-POP → ke-i-pap.
  2|en|loanword|BTS, BLACKPINK: K-POP → ke-i-pap.
  3|en|loanword|K + POP, letter then word → ke-i-pap.
재즈|jae-jeu
  1|en|loanword|JAZZ → jae-jeu.
  2|en|loanword|A smoky JAZZ club → jae-jeu.
  3|en|loanword|JAZZ, in two beats: jae-jeu.
클래식|keul-lae-sik
  1|en|loanword|CLASSIC(al) → keul-lae-sik.
  2|en|loanword|CLASSICAL music: Bach, Mozart → keul-lae-sik.
  3|es|loanword|CLÁSICA (es.) → keul-lae-sik.
알앤비|al-aen-bi
  1|en|loanword|R & B, said “ar-and-bee” → al-aen-bi.
  2|en|loanword|R&B slow jams → al-aen-bi.
  3|en|loanword|Usher, Beyoncé, The Weeknd: R&B → al-aen-bi.
여자|yeo-ja
  1|en|sound|Tarzan: “Me Tarzan, YOU JANE” → yeo-ja: woman.
  2|ko|sound|K-dramas' YEOJA-CHINGU (여자친구) means girlfriend → yeo-ja: woman.
  3|ko|sound|Restroom doors: 여자 on one, 남자 (NAM, MAN backwards) on the other → yeo-ja.
남자|nam-ja
  1|en|sound|NAM is MAN spelled backwards → nam-ja: man.
  2|ko|sound|K-dramas' NAMJA-CHINGU (남자친구) means boyfriend → nam-ja: man.
  3|ko|sound|Restroom signs: 남자 on the men's door, 여자 on the women's → nam-ja.
할아버지|ha-ra-beo-ji
  1|es|sound|“¡HOLA, ABUELO!” (es. hi, grandpa!): hola-abue ≈ ha-ra-beo → ha-ra-beo-ji.
  2|en|sound|Grandpa is the GRAND ABBA: 할 hal + 아버지 (≈ ABBA, father) → ha-ra-beo-ji.
  3|en|sound|Grandpa's big HAIRY BEARD → ha-ra-beo-ji.
할머니|hal-meo-ni
  1|en|sound|Grandma keeps the family in HARMONY: har-mo-ny ≈ hal-meo-ni.
  2|en|sound|Grandma always slips you some MONEY: hal-MONEY → hal-meo-ni.
  3|en|sound|A HALLMARK card for grandma → hal-meo-ni.
외할아버지|oe-ha-ra-beo-ji
  1|en|sound|Mom's side is the other WAY (외 oe) + 할아버지, grandpa → maternal grandfather.
  2|mixed|sound|The other WAY (외 oe), mom's side: “¡HOLA, ABUELO!” → oe-ha-ra-beo-ji.
  3|en|sound|The other WAY (외), mom's side + grandpa's HAIRY BEARD → oe-ha-ra-beo-ji.
외할머니|oe-hal-meo-ni
  1|en|sound|The other WAY (외 oe), mom's side + HARMONY: grandma → oe-hal-meo-ni.
  2|en|sound|The other WAY (외 oe), mom's side: grandma's MONEY → oe-hal-meo-ni.
  3|en|sound|WAY out on mom's side: her mother → oe-hal-meo-ni.
아버지|a-beo-ji
  1|en|sound|ABBA, the Bible's word for “father,” + ji → a-beo-ji.
  2|mixed|sound|Father ABRAHAM (“Padre Abraham”): a-bra ≈ a-beo → a-beo-ji.
  3|ko|sound|아빠 (dad, PAPA), grown formal: father → a-beo-ji.
어머니|eo-meo-ni
  1|en|sound|“Uh, MOMMY!” → eo-meo-ni: mother.
  2|en|sound|Mom is OMNIpresent, she sees everything: om-ni ≈ eo-meo-ni.
  3|ko|sound|엄마 (MAMA), grown formal: mother → eo-meo-ni.
아빠|a-ppa
  1|en|sound|PAPA minus the first p → a-ppa: dad.
  2|ko|sound|Dad is always busy: 아빠 바빠요 (PAPA's busy), a rhyme → a-ppa.
  3|en|sound|Avatar's flying bison APPA, carrying the family like a dad → a-ppa.
엄마|eom-ma
  1|mixed|sound|MAMA / MAMÁ / MAMAN → eom-ma: mom.
  2|en|sound|A baby's first word: “UM-MA!” → eom-ma.
  3|it|sound|“MAMMA MIA!” (it. my mother!) → eom-ma.
형|hyeong
  1|en|sound|BTS's younger members call the older ones HYUNG → hyeong (said by guys).
  2|en|sound|Big bro: HE's not YOUNG anymore → hyeong (said by guys).
  3|en|sound|Big bro always calls you “HEY, YOUNG one” → you call him hyeong.
누나|nu-na
  1|en|sound|Nuns are called “Sister”: NUN-a → nu-na, a guy's older sister.
  2|en|sound|Big sis babysits you like a NANNY → nu-na.
  3|en|sound|K-drama crush on an older woman: “NOONA!” → nu-na.
오빠|o-ppa
  1|en|sound|Psy's “OPPA Gangnam Style”: oppa = big brother, said by women → o-ppa.
  2|ko|sound|아빠 (PAPA) with an O for Older: big brother, said by women → o-ppa.
  3|en|sound|Big bro is always OP (overpowered) when you're little → o-ppa.
언니|eon-ni
  1|fr|sound|Ma sœur AÎNÉE (fr. my older sister) → eon-ni, said by women.
  2|en|sound|Big sis calls you HONEY → (h)eon-ni.
  3|en|sound|K-pop fans call older girls UNNIE → eon-ni.
남동생|nam-dong-saeng
  1|en|sound|NAM (MAN backwards) + 동생, your DOWNSIZED copy → younger brother.
  2|en|sound|NAM (man) + DON'T SNITCH, little bro → nam-dong-saeng.
  3|ko|sound|남 (male, as in 남자) + 동생 (younger sibling) → younger brother.
여동생|yeo-dong-saeng
  1|en|sound|여 (YOU JANE, woman) + 동생, your DOWNSIZED copy → younger sister.
  2|en|sound|여 (YOU JANE, woman) + “DON'T SNITCH!” → yeo-dong-saeng: little sister.
  3|ko|sound|여 (female, as in 여자) + 동생 (younger sibling) → younger sister.
동생|dong-saeng
  1|en|sound|Your DOWNSIZED copy: the younger sibling → dong-saeng.
  2|en|sound|“DON'T SNITCH!”: what you tell your little sibling → dong-saeng.
  3|en|sound|DONKEY from Shrek, the tag-along who never leaves you alone → dong-saeng.
남편|nam-pyeon
  1|en|sound|Your MAN, your CHAMPION: NAM (MAN backwards) + (cham)PION → nam-pyeon.
  2|en|sound|“My NUMBER ONE”: num-ber-one ≈ nam-pyeon → husband.
  3|es|sound|Your eNAMORADO (es. sweetheart), now your husband → nam-pyeon.
아내|a-nae
  1|fr|sound|She wears the ANNEAU (fr. ring) → a-nae: wife.
  2|es|sound|Your wife's ANILLO (es. ring) → a-nae.
  3|en|sound|A wedding ANNIversary with your wife → a-nae.
아들|a-deul
  1|en|sound|Your son grows into an ADULT → a-deul.
  2|en|sound|Your son: A little DUDE → a-deul.
  3|en|sound|Kratos's son ATREUS (God of War): “BOY!” → a-deul.
딸|ttal
  1|en|sound|DAUGHter, cut short: daugh ≈ ttal → ttal.
  2|en|sound|Your daughter shot up so TALL → ttal.
  3|fr|sound|TA FILLE (fr. your daughter): ta ≈ ttal → ttal.
부모님|bu-mo-nim
  1|en|sound|Your parents, the BOOMERS (“OK, boomer!”) → bu-mo + 님 for respect → bu-mo-nim.
  2|en|sound|PAPA + MOM: bu-mo ≈ pa-mom → bu-mo-nim.
  3|en|sound|Like a BOOMERANG, you always come back to your parents → bu-mo-nim.
가족|ga-jok
  1|en|sound|Family dinner: Dad's GOT JOKES → ga-jok.
  2|ja|sound|KAZOKU, the Japanese word for family → ga-jok.
  3|en|sound|Family GAME night, dad's JOKES included → ga-jok.
책|chaek
  1|en|sound|CHECK out a book from the library → chaek.
  2|en|sound|Chapter after CHAPTER: a book → chaek.
  3|en|sound|SHAKEspeare's complete works: one big book → chaek.
공책|gong-chaek
  1|en|sound|A book with every page GONE blank: 공 gong + 책 chaek (book) → notebook.
  2|en|sound|To-do lists: GOING to CHECK it all off in my notebook → gong-chaek.
  3|en|sound|A COMPACT notebook for your bag: com-pact ≈ gong-chaek → gong-chaek.
핸드폰|haen-deu-pon
  1|en|loanword|HAND + PHONE: a phone in your hand → haen-deu-pon.
  2|en|loanword|Konglish HAND PHONE = cellphone → haen-deu-pon.
  3|en|loanword|A HANDheld PHONE → haen-deu-pon.
컴퓨터|keom-pyu-teo
  1|en|loanword|COMPUTER → keom-pyu-teo.
  2|en|loanword|A gaming COMPUTER → keom-pyu-teo.
  3|en|loanword|COMPUTER, in three beats: keom-pyu-teo.
시계|si-gye
  1|en|sound|A SEIKO watch → si-gye.
  2|en|sound|The CPU clock CYCLE: tick, tick → si-gye.
  3|es|sound|El reloj SIGUE (es. the clock keeps going): tick-tock → si-gye.
창문|chang-mun
  1|en|sound|CHANG(E) + MOON: watch the moon change through your window → chang-mun.
  2|en|sound|CHANGE the view: open the window → chang-mun.
  3|en|sound|CHANGE the MOOD: open a window → chang-mun.
칠판|chil-pan
  1|en|sound|A CHALK PANEL → chil-pan: blackboard.
  2|en|sound|The coach's CHALK PLAN on the board at halftime → chil-pan.
  3|en|sound|Nails on a blackboard send a CHILL down your spine → chil-pan.
책상|chaek-ssang
  1|en|sound|At the studio mixing desk: CHECK the SONG one more time → chaek-ssang.
  2|en|sound|The hotel CHECK-IN desk → chaek-ssang.
  3|en|sound|CHECK out my new STANDING desk → chaek-ssang.
의자|ui-ja
  1|fr|sound|“OUI, JE m'assois” (fr. yes, I'll sit down) → ui-ja.
  2|en|sound|A WHEELCHAIR is still a chair: wee-chair → ui-ja.
  3|en|sound|Pull up a chair to the OUIJA board → ui-ja.
필통|pil-tong
  1|en|sound|FILL it with a TON of pens → pil-tong: pencil case.
  2|en|sound|Your PILOT pens live in the pencil case → pil-tong.
  3|en|sound|FILL the TUBE with pencils → pil-tong.
펜|pen
  1|en|loanword|PEN → pen, the same word.
  2|en|loanword|A ballpoint PEN → pen.
  3|en|loanword|PEN, the same in Korean → pen.
지우개|ji-u-gae
  1|en|sound|“GEE, WHOOPS!” Grab the eraser → ji-u-gae.
  2|en|sound|JIU-jitsu for mistakes: wipe them out → ji-u-gae.
  3|en|sound|“GEE, YOU GOT it wrong!” Erase it → ji-u-gae.
지갑|ji-gap
  1|en|sound|“GEE, a GAP!” My wallet's empty → ji-gap.
  2|en|sound|ZIP up your wallet: zip ≈ ji → ji-gap.
  3|en|sound|G PAY, the wallet on your phone: g-pay ≈ ji-gap → ji-gap.
돈|don
  1|es|sound|“Poderoso caballero es DON DINERO” (es. money rules) → don.
  2|en|sound|A DONation is money → don.
  3|en|sound|DON Corleone's money → don.
여권|yeo-kkwon
  1|en|sound|“YO, GO ON through!” says passport control → yeo-kkwon.
  2|en|sound|With a passport, YOU CAN go anywhere → yeo-kkwon.
  3|en|sound|Passport stamped, and YOU'RE GONE → yeo-kkwon.
가방|ga-bang
  1|fr|sound|Un CABAS (fr. tote bag): ca-bas ≈ ga-bang → ga-bang.
  2|ja|loanword|KABAN, the Japanese word for bag → ga-bang.
  3|en|sound|A Dolce & GABBANA bag: gab-ba ≈ ga-bang → ga-bang.
연필|yeon-pil
  1|en|sound|Sharpen a pencil and the wood PEELs → yeon-pil, which rhymes with pen-cil.
  2|en|sound|Rhymes with penCIL: yeon-PIL.
  3|en|sound|A YOUNG PUPIL's first pencil → yeon-pil.
종이|jong-i
  1|en|sound|Paper comes from JUNGLE trees → jong-i.
  2|en|sound|JOT it on paper → jong-i.
  3|fr|sound|Du papier JAUNI (fr. old yellowed paper): jau-ni ≈ jong-i → jong-i.
열쇠|yeol-ssoe
  1|en|sound|The key to YOUR SAFE → yeol-ssoe.
  2|en|sound|YELL “Open SESAME!”: the magic key → yeol-ssoe.
  3|en|sound|YALE, the classic lock-and-key brand: yale ≈ yeol → yeol-ssoe.
안경|an-gyeong
  1|en|sound|Hipster ANGULAR frames: ang-gyu ≈ an-gyeong → glasses.
  2|es|sound|ANTEOJOS (es. glasses) start the same way → an-gyeong.
  3|en|sound|ANGRY YOUNG man in thick glasses → an-gyeong.
우산|u-san
  1|en|sound|Raining? “USE AN umbrella!” → u-san.
  2|fr|sound|“OÙ SONT les parapluies ?” (fr. where are the umbrellas?) → u-san.
  3|es|sound|Si llueve, ¡USA paraguas! (es. if it rains, use an umbrella) → u-san.
선생님|seon-saeng-nim
  1|en|roots|SENSEI → seon-saeng-nim. Same word (先生), plus 님 for respect.
  2|en|sound|Teachers have a SIXTH SENSE for who didn't study → seon-saeng-nim.
  3|en|sound|SON, SING it again: the music teacher → seon-saeng-nim.
학생|hak-ssaeng
  1|en|sound|A student HACKing away to become a SENSEI → hak-ssaeng.
  2|en|sound|Students at a HACKathon → hak-ssaeng.
  3|en|sound|Students kicking a HACKY SACK on campus → hak-ssaeng.
회사원|hoe-sa-won
  1|en|sound|The WAY SAD ONE at the office → hoe-sa-won, office worker.
  2|mixed|sound|The company (회사, WAY SAD) pays you in WON: office worker → hoe-sa-won.
  3|en|sound|A HUAWEI badge, 9-to-5: an office worker → hoe-sa-won.
의사|ui-sa
  1|en|sound|“WE SAY ‘ahh’” for the doctor → ui-sa.
  2|fr|sound|The doctor presses: “OUI, ÇA fait mal ?” (fr. does that hurt?) → ui-sa.
  3|en|sound|“WE SAW the doctor” → ui-sa.
간호사|gan-ho-sa
  1|en|sound|The nurse CAN HOLD the SAline drip → gan-ho-sa.
  2|en|sound|The nurse hands you a hospital GOWN: gown-hos ≈ gan-ho → gan-ho-sa.
  3|fr|sound|Latex GANTS (fr. gloves) on: the nurse is ready → gan-ho-sa.
배우|bae-u
  1|en|sound|Curtain call: the actors take a BOW → bae-u.
  2|en|sound|“BRAVO!” The audience cheers the actor → bae-u.
  3|ko|sound|Same sound as 배우다 (to learn, ¡VEO!): an actor must learn lines → bae-u.
경찰|gyeong-chal
  1|en|sound|Cops on a GANG CHASE → gyeong-chal: police officer.
  2|fr|sound|Un GENDARME (fr. police officer): gen-dar ≈ gyeong-chal → gyeong-chal.
  3|en|sound|Riot police keep crowd CONTROL: con-trol ≈ gyeong-chal → gyeong-chal.
군인|gu-nin
  1|en|sound|A soldier: GUN IN hand → gu-nin.
  2|en|sound|A Few GOOD MEN: the Marines → gu-nin.
  3|en|sound|TOP GUN pilots: the military's elite → gu-nin.
가수|ga-su
  1|en|sound|Lady GAGA, SUperstar singer → ga-su.
  2|en|sound|Sing with GUSTO → ga-su.
  3|it|sound|Enrico CARUSO, the legendary tenor: ca-ru-so ≈ ga-su → ga-su.
요리사|yo-ri-sa
  1|en|sound|YOLK, RICE and SAUCE: the chef at work → yo-ri-sa.
  2|en|sound|“Chef, YOUR RISOTTO is perfect!” → yo-ri-sa.
  3|en|sound|The YOLK over RICE pro: chef → yo-ri-sa.
기자|gi-ja
  1|en|sound|A GIZMODO reporter breaks a tech scoop → gi-ja.
  2|en|sound|GIZMO news: the reporter's scoop → gi-ja.
  3|en|sound|A GAZETTE reporter (es. gaceta): ga-zette ≈ gi-ja → gi-ja.
주부|ju-bu
  1|en|sound|JUGGLING a BUsy home: homemaker → ju-bu.
  2|en|sound|Running a home is a full-time JOB: ju-bu.
  3|en|sound|CHORES and the BUdget: running a home → ju-bu.
엔지니어|en-ji-ni-eo
  1|en|sound|ENGINEER → en-ji-ni-eo. That's you!
  2|es|sound|INGENIERO (es.) → en-ji-ni-eo.
  3|en|sound|ENGINE + EAR: the engineer listens to the engine → en-ji-ni-eo.
개발자|gae-bal-jja
  1|en|sound|First command of the day: GIT PULL → gae-bal-jja.
  2|en|sound|CABLES and JAVA everywhere: a developer → gae-bal-jja.
  3|en|sound|Shipping the GAME BUILD: developers → gae-bal-jja.
변호사|byeon-ho-sa
  1|en|sound|Your case is BEYOND HOPE, SIR? Call a lawyer → byeon-ho-sa.
  2|en|sound|Only a lawyer may “approach the BENCH” → byeon-ho-sa.
  3|en|sound|Divorce: “BYE, HONEY, SEE you in court” → byeon-ho-sa.
약사|yak-ssa
  1|en|sound|The pharmacist hands you YUCKy medicine → yak-ssa.
  2|en|sound|“YUCK, SIR!” Pills from the pharmacist → yak-ssa.
  3|ko|sound|The pharmacist behind the 약국 (“YUCK! They COOK”) counter → yak-ssa.
학교|hak-kkyo
  1|en|sound|HOGWARTS, the most famous school: hog ≈ hak → hak-kkyo.
  2|en|sound|Play HOCKEY after school → hak-kkyo.
  3|ja|sound|Anime's GAKKŌ (school) is the same word: gak-kō ≈ hak-kkyo.
교실|gyo-sil
  1|en|sound|“GO SIT!” says the teacher in the classroom → gyo-sil.
  2|en|sound|The whole class GOES SILENT when the teacher walks in → gyo-sil.
  3|ja|sound|Assassination Classroom, in Japanese Ansatsu KYŌSHITSU: kyo-shi ≈ gyo-sil → gyo-sil.
집|jip
  1|en|sound|Your home's ZIP code → jip.
  2|fr|sound|A GÎTE (fr. holiday home, a place to stay) → jip: home.
  3|en|sound|Your JEEP is in the driveway: you're home → jip.
서점|seo-jeom
  1|en|sound|Rows of shelves? SEARCH 'EM: a bookstore → seo-jeom.
  2|en|sound|Dr. SEUSS books on every shelf: seuss ≈ seo → seo-jeom.
  3|en|sound|I SAW a GEM of a book at the bookstore → seo-jeom.
화장실|hwa-jang-sil
  1|en|sound|WASHING up at the sink → hwa-jang-sil, restroom.
  2|en|sound|Halftime rush: WHAT a JAM at the restroom → hwa-jang-sil.
  3|en|sound|WATCHING videos on the toilet → hwa-jang-sil, restroom.
식당|sik-ttang
  1|en|sound|A SIT-DOWN restaurant: sit-down ≈ sik-ttang → sik-ttang.
  2|en|sound|“Table for SIX, please”: eating out → sik-ttang, restaurant.
  3|fr|sound|A CHIC little restaurant: chic ≈ 식 sik, as in 음식 (food) → sik-ttang.
편의점|pyeo-ni-jeom
  1|en|sound|PENNY GUM at the convenience store → pyeo-ni-jeom.
  2|ja|sound|Japan's KONBINI, the 24/7 store: bi-ni ≈ pyeo-ni → pyeo-ni-jeom.
  3|it|sound|Grab a PANINI at the 24/7 convenience store → pyeo-ni-jeom.
백화점|bae-kwa-jeom
  1|en|sound|A BIG WArehouse, JAM-packed with goods → bae-kwa-jeom: department store.
  2|en|sound|BAGS, WATCHES, JEWELRY, all under one roof → bae-kwa-jeom, department store.
  3|en|sound|BLACK FRIDAY sales at the department store → bae-kwa-jeom.
은행|eun-haeng
  1|en|sound|Cash IN HAND, straight from the bank → eun-haeng.
  2|en|sound|ING, the orange Dutch bank: ING ≈ 은 eun → eun-haeng.
  3|en|sound|Your INHERITANCE, safe in the bank → eun-haeng.
공원|gong-won
  1|en|sound|Let's GO ON a walk in the park → gong-won.
  2|en|sound|Frisbee in the park: “GO LONG!” → gong-won.
  3|en|sound|Pine CONES all over the park → gong-won.
병원|byeong-won
  1|en|sound|BEEN WOUNDed? Off to the hospital → byeong-won.
  2|es|sound|Get well soon: ¡que te pongas BIEN! (es.) → byeong-won, hospital.
  3|en|sound|BEING WHEELED into the ER → byeong-won, hospital.
약국|yak-kkuk
  1|en|sound|“YUCK, COUGH syrup!” → yak-kkuk, pharmacy.
  2|en|sound|“YUCK!” They COOK up medicine here → yak-kkuk, pharmacy.
  3|ko|sound|Where the 약사 (pharmacist, YUCKy medicine) works → yak-kkuk, pharmacy.
공항|gong-hang
  1|en|sound|GONE flying from the HANGAR → gong-hang: airport.
  2|es|sound|¡CON GANAS de volar! (es. itching to fly) → gong-hang, airport.
  3|en|sound|Flight delayed? GONNA HANG around the gate → gong-hang.
미용실|mi-yong-sil
  1|en|sound|“Make ME look YOUNG!” at the hair salon → mi-yong-sil.
  2|fr|sound|Une coupe MI-LONGUE (fr. mid-length cut) at the salon → mi-yong-sil.
  3|en|sound|A MILLION-dollar haircut at the salon → mi-yong-sil.
지하철역|ji-ha-cheol-lyeok
  1|en|sound|Loyal HACHIKŌ waited at the station every day: ha-chi ≈ ha-cheol → ji-ha-cheol-lyeok.
  2|ja|sound|Tokyo's CHIKATETSU (subway) is the same word: chi-ka-te ≈ ji-ha-cheol → ji-ha-cheol-lyeok.
  3|mixed|roots|An iron road underground, like FERROcarril / chemin de FER → ji-ha-cheol-lyeok.
카페|ka-pe
  1|fr|loanword|CAFÉ. Korean has no f, so f → ㅍ p → ka-pe.
  2|fr|loanword|A Parisian sidewalk CAFÉ → ka-pe.
  3|es|loanword|CAFÉ con leche (es.) → ka-pe.
회사|hoe-sa
  1|en|sound|Monday at the company: WAY SAD → hoe-sa.
  2|en|sound|HUAWEI, the tech giant: a company → hoe-sa.
  3|es|sound|HUELGA (es. strike) at the company → hoe-sa.
도서관|do-seo-gwan
  1|fr|sound|Pull an old DOSSIER from the library archives → do-seo-gwan.
  2|en|sound|Studying in the library, you DOZE… GONE → do-seo-gwan.
  3|en|sound|DOSTOEVSKY lines every library shelf → do-seo-gwan.
마트|ma-teu
  1|en|loanword|MART, plus a final eu → ma-teu: supermarket.
  2|en|loanword|WalMART → ma-teu.
  3|en|loanword|The MART down the street → ma-teu.
시장|si-jang
  1|en|sound|CHEAP JUNK at the flea market → si-jang.
  2|en|sound|CHIANG MAI's famous night markets → si-jang.
  3|en|sound|SHE JANGLES her coins at the market → si-jang.
헬스장|hel-sseu-jang
  1|en|sound|The gym: a HEALTH JUNGLE → hel-sseu-jang.
  2|en|sound|Leg day is HELL at the gym → hel-sseu-jang.
  3|en|loanword|From HEALTH club: 헬스 + 장 (place, as in 시장) → hel-sseu-jang, gym.
무슨|mu-seun
  1|en|sound|“What kind of MOOSE is that?” → mu-seun.
  2|en|sound|What kind of MUSHROOM: Mario's red one or the green 1-UP? → mu-seun.
  3|fr|sound|MOUSSEUX or still? (fr. sparkling wine): what kind? → mu-seun.
제일|je-il
  1|en|sound|The MOST wanted end up in JAIL → je-il: the most.
  2|en|sound|The crown JEWEL: the very best → je-il, the most.
  3|fr|sound|J'AI LE meilleur (fr. I've got the best) → je-il, the most.
많이|ma-ni
  1|en|sound|MANY → ma-ni: a lot.
  2|en|sound|MANIA: way too much of something → ma-ni, a lot.
  3|es|sound|Un MONTÓN (es. a heap, loads) → ma-ni: a lot.
여행|yeo-haeng
  1|en|sound|Backpacking from YOUTH HOSTEL to hostel → yeo-haeng.
  2|ja|sound|A night in a Japanese RYOKAN (travelers' inn): ryo ≈ yeo → yeo-haeng.
  3|en|sound|Trip vibes: “YO, HANG loose!” → yeo-haeng, travel.
한국|han-guk
  1|en|sound|HAN-COOK: the land of Korean BBQ → han-guk, Korea.
  2|en|sound|HANGUL, Korea's own alphabet → han-guk.
  3|en|sound|HANBOK, Korea's traditional dress → han-guk.
커피숍|keo-pi-syop
  1|en|loanword|COFFEE SHOP → keo-pi-syop.
  2|en|loanword|Central Perk, the Friends COFFEE SHOP → keo-pi-syop.
  3|en|loanword|A Starbucks COFFEE SHOP → keo-pi-syop.
형용사|hyeong-yong-sa
  1*|en|sound|HUGE, YOUNG, SAD: three adjectives → hyeong-yong-sa, adjective.
  2|en|sound|HUNGRY, YOUNG, SALTY: three more adjectives → hyeong-yong-sa.
  3|es|sound|JOVEN, LLENO, SANO (es. young, full, healthy): adjectives → hyeong-yong-sa.
동사|dong-sa
  1|en|sound|Verbs are for DOING STUFF → dong-sa.
  2|en|sound|DON'T SAY it, DO it → dong-sa, verb.
  3|en|sound|A DANCER's day is all verbs: jump, spin, leap → dong-sa.
시간|si-gan
  1|en|sound|Time flies: SEE it, GONE! → si-gan.
  2|mixed|sound|One SECOND (es. SEGUNDO), the unit of time → si-gan.
  3|es|sound|El tiempo SIGUE (es. time keeps going) → si-gan.
요일|yo-il
  1|en|sound|“YO, I'LL see you Monday!” → yo-il, day of the week (월요일, 화요일…).
  2|en|roots|The -DAY of MonDAY, TuesDAY: every Korean weekday ends in 요일 → yo-il.
  3|es|sound|¿Y HOY, qué día es? (es. and today, what day is it?) → yo-il.
운동|un-dong
  1|es|sound|Counting reps: “¡UN, DOS…!” → un-dong, exercise.
  2|en|sound|Your workout is still UNDONE: go exercise → un-dong.
  3|en|sound|ENDORPHINS kick in after a workout → un-dong, exercise.
계절|gye-jeol
  1|fr|sound|Quel JOLI printemps ! (fr. what a lovely spring): a season → gye-jeol.
  2|en|sound|Nature's yearly SCHEDULE: spring, summer, fall, winter → gye-jeol.
  3|en|sound|GAZELLES migrate with the seasons → gye-jeol.
색깔|saek-kkal
  1|en|sound|A color SCALE → saek-kkal: color.
  2|en|sound|SKITTLES: taste the rainbow of colors → saek-kkal.
  3|en|sound|A SACK of COLORED pencils → saek-kkal, color.
과일|gwa-il
  1|en|sound|A GUAVA is a fruit → gwa-il.
  2|en|sound|GUACAMOLE: the avocado is a fruit → gwa-il.
  3|es|sound|GUANÁBANA (es. soursop), a tropical fruit → gwa-il.
음료|eum-nyo
  1|en|sound|Ice-cold Coca-Cola: ENJOY! → eum-nyo, drink.
  2|es|sound|¡UN MOJITO, por favor! (es.) → eum-nyo, a drink.
  3|es|sound|Ron AÑEJO (es. aged rum), served neat → eum-nyo.
음식|eum-sik
  1|en|sound|“MMM… CHIC!” An elegant plate of food → eum-sik.
  2|en|sound|HUMMUS and pita: food → eum-sik.
  3|fr|sound|An AMUSE-BOUCHE (fr. a bite before the meal) → eum-sik, food.
영화|yeong-hwa
  1|en|sound|“YOU WANNA see a movie?” → yeong-hwa.
  2|fr|sound|« ON VA au ciné ? » (fr. shall we go to the movies?): on-va ≈ yeong-hwa.
  3|en|sound|JOHN WAYNE westerns at the movies → yeong-hwa.
음악|eu-mak
  1|en|sound|Music is what YOU MAKE → eu-mak.
  2|es|sound|“¡Eh, MACARENA!”: the song everyone knows → eu-mak, music.
  3|en|sound|Producing beats in Logic on an iMAC → eu-mak, music.
물건|mul-geon
  1|en|sound|A MULTI-TOOL: one object, many uses → mul-geon.
  2|en|sound|A MILLION little things → mul-geon, objects.
  3|en|sound|MOVING day: all your stuff in boxes → mul-geon.
직업|ji-geop
  1|en|sound|Land a GIG: a job → ji-geop, occupation.
  2|fr|sound|JE GAGNE ma vie (fr. I earn my living) → ji-geop, occupation.
  3|en|sound|Writing ad JINGLES for a living → ji-geop.
장소|jang-so
  1|en|sound|Musical chairs: CHANGE SPOTS! → jang-so, place.
  2|en|sound|Meet me at the JUNCTION → jang-so, place.
  3|en|sound|SHANGRI-LA, the dream place: shang ≈ jang → jang-so.
날씨가 더워요|nal-ssi-ga deo-wo-yo
  1|en|roots|날씨 ≈ NASTY weather + 가 + 더워요 ≈ hot DEHORS → The weather is hot.
  2|en|roots|날씨 weather + 가 + 더워요 hot: The weather is hot.
  3|en|roots|Summer in Seoul, NASTY-hot weather: 날씨가 더워요!
커피가 뜨거워요|keo-pi-ga tteu-geo-wo-yo
  1|en|roots|커피 COFFEE + 가 + 뜨거워요 ≈ “¡TE QUEMAS!” → The coffee is hot.
  2|en|roots|커피 coffee + 가 + 뜨거워요 hot to touch: The coffee is hot.
  3|en|roots|First sip of fresh coffee: ouch! 커피가 뜨거워요, the coffee is hot.
날씨가 추워요|nal-ssi-ga chu-wo-yo
  1|en|roots|날씨 ≈ NASTY weather + 가 + 추워요 ≈ ACHOO! → The weather is cold.
  2|en|roots|날씨 weather + 가 + 추워요 cold: The weather is cold.
  3|en|roots|Winter in Seoul, nasty weather, achoo: 날씨가 추워요!
물이 차가워요|mu-ri cha-ga-wo-yo
  1|en|roots|물 ≈ MOULES' water + 이 + 차가워요 ≈ CHUG it ice-cold → The water is cold.
  2|en|roots|물 water + 이 + 차가워요 cold to touch: The water is cold.
  3|en|roots|Jump in the lake: the water (물) is ice-cold (차가워요)!
한국어를 배워요|han-gu-geo-reul bae-wo-yo
  1|en|roots|한국어 ≈ HAN-COOK's language + 를 + 배워요 ≈ “¡Ah, ya VEO!” → I learn Korean.
  2|en|roots|한국어 Korean + 를 + 배워요 learn: I learn Korean.
  3|en|roots|That's you, right now: learning Korean (한국어를 배워요)!
영어를 가르쳐요|yeong-eo-reul ga-reu-chyeo-yo
  1|en|roots|영어 English + 를 + 가르쳐요 ≈ a GURU CHEERS → I teach English.
  2|en|roots|영어 English + 를 + 가르쳐요 teach: I teach English.
  3|en|roots|The English GURU: 영어를 가르쳐요, I teach English.
무슨 운동을 해요?|mu-seun un-dong-eul hae-yo
  1|en|roots|무슨 ≈ MOOSE? + 운동 ≈ “¡UN, DOS!” + 을 해요 “do” → What sport do you do?
  2|en|roots|무슨 what kind + 운동 sport + 을 해요 do: What sport do you do?
  3|en|roots|Gym small talk: “무슨 운동을 해요?” What's your sport?
저는 수영을 해요|jeo-neun su-yeong-eul hae-yo
  1|en|roots|저는 “as for me” + 수영 ≈ SO YOUNG (swimming) + 을 해요 “do” → I swim.
  2|en|roots|저는 me + 수영 swimming + 을 해요 do: I swim.
  3|en|roots|Your answer at the gym: “저는 수영을 해요”: I swim (it keeps you so young).
무슨 색깔을 좋아해요?|mu-seun saek-kka-reul jo-a-hae-yo
  1|en|roots|무슨 ≈ MOOSE? + 색깔 ≈ color SCALE + 을 + 좋아해요 ≈ JOY (like) → What color do you like?
  2|en|roots|무슨 what kind + 색깔 color + 을 + 좋아해요 like: What color do you like?
  3|en|roots|Picking a phone case: “무슨 색깔을 좋아해요?” What color do you like?
파란색을 좋아해요|pa-ran-sae-geul jo-a-hae-yo
  1|en|roots|파란색 ≈ PARASAIL blue + 을 + 좋아해요 ≈ JOY (like) → I like blue.
  2|en|roots|파란색 blue + 을 + 좋아해요 like: I like blue.
  3|en|roots|Your answer: “파란색을 좋아해요”: blue, like a PARASAIL sky.
밥 먹어요|bam meo-geo-yo
  1|en|roots|밥 ≈ bibimBAP rice + 먹어요 ≈ MUKbang eating → I eat. 밥 sounds like bam here.
  2|en|roots|밥 rice / meal + 먹어요 eat: I'm having a meal. Said bam meo-geo-yo.
  3|en|roots|Lunchtime: a MUKBANG of BIBIMBAP → 밥 먹어요, I'm eating.
엔지니어예요|en-ji-ni-eo-ye-yo
  1|en|roots|ENGINEER? 예요 ≈ “YEAH-YO,” that's me → I'm an engineer.
  2|en|roots|엔지니어 engineer + 예요 am: I'm an engineer.
  3|en|roots|Your intro at a meetup: “엔지니어예요”: I'm an ENGINEER.
개발자예요|gae-bal-jja-ye-yo
  1|en|roots|개발자 ≈ CABLES and JAVA (developer)? 예요 ≈ “YEAH-YO” → I'm a developer.
  2|en|roots|개발자 developer + 예요 am: I'm a developer.
  3|en|roots|Your hackathon intro: “개발자예요”, a developer, that's me.
무슨 음식|mu-seun eum-sik
  1|en|roots|무슨 ≈ MOOSE? + 음식 ≈ “MMM, CHIC!” → what kind of food.
  2|en|roots|무슨 what kind of + 음식 food → what kind of food.
  3|en|roots|Choosing dinner: 무슨 음식? What kind of food?
무슨 운동|mu-seun un-dong
  1|en|roots|무슨 ≈ MOOSE? + 운동 ≈ “¡UN, DOS!” → what sport.
  2|en|roots|무슨 what kind of + 운동 sport, exercise → what sport.
  3|en|roots|At the gym: 무슨 운동? What sport?
무슨 영화|mu-seun yeong-hwa
  1|en|roots|무슨 ≈ MOOSE? + 영화 ≈ “YOU WANNA see a movie?” → what kind of movie.
  2|en|roots|무슨 what kind of + 영화 movie → what kind of movie.
  3|en|roots|Movie night: 무슨 영화? What kind of movie?
무슨 음악|mu-seun eu-mak
  1|en|roots|무슨 ≈ MOOSE? + 음악 ≈ what YOU MAKE → what kind of music.
  2|en|roots|무슨 what kind of + 음악 music → what kind of music.
  3|en|roots|Road-trip playlist: 무슨 음악? What kind of music?
무슨 색깔|mu-seun saek-kkal
  1|en|roots|무슨 ≈ MOOSE? + 색깔 ≈ color SCALE → what color.
  2|en|roots|무슨 what kind of + 색깔 color → what color.
  3|en|roots|Buying sneakers: 무슨 색깔? What color?
무슨 과일|mu-seun gwa-il
  1|en|roots|무슨 ≈ MOOSE? + 과일 ≈ GUAVA → what fruit.
  2|en|roots|무슨 what kind of + 과일 fruit → what fruit.
  3|en|roots|At the fruit stand: 무슨 과일? What fruit?
무슨 음료|mu-seun eum-nyo
  1|en|roots|무슨 ≈ MOOSE? + 음료 ≈ ENJOY (a drink) → what drink.
  2|en|roots|무슨 what kind of + 음료 drink → what drink.
  3|en|roots|At the café counter: 무슨 음료? What drink?
무슨 계절|mu-seun gye-jeol
  1|en|roots|무슨 ≈ MOOSE? + 계절 ≈ migrating GAZELLES → what season.
  2|en|roots|무슨 what kind of + 계절 season → what season.
  3|en|roots|Planning a trip: 무슨 계절? What season?
제일 좋아해요|je-il jo-a-hae-yo
  1|en|roots|제일 ≈ MOST-wanted JAIL + 좋아해요 ≈ JOY (like) → like the most / favorite.
  2|en|roots|제일 the most + 좋아해요 like → like the most / favorite.
  3|en|roots|Your all-time favorite, the one you like the most: 제일 좋아해요.
무슨 음식을 제일 좋아해요?|mu-seun eum-si-geul je-il jo-a-hae-yo
  1|en|roots|무슨 음식 ≈ MOOSE? MMM, CHIC! + 제일 ≈ JAIL (most) + 좋아해요 ≈ JOY (like) → What food do you like most?
  2|en|roots|무슨 음식 what food + 을 + 제일 most + 좋아해요 like → What food do you like most?
  3|en|roots|First-date question: “무슨 음식을 제일 좋아해요?” Your favorite food?
한국 음식을 제일 좋아해요|han-guk eum-si-geul je-il jo-a-hae-yo
  1|en|roots|한국 음식 ≈ HAN-COOK, MMM, CHIC! + 제일 ≈ JAIL (most) + 좋아해요 ≈ JOY (like) → I like Korean food most.
  2|en|roots|한국 음식 Korean food + 을 + 제일 most + 좋아해요 like → I like Korean food most.
  3|en|roots|Your answer: “한국 음식을 제일 좋아해요”: Korean food is my favorite.
`

const languages = ['en', 'es', 'fr', 'pt', 'it', 'de', 'ja', 'zh', 'ko', 'mixed']
const kinds = ['sound', 'reading', 'roots', 'loanword']

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

export const memoryAids = parseAids(entries)
