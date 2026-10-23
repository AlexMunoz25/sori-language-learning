/**
 * Korean conjugation by rule: vowel harmony, contraction, the irregular stems (ㅂ, ㄷ, ㅅ, 르, ㅎ, 으), ㄹ-stems, and 하다.
 * It builds the forms Sori teaches, explains each in a line, and lists the mistakes learners really make, so a
 * question can offer them as wrong options. Every wrong option is wrong: valid variants (마시어요, 하여요) never appear.
 */

const leads = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
const vowels = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ']
const tails = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ']
interface Syllable { lead: string; vowel: string; tail: string }

function parse(char: string): Syllable {
  const code = char.charCodeAt(0) - 0xac00
  if (code < 0 || code > 11171) throw new Error(`Not a Hangul syllable: ${char}`)
  return { lead: leads[Math.floor(code / 588)], vowel: vowels[Math.floor(code % 588 / 28)], tail: tails[code % 28] }
}
const make = ({ lead, vowel, tail }: Syllable) => String.fromCharCode(0xac00 + leads.indexOf(lead) * 588 + vowels.indexOf(vowel) * 28 + tails.indexOf(tail))
const last = (word: string) => parse(word.at(-1)!)
const head = (word: string) => word.slice(0, -1)
/** The word with its last syllable's final consonant replaced: 가 → 갔, 살 → 사. */
const withTail = (word: string, tail: string) => head(word) + make({ ...last(word), tail })
/** Ends in a final consonant: 학생, 먹. */
export const closed = (word: string) => !!last(word).tail
/** ㅏ, ㅗ (and ㅑ) take 아; every other vowel takes 어. */
const bright = (vowel: string) => vowel === 'ㅏ' || vowel === 'ㅗ' || vowel === 'ㅑ'

type Kind = 'hada' | 'b' | 'd' | 's' | 'reu' | 'h' | 'eu' | 'l' | 'regular'
// Irregularity is a property of the word, not its spelling: 덥다 → 더워요 but 입다 → 입어요.
const bIrregular = new Set(['덥', '춥', '쉽', '맵', '어렵', '귀엽', '가깝', '무겁', '가볍', '두껍', '무섭', '시끄럽', '더럽', '뜨겁', '차갑', '반갑', '고맙', '즐겁',
  '아름답', '부럽', '싱겁', '어둡', '가렵', '간지럽', '부드럽', '두렵', '그립', '무덥', '안타깝', '아깝', '미끄럽', '놀랍', '밉', '굽', '눕', '돕', '곱'])
const dIrregular = new Set(['듣', '걷', '묻', '싣', '깨닫', '붇'])
const sIrregular = new Set(['낫', '짓', '붓', '잇', '젓', '긋'])
const notReu = new Set(['따르', '치르', '들르', '우러르'])
const hRegular = new Set(['좋', '놓', '넣', '낳', '닿', '쌓'])

function kindOf(stem: string): Kind {
  const { vowel, tail } = last(stem)
  if (stem.endsWith('하')) return 'hada'
  if (bIrregular.has(stem) || ((/스럽$|롭$/).test(stem) && tail === 'ㅂ')) return 'b'
  if (dIrregular.has(stem)) return 'd'
  if (sIrregular.has(stem)) return 's'
  if (stem.endsWith('르') && stem.length > 1 && !notReu.has(stem)) return 'reu'
  if (tail === 'ㅎ' && !hRegular.has(stem)) return 'h'
  if (vowel === 'ㅡ' && !tail) return 'eu'
  if (tail === 'ㄹ') return 'l'
  return 'regular'
}

const contractions: Record<string, string> = { 'ㅏ': 'ㅏ', 'ㅓ': 'ㅓ', 'ㅕ': 'ㅕ', 'ㅐ': 'ㅐ', 'ㅔ': 'ㅔ', 'ㅗ': 'ㅘ', 'ㅜ': 'ㅝ', 'ㅣ': 'ㅕ', 'ㅚ': 'ㅙ' }
function regularInfinitive(stem: string) {
  const end = last(stem)
  if (end.tail) return stem + (bright(end.vowel) ? '아' : '어')
  const vowel = contractions[end.vowel]
  return vowel ? head(stem) + make({ ...end, vowel }) : stem + '어'
}

/** The 아/어 form every polite ending builds on: 가, 먹어, 해, 더워, 들어, 몰라, 바빠. */
function infinitive(stem: string): string {
  const end = last(stem)
  switch (kindOf(stem)) {
    case 'hada': return head(stem) + '해'
    case 'b': return withTail(stem, '') + (stem === '돕' || stem === '곱' ? '와' : '워')
    case 'd': return regularInfinitive(withTail(stem, 'ㄹ'))
    case 's': return withTail(stem, '') + (bright(end.vowel) ? '아' : '어')
    case 'reu': {
      const before = head(stem)
      return withTail(before, 'ㄹ') + (bright(last(before).vowel) ? '라' : '러')
    }
    case 'h': return head(stem) + make({ ...end, vowel: end.vowel === 'ㅑ' ? 'ㅒ' : 'ㅐ', tail: '' })
    case 'eu': {
      const before = head(stem)
      return before + make({ ...end, vowel: before && bright(last(before).vowel) ? 'ㅏ' : 'ㅓ' })
    }
    default: return regularInfinitive(stem)
  }
}

/** The stem as -(으) endings see it: whether 으 joins it, and its shape (더우, 들, 나, 하야). */
function euStem(stem: string): { base: string; eu: boolean; l: boolean } {
  switch (kindOf(stem)) {
    case 'b': return { base: withTail(stem, '') + '우', eu: false, l: false }
    case 'd': return { base: withTail(stem, 'ㄹ'), eu: true, l: false }
    case 's': return { base: withTail(stem, ''), eu: true, l: false }
    case 'h': return { base: withTail(stem, ''), eu: false, l: false }
    case 'l': return { base: stem, eu: false, l: true }
    default: return { base: stem, eu: closed(stem), l: false }
  }
}
/** -(으)ㄹ: 갈, 먹을, 살, 들을, 더울, 나을. */
function prospective(stem: string) {
  const { base, eu, l } = euStem(stem)
  return l ? base : eu ? base + '을' : withTail(base, 'ㄹ')
}
/** -(으)시-, then what follows: 가세요, 먹으세요, 사세요 (ㄹ drops before ㅅ), 들으세요. */
function honorific(stem: string, ending: string) {
  const { base, eu, l } = euStem(stem)
  return (l ? withTail(base, '') : eu ? base + '으' : base) + ending
}
/** -(스)ㅂ니다: 갑니다, 먹습니다, 삽니다. Irregular stems keep their shape here: 덥습니다, 듣습니다. */
function formal(stem: string) {
  if (last(stem).tail === 'ㄹ') return withTail(stem, 'ㅂ') + '니다'
  return closed(stem) ? stem + '습니다' : withTail(stem, 'ㅂ') + '니다'
}

export type Ending = 'present' | 'past' | 'future' | 'progressive' | 'want' | 'can' | 'must' | 'please' | 'dont' | 'pleaseForMe'
  | 'shallWe' | 'negative' | 'cannot' | 'formal' | 'casual' | 'honorific' | 'honorificPast' | 'copula' | 'notBe'

/** What the question asks for, in a few words. */
export const endingLabels: Record<Ending, string> = {
  present: 'Present · polite', past: 'Past · polite', future: 'Future · polite', progressive: 'Doing it right now',
  want: 'Want to', can: 'Can', must: 'Have to', please: 'Please do', dont: 'Please don’t', pleaseForMe: 'Please do it for me',
  shallWe: 'Shall we?', negative: 'Not (long form)', cannot: 'Can’t (long form)', formal: 'Formal (합니다체)', casual: 'Casual (반말)',
  honorific: 'Respectful · present', honorificPast: 'Respectful · past', copula: 'Is (A is B)', notBe: 'Is not',
}

/** Endings that go on a noun rather than a verb stem. */
export const nounEndings = new Set<Ending>(['copula', 'notBe'])

/** A verb or adjective in its dictionary form (먹다), or a noun for 이에요 and 아니에요, in the form asked for. */
export function conjugate(word: string, ending: Ending): string {
  if (ending === 'copula') return word + (closed(word) ? '이에요' : '예요')
  if (ending === 'notBe') return `${word}${closed(word) ? '이' : '가'} 아니에요`
  const stem = word.replace(/다$/, '')
  switch (ending) {
    case 'present': return infinitive(stem) + '요'
    case 'past': return withTail(infinitive(stem), 'ㅆ') + '어요'
    case 'casual': return infinitive(stem)
    case 'must': return infinitive(stem) + '야 해요'
    case 'pleaseForMe': return `${infinitive(stem)} 주세요`
    case 'future': return `${prospective(stem)} 거예요`
    case 'can': return `${prospective(stem)} 수 있어요`
    case 'shallWe': return `${prospective(stem)}까요?`
    case 'please': case 'honorific': return honorific(stem, '세요')
    case 'honorificPast': return honorific(stem, '셨어요')
    case 'formal': return formal(stem)
    case 'progressive': return `${stem}고 있어요`
    case 'want': return `${stem}고 싶어요`
    case 'dont': return `${stem}지 마세요`
    case 'negative': return `${stem}지 않아요`
    case 'cannot': return `${stem}지 못해요`
  }
}

/** One line on how this word takes this ending: the rule, not the answer. */
export function explain(word: string, ending: Ending): string {
  if (ending === 'copula') return closed(word) ? `${word} ends in a consonant, so 이에요.` : `${word} ends in a vowel, so 예요.`
  if (ending === 'notBe') return closed(word) ? `${word} ends in a consonant, so 이 before 아니에요.` : `${word} ends in a vowel, so 가 before 아니에요.`
  const stem = word.replace(/다$/, '')
  const kind = kindOf(stem)
  const { vowel } = last(stem)
  if (['progressive', 'want', 'dont', 'negative', 'cannot'].includes(ending)) return `Straight onto the stem ${stem}, whatever its last sound.`
  if (ending === 'formal') return last(stem).tail === 'ㄹ' ? `${stem} ends in ㄹ, which drops before ㅂ니다.` : closed(stem) ? `${stem} ends in a consonant: 습니다.` : `${stem} ends in a vowel: ㅂ joins it, then 니다.`
  if (['future', 'can', 'shallWe', 'please', 'honorific', 'honorificPast'].includes(ending)) {
    const ㄹ = ['future', 'can', 'shallWe'].includes(ending)
    switch (kind) {
      case 'b': return `${word} is ㅂ-irregular: ㅂ becomes 우 before 으, and the 으 goes.`
      case 'd': return `${word} is ㄷ-irregular: ㄷ becomes ㄹ before a vowel, then 으.`
      case 's': return `${word} is ㅅ-irregular: ㅅ drops before a vowel, but 으 stays.`
      case 'h': return `${word} is ㅎ-irregular: ㅎ drops, and no 으 is added.`
      case 'l': return ㄹ ? `${stem} already ends in ㄹ: nothing is added before it.` : `${stem} ends in ㄹ, which drops before ㅅ.`
      default: return closed(stem) ? `${stem} ends in a consonant, so 으 comes first.` : `${stem} ends in a vowel, so no 으.`
    }
  }
  switch (kind) {
    case 'hada': return 'Every 하다 verb: 하 + 여 becomes 해.'
    case 'b': return `${word} is ㅂ-irregular: ㅂ becomes 우, and 우 + 어 becomes 워.`
    case 'd': return `${word} is ㄷ-irregular: ㄷ becomes ㄹ before a vowel.`
    case 's': return `${word} is ㅅ-irregular: ㅅ drops before a vowel, with no contraction.`
    case 'reu': return `${word} is 르-irregular: 르 becomes ㄹ + 라 or 러.`
    case 'h': return `${word} is ㅎ-irregular: ㅎ drops and the vowel becomes ㅐ.`
    case 'eu': return `The ㅡ of ${stem.at(-1)} drops before 아/어; the syllable before decides which.`
    default: return closed(stem) ? `Last vowel ${vowel}: ${bright(vowel) ? '아' : '어'}.` : `${vowel} + ${bright(vowel) ? '아' : '어'} contracts${contractions[vowel] && contractions[vowel] !== vowel ? ` to ${contractions[vowel]}` : ''}.`
  }
}

/**
 * Real learners' mistakes for this word and ending, most instructive first. Each is wrong: a malformed form (wrong
 * vowel harmony, a missing contraction, an irregular treated as regular, a misplaced 으, a common misspelling) or a
 * real form that answers a different question (the present for the past). Never the answer, never a valid variant
 * (마시어요, 의사이에요, and 하여요 are all correct Korean, so none of them is ever offered as wrong).
 */
export function mistakes(word: string, ending: Ending): string[] {
  const right = conjugate(word, ending)
  const wrong: string[] = []
  if (ending === 'copula') wrong.push(...closed(word) ? [`${word}예요`, `${word}이예요`] : [`${word}에요`, `${word}이예요`], conjugate(word, 'notBe'))
  else if (ending === 'notBe') wrong.push(`${word}${closed(word) ? '가' : '이'} 아니에요`, `${word}${closed(word) ? '이' : '가'} 아니예요`, conjugate(word, 'copula'))
  else {
    const stem = word.replace(/다$/, '')
    const kind = kindOf(stem)
    const end = last(stem)
    const present = conjugate(word, 'present')
    // The 아/어 form built the wrong way: the other vowel, an irregular left regular, a contraction left out (only where
    // leaving it out is wrong: 가아, 서어, 켜어; 보아, 주어, 마시어 are valid).
    const misbuilt = [
      kind === 'regular' || kind === 'l' ? stem + (bright(end.vowel) ? '어' : '아') : undefined,
      ['b', 'd', 's', 'h'].includes(kind) ? stem + (bright(end.vowel) ? '아' : '어') : undefined,
      kind === 'reu' ? head(stem) + make({ ...end, vowel: bright(last(head(stem)).vowel) ? 'ㅏ' : 'ㅓ' }) : undefined,
      kind === 'eu' ? stem + '어' : undefined,
      kind === 'regular' && !end.tail && ['ㅏ', 'ㅓ', 'ㅕ'].includes(end.vowel) ? stem + (bright(end.vowel) ? '아' : '어') : undefined,
      kind === 'hada' ? head(stem) + '하어' : undefined,
    ].filter((form): form is string => !!form)
    const eu = euStem(stem)
    // The -(으) stem built the wrong way: 으 left out or added, an ㄹ-stem given 으, an irregular left regular.
    const misplaced = [
      eu.eu && kind !== 'd' && kind !== 's' ? stem : undefined,
      !eu.eu && kind !== 'b' && kind !== 'h' ? stem + '으' : undefined,
      kind === 'd' || kind === 'b' ? stem + '으' : undefined,
    ].filter((form): form is string => !!form)
    // A misplaced stem with the ㄹ of -(으)ㄹ: 먹 → 먹 (ㄹ can't join a consonant), 가으 → 가을, 살으 → 살을.
    const withL = (form: string) => form.endsWith('으') ? withTail(form, 'ㄹ') : form
    switch (ending) {
      case 'present': wrong.push(...misbuilt.map(form => form + '요'), conjugate(word, 'past'), conjugate(word, 'future')); break
      case 'past': wrong.push(...misbuilt.map(form => withTail(form, 'ㅆ') + '어요'), present, conjugate(word, 'future')); break
      case 'casual': wrong.push(...misbuilt, present, withTail(infinitive(stem), 'ㅆ') + '어'); break
      case 'must': wrong.push(...misbuilt.map(form => form + '야 해요'), `${infinitive(stem)}도 돼요`, `${stem}고 싶어요`); break
      case 'pleaseForMe': wrong.push(...misbuilt.map(form => `${form} 주세요`), `${stem}고 주세요`, `${stem}지 마세요`); break
      case 'future': wrong.push(...misplaced.map(form => `${withL(form)} 거예요`), `${prospective(stem)} 거에요`, present); break
      case 'can': wrong.push(...misplaced.map(form => `${withL(form)} 수 있어요`), `${prospective(stem)} 수 없어요`, `${stem}고 있어요`); break
      case 'shallWe': wrong.push(...misplaced.map(form => `${withL(form)}까요?`), `${prospective(stem)}가요?`, `${stem}고 싶어요?`); break
      case 'please': case 'honorific': wrong.push(...misplaced.map(form => `${form}세요`), `${stem}지 마세요`, present); break
      case 'honorificPast': wrong.push(...misplaced.map(form => `${form}셨어요`), conjugate(word, 'past'), honorific(stem, '세요')); break
      case 'formal': wrong.push(end.tail ? `${stem}니다` : `${stem}습니다`, end.tail && end.tail !== 'ㄹ' ? `${stem}읍니다` : `${withTail(stem, 'ㅂ')}습니다`, present); break
      case 'progressive': wrong.push(`${stem}는 있어요`, `${stem}고 있었어요`, `${stem}고 싶어요`); break
      case 'want': wrong.push(`${infinitive(stem)} 싶어요`, `${stem}지 싶어요`, `${stem}고 있어요`); break
      case 'dont': wrong.push(`${stem}고 마세요`, `${infinitive(stem)} 마세요`, `${stem}지 않아요`); break
      case 'negative': wrong.push(`${stem}지 안아요`, `${stem}고 않아요`, `${stem}지 못해요`); break
      case 'cannot': wrong.push(`${stem}지 못하요`, `${stem}고 못해요`, `${stem}지 않아요`); break
    }
  }
  return [...new Set(wrong.filter(form => form && form !== right))]
}

/** The answer and three wrong options, in a fixed order a saved question can be checked against. */
export function optionsFor(word: string, ending: Ending) {
  const wrong = mistakes(word, ending)
  return wrong.length >= 3 ? [conjugate(word, ending), ...wrong.slice(0, 3)] : undefined
}
