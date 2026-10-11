export type OriginKind = 'native' | 'sino-korean' | 'loanword' | 'mixed' | 'phrase' | 'uncertain'

export interface OriginSource {
  title: string
  url: string
}

export interface RootConcept {
  label: string
  hanja?: string
  meaning: string
  kind: 'hanja' | 'stem' | 'pattern' | 'loanword'
  /** Broad grammatical patterns are less specific than a shared lexical root. */
  weight?: number
}

export interface OriginReview {
  lemma: string
  kind: OriginKind
  /** Reviewed dictionary entries or grammar references, never sound-derived guesses. */
  sourceIds: string[]
  /** Empty when no useful, defensible aid was found. */
  componentIds: string[]
  note?: string
  omissionReason?: string
  lookupUrls?: string[]
}

export interface RelatedWord {
  id: string
  korean: string
  meaning: string
  connection: string
  kind: RootConcept['kind']
}

export interface RootsAid {
  kind: OriginKind
  components: Array<RootConcept & { id: string }>
  note?: string
  sources: OriginSource[]
  related: RelatedWord[]
}
