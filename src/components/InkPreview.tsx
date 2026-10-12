import { useEffect, useRef } from 'react'
import type { InkStroke } from '../recall/ink'

/** A small, read-only picture of handwriting, e.g. in test results: scaled to fit, the pad's proportions kept. */
export function InkPreview({ strokes, aspect = 2.3, label }: { strokes: InkStroke[]; aspect?: number; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const element = canvas.current
    const context = element?.getContext('2d')
    if (!element || !context) return
    const ratio = window.devicePixelRatio || 1
    const { clientWidth: width, clientHeight: height } = element
    Object.assign(element, { width: Math.max(1, Math.round(width * ratio)), height: Math.max(1, Math.round(height * ratio)) })
    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    let [left, right, top, bottom] = [Infinity, -Infinity, Infinity, -Infinity]
    for (const stroke of strokes) for (const { x, y } of stroke) {
      left = Math.min(left, x * aspect); right = Math.max(right, x * aspect)
      top = Math.min(top, y); bottom = Math.max(bottom, y)
    }
    if (left > right) return
    const margin = 4
    const scale = Math.min((width - margin * 2) / Math.max(right - left, .05), (height - margin * 2) / Math.max(bottom - top, .05))
    const offsetX = (width - (right - left) * scale) / 2 - left * scale
    const offsetY = (height - (bottom - top) * scale) / 2 - top * scale
    Object.assign(context, { strokeStyle: '#243e32', fillStyle: '#243e32', lineWidth: 1.6, lineCap: 'round', lineJoin: 'round' })
    for (const stroke of strokes) {
      const points = stroke.map(({ x, y }) => [x * aspect * scale + offsetX, y * scale + offsetY])
      context.beginPath()
      if (points.length === 1) { context.arc(points[0][0], points[0][1], .9, 0, Math.PI * 2); context.fill(); continue }
      points.forEach(([x, y], index) => index ? context.lineTo(x, y) : context.moveTo(x, y))
      context.stroke()
    }
  }, [strokes, aspect])
  return <canvas ref={canvas} className="ink-preview" role="img" aria-label={label} />
}
