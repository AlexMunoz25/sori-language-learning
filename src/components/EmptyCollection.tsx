import { ArrowRight, Star } from 'lucide-react'

/** Shown when the chosen collection and category have no words, in study and test alike. */
export function EmptyCollection({ difficultCount, onSelect }: { difficultCount: number; onSelect: (category: string, filter: 'all' | 'difficult') => void }) {
  return <section className="empty-state">
    <div className="empty-icon"><Star size={30} strokeWidth={1.3} /></div><h2>{difficultCount ? 'A clear slate here.' : 'Give tricky words a little love.'}</h2>
    <p>{difficultCount ? 'No difficult words in this category. Try all your words.' : 'Tap Difficult on any card. Your personal practice pile will be waiting here.'}</p>
    <button className="primary-button" onClick={() => onSelect('All words', difficultCount ? 'difficult' : 'all')}>{difficultCount ? 'See all difficult words' : 'Explore your words'}<ArrowRight size={18} /></button>
  </section>
}
