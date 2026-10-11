import { useState } from 'react'
import { Check, Layers, Search } from 'lucide-react'
import { categories, vocabulary } from '../data/vocabulary'
import type { Progress } from '../types/vocabulary'
import { Modal } from './Modal'

export function CategorySelector({ open, onClose, selected, onSelect, difficult, progress }: {
  open: boolean; onClose: () => void; selected: string; onSelect: (category: string) => void;
  difficult: boolean; progress: Progress
}) {
  const [search, setSearch] = useState('')
  const options = [{ name: 'All words', count: vocabulary.length }, ...categories]
  return <Modal open={open} onClose={onClose} title="Choose your words">
    <p className="sheet-description">{difficult ? 'Your difficult words, by category.' : 'A small practice, or a little of everything.'}</p>
    <label className="search-field flex items-center gap-3"><Search size={18} aria-hidden="true" />
      <input type="search" placeholder="Find a category" aria-label="Find a category" value={search} onChange={event => setSearch(event.target.value)} />
    </label>
    <div className="category-list">
      {options.filter(category => category.name.toLowerCase().includes(search.toLowerCase())).map(category => {
        const count = difficult ? vocabulary.filter(item => (category.name === 'All words' || item.category === category.name) && progress[item.id] === 'difficult').length : category.count
        return <button key={category.name} className={`category-option ${selected === category.name ? 'selected' : ''}`} onClick={() => { onSelect(category.name); onClose(); setSearch('') }} aria-pressed={selected === category.name}>
          {category.name === 'All words' ? <Layers size={20} /> : <span className="category-dot" />}
          <span className="flex-1 text-left">{category.name}</span><span className="category-count">{count}</span>
          <span className="w-5">{selected === category.name && <Check size={18} />}</span>
        </button>
      })}
      {!options.some(category => category.name.toLowerCase().includes(search.toLowerCase())) && <p className="empty-search">No matching categories. Try another name.</p>}
    </div>
    <p className="sheet-footnote">Every new selection starts with a fresh shuffle.</p>
  </Modal>
}
