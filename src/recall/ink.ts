import { isRecord } from '../hooks/storage'

/** Position as a fraction of the pad (0–1) and ms since the stroke began, the usual input for handwriting recognition. */
export interface InkPoint { x: number; y: number; t: number }
export type InkStroke = InkPoint[]

/** Far beyond any word, and the same limits for writing, saving, and restoring. */
export const inkLimits = { strokes: 300, points: 4000 }

const round = (value: number) => Math.round(value * 1000) / 1000

/** Evenly thins a long stroke to at most `max` points, keeping both ends. */
export function thinStroke(stroke: InkStroke, max = inkLimits.points): InkStroke {
  if (stroke.length <= max) return stroke
  return Array.from({ length: max }, (_, index) => stroke[Math.round(index * (stroke.length - 1) / (max - 1))])
}

/** Within the limits, and three decimals: plenty for display and recognition, about half the saved size. */
export function compactStrokes(strokes: InkStroke[]): InkStroke[] {
  return strokes.slice(0, inkLimits.strokes).map(stroke => thinStroke(stroke).map(({ x, y, t }) => ({ x: round(x), y: round(y), t: Math.round(t) })))
}

/** A light copy for showing past answers: at most `budget` points in all, spread over the strokes by length. */
export function previewStrokes(strokes: InkStroke[], budget = 400): InkStroke[] {
  const total = strokes.reduce((sum, stroke) => sum + stroke.length, 0)
  if (total <= budget) return compactStrokes(strokes)
  return compactStrokes(strokes.map(stroke => thinStroke(stroke, Math.max(2, Math.floor(stroke.length / total * budget)))))
}

/** Restores saved strokes, or returns null if anything is malformed. */
export function parseStrokes(value: unknown): InkStroke[] | null {
  if (!Array.isArray(value) || value.length > inkLimits.strokes) return null
  const strokes: InkStroke[] = []
  for (const stroke of value) {
    if (!Array.isArray(stroke) || !stroke.length || stroke.length > inkLimits.points) return null
    const points: InkPoint[] = []
    for (const point of stroke) {
      if (!isRecord(point)) return null
      const { x, y, t } = point
      if (typeof x !== 'number' || typeof y !== 'number' || typeof t !== 'number' || !Number.isFinite(t)
        || !(x >= 0 && x <= 1) || !(y >= 0 && y <= 1)) return null
      points.push({ x, y, t })
    }
    strokes.push(points)
  }
  return strokes
}
