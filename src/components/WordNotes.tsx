import type { VocabularyItem } from '../types/vocabulary'

/** Dictionary → polite form, who uses the word, and the source note. These contain Korean, so they only appear after an answer. */
export function WordNotes({ item, forms = true, speaker = true }: { item: VocabularyItem; forms?: boolean; speaker?: boolean }) {
  return <>
    {forms && item.dictionaryForm && <p className="forms" lang="ko"><span>{item.dictionaryForm}</span><span aria-label="becomes">→</span><span>{item.presentForm}</span></p>}
    {forms && item.dictionaryForm && <p className="reading-note">Dictionary → polite form</p>}
    {speaker && item.speaker && <p className="detail-note">Used by: {item.speaker}</p>}
    {item.note && <p className="detail-note">{item.note}</p>}
  </>
}
