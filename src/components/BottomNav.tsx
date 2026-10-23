import { GraduationCap, Library, Repeat } from 'lucide-react'
import type { Destination } from '../hooks/useStudySession'

const items: Array<{ id: Destination; label: string; Icon: typeof Library }> = [
  { id: 'learn', label: 'Learn', Icon: GraduationCap },
  { id: 'library', label: 'Library', Icon: Library },
  { id: 'review', label: 'Review', Icon: Repeat },
]

/** Learn, Library, Review: the same cards and anchors in all three. Review's badge counts what's due today. */
export function BottomNav({ destination, due, onGo }: { destination: Destination; due: number; onGo: (destination: Destination) => void }) {
  return <nav className="bottom-nav grid grid-cols-3" aria-label="Main">
    {items.map(({ id, label, Icon }) => <button key={id} className={destination === id ? 'selected' : ''} aria-current={destination === id ? 'page' : undefined} onClick={() => onGo(id)}>
      <Icon size={20} strokeWidth={1.7} aria-hidden="true" /><span>{label}</span>
      {id === 'review' && due > 0 && <span className="nav-badge" aria-label={`${due} due`}>{due}</span>}
    </button>)}
  </nav>
}
