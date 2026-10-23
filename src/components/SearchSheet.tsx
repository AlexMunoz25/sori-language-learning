import { useState } from 'react'
import { Search } from 'lucide-react'
import { collectionInfo } from '../data/cards'
import { searchCards } from '../data/search'
import { Modal } from './Modal'

/** Finds any card, word or grammar, by Korean, English, or how it sounds, and opens it in the Library. */
export function SearchSheet({ open, onClose, onOpen }: { open: boolean; onClose: () => void; onOpen: (id: string) => void }) {
  const [query, setQuery] = useState('')
  const results = searchCards(query)
  function close() { setQuery(''); onClose() }
  return <Modal open={open} onClose={close} title="Search the Library">
    <label className="search-field flex items-center gap-3"><Search size={18} aria-hidden="true" />
      <input type="search" autoFocus placeholder="Korean, English, or how it sounds" aria-label="Search words and grammar" value={query} onChange={event => setQuery(event.target.value)} />
    </label>
    {results.length > 0 && <ul className="search-results" aria-label="Results">
      {results.map(item => <li key={item.id}>
        <button className="search-result" onClick={() => { onOpen(item.id); close() }}>
          <span className="search-korean" lang="ko">{item.korean}</span>
          <span className="search-meaning">{item.meaning}</span>
          <span className="search-kind">{item.collection ? collectionInfo[item.collection].label : item.category}</span>
        </button>
      </li>)}
    </ul>}
    {query.trim() && !results.length && <p className="empty-search">Nothing matches “{query.trim()}”. Try a Korean word, an English meaning, or how it sounds.</p>}
    {!query.trim() && <p className="sheet-description">Type 커피, “coffee”, or “keo-pi”. Grammar works too: 은, “topic”, “because”.</p>}
  </Modal>
}
