import { BitSet } from "./bitset";

const A_CODE = 65;

/**
 * Indexes a dictionary for fast bitset-based constraint lookups.
 *
 * For each word length L, stores:
 *  - wordsByLength[L]: the word list (uppercase)
 *  - letterAt[L][position][charIndex]: BitSet of words having that letter at that position
 *
 * This allows "all 6-letter words with A at pos 0 and E at pos 3"
 * to be computed as a single bitwise AND of two pre-built bitsets.
 */
export class DictionaryIndex {
  /** words[length][wordIndex] = "WORD" (uppercase) */
  wordsByLength: Map<number, string[]> = new Map();

  /**
   * letterAt[length][position][charIndex] = BitSet
   * charIndex = charCode - 65  (A=0, B=1, ..., Z=25)
   */
  letterAt: Map<number, BitSet[][]> = new Map();

  /** How many words exist for each length */
  counts: Map<number, number> = new Map();

  constructor(words: string[]) {
    this.build(words);
  }

  private build(words: string[]): void {
    // Group by length
    const groups = new Map<number, string[]>();
    for (const word of words) {
      const upper = word.toUpperCase();
      const len = upper.length;
      if (len < 2) continue;
      let list = groups.get(len);
      if (!list) {
        list = [];
        groups.set(len, list);
      }
      list.push(upper);
    }

    for (const [len, wordList] of groups) {
      this.wordsByLength.set(len, wordList);
      this.counts.set(len, wordList.length);

      // Build letterAt[position][charIndex] bitsets
      const positions: BitSet[][] = new Array(len);
      for (let pos = 0; pos < len; pos++) {
        const chars: BitSet[] = new Array(26);
        for (let c = 0; c < 26; c++) {
          chars[c] = new BitSet(wordList.length);
        }
        positions[pos] = chars;
      }

      for (let i = 0; i < wordList.length; i++) {
        const word = wordList[i];
        for (let pos = 0; pos < len; pos++) {
          const ci = word.charCodeAt(pos) - A_CODE;
          if (ci >= 0 && ci < 26) {
            positions[pos][ci].set(i);
          }
        }
      }

      this.letterAt.set(len, positions);
    }
  }

  /**
   * Returns a BitSet of all words of `length` that match `pattern`.
   * Pattern uses uppercase letters for fixed positions, '*' for wildcards.
   * If pattern is omitted, returns all words of that length.
   *
   * Returns null if no words of that length exist in the dictionary.
   * The returned BitSet is a fresh clone — safe to mutate.
   */
  getMatchingWords(length: number, pattern?: string): BitSet | null {
    const count = this.counts.get(length);
    if (count === undefined) return null;

    const result = new BitSet(count);
    result.setAll(count);

    if (pattern) {
      const positions = this.letterAt.get(length)!;
      for (let pos = 0; pos < pattern.length; pos++) {
        const ch = pattern[pos];
        if (ch === "*") continue;
        const ci = ch.charCodeAt(0) - A_CODE;
        if (ci >= 0 && ci < 26) {
          result.andWith(positions[pos][ci]);
        } else {
          // Non-alpha character at fixed position — no word can match
          return new BitSet(count); // empty
        }
      }
    }

    return result;
  }

  /** Get the word string at a given index for a given length. */
  getWord(length: number, index: number): string {
    return this.wordsByLength.get(length)![index];
  }

  /** Extract all word strings from a BitSet domain. */
  getWords(length: number, domain: BitSet): string[] {
    const wordList = this.wordsByLength.get(length)!;
    const result: string[] = [];
    domain.forEachBit((i) => {
      if (i < wordList.length) result.push(wordList[i]);
    });
    return result;
  }

  /** Available word lengths (sorted). */
  get lengths(): number[] {
    return [...this.counts.keys()].sort((a, b) => a - b);
  }
}
