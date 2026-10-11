/** Fisher–Yates shuffle. `avoid` never comes first, so a reshuffled deck doesn't repeat its last card. */
export function shuffle<T>(values: readonly T[], avoid?: T, random: () => number = Math.random): T[] {
  const next = [...values]
  for (let index = next.length - 1; index > 0; index--) {
    const target = Math.floor(random() * (index + 1))
    ;[next[index], next[target]] = [next[target], next[index]]
  }
  if (next.length > 1 && next[0] === avoid) [next[0], next[1]] = [next[1], next[0]]
  return next
}
