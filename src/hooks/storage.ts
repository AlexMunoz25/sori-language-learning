export function readStorage(storage: 'localStorage' | 'sessionStorage', key: string): unknown {
  try { return JSON.parse(window[storage].getItem(key) ?? 'null') } catch { return null }
}

export function writeStorage(storage: 'localStorage' | 'sessionStorage', key: string, value: unknown): boolean {
  try { window[storage].setItem(key, JSON.stringify(value)); return true } catch { return false }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value)
}
