/** The large Korean word used by study cards, the listening answer, and tests. */
export function KoreanWord({ word }: { word: string }) {
  return <h2 lang="ko" data-testid="korean-word" className={`korean-word ${word.length > 10 ? 'long-word' : ''}`}>{word}</h2>
}
