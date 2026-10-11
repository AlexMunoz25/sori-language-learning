import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog || !open) return
    const originalOverflow = document.body.style.overflow
    dialog.showModal()
    document.body.style.overflow = 'hidden'
    return () => { dialog.close(); document.body.style.overflow = originalOverflow }
  }, [open])
  return <dialog ref={ref} className="sheet" aria-label={title} onCancel={onClose} onClick={event => {
    if (event.target !== event.currentTarget) return
    const bounds = event.currentTarget.getBoundingClientRect()
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose()
  }}>
    <div className="sheet-handle" />
    <div className="sheet-header flex items-center justify-between gap-4">
      <h2>{title}</h2>
      <button className="icon-button" aria-label={`Close ${title.toLowerCase()}`} onClick={onClose}><X size={21} /></button>
    </div>
    {children}
  </dialog>
}
