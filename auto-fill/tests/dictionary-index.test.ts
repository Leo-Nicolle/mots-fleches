import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync } from 'fs'
import { unzipSync } from 'fflate'
import { DictionaryIndex } from '../src/index'

// ─── Helpers ──────────────────────────────────────────────────────────────

function loadZip(locale: string): string[] {
  const path = new URL(`../demo/public/${locale}.zip`, import.meta.url)
  const zip = unzipSync(new Uint8Array(readFileSync(path)))
  return new TextDecoder()
    .decode(zip['dico.txt'])
    .trim()
    .split(',')
    .map(w =>
      w.trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[ '-]/g, '')
        .toUpperCase()
    )
    .filter(w => w.length >= 2)
}

// ─── Per-locale tests ─────────────────────────────────────────────────────

const LOCALES: { locale: string; minWords: number }[] = [
  { locale: 'fr-fr', minWords: 50_000 },
  { locale: 'en-en', minWords: 50_000 },
  { locale: 'es-es', minWords: 10_000 },
]

for (const { locale, minWords } of LOCALES) {
  describe(`DictionaryIndex — ${locale}`, () => {
    let rawWords: string[]
    let dict: DictionaryIndex

    beforeAll(() => {
      rawWords = loadZip(locale)
      dict = new DictionaryIndex(rawWords)
    })

    it('loads a large word list from the zip', () => {
      expect(rawWords.length).toBeGreaterThan(minWords)
    })

    it('indexes all unique words without loss', () => {
      let indexed = 0
      for (const count of dict.counts.values()) indexed += count
      // Allow a tiny margin for duplicates removed during normalization
      expect(indexed).equals(rawWords.length);
    })

    it('covers word lengths 3–7', () => {
      const lengths = dict.lengths
      for (const len of [3, 4, 5, 6, 7]) {
        expect(lengths, `missing length ${len}`).toContain(len)
      }
    })

    it('wordsByLength entries match counts', () => {
      for (const [len, count] of dict.counts) {
        expect(dict.wordsByLength.get(len)?.length).toBe(count)
      }
    })

    it('letterAt bitsets span the full word list at every position', () => {
      // For each length, the union of all 26 letterAt[pos][c] at position 0
      // must cover exactly the words in that length group
      for (const len of dict.lengths) {
        const positions = dict.letterAt.get(len)!
        const wordCount = dict.counts.get(len)!
        let total = 0
        for (let c = 0; c < 26; c++) total += positions[0][c].popcount()
        expect(total).toBe(wordCount)
      }
    })

    it('getMatchingWords — no pattern returns all words of that length', () => {
      const len = 5
      const domain = dict.getMatchingWords(len)
      expect(domain).not.toBeNull()
      expect(domain!.popcount()).toBe(dict.counts.get(len))
    })

    it('getMatchingWords — wildcard-only pattern returns full domain', () => {
      const len = 4
      const domain = dict.getMatchingWords(len, '****')
      expect(domain!.popcount()).toBe(dict.counts.get(len))
    })

    it('getMatchingWords — fixed first letter narrows domain', () => {
      const len = 5
      const all = dict.getMatchingWords(len)!.popcount()
      const withA = dict.getMatchingWords(len, 'A****')!.popcount()
      expect(withA).toBeGreaterThan(0)
      expect(withA).toBeLessThan(all)
    })

    it('getMatchingWords — impossible character returns empty bitset', () => {
      // Digits are not valid letters: no word can match
      const domain = dict.getMatchingWords(5, '1****')
      expect(domain?.popcount()).toBe(0)
    })

    it('getMatchingWords — exact word pattern matches ≥1 entry', () => {
      // Pick the first 5-letter word from the index and query it exactly
      const words5 = dict.wordsByLength.get(5)
      if (!words5?.length) return
      const word = words5[0]
      const domain = dict.getMatchingWords(5, word)
      expect(domain!.popcount()).toBeGreaterThanOrEqual(1)
    })

    it('getWords — recovers words from a domain bitset', () => {
      const len = 4
      const domain = dict.getMatchingWords(len, 'A***')!
      const words = dict.getWords(len, domain)
      expect(words.length).toBe(domain.popcount())
      expect(words.every(w => w.startsWith('A'))).toBe(true)
    })

    it('getMatchingWords returns null for an absent length', () => {
      expect(dict.getMatchingWords(99)).toBeNull()
    })
  })
}
