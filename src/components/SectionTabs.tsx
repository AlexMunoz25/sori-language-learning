import { BookA, Puzzle } from 'lucide-react'
import { sections } from '../data/cards'
import type { Section } from '../types/vocabulary'

const icons = { vocabulary: BookA, grammar: Puzzle }

/** Vocabulary and Grammar: the Library's two halves, each with its own place, selection, and Difficult pile. */
export function SectionTabs({ section, onSelect }: { section: Section; onSelect: (section: Section) => void }) {
  return <div className="section-tabs" role="group" aria-label="Section">
    {sections.map(({ id, label }) => {
      const Icon = icons[id]
      return <button key={id} className={section === id ? 'selected' : ''} aria-pressed={section === id} onClick={() => onSelect(id)}>
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
      </button>
    })}
  </div>
}
