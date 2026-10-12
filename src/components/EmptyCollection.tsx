import { ArrowRight, Star } from 'lucide-react'
import { sectionInfo } from '../data/cards'
import type { Section } from '../types/vocabulary'

/** Shown when the chosen collection and category have no cards, in study and test alike. */
export function EmptyCollection({ section, difficultCount, onSelect }: { section: Section; difficultCount: number; onSelect: (category: string, filter: 'all' | 'difficult') => void }) {
  const { all, noun: [, plural] } = sectionInfo[section]
  return <section className="empty-state">
    <div className="empty-icon"><Star size={30} strokeWidth={1.3} /></div><h2>{difficultCount ? 'A clear slate here.' : `Give tricky ${plural} a little love.`}</h2>
    <p>{difficultCount ? `No difficult ${plural} in this category. Try all your ${plural}.` : 'Tap Difficult on any card. Your personal practice pile will be waiting here.'}</p>
    <button className="primary-button" onClick={() => onSelect(all, difficultCount ? 'difficult' : 'all')}>{difficultCount ? `See all difficult ${plural}` : `Explore your ${plural}`}<ArrowRight size={18} /></button>
  </section>
}
