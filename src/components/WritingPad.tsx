import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Eraser, PenLine, Trash2, Undo2 } from 'lucide-react'
import { inkLimits, thinStroke, type InkPoint, type InkStroke } from '../recall/ink'

type Tool = 'pen' | 'eraser'
interface Ink { strokes: InkStroke[]; past: InkStroke[][] }
interface Point { x: number; y: number }

const inkColor = '#243e32'
const inkWidth = 4.5
const clamp = (value: number) => Math.min(1, Math.max(0, value))

function paint(canvas: HTMLCanvasElement, stroke: InkStroke, from = 0) {
  const context = canvas.getContext('2d')
  if (!context || !stroke.length) return
  const { width, height } = canvas
  const lineWidth = inkWidth * width / Math.max(canvas.clientWidth, 1)
  context.strokeStyle = inkColor
  context.fillStyle = inkColor
  context.lineWidth = lineWidth
  context.lineCap = 'round'
  context.lineJoin = 'round'
  if (stroke.length === 1) {
    context.beginPath()
    context.arc(stroke[0].x * width, stroke[0].y * height, lineWidth / 2, 0, Math.PI * 2)
    context.fill()
    return
  }
  const start = Math.max(from - 1, 0)
  context.beginPath()
  context.moveTo(stroke[start].x * width, stroke[start].y * height)
  for (const point of stroke.slice(start + 1)) context.lineTo(point.x * width, point.y * height)
  context.stroke()
}

// Eraser geometry, in CSS pixels.
function toSegment(point: Point, a: Point, b: Point) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const length = dx * dx + dy * dy
  const along = length ? clamp(((point.x - a.x) * dx + (point.y - a.y) * dy) / length) : 0
  return Math.hypot(point.x - (a.x + along * dx), point.y - (a.y + along * dy))
}
const side = (o: Point, a: Point, b: Point) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)
function apart(a: Point, b: Point, c: Point, d: Point) {
  if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) return 0
  return Math.min(toSegment(a, c, d), toSegment(b, c, d), toSegment(c, a, b), toSegment(d, a, b))
}
/** How close the eraser's path from `a` to `b` comes to a stroke. */
function reach(stroke: InkStroke, a: Point, b: Point, width: number, height: number) {
  const points = stroke.map(point => ({ x: point.x * width, y: point.y * height }))
  if (points.length === 1) return toSegment(points[0], a, b)
  let nearest = Infinity
  for (let index = 1; index < points.length; index++) nearest = Math.min(nearest, apart(a, b, points[index - 1], points[index]))
  return nearest
}
function samples(event: ReactPointerEvent) {
  const coalesced = typeof event.nativeEvent.getCoalescedEvents === 'function' ? event.nativeEvent.getCoalescedEvents() : []
  return coalesced.length ? coalesced : [event.nativeEvent]
}

/** A handwriting surface for finger, pen, or mouse, with a stroke eraser. Children sit on the left of its toolbar. */
export function WritingPad({ children, initialStrokes, onChange, readOnly = false, hint = 'Write the Korean word here' }: {
  children?: ReactNode
  /** Read once, when the pad mounts: e.g. a draft restored after a reload. */
  initialStrokes?: InkStroke[]
  /** Called after every change: a stroke, an erase, Clear all, or Undo. */
  onChange?: (strokes: InkStroke[]) => void
  /** Shows the ink but accepts no input, e.g. an answer under review. */
  readOnly?: boolean
  hint?: string
}) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const model = useRef<Ink>({ strokes: initialStrokes ?? [], past: [] })
  const [ink, setInk] = useState<Ink>(model.current)
  const [tool, setTool] = useState<Tool>('pen')
  const [drawing, setDrawing] = useState(false)
  const [eraserTip, setEraserTip] = useState(false)
  const pen = useRef<{ pointer: number; start: number; stroke: InkStroke } | null>(null)
  const eraser = useRef<{ pointer: number; origin: Point; last: Point; moved: boolean; recorded: boolean } | null>(null)
  const notify = useRef(onChange)
  useEffect(() => { notify.current = onChange })

  /** Every change goes through here, so Undo steps back through drawing, erasing, and clearing alike. */
  function change(strokes: InkStroke[], record = true) {
    const { strokes: before, past } = model.current
    model.current = { strokes, past: record ? [...past, before] : past }
    setInk(model.current)
    notify.current?.(strokes)
  }
  function undo() {
    const { past } = model.current
    if (!past.length) return
    model.current = { strokes: past[past.length - 1], past: past.slice(0, -1) }
    setInk(model.current)
    notify.current?.(model.current.strokes)
  }
  function redraw() {
    const element = canvas.current
    if (!element) return
    element.getContext('2d')?.clearRect(0, 0, element.width, element.height)
    for (const stroke of model.current.strokes) paint(element, stroke)
    if (pen.current) paint(element, pen.current.stroke)
  }
  useEffect(() => {
    redraw()
    // Nothing left to erase: hand back the pen.
    if (!ink.strokes.length) setTool('pen')
  }, [ink])
  // The eraser explains itself briefly, then gets out of the way of the ink.
  useEffect(() => {
    setEraserTip(tool === 'eraser')
    if (tool !== 'eraser') return
    const timer = setTimeout(() => setEraserTip(false), 2500)
    return () => clearTimeout(timer)
  }, [tool])
  // Locking drops any gesture still in progress, so a late pointerup can't add to a submitted answer.
  useEffect(() => {
    if (!readOnly) return
    pen.current = null
    eraser.current = null
    setDrawing(false)
    setTool('pen')
    redraw()
  }, [readOnly])
  useEffect(() => {
    const element = canvas.current
    if (!element) return
    // Match the backing store to the displayed size so ink stays sharp, then repaint from the stored strokes.
    const fit = () => {
      const ratio = window.devicePixelRatio || 1
      const width = Math.max(1, Math.round(element.clientWidth * ratio))
      const height = Math.max(1, Math.round(element.clientHeight * ratio))
      if (element.width !== width || element.height !== height) Object.assign(element, { width, height })
      redraw()
    }
    fit()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(fit)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function locate(event: PointerEvent): Point {
    const box = canvas.current!.getBoundingClientRect()
    return { x: event.clientX - box.left, y: event.clientY - box.top }
  }
  function point(event: PointerEvent, start: number): InkPoint {
    const box = canvas.current!.getBoundingClientRect()
    return { x: clamp((event.clientX - box.left) / box.width), y: clamp((event.clientY - box.top) / box.height), t: Math.round(event.timeStamp - start) }
  }
  /** A tap removes only the stroke nearest to it (the newest wins a tie); a swipe removes every stroke it crosses. */
  function erase(from: Point, to: Point, pointerType: string, swipe: boolean) {
    const gesture = eraser.current
    const element = canvas.current
    if (!gesture || !element) return
    const radius = inkWidth / 2 + (pointerType === 'touch' ? 14 : 7)
    const { strokes } = model.current
    const distances = strokes.map(stroke => reach(stroke, from, to, element.clientWidth, element.clientHeight))
    let nearest = -1
    distances.forEach((distance, index) => { if (distance <= radius && (nearest < 0 || distance <= distances[nearest])) nearest = index })
    if (nearest < 0) return
    change(strokes.filter((_, index) => swipe ? distances[index] > radius : index !== nearest), !gesture.recorded)
    // One gesture is one step for Undo, however many strokes it removes.
    gesture.recorded = true
  }
  function finish(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (eraser.current?.pointer === event.pointerId) { eraser.current = null; return }
    const current = pen.current
    if (!current || current.pointer !== event.pointerId) return
    pen.current = null
    setDrawing(false)
    change([...model.current.strokes, thinStroke(current.stroke)])
  }

  const count = ink.strokes.length
  return <div className={`writing-pad ${readOnly ? 'locked' : ''}`} data-testid="writing-pad" data-strokes={count} data-tool={readOnly ? undefined : tool}>
    <div className="writing-surface">
      <canvas ref={canvas} role="img" aria-label={count ? `Your writing: ${count} ${count === 1 ? 'stroke' : 'strokes'}` : `Writing pad: ${readOnly ? 'nothing written' : 'empty'}`}
        onPointerDown={event => {
          // One finger or pen at a time, so a resting palm can't add stray marks.
          if (readOnly || pen.current || eraser.current || (event.pointerType === 'mouse' && event.button !== 0)) return
          event.preventDefault()
          try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* the gesture still works without capture */ }
          if (tool === 'eraser') {
            const origin = locate(event.nativeEvent)
            eraser.current = { pointer: event.pointerId, origin, last: origin, moved: false, recorded: false }
            setEraserTip(false)
            erase(origin, origin, event.pointerType, false)
            return
          }
          if (model.current.strokes.length >= inkLimits.strokes) return
          pen.current = { pointer: event.pointerId, start: event.timeStamp, stroke: [point(event.nativeEvent, event.timeStamp)] }
          setDrawing(true)
          paint(event.currentTarget, pen.current.stroke)
        }}
        onPointerMove={event => {
          const gesture = eraser.current
          if (gesture?.pointer === event.pointerId) {
            for (const sample of samples(event)) {
              const at = locate(sample)
              // A little jitter during a tap is still a tap.
              if (!gesture.moved && Math.hypot(at.x - gesture.origin.x, at.y - gesture.origin.y) < 6) continue
              gesture.moved = true
              erase(gesture.last, at, event.pointerType, true)
              gesture.last = at
            }
            return
          }
          const current = pen.current
          if (!current || current.pointer !== event.pointerId) return
          const from = current.stroke.length
          for (const sample of samples(event)) current.stroke.push(point(sample, current.start))
          paint(event.currentTarget, current.stroke, from)
        }}
        onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish} />
      {!count && !drawing && <p className="writing-hint" aria-hidden="true"><span>{readOnly ? 'Nothing written' : hint}</span></p>}
      {eraserTip && !readOnly && <p className="eraser-hint" aria-hidden="true">Tap or swipe over a stroke to erase it</p>}
    </div>
    {(children || !readOnly) && <div className="writing-bar">
      {children}
      {!readOnly && <div className="writing-tools">
        <div className="ink-tools" role="group" aria-label="Writing tool">
          <button aria-label="Pen" title="Pen" aria-pressed={tool === 'pen'} onClick={() => setTool('pen')}><span><PenLine size={17} /></span></button>
          <button aria-label="Eraser" title="Eraser: tap or swipe over a stroke" aria-pressed={tool === 'eraser'} disabled={!count} onClick={() => setTool(tool === 'eraser' ? 'pen' : 'eraser')}><span><Eraser size={17} /></span></button>
        </div>
        <button aria-label="Undo" title="Undo" disabled={!ink.past.length} onClick={undo}><Undo2 size={18} /></button>
        <button aria-label="Clear all" title="Clear all" disabled={!count} onClick={() => change([])}><Trash2 size={18} /></button>
      </div>}
    </div>}
  </div>
}
