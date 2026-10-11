import type { VocabularyItem } from '../types/vocabulary'
import { lookAlikeGroups } from './answers'
import { shuffle } from './random'
import type { QuestionRule, TestQuestion } from './types'

type Assignment = { item: VocabularyItem; rule: QuestionRule }
const promptOf = (rule: QuestionRule, item: VocabularyItem) => `${rule.id}|${rule.promptKey(item)}`

/** Test history (oldest test first) → how many tests ago each word was last asked. */
export function recencyOf(history: string[][]) {
  const recent = new Map<string, number>()
  history.forEach((ids, index) => ids.forEach(id => recent.set(id, history.length - index)))
  return recent
}

/**
 * Chooses which cards a test asks: words not tested lately first (then the longest-ago tests), and
 * look-alikes (same Korean or same meaning) only when a long test runs out of other words.
 */
export function pickItems(pool: VocabularyItem[], length: number, random: () => number, recent: ReadonlyMap<string, number> = new Map()) {
  const fresh = shuffle(pool.filter(item => !recent.has(item.id)), undefined, random)
  const seen = shuffle(pool.filter(item => recent.has(item.id)), undefined, random)
    .sort((a, b) => recent.get(b.id)! - recent.get(a.id)!)
  const picked: VocabularyItem[] = []
  const deferred: VocabularyItem[] = []
  const groups = new Set<string>()
  for (const item of [...fresh, ...seen]) {
    if (picked.length >= length) break
    const keys = lookAlikeGroups(item)
    if (keys.some(key => groups.has(key))) { deferred.push(item); continue }
    keys.forEach(key => groups.add(key))
    picked.push(item)
  }
  return [...picked, ...deferred].slice(0, length)
}

/**
 * Gives every card a type: equal shares of the enabled types, and no prompt shown twice. Cards competing
 * for a prompt (가요 / 가요 / 팝) choose first, so they can take different types; the rest fill the shares.
 * A card no type can take (two look-alikes, one type enabled) is dropped.
 */
export function assignTypes(items: VocabularyItem[], rules: QuestionRule[], random: () => number): Assignment[] {
  const share = new Map(shuffle(rules, undefined, random).map((rule, index) =>
    [rule, Math.floor(items.length / rules.length) + (index < items.length % rules.length ? 1 : 0)]))
  const claims = new Map<string, number>()
  for (const item of items) for (const rule of rules) if (rule.supports(item)) claims.set(promptOf(rule, item), (claims.get(promptOf(rule, item)) ?? 0) + 1)
  const contested = (item: VocabularyItem) => rules.some(rule => rule.supports(item) && claims.get(promptOf(rule, item))! > 1)
  const used = new Set<string>()
  const assigned = new Map<VocabularyItem, QuestionRule>()
  const take = (item: VocabularyItem, rule: QuestionRule) => {
    assigned.set(item, rule)
    used.add(promptOf(rule, item))
    share.set(rule, share.get(rule)! - 1)
  }
  // Every prompt this card could use is taken: move an earlier card to another type to free one.
  const makeRoom = (card: VocabularyItem) => {
    for (const rule of rules.filter(candidate => candidate.supports(card))) {
      const holder = [...assigned].find(([item, taken]) => taken === rule && promptOf(rule, item) === promptOf(rule, card))?.[0]
      const other = holder && rules.find(alternative => alternative !== rule && alternative.supports(holder) && !used.has(promptOf(alternative, holder)))
      if (!holder || !other) continue
      used.delete(promptOf(rule, holder))
      share.set(rule, share.get(rule)! + 1)
      take(holder, other)
      return rule
    }
  }
  for (const item of [...shuffle(items.filter(contested), undefined, random), ...shuffle(items.filter(item => !contested(item)), undefined, random)]) {
    const open = shuffle(rules, undefined, random)
      .filter(rule => rule.supports(item) && !used.has(promptOf(rule, item)))
      .sort((a, b) => share.get(b)! - share.get(a)!)
    const rule = open[0] ?? makeRoom(item)
    if (rule) take(item, rule)
  }
  return items.filter(item => assigned.has(item)).map(item => ({ item, rule: assigned.get(item)! }))
}

/**
 * Puts the questions in random order, with no more than `max` of one type in a row and, where possible,
 * no look-alikes back to back. Reordering never changes a card's type, so prompts stay unique.
 */
export function orderQuestions<T extends Assignment>(assignments: T[], random: () => number, max = 3): T[] {
  const remaining = shuffle(assignments, undefined, random)
  const ordered: T[] = []
  const alike = (a: T, b: T) => lookAlikeGroups(a.item).some(key => lookAlikeGroups(b.item).includes(key))
  while (remaining.length) {
    const left = new Map<QuestionRule, number>()
    remaining.forEach(({ rule }) => left.set(rule, (left.get(rule) ?? 0) + 1))
    const tail = ordered.slice(-max)
    const blocked = tail.length === max && tail.every(({ rule }) => rule === tail[0].rule) ? tail[0].rule : undefined
    const allowed = [...left.keys()].filter(rule => rule !== blocked)
    const choices = allowed.length ? allowed : [...left.keys()]
    const previous = ordered[ordered.length - 1]
    const fits = (entry: T, candidate: QuestionRule) => entry.rule === candidate && !(previous && alike(previous, entry))
    // A type with too many left must go now, or the test would have to end on a long run of it.
    let rule = choices.find(candidate => left.get(candidate)! > (remaining.length - left.get(candidate)!) * max)
    if (!rule) {
      const apartFromPrevious = choices.filter(candidate => remaining.some(entry => fits(entry, candidate)))
      const options = apartFromPrevious.length ? apartFromPrevious : choices
      let pick = random() * options.reduce((sum, candidate) => sum + left.get(candidate)!, 0)
      rule = options.find(candidate => (pick -= left.get(candidate)!) < 0) ?? options[options.length - 1]
    }
    const apart = remaining.findIndex(entry => fits(entry, rule))
    ordered.push(...remaining.splice(apart >= 0 ? apart : remaining.findIndex(entry => entry.rule === rule), 1))
  }
  // Look-alikes still back to back (usually the last two left): swapping questions of the same type keeps the type pattern.
  const clash = (position: number) => [position - 1, position + 1].some(near => near >= 0 && near < ordered.length && alike(ordered[near], ordered[position]))
  for (let index = 1; index < ordered.length; index++) {
    if (!alike(ordered[index - 1], ordered[index])) continue
    for (const other of shuffle([...ordered.keys()], undefined, random)) {
      if (other === index || ordered[other].rule !== ordered[index].rule) continue
      ;[ordered[index], ordered[other]] = [ordered[other], ordered[index]]
      if (!clash(index) && !clash(other)) break
      ;[ordered[index], ordered[other]] = [ordered[other], ordered[index]]
    }
  }
  return ordered
}

/** Builds a test: distinct cards, balanced types in random order, positional question ids. */
export function buildTest(pool: VocabularyItem[], options: { length: number; rules: QuestionRule[]; random?: () => number; recent?: ReadonlyMap<string, number> }): TestQuestion[] {
  const { rules, random = Math.random } = options
  if (!rules.length) return []
  const eligible = pool.filter(item => rules.some(rule => rule.supports(item)))
  const items = pickItems(eligible, Math.max(0, Math.min(options.length, eligible.length)), random, options.recent)
  return orderQuestions(assignTypes(items, rules, random), random).map(({ item, rule }, index) => ({
    id: `q${index + 1}`,
    itemId: item.id,
    type: rule.id,
    ...rule.prepare ? { data: rule.prepare(item, { pool: eligible, random }) } : {},
  }))
}

/** How many questions this pool can give: with one type enabled, words sharing a prompt (락 / 록) count once. */
export const capacity = (pool: VocabularyItem[], rules: QuestionRule[]) => buildTest(pool, { length: pool.length, rules, random: () => 0 }).length
