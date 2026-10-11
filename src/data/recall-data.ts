/**
 * Hand-written test data per card id:
 * - `clue`: a Korean → English hint that points at the meaning without stating it.
 * - `accept`: other English answers that should count as correct for typed answers, also hidden from anchor hints.
 */
export interface RecallData { clue?: string; accept?: string[] }

export const recallData: Record<string, RecallData> = {}
