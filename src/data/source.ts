import type { VocabularySource } from '../types/vocabulary'

// Supplemental expressions are taken from the prose, not invented examples.
// Keep an exact source anchor so edits cannot silently orphan an entry.
export const phrases = [
  ['날씨가 더워요', 'The weather is hot.', '- 날씨가 **더워요**'],
  ['커피가 뜨거워요', 'The coffee is hot.', '- 커피가 **뜨거워요**'],
  ['날씨가 추워요', 'The weather is cold.', '- 날씨가 **추워요**'],
  ['물이 차가워요', 'The water is cold.', '- 물이 **차가워요**'],
  ['한국어를 배워요', 'I learn Korean.', '→ 한국어를 **배워요**'],
  ['영어를 가르쳐요', 'I teach English.', '→ 영어를 **가르쳐요**'],
  ['무슨 운동을 해요?', 'What sport/exercise do you do?', '**무슨 운동을 해요?**'],
  ['저는 수영을 해요', 'I swim.', '저는 **수영을 해요.**'],
  ['무슨 색깔을 좋아해요?', 'What color do you like?', '**무슨 색깔을 좋아해요?**'],
  ['파란색을 좋아해요', 'I like blue.', '**파란색을 좋아해요.**'],
  ['밥 먹어요', "I eat / I'm having a meal.", '밥 먹어요.'],
  ['엔지니어예요', "I'm an engineer.", '**엔지니어예요.**'],
  ['개발자예요', "I'm a developer.", '**개발자예요.**'],
  ['무슨 음식', 'what kind of food', '무슨 음식 →'],
  ['무슨 운동', 'what sport', '무슨 운동 →'],
  ['무슨 영화', 'what kind of movie', '무슨 영화 →'],
  ['무슨 음악', 'what kind of music', '무슨 음악 →'],
  ['무슨 색깔', 'what color', '무슨 색깔 →'],
  ['무슨 과일', 'what fruit', '무슨 과일 →'],
  ['무슨 음료', 'what drink', '무슨 음료 →'],
  ['무슨 계절', 'what season', '무슨 계절 →'],
  ['제일 좋아해요', 'like the most / favorite', '**제일 좋아해요**'],
  ['무슨 음식을 제일 좋아해요?', 'What food do you like the most?', '**무슨 음식을 제일 좋아해요?**'],
  ['한국 음식을 제일 좋아해요', 'I like Korean food the most.', '**한국 음식을 제일 좋아해요.**'],
] as const

const headingMeanings: Record<string, string> = {
  형용사: 'adjective', 동사: 'verb', 시간: 'time', 요일: 'day of the week',
  운동: 'sport / exercise', 계절: 'season', 색깔: 'color', 과일: 'fruit',
  음료: 'drink / beverage', 음식: 'food', 영화: 'movie', 음악: 'music',
  가족: 'family', 물건: 'object / thing', 직업: 'job / occupation', 장소: 'place',
}

export const proseNotes = [
  { anchor: 'Para **verbos y adjetivos**', reason: 'Grammar endings -아요 / -어요 / -해요 are preserved in polite forms, not standalone vocabulary.' },
  { anchor: '**배우다** =', reason: 'Dictionary form already preserved on 배워요.' },
  { anchor: '**가르치다** =', reason: 'Dictionary form already preserved on 가르쳐요.' },
  { anchor: '**배** =', reason: 'Duplicate entry; alternate senses preserved in the pear card note.' },
  { anchor: '**밥** technically', reason: 'Cooked rice / meal distinction preserved in the 밥 card note.' },
  { anchor: '**배우** =', reason: 'Duplicate actor entry; 배우 / 배우다 distinction preserved in both notes.' },
  { anchor: '**무슨 + noun**', reason: 'Template preserved in the 무슨 card note and all eight phrase examples.' },
  { anchor: '그래서:', reason: 'Editorial transition (“so”), not a vocabulary entry or study example.' },
] as const

const notes: Record<string, string> = {
  배: 'Here: pear. The source also notes boat and stomach/belly as other meanings, depending on context.',
  밥: 'Cooked rice; also used for a meal in everyday Korean.',
  배우: '배우 is an actor. 배우다 → 배워요 means to learn.',
  배워요: '배우다 means to learn. 배우 on its own is an actor.',
  무슨: 'Pattern: 무슨 + noun → what kind of…?',
  같아요: 'Source: (똑)같다 → (똑)같아요. Both 같다 and 똑같다 are included as separate cards.',
  똑같아요: 'Source: (똑)같다 → (똑)같아요. Both 같다 and 똑같다 are included as separate cards.',
  잘생겼어요: 'The source lists 잘생겼다 as the dictionary form; preserved as written.',
  못생겼어요: 'The source lists 못생겼다 as the dictionary form; preserved as written.',
  팝: 'The source groups 팝 / 가요 as “pop / popular music.” Both forms are included.',
  가요: 'In Music, 가요 is popular music. In Verbs, 가요 is the polite form of 가다 (to go).',
}

export function parseVocabulary(markdown: string): VocabularySource[] {
  const lines = markdown.split(/\r?\n/)
  const result: VocabularySource[] = []
  const headings: VocabularySource[] = []
  let category = ''
  let subcategory: string | undefined
  let headers: string[] = []
  for (const [index, line] of lines.entries()) {
    const heading = line.match(/^#{1,2}\s+\d+\.\s+(.*)$/)
    if (heading) {
      const parts = heading[1].split(' — ')
      category = parts[1] ?? 'Useful words'
      subcategory = undefined
      headers = []
      if (parts[1]) {
        for (const korean of parts[0].split(' / ')) {
          if (!headingMeanings[korean]) throw new Error(`Unrecognized Korean heading: ${korean}`)
          headings.push({ id: `heading:${korean}`, korean, meaning: headingMeanings[korean], category,
            subcategory: 'Category word', sourceLine: index + 1, sourceText: line, sourceKind: 'heading' })
        }
      }
    }
    if (line.startsWith('### ')) subcategory = line.slice(4).trim()
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map(cell => cell.trim())
    if (cells[0] === 'Dictionary form' || cells[0] === 'Korean') { headers = cells; continue }
    if (/^[-: ]+$/.test(cells[0])) continue
    if (!/[가-힣]/.test(cells[0])) throw new Error(`Unrecognized table row at ${index + 1}`)
    if (!category || !headers.length) throw new Error(`Table without headers at ${index + 1}`)
    const conjugated = headers[0] === 'Dictionary form'
    const clean = (value: string) => value.replace(/★\s*/g, '').trim()
    const dictionary = conjugated ? clean(cells[0]) : undefined
    const raw = conjugated ? cells[1] : clean(cells[0])
    const variants = raw.includes('(똑)') ? [raw.replace('(똑)', ''), raw.replace('(똑)', '똑')] : raw.split(' / ')
    for (const [variant, korean] of variants.entries()) {
      const dictionaryForm = dictionary?.includes('(똑)') ? dictionary.replace('(똑)', variant ? '똑' : '') : dictionary
      result.push({
        id: `${category}:${korean}`, korean,
        ...(dictionaryForm ? { dictionaryForm, presentForm: korean } : {}),
        meaning: cells[conjugated ? 2 : 1], category,
        ...(subcategory ? { subcategory } : {}),
        ...(headers[2] === 'Speaker' ? { speaker: cells[2] } : {}),
        ...(notes[korean] ? { note: notes[korean] } : {}),
        sourceLine: index + 1, sourceText: line, sourceKind: 'table', sourceExtra: cells[0].includes('★'),
      })
    }
  }
  result.push(...headings.filter(heading => !result.some(item => item.korean === heading.korean)))
  for (const [korean, meaning, anchor] of phrases) {
    const index = lines.findIndex(line => line.startsWith(anchor))
    if (index < 0) throw new Error(`Missing phrase anchor: ${anchor}`)
    result.push({ id: `phrase:${korean}`, korean, meaning, category: 'Useful phrases',
      sourceKind: 'phrase', sourceLine: index + 1, sourceText: lines[index] })
  }
  return result
}
