import { BookA, Link2, Puzzle } from 'lucide-react'
import { sections } from '../data/cards'
import type { Section } from '../types/vocabulary'

const icons = { vocabulary: BookA, connectors: Link2, particles: Puzzle }

/** Vocabulary, Connectors, Particles: three decks with the same study, listening, and test tools. */
export function SectionTabs({ section, onSelect, disabled = false }: { section: Section; onSelect: (section: Section) => void; disabled?: boolean }) {
  return <div className="section-tabs" role="group" aria-label="Section">
    {sections.map(({ id, label }) => {
      const Icon = icons[id]
      return <button key={id} className={section === id ? 'selected' : ''} aria-pressed={section === id} disabled={disabled && section !== id}
        title={disabled && section !== id ? 'Finish or end the test to switch sections' : undefined} onClick={() => onSelect(id)}>
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" /><span>{label}</span>
      </button>
    })}
  </div>
}
