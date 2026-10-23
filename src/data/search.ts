import { words } from '../recall/english'
import type { VocabularyItem } from '../types/vocabulary'
import { cards } from './cards'
import { recallData } from './recall-data'

const hangul = /[가-힣ㄱ-ㅎㅏ-ㅣ]/
/** Korean as typed or written on a card, without the spaces, hyphens, slashes, and brackets that vary: “-(으)로” → 으로. */
const bare = (text: string) => text.replace(/[\s\-–/()[\]?.,!]/g, '')

interface Indexed { item: VocabularyItem; korean: string[]; english: string[]; reading: string }
let index: Indexed[] | undefined
function indexed() {
  return index ??= cards.map(item => ({
    item,
    korean: [item.korean, item.dictionaryForm, item.presentForm, ...item.korean.split('/')].filter((form): form is string => !!form).map(bare),
    english: [...new Set([...words(item.meaning), ...(recallData[item.id]?.accept ?? []).flatMap(words)])],
    reading: (item.pronunciation ?? '').toLowerCase().replace(/[^a-z]/g, ''),
  }))
}

/** How well a card matches: exact beats a prefix, which beats anywhere; Korean and meaning beat the reading guide. */
function scoreOf(entry: Indexed, query: string): number {
  if (hangul.test(query)) {
    const target = bare(query)
    if (!target) return 0
    if (entry.korean.includes(target)) return 100
    if (entry.korean.some(form => form.startsWith(target))) return 80
    return entry.korean.some(form => form.includes(target)) ? 60 : 0
  }
  const terms = words(query)
  if (!terms.length) return 0
  const meaning = terms.every(term => entry.english.includes(term)) ? 90
    : terms.every(term => entry.english.some(word => word.startsWith(term))) ? 70 : 0
  const letters = terms.join('')
  const reading = letters.length >= 2 && entry.reading.startsWith(letters) ? 50 : letters.length >= 3 && entry.reading.includes(letters) ? 30 : 0
  return Math.max(meaning, reading)
}

/** Cards whose Korean, meaning (or a reviewed synonym), or reading matches, best first, words before grammar on a tie. */
export function searchCards(query: string, limit = 40): VocabularyItem[] {
  if (!query.trim()) return []
  return indexed().map(entry => ({ entry, score: scoreOf(entry, query.trim()) })).filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.item.korean.length - b.entry.item.korean.length)
    .slice(0, limit).map(({ entry }) => entry.item)
}
