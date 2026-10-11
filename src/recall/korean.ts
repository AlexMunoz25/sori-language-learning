import type { AnswerKey } from './types'

const initials = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const medials = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
const finals = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']

/** Spacing and punctuation don't count: 무슨 음식을 제일 좋아해요? ~ 무슨음식을제일좋아해요 */
export const normalizeKorean = (text: string) => text.normalize('NFC').replace(/[\s?!.,~·…'"“”‘’()[\]-]/g, '')

/** Syllables as their letters: 사과 → ㅅㅏㄱㅘ. Anything that isn't a Hangul syllable passes through. */
export function toJamo(text: string) {
  return [...normalizeKorean(text)].flatMap(char => {
    const code = char.codePointAt(0)! - 0xac00
    if (code < 0 || code > 11171) return [char]
    const final = finals[code % 28]
    return [initials[Math.floor(code / 588)], medials[Math.floor(code % 588 / 28)], ...final ? [final] : []]
  })
}

/** Damerau–Levenshtein distance between two letter sequences. */
function editDistance(a: string[], b: string[]) {
  const rows = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => i || j ? (i ? (j ? 0 : i) : j) : 0))
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) {
    const cost = a[i - 1] === b[j - 1] ? 0 : 1
    rows[i][j] = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost)
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) rows[i][j] = Math.min(rows[i][j], rows[i - 2][j - 2] + 1)
  }
  return rows[a.length][b.length]
}

export interface KoreanMatch {
  /** The accepted answer it equals (word, dictionary form, or a same-speaker synonym), if any. */
  matched?: string
  /** Letters (jamo) away from the closest accepted answer: 1 is a single stroke group off. */
  distance: number
  closest: string
}

/** Compares a reading of the learner's handwriting with every accepted answer. Deterministic. */
export function matchKorean(read: string, key: AnswerKey): KoreanMatch {
  const accepted = [key.expected, ...key.alternatives.map(alternative => alternative.text)]
  const target = normalizeKorean(read)
  const exact = accepted.find(answer => normalizeKorean(answer) === target)
  if (exact) return { matched: exact, distance: 0, closest: exact }
  const letters = toJamo(read)
  return accepted.map(answer => ({ distance: editDistance(letters, toJamo(answer)), closest: answer }))
    .reduce((best, entry) => entry.distance < best.distance ? entry : best)
}
