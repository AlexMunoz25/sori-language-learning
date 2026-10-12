/**
 * Root-based Memory Anchors spell out a word's parts, each with its reading and meaning, then what they add up to:
 *
 *   말 mal = WORDS + 해요 hae-yo = DO → doing speech: to speak.
 *   공 (空) gong = AIR + 항 (港) hang = PORT → air-port, word for word.
 *
 * A part is `Korean[ (Hanja)] reading = MEANING`; parts are joined by ` + `, and ` → ` starts the gloss.
 */
export interface RootPart {
  korean: string
  hanja?: string
  reading: string
  meaning: string
}

const part = /^(-?[가-힣]+-?)(?: \((\p{Script=Han}+)\))? ([a-z]+(?:-[a-z]+)*) = (-?[A-Z][^+→]*?)$/u

const render = (parts: RootPart[], gloss: string) =>
  `${parts.map(({ korean, hanja, reading, meaning }) => `${korean}${hanja ? ` (${hanja})` : ''} ${reading} = ${meaning}`).join(' + ')} → ${gloss}`

/** The parts of a root-based anchor, or undefined if the text isn't one (or wouldn't read back exactly). */
export function rootParts(text: string): { parts: RootPart[]; gloss: string } | undefined {
  const arrow = text.indexOf(' → ')
  if (arrow < 0) return undefined
  const gloss = text.slice(arrow + 3)
  const parts: RootPart[] = []
  for (const piece of text.slice(0, arrow).split(' + ')) {
    const match = piece.match(part)
    if (!match) return undefined
    parts.push({ korean: match[1], ...match[2] ? { hanja: match[2] } : {}, reading: match[3], meaning: match[4] })
  }
  return parts.length >= 2 && gloss && render(parts, gloss) === text ? { parts, gloss } : undefined
}

/** The parts' meanings, with their Hanja: 空 AIR + 港 PORT. No Korean or reading, so it can hint in either direction. */
export const rootChain = (parts: RootPart[]) => parts.map(({ hanja, meaning }) => hanja ? `${hanja} ${meaning}` : meaning).join(' + ')
