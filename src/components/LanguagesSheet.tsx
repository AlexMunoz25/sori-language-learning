import { Check } from 'lucide-react'
import { languageOptions, setLanguages, useLanguages } from '../hooks/useLanguages'
import { Modal } from './Modal'

/** The languages a learner knows: Memory Anchors that hook into them come first; anchors in other languages stay one tap away. */
export function LanguagesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const languages = useLanguages()
  return <Modal open={open} onClose={onClose} title="Languages you know">
    <p className="sheet-description">Memory Anchors hook a Korean sound onto a word you already know. Anchors in these languages come first; the rest wait under “More ideas”. Roots and borrowed words always show.</p>
    <div className="language-list" role="group" aria-label="Languages you know">
      {languageOptions.map(option => {
        const on = languages.includes(option.id)
        const always = option.id === 'en'
        return <button key={option.id} className="language-option" aria-pressed={on} disabled={always}
          onClick={() => setLanguages(on ? languages.filter(id => id !== option.id) : [...languages, option.id])}>
          <span className="test-type-check" aria-hidden="true">{on && <Check size={14} strokeWidth={2.4} />}</span>
          <span className="flex-1 text-left">{option.label}</span>{always && <span className="language-note">The app's language</span>}
        </button>
      })}
    </div>
    <p className="sheet-footnote">Saved in this browser. Change it any time.</p>
  </Modal>
}
