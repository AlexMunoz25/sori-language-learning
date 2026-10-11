import { readFileSync, writeFileSync } from 'node:fs'
import { parseVocabulary } from '../src/data/source'

const vocabulary = parseVocabulary(readFileSync('vocabulary.md', 'utf8'))
writeFileSync('src/data/vocabulary.generated.json', JSON.stringify(vocabulary, null, 2) + '\n')
console.log(`Generated ${vocabulary.length} cards from vocabulary.md.`)
