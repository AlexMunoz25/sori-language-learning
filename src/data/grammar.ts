import type { GrammarSource } from '../types/vocabulary'

/**
 * Connectors and particles. Their Memory Anchors and reading guides are in memory-aids.ts, their origins in
 * origin-reviews.json, and their test clues in recall-data.ts, all keyed by card id, exactly like vocabulary.
 * Examples bracket the studied piece as written in that sentence (저[는], 가[서]); `gap` holds three wrong fillers.
 */
export const grammarSources: GrammarSource[] = [
  {
    id: 'connector:그리고', section: 'connectors', category: 'Adding & choosing',
    korean: '그리고', meaning: 'and (between sentences)',
    grammar: {
      speech: '그리고',
      forms: [
        { form: '그리고', when: 'at the start of the second sentence, after a full stop: …요. 그리고 …' },
      ],
      examples: [
        { korean: '커피를 마셔요. [그리고] 빵을 먹어요.', english: 'I drink coffee. And I eat bread.',
          gap: ['그래서', '하지만', '그러면'],
          why: '그리고 just adds the next action; 그래서 would make the bread a result of the coffee.' },
        { korean: '저는 개발자예요. [그리고] 음악을 좋아해요.', english: 'I\'m a developer. And I like music.',
          gap: ['그러니까', '왜냐하면', '아니면'],
          why: 'Two facts about you, side by side: 그리고. 그러니까 would make your job the reason you like music.' },
        { korean: '토요일에 친구를 만나요. [그리고] 같이 영화를 봐요.', english: 'On Saturday I meet a friend. And we watch a movie together.',
          gap: ['그래도', '그렇지만', '또는'],
          why: 'The movie simply follows the meeting: 그리고. 그래도 (even so) would hint that meeting a friend was a problem.' },
      ],
      rules: [
        'Starts the second sentence: …요. 그리고 …요. It never attaches to a word.',
        'Inside one sentence, join the verbs with -고 instead: 커피를 마시고 빵을 먹어요.',
        'For two nouns, the everyday choice is 하고 or 와/과: 커피하고 빵. 그리고 mostly links whole sentences.',
      ],
      tricks: [
        'Full stop before it? 그리고. Same sentence? -고: 마셔요. 그리고 → 마시고.',
        'Both end in 고 and both mean and: 그리고 between sentences, -고 inside one.',
      ],
      comparisons: [
        { with: ['connector:-고'], title: '그리고 vs -고', points: [
          '그리고 opens a new sentence: 커피를 마셔요. 그리고 빵을 먹어요.',
          '-고 glues the two verbs into one sentence: 커피를 마시고 빵을 먹어요. Same meaning.',
          'With -고 only the last verb carries 요 and the tense; with 그리고 each sentence has its own.',
        ] },
        { with: ['particle:하고', 'particle:와/과'], title: '그리고 vs 하고 / 와/과', points: [
          'Two nouns? Use 하고 or 와/과: 커피하고 빵을 먹어요.',
          '그리고 links whole sentences: 커피를 마셔요. 그리고 빵을 먹어요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-고', section: 'connectors', category: 'Adding & choosing',
    korean: '-고', meaning: 'and (inside one sentence)',
    grammar: {
      speech: '먹고',
      forms: [
        { form: '-고', when: 'after any verb or adjective stem, no change: 가고, 먹고, 싸고' },
        { form: '이고', when: 'after a noun (이다): 학생이고; after a vowel often just 고: 개발자고' },
      ],
      examples: [
        { korean: '커피를 마시[고] 빵을 먹어요.', english: 'I drink coffee and eat bread.',
          gap: ['지만', '면', '거나'],
          why: '-고 simply links the two actions. -거나 would make it a choice: coffee or bread.' },
        { korean: '이 식당은 싸[고] 맛있어요.', english: 'This restaurant is cheap and tasty.',
          gap: ['지만', '서', '니까'],
          why: 'Two good points side by side: -고. -지만 would set them against each other.' },
        { korean: '밥을 먹[고] 커피를 마셨어요.', english: 'I ate, and then I had coffee.',
          gap: ['거나', '지만', '으면'],
          why: 'First the meal, then coffee: -고, with the past tense only on the last verb. -거나 would offer a choice.' },
      ],
      rules: [
        'Attaches to any verb or adjective stem with no change: 가고, 먹고, 싸고. Nouns take 이고: 학생이고.',
        'Joins two clauses in one sentence: facts side by side, or actions in order (do A, then B).',
        'For actions in order, the tense goes on the last verb only: 밥을 먹고 잤어요. -었고 lists separate past facts.',
        'The two halves can have different subjects: 저는 커피를 마시고 친구는 차를 마셔요.',
      ],
      tricks: [
        'Dictionary form minus 다, plus 고: 먹다 → 먹고, 공부하다 → 공부하고.',
        'One sentence → -고; two sentences → 그리고. Both end in the same 고.',
      ],
      comparisons: [
        { with: ['connector:그리고'], title: '-고 vs 그리고', points: [
          '-고 joins two clauses into one sentence: 커피를 마시고 빵을 먹어요.',
          '그리고 starts a second sentence: 커피를 마셔요. 그리고 빵을 먹어요.',
          'Same and; with -고 only the last verb ends in 요 and shows the tense.',
        ] },
        { with: ['connector:-아서/어서'], title: '-고 vs -아서/어서 (in order)', points: [
          '학교에 가고 친구도 만나요: go to school, and also meet friends (two separate things).',
          '학교에 가서 공부해요: go to school and study there. -아서/어서 links the steps.',
          'A reason is never -고: use -아서/어서 or -(으)니까 for because.',
        ] },
      ],
    },
  },
  {
    id: 'connector:또', section: 'connectors', category: 'Adding & choosing',
    korean: '또', meaning: 'also / again',
    grammar: {
      speech: '또',
      forms: [
        { form: '또', when: 'before the verb (again, also), or at the start of a sentence (and also, besides)' },
      ],
      examples: [
        { korean: '어제 김치를 먹었어요. 오늘 [또] 먹어요.', english: 'I ate kimchi yesterday. Today I eat it again.',
          gap: ['또는', '그래도', '그리고'],
          why: '또 means again here: kimchi two days in a row. 또는 looks alike but means or.' },
        { korean: '이 카페는 커피가 맛있어요. [또] 빵도 싸요.', english: 'This café has good coffee. Also, the bread is cheap.',
          gap: ['하지만', '아니면', '그러면'],
          why: '또 adds one more good point. 하지만 would need a contrast, and both points are good.' },
        { korean: '주말에 [또] 공부해요?', english: 'Are you studying again this weekend?',
          gap: ['또는', '그리고', '왜냐하면'],
          why: 'The question is about doing it again: 또. 또는 would need a second option after it.' },
      ],
      rules: [
        'Before the verb it means again or also: 또 먹어요 (eat again), 또 와요 (come again).',
        'At the start of a sentence it adds one more point, like and also or besides: 싸요. 또 맛있어요.',
        'Often teams up with the particle 도 (also): 또 빵도 싸요.',
        'Don\'t mix it up with 또는 (or), which only joins choices.',
      ],
      tricks: [
        '또 봐요! = See you again! 또 = one more time.',
        '또 + 는 = 또는 (or): one extra syllable turns also into or.',
      ],
      comparisons: [
        { with: ['connector:또는'], title: '또 vs 또는', points: [
          '또 = again or also: 또 먹어요 (eat it again).',
          '또는 = or, between two options: 커피 또는 차.',
          'Hear the 는: it turns also into or.',
        ] },
        { with: ['particle:도'], title: '또 vs 도', points: [
          '도 is a particle stuck to a noun: 저도 (me too), 빵도 (bread too).',
          '또 is a word of its own before the verb: 또 와요 (come again).',
          'They often team up: 또 빵도 사요 (I also buy bread, too).',
        ] },
      ],
    },
  },
  {
    id: 'connector:또는', section: 'connectors', category: 'Adding & choosing',
    korean: '또는', meaning: 'or (between options)',
    grammar: {
      speech: '또는',
      forms: [
        { form: '또는', when: 'between two nouns (커피 또는 차) or two clauses; a little formal' },
      ],
      examples: [
        { korean: '커피 [또는] 차를 마셔요.', english: 'I drink coffee or tea.',
          gap: ['그리고', '그래서', '하지만'],
          why: '또는 offers a choice between the two drinks; 그리고 would mean you drink both.' },
        { korean: '주말에는 수영 [또는] 요가를 해요.', english: 'On weekends I do swimming or yoga.',
          gap: ['또', '그래도', '그러면'],
          why: 'One of the two each weekend: 또는. Without the 는, 또 means again, not or.' },
        { korean: '토요일 [또는] 일요일에 만나요.', english: 'Let\'s meet on Saturday or Sunday.',
          gap: ['그리고', '그런데', '그러니까'],
          why: 'Either day works: 또는. 그리고 would mean meeting on both days.' },
      ],
      rules: [
        'Goes between two choices, mostly nouns: 커피 또는 차. The particle goes on the last noun only: 커피 또는 차를.',
        'Sounds a bit formal or written; in conversation 아니면 or (이)나 are more common: 커피나 차.',
        'For two verbs, attach -거나 instead: 커피를 마시거나 차를 마셔요.',
      ],
      tricks: [
        '또는 = 또 (also) + 는: hear the extra 는 and switch from also to or.',
        'Forms and menus love it: 현금 또는 카드 (cash or card).',
      ],
      comparisons: [
        { with: ['connector:아니면', 'connector:-거나'], title: '또는 vs 아니면 vs -거나', points: [
          '또는: between nouns, a bit formal: 커피 또는 차.',
          '아니면: the everyday or, often between two questions: 커피 마셔요? 아니면 차 마셔요?',
          '-거나: attached to a verb: 커피를 마시거나 차를 마셔요.',
        ] },
        { with: ['particle:(이)나'], title: '또는 vs (이)나', points: [
          '(이)나 attaches to the first noun: 커피나 차.',
          '또는 stands between the nouns as a word of its own: 커피 또는 차. Same meaning, more formal.',
        ] },
      ],
    },
  },
  {
    id: 'connector:아니면', section: 'connectors', category: 'Adding & choosing',
    korean: '아니면', meaning: 'or (between questions) / if not',
    grammar: {
      speech: '아니면',
      forms: [
        { form: '아니면', when: 'between two questions or choices, at the start of the second: …? 아니면 …?' },
      ],
      examples: [
        { korean: '커피 마셔요? [아니면] 차 마셔요?', english: 'Do you drink coffee? Or do you drink tea?',
          gap: ['그리고', '그래서', '그런데'],
          why: 'Two questions, pick one: 아니면. 그리고 would ask about both drinks.' },
        { korean: '주말에 영화를 봐요? [아니면] 집에서 요리해요?', english: 'On the weekend, do you watch a movie? Or cook at home?',
          gap: ['그래도', '그러니까', '하지만'],
          why: 'Two plans to choose from: 아니면. 하지만 would set them against each other instead.' },
        { korean: '사과 [아니면] 바나나를 사요.', english: 'I\'ll buy apples or bananas.',
          gap: ['또', '그러면', '왜냐하면'],
          why: 'Either fruit, not both: 아니면. 또 would mean also, adding bananas to the apples.' },
      ],
      rules: [
        'Most common between two questions: 커피 마셔요? 아니면 차 마셔요? It starts the second one.',
        'Also works between nouns in speech: 사과 아니면 바나나.',
        'Its literal sense is if not (아니다 + -면).',
        'Between two questions Korean can even drop it: 커피 마셔요, 차 마셔요?',
      ],
      tricks: [
        'Read it literally: 아니면 = if not → if not this, then that: or.',
        'Two questions, one choice: put 아니면 between them.',
      ],
      comparisons: [
        { with: ['connector:또는'], title: '아니면 vs 또는', points: [
          '아니면 is the everyday or, great between two questions: 커피 마셔요? 아니면 차 마셔요?',
          '또는 sounds formal, mostly between nouns: 현금 또는 카드.',
        ] },
        { with: ['connector:-거나'], title: '아니면 vs -거나', points: [
          '-거나 attaches to a verb inside one sentence: 영화를 보거나 요리해요.',
          '아니면 is a word of its own, often between two whole questions.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-거나', section: 'connectors', category: 'Adding & choosing',
    korean: '-거나', meaning: 'or (after a verb or adjective)',
    grammar: {
      speech: '먹거나',
      forms: [
        { form: '-거나', when: 'after any verb or adjective stem, no change: 보거나, 먹거나, 바쁘거나' },
        { form: '이거나', when: 'after a noun (이다): 학생이거나; for plain nouns (이)나 is more common' },
      ],
      examples: [
        { korean: '주말에 영화를 보[거나] 책을 읽어요.', english: 'On weekends I watch a movie or read a book.',
          gap: ['고', '지만', '면'],
          why: 'One or the other each weekend: -거나. -고 would mean you do both.' },
        { korean: '아침에 커피를 마시[거나] 녹차를 마셔요.', english: 'In the morning I drink coffee or green tea.',
          gap: ['는데', '니까', '러'],
          why: 'A choice of morning drinks: -거나. -니까 would make the coffee a reason.' },
        { korean: '피곤하[거나] 바쁘면 집에 있어요.', english: 'When I\'m tired or busy, I stay home.',
          gap: ['고', '지만', '니까'],
          why: 'Either one is enough: -거나. -고 would need you to be tired and busy at once.' },
      ],
      rules: [
        'Attaches to any verb or adjective stem with no change: 보거나, 먹거나, 바쁘거나.',
        'The tense usually goes on the last verb: 영화를 보거나 책을 읽었어요.',
        'For nouns, use the particle (이)나: 커피나 차. -거나 is for verbs and adjectives.',
        'Repeated, it means whether … or: 비가 오거나 안 오거나 상관없어요 (rain or not, it doesn\'t matter).',
      ],
      tricks: [
        'Swap -고 for -거나 and and becomes or: 보고 (watch and) → 보거나 (watch or).',
      ],
      comparisons: [
        { with: ['connector:-고'], title: '-거나 vs -고', points: [
          '보고 읽어요: watch and read (both).',
          '보거나 읽어요: watch or read (one of them).',
        ] },
        { with: ['particle:(이)나'], title: '-거나 vs (이)나', points: [
          '(이)나 sits on nouns: 영화나 책.',
          '-거나 sits on verbs and adjectives: 영화를 보거나 책을 읽어요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:하지만', section: 'connectors', category: 'Contrast',
    korean: '하지만', meaning: 'but / however',
    grammar: {
      speech: '하지만',
      forms: [
        { form: '하지만', when: 'at the start of the second sentence: …요. 하지만 …' },
      ],
      examples: [
        { korean: '이 가방은 예뻐요. [하지만] 너무 비싸요.', english: 'This bag is pretty. But it\'s too expensive.',
          gap: ['그래서', '그리고', '그러면'],
          why: 'Pretty, then a drawback: 하지만. 그래서 would make the price a result of the looks.' },
        { korean: '한국어는 어려워요. [하지만] 재미있어요.', english: 'Korean is difficult. But it\'s fun.',
          gap: ['그러니까', '또는', '왜냐하면'],
          why: 'Difficult and fun pull in opposite directions: 하지만. 그러니까 would say it\'s fun because it\'s hard.' },
        { korean: '저는 커피를 좋아해요. [하지만] 오늘은 차를 마셔요.', english: 'I like coffee. But today I\'m drinking tea.',
          gap: ['그리고', '그래서', '아니면'],
          why: 'Liking coffee but choosing tea is a contrast: 하지만. 그리고 would just add a fact.' },
      ],
      rules: [
        'Starts the second sentence: …요. 하지만 …. Inside one sentence, put -지만 on the verb: 비싸지만.',
        'Neutral and very common in speech and writing; 그렇지만 sounds a little more formal.',
        'The second sentence goes against what the first one leads you to expect.',
      ],
      tricks: [
        'Two sentences with 하지만 = one sentence with -지만: 비싸요. 하지만 … → 비싸지만 ….',
        'Hear the 지만 inside 하지만: the same but-ending, stuck to 하 (do).',
      ],
      comparisons: [
        { with: ['connector:-지만'], title: '하지만 vs -지만', points: [
          '하지만 opens a new sentence: 비싸요. 하지만 맛있어요.',
          '-지만 attaches to the stem inside one sentence: 비싸지만 맛있어요. Same meaning.',
        ] },
        { with: ['connector:그렇지만', 'connector:그런데'], title: '하지만 vs 그렇지만 vs 그런데', points: [
          '하지만 and 그렇지만 both mean but; 그렇지만 sounds a little more formal.',
          '그런데 is softer, and can also change the topic: by the way.',
        ] },
      ],
    },
  },
  {
    id: 'connector:그렇지만', section: 'connectors', category: 'Contrast',
    korean: '그렇지만', meaning: 'but / nevertheless',
    grammar: {
      speech: '그렇지만',
      forms: [
        { form: '그렇지만', when: 'at the start of the second sentence; ㅎ + ㅈ is said ㅊ: geu-reo-chi-man' },
      ],
      examples: [
        { korean: '그 식당은 비싸요. [그렇지만] 정말 맛있어요.', english: 'That restaurant is expensive. But it\'s really delicious.',
          gap: ['그래서', '그리고', '아니면'],
          why: 'Pricey, yet delicious: 그렇지만 grants the first point, then contrasts. 그래서 would make it tasty because it\'s pricey.' },
        { korean: '운동은 힘들어요. [그렇지만] 매일 해요.', english: 'Exercise is hard. But I do it every day.',
          gap: ['그러니까', '또는', '그러면'],
          why: 'Hard, yet done every day: a contrast. 그러니까 would make the hardness the reason you do it.' },
        { korean: '저는 엔지니어예요. [그렇지만] 요리도 잘해요.', english: 'I\'m an engineer. But I\'m also good at cooking.',
          gap: ['왜냐하면', '그래서', '그리고'],
          why: 'An engineer who is also a good cook: an unexpected contrast. 그리고 would only add the fact.' },
      ],
      rules: [
        'Starts the second sentence, like 하지만. Inside one sentence, use -지만: 비싸지만 맛있어요.',
        'Literally \'it is so, but\': it grants the point first, then contrasts. A little more formal than 하지만.',
        'Pronounced geu-reo-chi-man: ㅎ + ㅈ merge into ㅊ.',
        'Casual speech also has 그치만.',
      ],
      tricks: [
        '그렇다 (to be so) + -지만 (but) = that\'s so, but…: agree first, then object.',
        'Any 하지만 can become 그렇지만 when you want to sound a bit more formal.',
      ],
      comparisons: [
        { with: ['connector:하지만'], title: '그렇지만 vs 하지만', points: [
          'Both start the next sentence and mean but.',
          '그렇지만 = that\'s true, but…, slightly more formal; 하지만 is the everyday default.',
        ] },
        { with: ['connector:그래도'], title: '그렇지만 vs 그래도', points: [
          '그렇지만 sets two facts against each other: 비싸요. 그렇지만 맛있어요.',
          '그래도 = even so: you act despite the first fact: 비싸요. 그래도 사요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:그런데', section: 'connectors', category: 'Contrast',
    korean: '그런데', meaning: 'but / by the way',
    grammar: {
      speech: '그런데',
      forms: [
        { form: '그런데', when: 'at the start of a sentence: a soft contrast (but) or a new topic (by the way)' },
        { form: '근데', when: 'short form in casual speech' },
      ],
      examples: [
        { korean: '그 영화는 길어요. [그런데] 재미있어요.', english: 'That movie is long. But it\'s interesting.',
          gap: ['그래서', '그리고', '또는'],
          why: 'Long, yet interesting: 그런데 marks the contrast. 그래서 would make it fun because it\'s long.' },
        { korean: '오늘 날씨가 좋아요. [그런데] 내일 시간 있어요?', english: 'The weather is nice today. By the way, are you free tomorrow?',
          gap: ['왜냐하면', '아니면', '또는'],
          why: '그런데 switches to a new topic, like by the way. 아니면 would offer a choice between the two.' },
        { korean: '어제 시장에 갔어요. [그런데] 사람이 너무 많았어요.', english: 'I went to the market yesterday. But there were too many people.',
          gap: ['그래서', '그리고', '그러니까'],
          why: '그런데 sets up a turn in the story. 그래서 would mean the crowd came because you went.' },
      ],
      rules: [
        'Starts a sentence with two jobs: a soft but (contrast), or by the way (new topic).',
        'Softer than 하지만 and very common in conversation; casual speech shrinks it to 근데.',
        'Inside one sentence, the same idea is the ending -는데 / -(으)ㄴ데: 비싼데 맛있어요.',
        'Often sets the scene for a question: …요. 그런데 내일 시간 있어요?',
      ],
      tricks: [
        '비싸요. 그런데 … = 비싼데 …: the same soft but, two sentences or one.',
        'Changing the subject? Start with 그런데 (casual: 근데), like by the way.',
      ],
      comparisons: [
        { with: ['connector:-는데'], title: '그런데 vs -는데', points: [
          '그런데 starts a new sentence: 비싸요. 그런데 맛있어요.',
          '-는데 / -(으)ㄴ데 joins inside one sentence: 비싼데 맛있어요. Same soft but or background.',
        ] },
        { with: ['connector:하지만'], title: '그런데 vs 하지만', points: [
          '하지만 is a clear but, for a real contrast.',
          '그런데 is softer and can also mean by the way; 하지만 never changes the topic.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-지만', section: 'connectors', category: 'Contrast',
    korean: '-지만', meaning: 'but / although',
    grammar: {
      speech: '비싸지만',
      forms: [
        { form: '-지만', when: 'after any verb or adjective stem, no change: 비싸지만, 먹지만, 좋지만' },
        { form: '이지만', when: 'after a noun (이다): 학생이지만; after a vowel often just 지만: 의사지만' },
      ],
      examples: [
        { korean: '이 카페는 비싸[지만] 커피가 맛있어요.', english: 'This café is expensive, but the coffee is delicious.',
          gap: ['서', '고', '면'],
          why: 'Expensive is a minus, tasty a plus: -지만. -서 would make the coffee good because the café is pricey.' },
        { korean: '저는 커피를 좋아하[지만] 매일 안 마셔요.', english: 'I like coffee, but I don\'t drink it every day.',
          gap: ['거나', '니까', '러'],
          why: 'Liking it but not drinking it daily is a contrast: -지만. -니까 would make liking it the reason you don\'t.' },
        { korean: '어제 운동했[지만] 오늘은 안 피곤해요.', english: 'I exercised yesterday, but I\'m not tired today.',
          gap: ['고', '어서', '으면'],
          why: '-지만 can follow the past tense: 했지만. 했어서 is never right: -아서/어서 takes no past.' },
      ],
      rules: [
        'Attaches to any verb or adjective stem with no change: 비싸지만, 먹지만. Nouns take 이지만: 학생이지만.',
        'Past tense is fine before it: 먹었지만, 했지만.',
        'Joins two clauses inside one sentence; to start a new sentence, use 하지만 or 그렇지만.',
        'Also softens a request or an opinion: 미안하지만 … (sorry, but …).',
      ],
      tricks: [
        '비싸요. 하지만 … → 비싸지만 …: the 지만 jumps onto the verb.',
        'Polite openers: 죄송하지만 / 미안하지만 = excuse me, but…',
      ],
      comparisons: [
        { with: ['connector:하지만', 'connector:그렇지만'], title: '-지만 vs 하지만 / 그렇지만', points: [
          '-지만 sits on the stem inside one sentence: 비싸지만 맛있어요.',
          '하지만 and 그렇지만 start a new sentence: 비싸요. 하지만 맛있어요.',
        ] },
        { with: ['connector:-는데'], title: '-지만 vs -는데', points: [
          '-지만 is a clear contrast: 비싸지만 맛있어요 (pricey but tasty).',
          '-는데 can contrast too, but often just sets the scene: 비가 오는데 우산 있어요? -지만 can\'t do that.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-는데', section: 'connectors', category: 'Contrast',
    korean: '-는데', meaning: 'but / and (background)',
    grammar: {
      speech: '가는데, 좋은데, 비싼데',
      forms: [
        { form: '-는데', when: 'after verbs and 있다 / 없다: 가는데, 먹는데, 맛있는데' },
        { form: '-은데', when: 'after an adjective ending in a consonant: 좋은데, 작은데' },
        { form: '-ㄴ데', when: 'after an adjective ending in a vowel: 비싼데, 바쁜데; ㄹ drops: 길다 → 긴데' },
        { form: '인데', when: 'after a noun (이다): 학생인데, 의사인데' },
      ],
      examples: [
        { korean: '비가 오[는데] 우산 있어요?', english: 'It\'s raining. Do you have an umbrella?',
          gap: ['지만', '거나', '러'],
          why: '-는데 sets the scene (it\'s raining) for the question. -지만 would set up a contrast that isn\'t there.' },
        { korean: '이 가방은 좋[은데] 너무 비싸요.', english: 'This bag is nice, but it\'s too expensive.',
          gap: ['는데', '고', '아서'],
          why: '좋다 is an adjective ending in a consonant, so 은데: nice, but pricey. 는데 is for verbs.' },
        { korean: '오늘 토요일[인데] 같이 영화 봐요.', english: 'It\'s Saturday today, so let\'s watch a movie together.',
          gap: ['이지만', '이고', '이라서'],
          why: '인데 gives the background for a suggestion. 이라서 can\'t lead into let\'s: -아서 never takes a suggestion.' },
      ],
      rules: [
        'Verbs and 있다/없다 take -는데 (가는데, 맛있는데); adjectives take -(으)ㄴ데 (좋은데, 비싼데); nouns take 인데.',
        'A stem-final ㄹ drops: 살다 → 사는데, 길다 → 긴데.',
        'In the past, every stem takes -었는데: 갔는데, 비쌌는데.',
        'Two jobs: background before a question or suggestion (비가 오는데 우산 있어요?), or a soft but (좋은데 비싸요).',
      ],
      tricks: [
        'Background first, main point second: -는데 says here\'s the situation…',
        'In the present, take the noun-describing form and add 데: 좋은 → 좋은데, 비싼 → 비싼데, 가는 → 가는데.',
      ],
      comparisons: [
        { with: ['connector:그런데'], title: '-는데 vs 그런데', points: [
          '-는데 joins inside one sentence: 비싼데 맛있어요.',
          '그런데 starts the next sentence with the same idea: 비싸요. 그런데 맛있어요.',
        ] },
        { with: ['connector:-지만'], title: '-는데 vs -지만', points: [
          '-지만 is a clear but: 비싸지만 맛있어요.',
          '-는데 is softer and also gives background for a question: 비가 오는데 우산 있어요? -지만 can\'t.',
        ] },
      ],
    },
  },
  {
    id: 'connector:그래도', section: 'connectors', category: 'Contrast',
    korean: '그래도', meaning: 'still / even so',
    grammar: {
      speech: '그래도',
      forms: [
        { form: '그래도', when: 'at the start of the second sentence: the first fact doesn\'t stop the second' },
      ],
      examples: [
        { korean: '비가 와요. [그래도] 축구를 해요.', english: 'It\'s raining. Still, we play soccer.',
          gap: ['그래서', '그러면', '그리고'],
          why: 'Rain would normally stop the game, but you play anyway: 그래도. 그래서 would make rain the reason to play.' },
        { korean: '피곤해요. [그래도] 운동해요.', english: 'I\'m tired. Even so, I exercise.',
          gap: ['그러니까', '왜냐하면', '또는'],
          why: 'Tired, yet you exercise anyway: 그래도. 그러니까 would mean you exercise because you\'re tired.' },
        { korean: '이 가방은 비싸요. [그래도] 사요.', english: 'This bag is expensive. Still, I\'m buying it.',
          gap: ['그래서', '아니면', '왜냐하면'],
          why: 'Expensive, but you buy it anyway: 그래도. 그래서 would mean buying it because it\'s pricey.' },
      ],
      rules: [
        'Starts the second sentence: the first fact would normally stop the second, but it happens anyway.',
        'Inside one sentence, use -아도/어도: 비가 와도 축구를 해요.',
        '그래서 (so) and 그래도 (still) differ by one syllable: 서 follows the logic, 도 goes against it.',
      ],
      tricks: [
        '그래서 vs 그래도: 서 = so, 도 = even. One syllable flips the logic.',
        'Literally \'even if it\'s so\': 그래 (be so) + 도 (even).',
      ],
      comparisons: [
        { with: ['connector:그래서'], title: '그래도 vs 그래서', points: [
          '비가 와요. 그래서 집에 있어요: it rains, so I stay home.',
          '비가 와요. 그래도 축구를 해요: it rains, still we play. One syllable flips the logic.',
        ] },
        { with: ['connector:-아도/어도'], title: '그래도 vs -아도/어도', points: [
          '그래도 starts a new sentence: 피곤해요. 그래도 운동해요.',
          '-아도/어도 joins inside one sentence: 피곤해도 운동해요. Same meaning.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-아도/어도', section: 'connectors', category: 'Contrast',
    korean: '-아도/어도', meaning: 'even if / even though',
    grammar: {
      speech: '좋아도, 먹어도',
      forms: [
        { form: '-아도', when: 'last vowel ㅏ or ㅗ: 좋아도, 작아도; 가 + 아도 → 가도' },
        { form: '-어도', when: 'any other vowel: 먹어도, 재미있어도; 마시 + 어도 → 마셔도' },
        { form: '해도', when: '하다 → 해도: 공부해도, 피곤해도' },
        { form: '이어도', when: 'after a noun (이다): 학생이어도; after a vowel 여도: 의사여도' },
      ],
      examples: [
        { korean: '이 가방은 비싸[도] 사요.', english: 'Even though this bag is expensive, I\'m buying it.',
          gap: ['서', '면', '니까'],
          why: 'The price doesn\'t stop you: -아도. -서 would make the price the reason you buy it.' },
        { korean: '아무리 자[도] 피곤해요.', english: 'No matter how much I sleep, I\'m tired.',
          gap: ['서', '면', '고'],
          why: '아무리 + -아도 = no matter how much: sleep doesn\'t help. -서 would make sleeping the cause.' },
        { korean: '이거 먹[어도] 돼요?', english: 'May I eat this?',
          gap: ['아도', '어서', '고'],
          why: '-어도 돼요? asks permission: is it OK even if I…? 먹 has no ㅏ or ㅗ, so 어도, not 아도.' },
      ],
      rules: [
        'Vowel rule as in 해요 forms: ㅏ/ㅗ → 아도, other vowels → 어도, 하다 → 해도. Nouns: 이어도 (의사여도).',
        '-아도/어도 돼요? asks for permission: 먹어도 돼요? (May I eat it?)',
        'With 아무리 it means no matter how: 아무리 자도 피곤해요.',
      ],
      tricks: [
        'From the 해요 form: drop 요, add 도: 좋아요 → 좋아도, 공부해요 → 공부해도.',
        '도 is the also/even particle (저도 = me too), so -아도 = even if.',
        '그래도 is the sentence-starting version: 피곤해요. 그래도 운동해요.',
      ],
      comparisons: [
        { with: ['connector:-아서/어서'], title: '-아도/어도 vs -아서/어서', points: [
          'Same 아/어 form, different last syllable: 서 = so, 도 = even.',
          '비가 와서 집에 있어요 (it rains, so I stay in) vs 비가 와도 나가요 (even if it rains, I go out).',
        ] },
        { with: ['connector:-지만'], title: '-아도/어도 vs -지만', points: [
          '-지만 contrasts two facts: 비싸지만 맛있어요.',
          '-아도/어도 says the first fact won\'t stop the second, real or imagined: 비싸도 사요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:그래서', section: 'connectors', category: 'Reason & purpose',
    korean: '그래서', meaning: 'so (that\'s why) / therefore',
    grammar: {
      speech: '그래서',
      forms: [
        { form: '그래서', when: 'at the start of the second sentence: cause. 그래서 result.' },
      ],
      examples: [
        { korean: '비가 와요. [그래서] 집에 있어요.', english: 'It\'s raining. So I\'m staying home.',
          gap: ['그래도', '하지만', '아니면'],
          why: 'Rain is the cause, staying home the result: 그래서. 그래도 would mean you stay home despite the rain.' },
        { korean: '배가 고파요. [그래서] 밥을 먹어요.', english: 'I\'m hungry. So I\'m eating.',
          gap: ['그런데', '또는', '왜냐하면'],
          why: 'Hunger is the reason for eating: 그래서. 왜냐하면 would need the reason after it, not the result.' },
        { korean: '오늘은 일요일이에요. [그래서] 회사에 안 가요.', english: 'Today is Sunday. So I\'m not going to work.',
          gap: ['그래도', '그렇지만', '그리고'],
          why: 'Sunday is why you skip work: 그래서. 그래도 would say you skip it despite Sunday.' },
      ],
      rules: [
        'Starts the second sentence: the first is the cause, the second the result.',
        'Inside one sentence, use -아서/어서: 비가 와서 집에 있어요.',
        'The result can\'t be a command or suggestion; for so, let\'s… use 그러니까.',
        'On its own, 그래서요? asks so? or and then? in a conversation.',
      ],
      tricks: [
        '그래서 = 그래 (be so) + 서 (so): it\'s like that, so…',
        '그래서 vs 그래도: one syllable apart. 서 follows the logic; 도 goes against it.',
      ],
      comparisons: [
        { with: ['connector:-아서/어서'], title: '그래서 vs -아서/어서', points: [
          '그래서 starts the second sentence: 비가 와요. 그래서 집에 있어요.',
          '-아서/어서 joins inside one sentence: 비가 와서 집에 있어요. Same so.',
        ] },
        { with: ['connector:그러니까'], title: '그래서 vs 그러니까', points: [
          '그래서 reports a result: 비가 와요. 그래서 집에 있어요.',
          '그러니까 can push advice or a request: 비가 와요. 그러니까 우산을 가져가세요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:그러니까', section: 'connectors', category: 'Reason & purpose',
    korean: '그러니까', meaning: 'so (that\'s why) / I mean',
    grammar: {
      speech: '그러니까',
      forms: [
        { form: '그러니까', when: 'at the start of the next sentence: reason. 그러니까 advice, request, or result.' },
      ],
      examples: [
        { korean: '비가 와요. [그러니까] 우산을 가져가세요.', english: 'It\'s raining. So take an umbrella.',
          gap: ['그래서', '그래도', '하지만'],
          why: 'A command follows, so 그러니까; 그래서 can\'t lead into take… or let\'s…' },
        { korean: '내일 시험이 있어요. [그러니까] 오늘 공부해요.', english: 'I have an exam tomorrow. So I\'m studying today.',
          gap: ['그런데', '아니면', '그렇지만'],
          why: 'The exam is the reason for studying: 그러니까. 그렇지만 would set studying against the exam.' },
        { korean: '주말에, [그러니까] 토요일에 만나요.', english: 'Let\'s meet on the weekend, I mean, on Saturday.',
          gap: ['그리고', '그래도', '또는'],
          why: '그러니까 can mean I mean, narrowing the weekend down to Saturday. 또는 would offer Saturday as another option.' },
      ],
      rules: [
        'Starts the next sentence: the first gives the reason, the second the result, advice, or request.',
        'Unlike 그래서, it can lead into a command or suggestion: 그러니까 우산을 가져가세요.',
        'In conversation it also means I mean / in other words, or Exactly! when you agree: 그러니까요!',
        'Inside one sentence, use -(으)니까: 비가 오니까 우산을 가져가세요.',
      ],
      tricks: [
        '그러 (be so) + 니까 (since): since it\'s so…',
        'Command or let\'s coming next? Pick 그러니까 over 그래서.',
      ],
      comparisons: [
        { with: ['connector:그래서'], title: '그러니까 vs 그래서', points: [
          'Both mean so. 그래서 just reports a result: 비가 와요. 그래서 집에 있어요.',
          '그러니까 can push advice or a request: 비가 와요. 그러니까 우산을 가져가세요.',
        ] },
        { with: ['connector:-(으)니까'], title: '그러니까 vs -(으)니까', points: [
          '그러니까 starts the next sentence: 비가 와요. 그러니까 …',
          '-(으)니까 joins inside one sentence: 비가 오니까 우산을 가져가세요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:왜냐하면', section: 'connectors', category: 'Reason & purpose',
    korean: '왜냐하면', meaning: 'because (the reason follows)',
    grammar: {
      speech: '왜냐하면',
      forms: [
        { form: '왜냐하면', when: 'at the start of the reason sentence, often closed with -기 때문이에요 or -거든요' },
        { form: '왜냐면', when: 'shorter, casual' },
      ],
      examples: [
        { korean: '오늘은 집에 있어요. [왜냐하면] 비가 오기 때문이에요.', english: 'I\'m staying home today. Because it\'s raining.',
          gap: ['그래서', '그러니까', '그래도'],
          why: 'The reason comes second, ending in -기 때문이에요: 왜냐하면. 그래서 would bring a result, not a reason.' },
        { korean: '한국어를 배워요. [왜냐하면] 케이팝을 좋아하거든요.', english: 'I\'m learning Korean. Because I like K-pop.',
          gap: ['그런데', '아니면', '그러면'],
          why: '왜냐하면 opens the reason and -거든요 closes it. 그러면 would set a condition instead.' },
        { korean: '커피를 안 마셔요. [왜냐하면] 잠을 못 자기 때문이에요.', english: 'I don\'t drink coffee. Because I can\'t sleep.',
          gap: ['하지만', '그리고', '또는'],
          why: 'Not sleeping is the reason for skipping coffee: 왜냐하면. 하지만 would set the two facts against each other.' },
      ],
      rules: [
        'Starts a second sentence that gives the reason for the first: result first, reason second.',
        'End the reason sentence with -기 때문이에요 or -거든요: 왜냐하면 바쁘기 때문이에요.',
        'A bit formal or emphatic; in speech one sentence with -아서/어서 or -(으)니까 is more common.',
        'Casual short form: 왜냐면.',
      ],
      tricks: [
        'Literally \'if you ask why\': 왜 (why) + 하면 (if one says). The answer follows.',
        'Order check: result. 왜냐하면 reason. With 그래서 it flips: reason. 그래서 result.',
      ],
      comparisons: [
        { with: ['connector:그래서'], title: '왜냐하면 vs 그래서', points: [
          '그래서: reason first, result second: 비가 와요. 그래서 집에 있어요.',
          '왜냐하면: result first, reason second: 집에 있어요. 왜냐하면 비가 오기 때문이에요.',
        ] },
        { with: ['connector:-아서/어서', 'connector:-(으)니까'], title: '왜냐하면 vs -아서/어서 / -(으)니까', points: [
          'In conversation, one sentence with -아서/어서 or -(으)니까 is more natural: 비가 와서 집에 있어요.',
          '왜냐하면 adds the reason afterwards, a bit more formal or emphatic.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-아서/어서', section: 'connectors', category: 'Reason & purpose',
    korean: '-아서/어서', meaning: 'so / because / and then',
    grammar: {
      speech: '좋아서, 먹어서',
      forms: [
        { form: '-아서', when: 'last vowel ㅏ or ㅗ: 좋아서, 작아서; 가 + 아서 → 가서, 오 + 아서 → 와서' },
        { form: '-어서', when: 'any other vowel: 먹어서, 재미있어서; 마시 + 어서 → 마셔서' },
        { form: '해서', when: '하다 → 해서: 공부해서, 피곤해서' },
        { form: '이라서', when: 'after a noun (이다): 학생이라서; after a vowel 라서: 의사라서' },
      ],
      examples: [
        { korean: '이 가방은 너무 비싸[서] 안 사요.', english: 'This bag is too expensive, so I\'m not buying it.',
          gap: ['도', '지만', '고'],
          why: 'The price is the reason you don\'t buy it: -아서. -도 would mean even though, the opposite logic.' },
        { korean: '친구를 만나[서] 영화를 봐요.', english: 'I meet a friend and we watch a movie.',
          gap: ['거나', '는데', '니까'],
          why: 'Meeting the friend leads into the movie together: -아서 links the steps. -거나 would make it one or the other.' },
        { korean: '저는 학생[이라서] 돈이 없어요.', english: 'I\'m a student, so I don\'t have money.',
          gap: ['이지만', '이거나', '이면'],
          why: 'Being a student is the reason: 이라서, the noun form of -아서. 이지만 would turn it into a contrast.' },
      ],
      rules: [
        'Vowel rule as in 해요 forms: ㅏ/ㅗ → 아서, other vowels → 어서, 하다 → 해서. Nouns: 이라서.',
        'No past tense before it: 어제 일을 많이 해서 피곤했어요, never 했어서.',
        'As because, the second part can\'t be a command or let\'s; use -(으)니까 for that.',
        'As and then, the steps are linked (same place or object): 가서 먹어요 = go and eat there.',
      ],
      tricks: [
        'Take the 해요 form, drop 요, add 서: 좋아요 → 좋아서, 와요 → 와서, 해요 → 해서.',
        'You already know it: 만나서 반가워요 (nice to meet you), 늦어서 미안해요 (sorry I\'m late).',
      ],
      comparisons: [
        { with: ['connector:-(으)니까'], title: '-아서/어서 vs -(으)니까', points: [
          'Both give a reason. -아서/어서 just states it: no past tense, no command after it.',
          '-(으)니까 is fine with commands and past tense: 비가 오니까 우산을 가져가세요.',
        ] },
        { with: ['connector:-고'], title: '-아서/어서 vs -고 (and then)', points: [
          '학교에 가서 공부해요: go to school and study there (linked steps).',
          '학교에 가고 친구도 만나요: go to school, and also meet friends (two separate things).',
        ] },
      ],
    },
  },
  {
    id: 'connector:-(으)니까', section: 'connectors', category: 'Reason & purpose',
    korean: '-(으)니까', meaning: 'because / since',
    grammar: {
      speech: '가니까, 먹으니까',
      forms: [
        { form: '-으니까', when: 'after a consonant: 먹으니까, 좋으니까' },
        { form: '-니까', when: 'after a vowel: 가니까, 비싸니까; ㄹ drops: 살다 → 사니까, 멀다 → 머니까' },
        { form: '이니까', when: 'after a noun (이다): 학생이니까; after a vowel just 니까: 의사니까' },
      ],
      examples: [
        { korean: '비가 오[니까] 우산을 가져가세요.', english: 'It\'s raining, so take an umbrella.',
          gap: ['으니까', '지만', '거나'],
          why: 'A reason plus a command calls for -(으)니까. 오 ends in a vowel, so 니까, not 으니까.' },
        { korean: '이 식당은 맛있[으니까] 같이 가요.', english: 'This restaurant is delicious, so let\'s go together.',
          gap: ['어서', '니까', '지만'],
          why: '있 ends in a consonant, so 으니까. A suggestion (let\'s go) rules out -어서.' },
        { korean: '청소를 다 했[으니까] 커피 마셔요.', english: 'We\'ve finished cleaning, so let\'s have coffee.',
          gap: ['어서', '지만', '거나'],
          why: 'Past tense is fine before -(으)니까: 했으니까. 했어서 never works, and -어서 can\'t lead into let\'s.' },
      ],
      rules: [
        '으니까 after a consonant (먹으니까), 니까 after a vowel (가니까); a final ㄹ drops: 살다 → 사니까.',
        'Unlike -아서/어서, it works before commands and suggestions: 비가 오니까 우산을 가져가세요.',
        'Past tense is fine before it: 했으니까, 먹었으니까.',
      ],
      tricks: [
        'Command or let\'s after the reason? Choose -(으)니까, never -아서/어서.',
        '그러니까 is the sentence-starting version: 비가 와요. 그러니까 우산을 가져가세요.',
      ],
      comparisons: [
        { with: ['connector:-아서/어서'], title: '-(으)니까 vs -아서/어서', points: [
          '-아서/어서 states a cause, often for feelings and set phrases: 늦어서 미안해요.',
          '-(으)니까 gives a reason you can act on: 늦었으니까 택시를 타요 (we\'re late, so let\'s take a taxi).',
        ] },
        { with: ['connector:그러니까'], title: '-(으)니까 vs 그러니까', points: [
          '-(으)니까 joins inside one sentence: 비가 오니까 우산을 가져가세요.',
          '그러니까 starts the next one: 비가 와요. 그러니까 우산을 가져가세요.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-(으)러', section: 'connectors', category: 'Reason & purpose',
    korean: '-(으)러', meaning: 'in order to (before verbs of motion)',
    grammar: {
      speech: '사러, 먹으러',
      forms: [
        { form: '-으러', when: 'after a consonant: 먹으러, 읽으러' },
        { form: '-러', when: 'after a vowel or ㄹ: 사러, 보러, 놀러, 만들러' },
      ],
      examples: [
        { korean: '빵을 사[러] 마트에 가요.', english: 'I\'m going to the supermarket to buy bread.',
          gap: ['서', '고', '으러'],
          why: 'Buying bread is why you go: -러 + 가요. 사 ends in a vowel, so 러, not 으러.' },
        { korean: '친구가 밥을 먹[으러] 우리 집에 와요.', english: 'My friend is coming to my place to eat.',
          gap: ['어서', '고', '는데'],
          why: 'Eating is the purpose of coming: -으러 + 와요. -고 would mean your friend eats first, then comes.' },
        { korean: '주말에 수영하[러] 가요.', english: 'On weekends I go swimming.',
          gap: ['면', '지만', '거나'],
          why: 'Swimming is the reason for going: -러 + 가요. -면 would make swimming a condition.' },
      ],
      rules: [
        'Only before verbs of coming and going: 가다, 오다, 다니다 (and 나가다, 들어오다…).',
        '으러 after a consonant (먹으러), 러 after a vowel or ㄹ (보러, 놀러).',
        'No tense on it; the tense goes on 가다 / 오다: 먹으러 갔어요.',
        'With other verbs, in order to is -(으)려고: 사려고 돈을 모아요.',
      ],
      tricks: [
        'Picture the trip: purpose + 러 + 가요 / 와요. No 가요 or 와요, no -러.',
        'Everyday combos: 밥 먹으러 가요, 영화 보러 가요, 놀러 와요.',
      ],
      comparisons: [
        { with: ['connector:-아서/어서'], title: '-(으)러 vs -아서/어서', points: [
          '빵을 사러 가요: go in order to buy bread (purpose).',
          '빵을 사서 가요: buy bread, then go with it.',
        ] },
        { with: ['particle:에'], title: '-(으)러 with 에', points: [
          'The place takes 에 and the purpose takes -(으)러: 마트에 빵을 사러 가요.',
          'The order is flexible: 빵을 사러 마트에 가요 also works.',
        ] },
      ],
    },
  },
  {
    id: 'connector:그러면', section: 'connectors', category: 'Condition & sequence',
    korean: '그러면', meaning: 'then / if so (in that case)',
    grammar: {
      speech: '그러면',
      forms: [
        { form: '그러면', when: 'at the start of a reply or the next sentence: \'if so, …\'' },
        { form: '그럼', when: 'short form, very common in speech' },
      ],
      examples: [
        { korean: '커피를 안 마셔요? [그러면] 녹차를 마셔요.', english: 'You don\'t drink coffee? Then have green tea.',
          gap: ['그래도', '왜냐하면', '그런데'],
          why: 'The first sentence sets a condition and 그러면 gives the advice for it. 그래도 would push back instead.' },
        { korean: '배가 고파요? [그러면] 밥을 먹어요.', english: 'Hungry? Then eat something.',
          gap: ['그래서', '하지만', '아니면'],
          why: '그러면 = if so: if you\'re hungry, eat. 하지만 would set up a contrast.' },
        { korean: '10분 걸어가세요. [그러면] 지하철역이 있어요.', english: 'Walk for ten minutes. Then you\'ll find the subway station.',
          gap: ['그리고', '그래도', '아니면'],
          why: 'Do the walking and the station appears: 그러면 = if you do that. 그리고 would just add a fact.' },
      ],
      rules: [
        'Starts the next sentence: \'if so, in that case\', building on what was just said.',
        'Very common in replies and advice; casual speech shortens it to 그럼: 그럼 내일 봐요!',
        'Inside one sentence, use -(으)면 on the verb: 배가 고프면 밥을 먹어요.',
      ],
      tricks: [
        '그러 (be so) + 면 (if) = if so → then.',
        '그럼 also wraps up a talk: 그럼 안녕히 가세요 (well then, goodbye).',
      ],
      comparisons: [
        { with: ['connector:-(으)면'], title: '그러면 vs -(으)면', points: [
          '그러면 starts a new sentence: 배가 고파요? 그러면 밥을 먹어요.',
          '-(으)면 joins inside one sentence: 배가 고프면 밥을 먹어요.',
        ] },
        { with: ['connector:그래서'], title: '그러면 vs 그래서', points: [
          '그래서 reports a real result: 배가 고파요. 그래서 밥을 먹어요 (I\'m hungry, so I eat).',
          '그러면 reacts to a condition, often with advice: 배가 고파요? 그러면 밥을 먹어요 (then eat).',
        ] },
      ],
    },
  },
  {
    id: 'connector:-(으)면', section: 'connectors', category: 'Condition & sequence',
    korean: '-(으)면', meaning: 'if / when',
    grammar: {
      speech: '가면, 먹으면',
      forms: [
        { form: '-으면', when: 'after a consonant: 먹으면, 좋으면' },
        { form: '-면', when: 'after a vowel or ㄹ: 가면, 비싸면, 살면 (the ㄹ stays)' },
        { form: '이면', when: 'after a noun (이다): 학생이면; after a vowel just 면: 의사면' },
      ],
      examples: [
        { korean: '비가 오[면] 집에 있어요.', english: 'If it rains, I stay home.',
          gap: ['으면', '니까', '지만'],
          why: 'A condition that may or may not happen: -면. 오 ends in a vowel, so 면, not 으면.' },
        { korean: '시간이 있[으면] 같이 영화 봐요.', english: 'If you have time, let\'s watch a movie together.',
          gap: ['어서', '지만', '고'],
          why: 'Having time is the condition; 있 ends in a consonant, so 으면. -어서 can\'t lead into let\'s.' },
        { korean: '피곤하[면] 일찍 자요.', english: 'When I\'m tired, I go to bed early.',
          gap: ['지만', '거나', '러'],
          why: 'Whenever you\'re tired, you sleep early: -면 also means when. -지만 would oppose the two.' },
      ],
      rules: [
        '으면 after a consonant (먹으면), 면 after a vowel (가면). Stems in ㄹ just add 면: 살면, 멀면.',
        'Means if for possible events and when for regular ones: 봄이 오면 따뜻해요.',
        'No future marker inside the 면-part: 내일 비가 오면 집에 있을 거예요.',
        'Nouns take 이면 (학생이면), or 면 after a vowel (의사면).',
      ],
      tricks: [
        'Spot the condition first, then the main point: X-(으)면, Y.',
        'ㄹ-stems keep their ㄹ: 살면 (if I live). 사면 is a different verb: if I buy.',
      ],
      comparisons: [
        { with: ['connector:그러면'], title: '-(으)면 vs 그러면', points: [
          '-(으)면 joins inside one sentence: 배가 고프면 밥을 먹어요.',
          '그러면 starts the next sentence: 배가 고파요? 그러면 밥을 먹어요.',
        ] },
        { with: ['connector:-(으)니까'], title: '-(으)면 vs -(으)니까', points: [
          '-(으)면: maybe, or every time: 비가 오면 집에 있어요 (if it rains).',
          '-(으)니까: it\'s a fact now: 비가 오니까 집에 있어요 (since it\'s raining).',
        ] },
      ],
    },
  },
  {
    id: 'connector:그다음에', section: 'connectors', category: 'Condition & sequence',
    korean: '그다음에', meaning: 'then / after that / next',
    grammar: {
      speech: '그다음에',
      forms: [
        { form: '그다음에', when: 'at the start of the next step: …요. 그다음에 …요.' },
      ],
      examples: [
        { korean: '아침에 일어나요. [그다음에] 샤워해요.', english: 'I get up in the morning. Then I take a shower.',
          gap: ['그래서', '그래도', '그런데'],
          why: 'One step after another: 그다음에. 그래서 would make getting up the reason for the shower.' },
        { korean: '먼저 손을 씻어요. [그다음에] 밥을 먹어요.', english: 'First wash your hands. Then eat.',
          gap: ['왜냐하면', '아니면', '그렇지만'],
          why: '먼저 … 그다음에 is first … then. 아니면 would offer eating instead of washing.' },
        { korean: '도서관에서 공부했어요. [그다음에] 친구를 만났어요.', english: 'I studied at the library. After that, I met a friend.',
          gap: ['그러면', '또는', '그러니까'],
          why: 'Past events in order: 그다음에 = after that. 그러면 is for conditions, not a timeline.' },
      ],
      rules: [
        'Starts the next step in a sequence: …요. 그다음에 …요. Great with 먼저 (first): 먼저 …, 그다음에 ….',
        'Inside one sentence, use -고 나서 (after finishing) or -고: 손을 씻고 나서 밥을 먹어요.',
        '다음에 on its own means next time: 다음에 봐요! (See you next time!)',
      ],
      tricks: [
        '그 (that) + 다음 (next) + 에 (at): at the next thing after that.',
        'Telling steps in order: 먼저 (first), 그다음에 (then), 마지막으로 (finally).',
      ],
      comparisons: [
        { with: ['connector:-고 나서'], title: '그다음에 vs -고 나서', points: [
          '그다음에 starts a new sentence: 손을 씻어요. 그다음에 밥을 먹어요.',
          '-고 나서 attaches to the first verb, all in one sentence: 손을 씻고 나서 밥을 먹어요.',
        ] },
        { with: ['connector:그리고'], title: '그다음에 vs 그리고', points: [
          '그리고 just adds: and.',
          '그다음에 stresses the order: first this, then that, as in steps or directions.',
        ] },
      ],
    },
  },
  {
    id: 'connector:-고 나서', section: 'connectors', category: 'Condition & sequence',
    korean: '-고 나서', meaning: 'after (finishing)',
    grammar: {
      speech: '먹고 나서',
      forms: [
        { form: '-고 나서', when: 'after any verb stem, no change: 먹고 나서, 보고 나서, 공부하고 나서' },
      ],
      examples: [
        { korean: '밥을 먹[고 나서] 커피를 마셔요.', english: 'After eating, I drink coffee.',
          gap: ['거나', '지만', '으러'],
          why: 'First the meal, finished, then coffee: -고 나서. -거나 would make it one or the other.' },
        { korean: '운동하[고 나서] 샤워해요.', english: 'After exercising, I take a shower.',
          gap: ['는데', '니까', '거나'],
          why: 'The shower comes once the workout is done: -고 나서. -니까 would make exercise the reason, not the timing.' },
        { korean: '영화를 보[고 나서] 저녁을 먹었어요.', english: 'After watching the movie, we had dinner.',
          gap: ['면', '러', '지만'],
          why: 'Past events in order, tense on the last verb: 보고 나서 … 먹었어요. -면 can\'t describe what already happened.' },
      ],
      rules: [
        'Attaches to verb stems with no change: 먹고 나서, 보고 나서. The first action is fully finished first.',
        'Past tense only on the last verb: 영화를 보고 나서 저녁을 먹었어요.',
        'Built from -고 + 나다 (a helper verb: be done) + -아서: 나 + 아서 → 나서.',
        'Starting a new sentence instead? Use 그다음에 or 그러고 나서 (not 그리고 나서).',
      ],
      tricks: [
        'Think \'done, then\': -고 나서 = do A, be done, then B.',
        '-고 alone can also mean and then; add 나서 to stress that A is completely over.',
      ],
      comparisons: [
        { with: ['connector:그다음에'], title: '-고 나서 vs 그다음에', points: [
          '-고 나서 attaches to the first verb, one sentence: 손을 씻고 나서 밥을 먹어요.',
          '그다음에 starts the next sentence: 손을 씻어요. 그다음에 밥을 먹어요.',
        ] },
        { with: ['connector:-고'], title: '-고 나서 vs -고', points: [
          '-고 can list or sequence: 밥을 먹고 커피를 마셔요.',
          '-고 나서 makes the order explicit: only once the meal is over, the coffee.',
        ] },
      ],
    },
  },
  {
    id: 'particle:은/는', section: 'particles', category: 'Sentence roles',
    korean: '은/는', meaning: 'topic marker / as for',
    grammar: {
      speech: '은, 는',
      forms: [
        { form: '은', when: 'after a consonant: 책은, 이름은' },
        { form: '는', when: 'after a vowel: 저는, 커피는' },
        { form: 'ㄴ', when: 'casual, after a vowel: 저는 → 전, 나는 → 난' },
      ],
      examples: [
        { korean: '제 이름[은] 알렉스예요.', english: 'My name is Alex.',
          gap: ['는', '을', '도'],
          why: '이름 ends in a consonant, so 은 (는 is for vowels). 도 would say \'my name is Alex too\'.' },
        { korean: '저는 커피를 좋아해요. 차[는] 안 좋아해요.', english: 'I like coffee. Tea, I don\'t like.',
          gap: ['가', '도', '은'],
          why: 'Contrast (coffee yes, tea no) takes 는. 가 would make the tea the one doing the liking.' },
        { korean: '저는 커피 마셔요. 민수 씨[는]요?', english: 'I\'m having coffee. What about you, Minsu?',
          gap: ['가', '도', '를'],
          why: 'Name + 는요? asks \'what about you?\'. 도 would assume Minsu is having coffee too.' },
      ],
      rules: [
        '은 after a consonant (책은), 는 after a vowel (저는). Casual speech often shortens 는 to ㄴ: 저는 → 전, 나는 → 난.',
        'It marks what the sentence is about, usually something already known: yourself (저는…), something just mentioned, or a general fact.',
        'It adds contrast: 커피는 좋아해요. 차는 안 좋아해요. Placed mid-sentence, 은/는 almost always sounds contrastive.',
        'It replaces 이/가 and 을/를 (never 커피를는), but follows other particles: 학교에서는, 주말에는.',
      ],
      tricks: [
        'If \'As for…\' fits in English, 은/는 fits in Korean: as for me → 저는, as for tea → 차는.',
        '\'What about you?\' is just a name + 는요: 저는 학생이에요. 민수 씨는요?',
        'After a consonant, the form starting with a vowel sound (은); after a vowel, the one starting with a consonant (는). Same for 이/가, 을/를.',
      ],
      comparisons: [
        { with: ['particle:이/가'], title: '은/는 vs 이/가: known topic vs new info', points: [
          '은/는 = what we\'re talking about, already known; the news comes after it: 저는 개발자예요 (as for me, I\'m a developer).',
          '이/가 = the subject itself is the news: 누가 개발자예요? 제가 개발자예요 (I\'m the one who\'s the developer).',
          'Something new appears: 저기 카페가 있어요. Already known: 카페는 저기 있어요 (the café is over there).',
        ] },
        { with: ['particle:도'], title: '은/는 vs 도', points: [
          'After \'I like coffee\': 차는 안 좋아해요 = tea, on the other hand, no. 차도 좋아해요 = I like tea too.',
          'Both take the place of 이/가 and 을/를: 저는 / 저도, 커피는 / 커피도.',
        ] },
      ],
    },
  },
  {
    id: 'particle:이/가', section: 'particles', category: 'Sentence roles',
    korean: '이/가', meaning: 'subject marker',
    grammar: {
      speech: '이, 가',
      forms: [
        { form: '이', when: 'after a consonant: 책이, 물이' },
        { form: '가', when: 'after a vowel: 커피가, 친구가' },
        { form: '제가 · 내가 · 누가', when: '저, 나, 누구 + 가: the word changes shape' },
        { form: '께서', when: 'honorific, for someone you respect: 할머니께서' },
      ],
      examples: [
        { korean: '누가 왔어요? 민수[가] 왔어요.', english: 'Who came? Minsu came.',
          gap: ['는', '이', '를'],
          why: 'The answer to \'who?\' is the new information, so 가. 는 would treat Minsu as old, known background.' },
        { korean: '저기 카페[가] 있어요.', english: 'There\'s a café over there.',
          gap: ['는', '를', '에'],
          why: 'Something new that exists takes 가 with 있어요. 카페에 있어요 would mean \'I\'m at the café\'.' },
        { korean: '저는 학생[이] 아니에요. 회사원이에요.', english: 'I\'m not a student. I\'m an office worker.',
          gap: ['가', '을', '에'],
          why: '아니에요 takes 이/가 on the noun, and 학생 ends in a consonant, so 이, not 가.' },
      ],
      rules: [
        '이 after a consonant (물이), 가 after a vowel (커피가). 저, 나, 누구 + 가 become 제가, 내가, 누가.',
        'Use it for new information: the answer to who/what, something that appears or exists (카페가 있어요), or is missing (시간이 없어요).',
        'Question words take 이/가, not 은/는: 누가, 뭐가, 어디가. So do 아니에요 and 되다: 학생이 아니에요, 의사가 돼요.',
        'With adjectives, the thing described takes 이/가: 날씨가 더워요, 커피가 맛있어요.',
      ],
      tricks: [
        'A who/what question and its answer both take 이/가: 뭐가 맛있어요? 김치가 맛있어요.',
        '제가 hides an old 이: 저 + 이 became 제, then 가 was added on top. Same with 내가 (나 + 이).',
      ],
      comparisons: [
        { with: ['particle:은/는'], title: '이/가 vs 은/는: questions and answers', points: [
          'Who/what questions and their answers take 이/가: 누가 왔어요? 민수가 왔어요. 은/는 doesn\'t go on a question word.',
          'Same words, different focus: 제가 개발자예요 = I\'m the one who\'s the developer. 저는 개발자예요 = as for me, I\'m a developer.',
          'With 있어요/없어요, new things take 이/가: 질문이 있어요 (I have a question). 은/는 there sounds like a contrast.',
        ] },
        { with: ['particle:을/를'], title: '이/가 vs 을/를: 좋아요 vs 좋아해요', points: [
          '좋아요 is an adjective (is good), so the thing takes 이/가: 커피가 좋아요. 좋아해요 is a verb (to like): 커피를 좋아해요.',
          'Both mean \'I like coffee\'. Same split for 싫어요 / 싫어해요: 비가 싫어요, 비를 싫어해요.',
        ] },
      ],
    },
  },
  {
    id: 'particle:을/를', section: 'particles', category: 'Sentence roles',
    korean: '을/를', meaning: 'object marker',
    grammar: {
      speech: '을, 를',
      forms: [
        { form: '을', when: 'after a consonant: 빵을, 책을' },
        { form: '를', when: 'after a vowel: 커피를, 영화를' },
        { form: 'ㄹ', when: 'casual, after a vowel: 나를 → 날, 저를 → 절' },
      ],
      examples: [
        { korean: '저는 빵[을] 먹어요.', english: 'I eat bread.',
          gap: ['를', '이', '에서'],
          why: '빵 ends in a consonant, so 을. With 이, the bread would be the one doing the eating.' },
        { korean: '저는 한국 음식[을] 좋아해요.', english: 'I like Korean food.',
          gap: ['이', '를', '에'],
          why: '좋아해요 is a verb that takes an object: 음식을. 이 goes with the adjective 좋아요.' },
        { korean: '어제 친구[를] 만났어요.', english: 'I met a friend yesterday.',
          gap: ['가', '에게', '을'],
          why: '만나요 takes a direct object: 친구를 만나요. 에게 is for giving or saying something to someone.' },
      ],
      rules: [
        '을 after a consonant (빵을), 를 after a vowel (커피를). Casual speech shortens 를 to ㄹ: 나를 → 날, 저를 → 절.',
        'It marks what the action is done to: what you eat, drink, watch, buy, like or meet. It comes before the verb: 커피를 마셔요.',
        'Some English \'with/on\' verbs take 을/를 in Korean: 친구를 만나요 (meet with a friend), 버스를 타요 (get on the bus).',
        'In speech it\'s often dropped when obvious: 밥 먹어요, 커피 마셔요.',
      ],
      tricks: [
        'Ask \'WHAT?\' after the verb: eat what? Bread → 빵을 먹어요.',
        '좋아해요/싫어해요 take 을/를; 좋아요/싫어요 take 이/가. Same meaning, different particle.',
      ],
      comparisons: [
        { with: ['particle:이/가'], title: '을/를 vs 이/가', points: [
          '이/가 = who does it; 을/를 = what it\'s done to: 친구가 빵을 먹어요 (my friend eats bread).',
          '좋아해요 → 을/를: 커피를 좋아해요. 좋아요 → 이/가: 커피가 좋아요. Both mean \'I like coffee\'.',
        ] },
        { with: ['particle:은/는'], title: '을/를 vs 은/는', points: [
          'For contrast, 은/는 replaces 을/를: 커피는 마셔요. 차는 안 마셔요. Never stack them: 커피를는 ✗.',
          '커피를 마셔요 is neutral; 커피는 마셔요 hints \'but not something else\'.',
        ] },
      ],
    },
  },
  {
    id: 'particle:의', section: 'particles', category: 'Sentence roles',
    korean: '의', meaning: '\'s / of (possessive)',
    grammar: {
      speech: '의',
      forms: [
        { form: '의', when: 'after any noun; usually said [에]: 친구의, 한국의' },
        { form: '제', when: '저 + 의 → 제 (my, polite): 제 이름' },
        { form: '내', when: '나 + 의 → 내 (my, casual): 내 친구' },
      ],
      examples: [
        { korean: '이건 친구[의] 가방이에요.', english: 'This is my friend\'s bag.',
          gap: ['에', '가', '를'],
          why: '의 links owner and thing: a friend\'s bag. It\'s often said like 에, but 에 means at/to.' },
        { korean: '선생님[의] 책상은 커요.', english: 'The teacher\'s desk is big.',
          gap: ['에', '을', '에서'],
          why: 'Owner + 의 + thing. 에서 marks where an action happens, and never follows a person.' },
        { korean: '오늘[의] 커피는 뭐예요?', english: 'What\'s the coffee of the day?',
          gap: ['에', '을', '이'],
          why: '오늘의 커피 = today\'s coffee, the coffee of the day. 오늘 never takes 에.' },
      ],
      rules: [
        'Owner, then 의, then the thing: 친구의 가방 (a friend\'s bag), 한국의 수도 (the capital of Korea). Same shape after any noun.',
        'As a particle it\'s usually said [에], but always spelled 의. Don\'t mix it up with 에 (at/to).',
        'Everyday speech often drops it: 친구 가방, 우리 집. And 저의 → 제, 나의 → 내: 제 이름, 내 친구.',
      ],
      tricks: [
        'Read 의 as English \'s, in the same order: Korea\'s capital = 한국의 수도.',
        '제 = 저 + 의 squeezed into one syllable; 내 = 나 + 의. Both mean \'my\'.',
      ],
      comparisons: [
        { with: ['particle:에'], title: '의 vs 에', points: [
          'They often sound alike, but 친구의 집 = my friend\'s house, while 친구 집에 가요 = I go to my friend\'s house.',
          '의 joins two nouns (A\'s B). 에 links a noun to a verb: 학교에 가요, 집에 있어요.',
        ] },
        { with: ['particle:이/가'], title: '제 (my) vs 제가 (I)', points: [
          '제 + noun = my: 제 이름 (my name). 제가 + verb = I, as the subject: 제가 할게요 (I\'ll do it).',
          'Casual speech works the same: 내 친구 (my friend) vs 내가 (I).',
        ] },
      ],
    },
  },
  {
    id: 'particle:에', section: 'particles', category: 'Place & time',
    korean: '에', meaning: 'at / in / to (place, time)',
    grammar: {
      speech: '에',
      forms: [
        { form: '에', when: 'after any noun, vowel or consonant: 학교에, 집에, 세 시에' },
      ],
      examples: [
        { korean: '내일 학교[에] 가요.', english: 'I\'m going to school tomorrow.',
          gap: ['에서', '의', '가'],
          why: 'A destination takes 에. 에서 would mean leaving from the school.' },
        { korean: '지갑이 가방[에] 있어요.', english: 'The wallet is in the bag.',
          gap: ['에서', '을', '의'],
          why: '있어요 just says where something is, so 에. 에서 is for where an action happens.' },
        { korean: '토요일[에] 영화를 봐요.', english: 'I watch a movie on Saturday.',
          gap: ['에서', '까지', '를'],
          why: 'A day or a clock time takes 에. 까지 would mean \'until Saturday\'.' },
      ],
      rules: [
        '에 marks where something is (집에 있어요), where you\'re going (학교에 가요), and when (세 시에, 토요일에).',
        'No 에 after 오늘, 어제, 내일 or 지금: 내일 가요, not 내일에 가요.',
        'For people and animals use 에게/한테: 친구한테 줘요, not 친구에 줘요.',
        'Being or going → 에; doing something there → 에서: 카페에 가요, 카페에서 일해요.',
      ],
      tricks: [
        'Picture a pin on a map or a clock: where it is, where you go, what time. Action at the pin? Switch to 에서.',
        'Verb test: 있어요, 없어요, 가요, 와요 → 에.',
      ],
      comparisons: [
        { with: ['particle:에서'], title: '에 vs 에서', points: [
          '에 = where something is or goes: 집에 있어요, 학교에 가요. 에서 = where an action happens: 집에서 쉬어요.',
          'Same place, different verbs: 카페에 가요 (go to the café) vs 카페에서 커피를 마셔요 (drink coffee at the café).',
          '에서 can also mean \'from\' a place: 한국에서 왔어요. 에 never means \'from\'.',
        ] },
        { with: ['particle:(으)로'], title: '에 vs (으)로', points: [
          'Both work for going places: 학교에 가요 ≈ 학교로 가요. 에 names the goal, (으)로 the direction.',
          'Only (으)로 for tools and transport (버스로, 손으로); only 에 for time and 있어요 (세 시에, 집에 있어요).',
        ] },
      ],
    },
  },
  {
    id: 'particle:에서', section: 'particles', category: 'Place & time',
    korean: '에서', meaning: 'at / in (place of action) / from',
    grammar: {
      speech: '에서',
      forms: [
        { form: '에서', when: 'after a place: 집에서, 학교에서' },
        { form: '서', when: 'short form after 여기, 거기, 저기, 어디: 여기서, 어디서' },
      ],
      examples: [
        { korean: '저는 도서관[에서] 공부해요.', english: 'I study at the library.',
          gap: ['에', '에게', '의'],
          why: 'Studying is an action, so the place takes 에서. 에 is for being somewhere or going there.' },
        { korean: '친구가 한국[에서] 왔어요.', english: 'My friend came from Korea.',
          gap: ['에', '부터', '의'],
          why: 'Coming from a place takes 에서. 에 would mean the friend came to Korea.' },
        { korean: '어디[서] 만나요?', english: 'Where do we meet?',
          gap: ['에게', '가', '를'],
          why: 'Meeting is an action, so 에서, shortened to 서 after 어디. 에게 is only for people.' },
      ],
      rules: [
        'Use 에서 for where an action happens: 집에서 쉬어요, 카페에서 일해요. Just being or going somewhere takes 에.',
        'It also marks \'from\' a place: 한국에서 왔어요, 집에서 회사까지. For \'from\' a time, use 부터.',
        'After 여기, 거기, 저기, 어디 it often shortens to 서: 여기서, 어디서.',
        'Places only: \'from\' a person is 에게서/한테서.',
      ],
      tricks: [
        'Doing something there? 에서. Just there, or heading there? 에.',
        'Trip pattern: A에서 B까지 = from A to B: 서울에서 부산까지.',
      ],
      comparisons: [
        { with: ['particle:에'], title: '에서 vs 에', points: [
          '에서: the action happens there (식당에서 먹어요). 에: something is there or goes there (식당에 있어요, 식당에 가요).',
          'Coming from: 학교에서 와요. Going to: 학교에 가요.',
        ] },
        { with: ['particle:부터'], title: '에서 vs 부터', points: [
          'Both can mean \'from\': places take 에서 (집에서), times take 부터 (아침부터).',
          'Both pair with 까지: 집에서 회사까지 (from home to work), 아침부터 밤까지 (from morning to night).',
        ] },
      ],
    },
  },
  {
    id: 'particle:부터', section: 'particles', category: 'Place & time',
    korean: '부터', meaning: 'from (a time) / starting with',
    grammar: {
      speech: '부터',
      forms: [
        { form: '부터', when: 'after a time word or other noun: 아침부터, 월요일부터, 손부터' },
      ],
      examples: [
        { korean: '월요일[부터] 금요일까지 일해요.', english: 'I work from Monday to Friday.',
          gap: ['까지', '에', '만'],
          why: '부터 opens the span and 까지 closes it. 에 would pin one day instead.' },
        { korean: '어제[부터] 머리가 아파요.', english: 'I\'ve had a headache since yesterday.',
          gap: ['에', '까지', '에서'],
          why: 'Since yesterday = a starting point in time, so 부터. 까지 would mean \'until yesterday\'.' },
        { korean: '뭐[부터] 먹을까요?', english: 'What shall we eat first?',
          gap: ['까지', '에', '에서'],
          why: '부터 marks what comes first. 까지 would ask how far to go.' },
      ],
      rules: [
        '부터 marks a starting point, mostly in time: 아침부터, 월요일부터. Close the span with 까지: 아홉 시부터 여섯 시까지.',
        'A starting place usually takes 에서: 서울에서 출발해요. 부터 is for times, and for ranges like 1번부터 (from number 1).',
        'It can mean \'X first, then the rest\': 손부터 씻어요 (wash your hands first), 뭐부터 할까요?',
        'Handy phrases: 지금부터 (from now on), 내일부터 (starting tomorrow), 처음부터 (from the beginning).',
      ],
      tricks: [
        'Start line 부터, finish line 까지: every race needs both.',
        'Time \'from\' → 부터; place \'from\' → 에서. The end is 까지 either way.',
      ],
      comparisons: [
        { with: ['particle:까지'], title: '부터 vs 까지', points: [
          '부터 = the start, 까지 = the end: 월요일부터 금요일까지 (Monday to Friday).',
          'Each works alone: 내일부터 (from tomorrow on), 내일까지 (until or by tomorrow).',
        ] },
        { with: ['particle:에서'], title: '부터 vs 에서', points: [
          'From a time → 부터: 아침부터. From a place → 에서: 집에서.',
          'Trip: 집에서 회사까지. Workday: 아홉 시부터 여섯 시까지.',
        ] },
      ],
    },
  },
  {
    id: 'particle:까지', section: 'particles', category: 'Place & time',
    korean: '까지', meaning: 'until / up to / by (a deadline)',
    grammar: {
      speech: '까지',
      forms: [
        { form: '까지', when: 'after a time, place or other noun: 여섯 시까지, 부산까지' },
      ],
      examples: [
        { korean: '저는 여섯 시[까지] 일해요.', english: 'I work until six.',
          gap: ['부터', '에', '에서'],
          why: '까지 marks the end: until six. 부터 would mean starting at six.' },
        { korean: '서울에서 부산[까지] 기차로 가요.', english: 'I go from Seoul to Busan by train.',
          gap: ['부터', '에서', '만'],
          why: '에서 … 까지 = from … to. 부터 marks a start, not the end point.' },
        { korean: '다섯 시[까지] 오세요.', english: 'Please come by five.',
          gap: ['부터', '에서', '도'],
          why: 'With a deadline, 까지 means \'by\': by five. 부터 would mean \'from five on\'.' },
      ],
      rules: [
        '까지 marks the end point: of time (여섯 시까지, until six) or of a trip (부산까지, as far as Busan).',
        'Pair it with a start: 부터…까지 for time, 에서…까지 for places.',
        'With a deadline it means \'by\': 금요일까지 주세요 (please give it to me by Friday).',
        'It can also mean \'even\': 동생까지 왔어요 (even my younger sibling came).',
      ],
      tricks: [
        '까지 is the finish line, 부터 the start line: 아홉 시부터 다섯 시까지, 9 to 5.',
        'Until AND by: 다섯 시까지 기다려요 (wait until five), 다섯 시까지 오세요 (come by five).',
      ],
      comparisons: [
        { with: ['particle:부터'], title: '까지 vs 부터', points: [
          '까지 closes, 부터 opens: 아홉 시부터 다섯 시까지 (from 9 to 5).',
          'Alone: 내일부터 = from tomorrow on; 내일까지 = until or by tomorrow.',
        ] },
        { with: ['particle:에'], title: '까지 vs 에', points: [
          '에 = the destination: 부산에 가요. 까지 = how far: 부산까지 가요 (I go as far as Busan).',
          'Time: 다섯 시에 (at five) vs 다섯 시까지 (until or by five).',
        ] },
      ],
    },
  },
  {
    id: 'particle:(으)로', section: 'particles', category: 'Place & time',
    korean: '(으)로', meaning: 'toward / by (means of) / with (a tool)',
    grammar: {
      speech: '으로, 로',
      forms: [
        { form: '으로', when: 'after a consonant (except ㄹ): 집으로, 손으로' },
        { form: '로', when: 'after a vowel or ㄹ: 버스로, 지하철로, 서울로' },
      ],
      examples: [
        { korean: '저는 지하철[로] 회사에 가요.', english: 'I go to work by subway.',
          gap: ['으로', '에', '에서'],
          why: 'Transport takes (으)로, and after ㄹ it\'s just 로: 지하철로, never 지하철으로.' },
        { korean: '오른쪽[으로] 가세요.', english: 'Go to the right.',
          gap: ['로', '에서', '에게'],
          why: 'Direction takes (으)로, and 쪽 ends in a consonant, so 으로.' },
        { korean: '젓가락[으로] 밥을 먹어요.', english: 'I eat rice with chopsticks.',
          gap: ['로', '과', '에서'],
          why: 'A tool takes (으)로. 과 means \'together with\': you\'d be eating the chopsticks too!' },
      ],
      rules: [
        '으로 after a consonant (손으로), 로 after a vowel or ㄹ (버스로, 지하철로, 서울로).',
        'Direction: 오른쪽으로 가세요 (go right), 집으로 가요 (head home).',
        'Means and tools: 버스로 가요 (by bus), 한국어로 말해요 (in Korean), 손으로 먹어요 (with your hands).',
        'Choosing or ordering: 커피로 주세요 (coffee, please), 이걸로 할게요 (I\'ll take this one).',
      ],
      tricks: [
        'ㄹ counts as a vowel here: 지하철로, 서울로, 연필로, never 지하철으로.',
        'Think of an arrow: (으)로 points the way (오른쪽으로) or names the vehicle (버스로).',
        'English \'with\' splits: a tool takes (으)로 (펜으로), a person takes 와/과, 하고 or (이)랑 (친구하고).',
      ],
      comparisons: [
        { with: ['particle:에'], title: '(으)로 vs 에', points: [
          '학교에 가요 = I go to school (the goal). 학교로 가요 = I head toward school (the direction). Both work.',
          'Only (으)로 for \'by/with\': 버스로, 손으로. Only 에 for time and 있어요: 세 시에, 집에 있어요.',
        ] },
        { with: ['particle:와/과'], title: '(으)로 vs 와/과: two kinds of \'with\'', points: [
          'A tool or means takes (으)로: 펜으로 써요 (I write with a pen).',
          'A companion takes 와/과: 친구와 가요 (I go with a friend). If \'using\' fits, pick (으)로.',
        ] },
      ],
    },
  },
  {
    id: 'particle:에게/한테', section: 'particles', category: 'People & together',
    korean: '에게/한테', meaning: 'to (a person or animal)',
    grammar: {
      speech: '에게, 한테',
      forms: [
        { form: '에게', when: 'after a person or animal; written or careful: 친구에게' },
        { form: '한테', when: 'same job in everyday speech: 친구한테' },
        { form: '께', when: 'honorific, for someone you respect: 선생님께' },
      ],
      examples: [
        { korean: '친구[에게] 편지를 써요.', english: 'I write a letter to my friend.',
          gap: ['에', '에게서', '를'],
          why: 'People take 에게/한테, not 에. 에게서 would mean \'from my friend\'.' },
        { korean: '엄마[한테] 전화해요.', english: 'I call my mom.',
          gap: ['를', '에', '한테서'],
          why: '전화해요 takes the person with 한테 (\'call to\'). 를 feels natural in English but is wrong here.' },
        { korean: '할머니[께] 선물을 드려요.', english: 'I give a present to my grandmother.',
          gap: ['께서', '에', '한테서'],
          why: '께 is the respectful \'to\', used with 드려요. 께서 would make Grandma the giver.' },
      ],
      rules: [
        '에게/한테 = \'to\' for people and animals. Places and things take 에: 친구한테 가요, but 학교에 가요.',
        '에게 sounds written or careful; 한테 is everyday speech. Same meaning.',
        'For someone you respect use 께: 선생님께, 할머니께, often with 드려요 (the polite \'give\').',
        'Typical verbs: 줘요 (give), 말해요 (say), 전화해요 (call), 보내요 (send), 가르쳐요 (teach).',
      ],
      tricks: [
        'Person or pet? 에게/한테. Place or thing? 에.',
        'Respect upgrade: 에게 → 께, just as 이/가 → 께서 for the subject.',
      ],
      comparisons: [
        { with: ['particle:에게서/한테서'], title: '에게/한테 vs 에게서/한테서', points: [
          '에게/한테 = to a person: 친구한테 줘요 (I give it to my friend). Add 서 for \'from\': 친구한테서 받아요.',
          'Think direction: without 서 it flows to the person; with 서 it comes from them.',
        ] },
        { with: ['particle:에'], title: '에게/한테 vs 에', points: [
          'Both mean \'to\'. People and animals take 에게/한테 (엄마한테 가요); places and things take 에 (집에 가요).',
          'Plants and companies count as things: 꽃에 물을 줘요 (water the flowers), 회사에 전화해요 (call the office).',
        ] },
      ],
    },
  },
  {
    id: 'particle:에게서/한테서', section: 'particles', category: 'People & together',
    korean: '에게서/한테서', meaning: 'from (a person or animal)',
    grammar: {
      speech: '에게서, 한테서',
      forms: [
        { form: '에게서', when: 'after a person or animal; written or careful: 친구에게서' },
        { form: '한테서', when: 'same job in everyday speech: 친구한테서' },
      ],
      examples: [
        { korean: '친구[한테서] 선물을 받았어요.', english: 'I got a present from my friend.',
          gap: ['에서', '에', '를'],
          why: 'From a person: 한테서. 에서 means \'from\' only for places: 학교에서.' },
        { korean: '어제 엄마[에게서] 전화가 왔어요.', english: 'Yesterday I got a call from my mom.',
          gap: ['에서', '께서', '를'],
          why: 'The call comes from a person: 에게서. 께서 marks a respected subject, not a source.' },
        { korean: '저는 선생님[에게서] 한국어를 배워요.', english: 'I learn Korean from a teacher.',
          gap: ['에서', '에', '이'],
          why: '에게서 = from a person. With 이, the teacher would be the one learning.' },
      ],
      rules: [
        '에게서/한테서 = \'from\' a person or animal. For places use 에서: 학교에서 와요.',
        '한테서 is everyday speech; 에게서 sounds written or careful.',
        'With 받아요, 배워요, 들어요 the 서 is often dropped: 친구한테 받았어요 means the same.',
      ],
      tricks: [
        '서 is short for 에서, \'from\'. Add it to 에게/한테 and you get \'from a person\': 친구한테서.',
        'Give → 한테, get → 한테서: 친구한테 줘요, 친구한테서 받아요.',
      ],
      comparisons: [
        { with: ['particle:에게/한테'], title: '에게서/한테서 vs 에게/한테', points: [
          '줘요 (give) → 한테: 친구한테 줘요. 받아요 (get) → 한테서: 친구한테서 받아요.',
          'With 받아요, 배워요, 들어요 plain 한테 can mean \'from\' too; with 줘요 or 보내요 it only means \'to\'.',
        ] },
        { with: ['particle:에서'], title: '에게서/한테서 vs 에서', points: [
          'Both mean \'from\'. People: 친구한테서. Places: 회사에서.',
          'Classic slips: 친구에서 ✗, 학교한테서 ✗. Person → 한테서/에게서, place → 에서.',
        ] },
      ],
    },
  },
  {
    id: 'particle:와/과', section: 'particles', category: 'People & together',
    korean: '와/과', meaning: 'and / with (written, formal)',
    grammar: {
      speech: '와, 과',
      forms: [
        { form: '와', when: 'after a vowel: 커피와, 친구와' },
        { form: '과', when: 'after a consonant: 빵과, 책과' },
      ],
      examples: [
        { korean: '빵[과] 우유를 사요.', english: 'I buy bread and milk.',
          gap: ['와', '을', '도'],
          why: '빵 ends in a consonant, so 과. 와 is for nouns ending in a vowel: 우유와 빵.' },
        { korean: '주말에 친구[와] 영화를 봐요.', english: 'On the weekend I watch a movie with a friend.',
          gap: ['과', '에게', '를'],
          why: 'Here 와 means \'with\' (together). 에게 would mean \'to my friend\'.' },
        { korean: '제 가방은 친구 가방[과] 달라요.', english: 'My bag is different from my friend\'s bag.',
          gap: ['와', '보다', '처럼'],
          why: 'With 같아요/달라요, 와/과 means \'as / from\'. 보다 means \'than\' and goes with 더.' },
      ],
      rules: [
        '와 after a vowel (커피와), 과 after a consonant (빵과). Unlike 는, 가 and 를, the hard-sounding form goes after the consonant.',
        'It joins nouns only: 빵과 우유. To join sentences use 그리고; to join actions use -고.',
        'It\'s the written, formal choice. In conversation 하고 or (이)랑 are more common.',
        'With 같이 it means \'together with\': 친구와 같이 가요. With 같아요/달라요: \'same as\' / \'different from\'.',
      ],
      tricks: [
        '과 is the original; after a vowel its k sound wore away, leaving 와. So consonant → 과, vowel → 와.',
        '\'And\' between nouns: 와/과, 하고, (이)랑. Between sentences: 그리고.',
      ],
      comparisons: [
        { with: ['connector:그리고', 'connector:-고'], title: '와/과 vs 그리고 / -고', points: [
          '와/과 joins nouns in one sentence: 빵과 우유를 사요. 그리고 joins sentences: 빵을 사요. 그리고 우유를 사요.',
          'For two actions use -고: 빵을 먹고 우유를 마셔요. 와/과 never goes on a verb.',
        ] },
        { with: ['particle:하고', 'particle:(이)랑'], title: '와/과 vs 하고 vs (이)랑', points: [
          'Same jobs: \'and\' between nouns, or \'with\'. 와/과 = written or formal, 하고 = everyday speech, (이)랑 = casual.',
          'Attachment: 와/과 and (이)랑 change after a consonant (빵과, 빵이랑); 하고 never changes (빵하고).',
        ] },
      ],
    },
  },
  {
    id: 'particle:하고', section: 'particles', category: 'People & together',
    korean: '하고', meaning: 'and / with (spoken)',
    grammar: {
      speech: '하고',
      forms: [
        { form: '하고', when: 'after any noun, vowel or consonant: 빵하고, 커피하고' },
      ],
      examples: [
        { korean: '커피[하고] 케이크 주세요.', english: 'Coffee and cake, please.',
          gap: ['나', '도', '를'],
          why: '하고 = and: you want both. 나 would mean coffee or cake, either one.' },
        { korean: '저는 동생[하고] 같이 살아요.', english: 'I live with my younger sibling.',
          gap: ['한테', '을', '의'],
          why: '하고 같이 = together with. 한테 would mean \'to my sibling\'.' },
        { korean: '엄마[하고] 아빠는 회사원이에요.', english: 'My mom and dad are office workers.',
          gap: ['과', '도', '를'],
          why: '하고 joins the two nouns and never changes. 과 only follows consonants; after 마 it would be 와.' },
      ],
      rules: [
        '하고 never changes shape: 빵하고, 커피하고. The easiest \'and\' for nouns.',
        'Same jobs as 와/과: \'and\' in a list (빵하고 우유) and \'with\' (친구하고 같이 가요).',
        'It belongs to speech; in writing, 와/과 is the usual choice.',
        'It joins nouns only. For two actions use -고: 먹고 마셔요.',
      ],
      tricks: [
        '하고 = 하다 (do, say) + -고 (and), frozen into a particle: one shape for every noun.',
        '친구하고 (with a friend) is the particle; in 공부하고 (study and…) it\'s 공부하다 + -고.',
      ],
      comparisons: [
        { with: ['particle:와/과', 'particle:(이)랑'], title: '하고 vs 와/과 vs (이)랑', points: [
          'All three mean \'and\' between nouns, or \'with\'. Only 하고 never changes; the others depend on the last sound.',
          'Register: 와/과 for writing, 하고 for everyday speech, (이)랑 for casual chat.',
        ] },
        { with: ['connector:-고'], title: '하고 vs -고', points: [
          '하고 follows a noun: 빵하고 우유 (bread and milk). -고 follows a verb stem: 빵을 먹고 우유를 마셔요.',
          '공부하고 운동해요 = I study and exercise: that\'s 공부하다 + -고, not the particle.',
        ] },
      ],
    },
  },
  {
    id: 'particle:(이)랑', section: 'particles', category: 'People & together',
    korean: '(이)랑', meaning: 'and / with (casual)',
    grammar: {
      speech: '이랑, 랑',
      forms: [
        { form: '이랑', when: 'after a consonant: 빵이랑, 동생이랑' },
        { form: '랑', when: 'after a vowel: 커피랑, 친구랑' },
      ],
      examples: [
        { korean: '딸기[랑] 바나나를 사요.', english: 'I\'m buying strawberries and bananas.',
          gap: ['이랑', '를', '나'],
          why: '딸기 ends in a vowel, so 랑, not 이랑. 나 would mean strawberries or bananas.' },
        { korean: '친구[랑] 같이 운동해요.', english: 'I work out with a friend.',
          gap: ['한테', '를', '이랑'],
          why: '랑 같이 = together with. 한테 would mean \'to a friend\'.' },
        { korean: '제 가방은 동생 가방[이랑] 똑같아요.', english: 'My bag is exactly the same as my sibling\'s bag.',
          gap: ['랑', '보다', '에서'],
          why: 'With 같아요/똑같아요, (이)랑 means \'as\'. 가방 ends in a consonant, so 이랑.' },
      ],
      rules: [
        '이랑 after a consonant (빵이랑), 랑 after a vowel (커피랑).',
        'Same jobs as 와/과 and 하고: \'and\' between nouns, and \'with\' (친구랑 같이 가요).',
        'The most casual of the three: friends, family, texting. Avoid it in formal writing.',
        'With 같아요, 달라요, 닮았어요 it means \'as / from / like\': 아빠랑 닮았어요 (I look like my dad).',
      ],
      tricks: [
        'In speech you can repeat it: 빵이랑 우유랑 커피랑 (bread, milk and coffee).',
        '(이)랑 = and, (이)나 = or: one letter apart, same attachment.',
      ],
      comparisons: [
        { with: ['particle:하고', 'particle:와/과'], title: '(이)랑 vs 하고 vs 와/과', points: [
          'Same meaning, different feel: (이)랑 casual, 하고 everyday speech, 와/과 written or formal.',
          'Keep one style per list: 빵이랑 우유 (casual), 빵과 우유 (written).',
        ] },
        { with: ['particle:(이)나'], title: '(이)랑 vs (이)나', points: [
          '커피랑 차 = coffee AND tea (both). 커피나 차 = coffee OR tea (one of them).',
          'Same attachment: 빵이랑 / 빵이나 after a consonant, 커피랑 / 커피나 after a vowel.',
        ] },
      ],
    },
  },
  {
    id: 'particle:도', section: 'particles', category: 'Focus & comparison',
    korean: '도', meaning: 'also / too / even',
    grammar: {
      speech: '도',
      forms: [
        { form: '도', when: 'replaces 은/는, 이/가, 을/를: 저도, 커피도' },
        { form: '에도 · 에서도 · 한테도', when: 'after other particles, which stay: 주말에도' },
      ],
      examples: [
        { korean: '민수 씨는 커피를 좋아해요. 저[도] 좋아해요.', english: 'Minsu likes coffee. I like it too.',
          gap: ['만', '는', '를'],
          why: '도 = too, replacing 는: 저도. 는 would set you against Minsu; 만 would mean only you.' },
        { korean: '평일에 일해요. 주말에[도] 일해요.', english: 'I work on weekdays. I work on weekends too.',
          gap: ['는', '만', '가'],
          why: '도 sits after 에 and adds \'too\'. 만 would mean only on weekends.' },
        { korean: '저는 고기를 안 먹어요. 생선[도] 안 먹어요.', english: 'I don\'t eat meat. I don\'t eat fish either.',
          gap: ['만', '은', '이'],
          why: 'With a negative, 도 means \'not … either\'. 만 would single out fish.' },
      ],
      rules: [
        '도 replaces 은/는, 이/가 and 을/를: 저도, 커피도 (never 저는도, 커피를도).',
        'It follows other particles, which stay: 주말에도, 학교에서도, 친구한테도.',
        'With a negative it means \'not … either\': 저도 안 가요 (I\'m not going either).',
        'Doubled, A도 B도 = both A and B (or neither, with a negative): 커피도 차도 좋아해요.',
      ],
      tricks: [
        'Someone says they like it? Answer 저도요! (Me too!)',
        'Even: 하나도 없어요 = there isn\'t even one.',
      ],
      comparisons: [
        { with: ['particle:만'], title: '도 vs 만', points: [
          '도 adds (커피도 = coffee too); 만 limits (커피만 = only coffee).',
          'Both replace 은/는, 이/가, 을/를 and sit after other particles: 집에서도 / 집에서만.',
        ] },
        { with: ['particle:은/는'], title: '도 vs 은/는', points: [
          'After \'I\'m a student\': 저도 학생이에요 = me too. 저는 회사원이에요 = me, I work at a company.',
          '도 makes things alike; 은/는 sets them apart.',
        ] },
      ],
    },
  },
  {
    id: 'particle:만', section: 'particles', category: 'Focus & comparison',
    korean: '만', meaning: 'only / just',
    grammar: {
      speech: '만',
      forms: [
        { form: '만', when: 'replaces 은/는, 이/가, 을/를: 물만, 저만' },
        { form: '에만 · 에서만 · 한테만', when: 'after other particles, which stay: 주말에만' },
      ],
      examples: [
        { korean: '저는 물[만] 마셔요.', english: 'I only drink water.',
          gap: ['도', '밖에', '까지'],
          why: '만 = only, with a normal verb. 밖에 also means only but needs a negative: 물밖에 안 마셔요.' },
        { korean: '주말에[만] 운동해요.', english: 'I exercise only on weekends.',
          gap: ['도', '까지', '를'],
          why: '만 after 에 limits it: only on weekends. 도 would mean on weekends too.' },
        { korean: '동생[만] 키가 커요.', english: 'Only my younger sibling is tall.',
          gap: ['보다', '처럼', '까지'],
          why: '만 picks one out of the group. 보다 would compare: taller than my sibling.' },
      ],
      rules: [
        '만 = only, with a positive verb: 물만 마셔요. It replaces 은/는, 이/가 and 을/를.',
        'It sits after other particles: 집에서만, 친구한테만, 주말에만.',
        'For \'only\' with a negative verb, Korean prefers 밖에: 물밖에 안 마셔요.',
        'Handy when ordering: 하나만 주세요 (just one, please).',
      ],
      tricks: [
        'Positive verb → 만. Negative verb → 밖에.',
        'Pointing at a menu: 이것만 주세요 (just this one, please).',
      ],
      comparisons: [
        { with: ['particle:밖에'], title: '만 vs 밖에', points: [
          'Same idea, opposite verbs: 물만 마셔요 = 물밖에 안 마셔요 (I only drink water).',
          '밖에 needs a negative (안, 없어요, 몰라요): 천 원밖에 없어요 = I only have 1,000 won.',
          '밖에 stresses \'and that\'s not much\'; 만 is neutral.',
        ] },
        { with: ['particle:도'], title: '만 vs 도', points: [
          '만 = only that one; 도 = that one too: 커피만 vs 커피도.',
          'Both replace 은/는, 이/가, 을/를: 저만 / 저도.',
        ] },
      ],
    },
  },
  {
    id: 'particle:밖에', section: 'particles', category: 'Focus & comparison',
    korean: '밖에', meaning: 'only (with a negative) / nothing but',
    grammar: {
      speech: '밖에',
      forms: [
        { form: '밖에', when: 'after a noun, then a negative verb: 하나밖에 없어요' },
      ],
      examples: [
        { korean: '지갑에 천 원[밖에] 없어요.', english: 'I only have 1,000 won in my wallet.',
          gap: ['만', '도', '까지'],
          why: '밖에 + 없어요 = only have. 천 원만 없어요 would mean just the 1,000 won is missing.' },
        { korean: '저는 한국어를 조금[밖에] 못 해요.', english: 'I can only speak a little Korean.',
          gap: ['만', '도', '부터'],
          why: '밖에 + 못 = only a little. 조금도 못 해요 would mean \'not at all\'.' },
        { korean: '저는 그 사람 이름[밖에] 몰라요.', english: 'I only know that person\'s name.',
          gap: ['만', '까지', '의'],
          why: '몰라요 is negative, so 밖에. 이름만 몰라요 would mean the name is the one thing you don\'t know.' },
      ],
      rules: [
        '밖에 always needs a negative after it: 안 …, 못 …, 없어요, 몰라요: 물밖에 안 마셔요.',
        'It means \'only\', stressing that it isn\'t much: 십 분밖에 없어요 (I\'ve only got 10 minutes).',
        'Said [바께]: the ㄲ slides into 에.',
        'It replaces 이/가 and 을/를: 돈밖에 없어요, never 돈이밖에.',
      ],
      tricks: [
        '밖 means outside: 물밖에 안 마셔요 ≈ outside of water, I drink nothing.',
        'Drop the negative and it breaks? Then you needed 밖에, not 만.',
      ],
      comparisons: [
        { with: ['particle:만'], title: '밖에 vs 만', points: [
          '밖에 + negative = 만 + positive: 커피밖에 안 마셔요 = 커피만 마셔요.',
          '만 없어요 is a trap: 천 원만 없어요 = only the 1,000 won is missing. Say 천 원밖에 없어요.',
        ] },
        { with: ['particle:도'], title: '밖에 vs 도 with a negative', points: [
          '조금밖에 몰라요 = I only know a little. 조금도 몰라요 = I don\'t know at all.',
          '하나밖에 없어요 = there\'s only one. 하나도 없어요 = there isn\'t a single one.',
        ] },
      ],
    },
  },
  {
    id: 'particle:보다', section: 'particles', category: 'Focus & comparison',
    korean: '보다', meaning: 'than (comparison)',
    grammar: {
      speech: '보다',
      forms: [
        { form: '보다', when: 'after what you compare against, often with 더: 저보다 더' },
      ],
      examples: [
        { korean: '서울이 부산[보다] 커요.', english: 'Seoul is bigger than Busan.',
          gap: ['처럼', '만', '까지'],
          why: '보다 marks the yardstick: than Busan. 처럼 would say they\'re alike.' },
        { korean: '저는 커피[보다] 차를 더 좋아해요.', english: 'I like tea more than coffee.',
          gap: ['하고', '처럼', '도'],
          why: 'The thing you like less takes 보다, then 더. 하고 would lump coffee and tea together.' },
        { korean: '오늘이 어제[보다] 더 추워요.', english: 'Today is colder than yesterday.',
          gap: ['부터', '에', '까지'],
          why: '어제보다 = than yesterday. 부터 would mean starting from yesterday.' },
      ],
      rules: [
        '보다 goes on the thing you compare against: 저보다 키가 커요 (taller than me).',
        '더 (more) usually comes before the adjective: 커피보다 차가 더 좋아요. 보다 itself never changes.',
        'Word order is flexible: 서울이 부산보다 커요 = 부산보다 서울이 커요.',
        'For \'the most\', skip 보다 and use 제일: 커피를 제일 좋아해요.',
      ],
      tricks: [
        '보다 is also the verb \'to see\': after seeing A, B looks bigger. That really is where it comes from.',
        'Bigger → 보다 + 더. Biggest → 제일.',
      ],
      comparisons: [
        { with: ['particle:처럼'], title: '보다 vs 처럼', points: [
          '보다 = than (different level): 형보다 커요 (taller than my brother). 처럼 = like (same level): 형처럼 커요.',
          'Ask: more or less → 보다 (+ 더); alike → 처럼.',
        ] },
        { with: ['particle:와/과'], title: '보다 vs 와/과: degree or sameness', points: [
          'Degree → 보다: 형이 저보다 커요. Same or different → 와/과: 형은 저와 달라요 (he\'s different from me).',
          '보다 pairs with 더; 와/과 pairs with 같아요 and 달라요.',
        ] },
      ],
    },
  },
  {
    id: 'particle:처럼', section: 'particles', category: 'Focus & comparison',
    korean: '처럼', meaning: 'like / as (similar to)',
    grammar: {
      speech: '처럼',
      forms: [
        { form: '처럼', when: 'after any noun, vowel or consonant: 가수처럼, 여름처럼' },
      ],
      examples: [
        { korean: '제 친구는 가수[처럼] 노래를 잘해요.', english: 'My friend sings as well as a singer.',
          gap: ['보다', '만', '한테'],
          why: '처럼 = like, as good as. 보다 would mean better than a singer.' },
        { korean: '오늘은 여름[처럼] 더워요.', english: 'Today it\'s hot like summer.',
          gap: ['보다', '에', '까지'],
          why: '처럼 compares by likeness: hot like summer. 보다 would mean hotter than summer.' },
        { korean: '저는 한국 사람[처럼] 말하고 싶어요.', english: 'I want to speak like a Korean.',
          gap: ['하고', '에게', '까지'],
          why: '처럼 = in the same way as. 하고 would mean you want to talk with a Korean.' },
      ],
      rules: [
        '처럼 never changes: 가수처럼, 여름처럼. It sits on the thing you compare with.',
        'Use it for likeness: 여름처럼 더워요 (hot like summer). For more or less, use 보다.',
        'Common pairs: 아이처럼 (like a child), 친구처럼 (like friends), 어제처럼 (like yesterday).',
      ],
      tricks: [
        'It\'s the \'like\' of \'fly like a bird\': 새처럼 날아요.',
        'Like → 처럼; than → 보다; same as → 와/과 같아요.',
      ],
      comparisons: [
        { with: ['particle:보다'], title: '처럼 vs 보다', points: [
          '처럼 = like (same level): 형처럼 커요. 보다 = than (different level): 형보다 커요.',
          'Alike → 처럼. More or less → 보다 (+ 더).',
        ] },
        { with: ['particle:하고'], title: '처럼 vs 하고', points: [
          'English \'like\' vs \'with\': 친구처럼 = like a friend; 친구하고 = with a friend.',
          '한국 사람처럼 말해요 (speak like a Korean) vs 한국 사람하고 말해요 (talk with a Korean).',
        ] },
      ],
    },
  },
  {
    id: 'particle:마다', section: 'particles', category: 'Focus & comparison',
    korean: '마다', meaning: 'every / each',
    grammar: {
      speech: '마다',
      forms: [
        { form: '마다', when: 'after any noun: 날마다, 주말마다, 사람마다' },
      ],
      examples: [
        { korean: '저는 주말[마다] 테니스를 쳐요.', english: 'I play tennis every weekend.',
          gap: ['까지', '만', '부터'],
          why: '마다 = every: every weekend. 만 would limit it to weekends only.' },
        { korean: '사람[마다] 생각이 달라요.', english: 'Every person thinks differently.',
          gap: ['만', '보다', '에'],
          why: '마다 = each one separately: each person. 만 would mean only people.' },
        { korean: '날[마다] 커피를 마셔요.', english: 'I drink coffee every day.',
          gap: ['에', '도', '까지'],
          why: '날마다 = every day, like 매일. 에 marks one point in time, not a repeat.' },
      ],
      rules: [
        '마다 = every/each, right after the noun: 날마다, 주말마다, 아침마다.',
        'For time, 마다 does the job alone, no 에 needed: 주말마다 운동해요 (I work out every weekend).',
        'With people or things it means \'each one\': 사람마다 달라요 (it differs from person to person).',
        'Same idea as 매-: 날마다 = 매일 (every day), 주마다 = 매주 (every week).',
      ],
      tricks: [
        'Habits: 아침마다 운동해요 (I work out every morning).',
        'One Saturday → 토요일에. Every Saturday → 토요일마다.',
      ],
      comparisons: [
        { with: ['particle:에'], title: '마다 vs 에', points: [
          '에 = one point: 토요일에 (on Saturday). 마다 = every: 토요일마다 (every Saturday).',
          'Both go right after the time word: 주말에, 주말마다.',
        ] },
        { with: ['particle:만'], title: '마다 vs 만', points: [
          '주말마다 운동해요 = I work out every weekend. 주말에만 운동해요 = only on weekends, never on weekdays.',
          '마다 repeats; 만 excludes.',
        ] },
      ],
    },
  },
  {
    id: 'particle:(이)나', section: 'particles', category: 'Focus & comparison',
    korean: '(이)나', meaning: 'or / or something',
    grammar: {
      speech: '이나, 나',
      forms: [
        { form: '이나', when: 'after a consonant: 빵이나, 물이나' },
        { form: '나', when: 'after a vowel: 커피나, 차나' },
      ],
      examples: [
        { korean: '커피[나] 차를 마셔요.', english: 'I drink coffee or tea.',
          gap: ['이나', '랑', '도'],
          why: '(이)나 = or: one of the two. 랑 would mean you drink both.' },
        { korean: '주말에 영화[나] 볼까요?', english: 'Shall we watch a movie or something this weekend?',
          gap: ['만', '도', '이나'],
          why: 'Here (이)나 softens the plan: a movie or something. 만 would mean only a movie.' },
        { korean: '버스를 한 시간[이나] 기다렸어요.', english: 'I waited for the bus for a whole hour.',
          gap: ['나', '만', '에'],
          why: 'After an amount, (이)나 stresses it\'s a lot. 만 would mean you only waited an hour.' },
      ],
      rules: [
        '이나 after a consonant (빵이나), 나 after a vowel (커피나).',
        'It joins nouns: 커피나 차. To join verbs use -거나 (보거나 쉬어요); to offer a new option, start with 아니면.',
        'In suggestions it means \'or something\': 커피나 마실까요? (shall we grab a coffee or something?).',
        'After an amount it stresses \'that much\': 두 시간이나 기다렸어요 (I waited a whole two hours).',
      ],
      tricks: [
        '(이)랑 = and, (이)나 = or: one letter apart, same attachment.',
        '아무거나 = anything at all (아무 + 거 + 나): 아무거나 괜찮아요 (anything is fine).',
      ],
      comparisons: [
        { with: ['connector:아니면', 'connector:-거나'], title: '(이)나 vs 아니면 vs -거나', points: [
          '(이)나 joins nouns: 커피나 차. -거나 joins verbs: 영화를 보거나 쉬어요 (watch a movie or rest).',
          '아니면 starts a new option, often a new sentence: 커피 마실래요? 아니면 차?',
        ] },
        { with: ['particle:(이)랑'], title: '(이)나 vs (이)랑', points: [
          '커피나 차 = coffee OR tea (one). 커피랑 차 = coffee AND tea (both).',
          'Same attachment: 빵이나 / 빵이랑 after a consonant, 커피나 / 커피랑 after a vowel.',
        ] },
      ],
    },
  },
]
