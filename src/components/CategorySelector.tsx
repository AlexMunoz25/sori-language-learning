import { useState } from 'react'
import { Check, Layers, Search } from 'lucide-react'
import { cards, categoriesOf, collections, inSelection, nounsOf, sectionInfo } from '../data/cards'
import type { StudyFilter } from '../hooks/useStudySession'
import type { Progress, Section } from '../types/vocabulary'
import { Modal } from './Modal'

interface Option { name: string; count: number; level: 'all' | 'collection' | 'category' }

/** Every way to narrow a section: all of it, a grammar collection, or one category. */
function optionsOf(section: Section): Option[] {
  const all: Option = { name: sectionInfo[section].all, count: cards.filter(item => item.section === section).length, level: 'all' }
  if (section === 'vocabulary') return [all, ...categoriesOf('vocabulary').map(category => ({ ...category, level: 'category' as const }))]
  return [all, ...collections.flatMap(collection => [
    { name: collection.all, count: cards.filter(item => item.collection === collection.id).length, level: 'collection' as const },
    ...categoriesOf(collection.id).map(category => ({ ...category, level: 'category' as const })),
  ])]
}

export function CategorySelector({ open, onClose, section, selected, filter, onSelect, progress }: {
  open: boolean; onClose: () => void; section: Section; selected: string; filter: StudyFilter
  onSelect: (category: string, filter: StudyFilter) => void; progress: Progress
}) {
  const [search, setSearch] = useState('')
  const [, plural] = nounsOf(sectionInfo[section].all)
  const difficult = filter === 'difficult'
  const options = optionsOf(section)
  const shown = options.filter(option => option.name.toLowerCase().includes(search.toLowerCase()))
  const count = (option: Option) => difficult ? cards.filter(item => inSelection(item, option.name) && progress[item.id] === 'difficult').length : option.count
  return <Modal open={open} onClose={onClose} title={`Choose your ${plural}`}>
    <div className="segmented sheet-filter" role="group" aria-label="Collection">
      <button aria-pressed={!difficult} onClick={() => onSelect(selected, 'all')}>All {plural}</button>
      <button aria-pressed={difficult} onClick={() => onSelect(selected, 'difficult')}>Difficult only</button>
    </div>
    <p className="sheet-description">{difficult ? `Your difficult ${plural}, by category.` : 'A small practice, or a little of everything.'}</p>
    <label className="search-field flex items-center gap-3"><Search size={18} aria-hidden="true" />
      <input type="search" placeholder="Find a category" aria-label="Find a category" value={search} onChange={event => setSearch(event.target.value)} />
    </label>
    <div className="category-list">
      {shown.map(option => <button key={option.name} className={`category-option ${option.level} ${selected === option.name ? 'selected' : ''}`}
        onClick={() => { onSelect(option.name, filter); onClose(); setSearch('') }} aria-pressed={selected === option.name}>
        {option.level === 'category' ? <span className="category-dot" /> : <Layers size={option.level === 'all' ? 20 : 18} />}
        <span className="flex-1 text-left">{option.name}</span><span className="category-count">{count(option)}</span>
        <span className="w-5">{selected === option.name && <Check size={18} />}</span>
      </button>)}
      {!shown.length && <p className="empty-search">No matching categories. Try another name.</p>}
    </div>
    <p className="sheet-footnote">Every new selection starts with a fresh shuffle.</p>
  </Modal>
}
