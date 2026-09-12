/**
 * Fixed-size bitset over Uint32Array.
 * Processes 32 elements per CPU instruction for AND/OR/popcount.
 */
export class BitSet {
  data: Uint32Array;
  wordCount: number;

  constructor(numBits: number) {
    this.wordCount = (numBits + 31) >>> 5;
    this.data = new Uint32Array(this.wordCount);
  }

  set(i: number): void {
    this.data[i >>> 5] |= 1 << (i & 31);
  }

  clear(i: number): void {
    this.data[i >>> 5] &= ~(1 << (i & 31));
  }

  has(i: number): boolean {
    return (this.data[i >>> 5] & (1 << (i & 31))) !== 0;
  }

  /** Set all bits from 0..numBits-1 */
  setAll(numBits: number): void {
    const fullWords = numBits >>> 5;
    for (let i = 0; i < fullWords; i++) {
      this.data[i] = 0xffffffff;
    }
    const remainder = numBits & 31;
    if (remainder > 0 && fullWords < this.wordCount) {
      this.data[fullWords] = (1 << remainder) - 1;
    }
  }

  /** AND in-place. Returns true if any bit was cleared. */
  andWith(other: BitSet): boolean {
    let changed = false;
    for (let i = 0; i < this.wordCount; i++) {
      const old = this.data[i];
      this.data[i] = old & (other.data[i] ?? 0);
      if (this.data[i] !== old) changed = true;
    }
    return changed;
  }

  /** OR in-place. */
  orWith(other: BitSet): void {
    for (let i = 0; i < this.wordCount; i++) {
      this.data[i] |= other.data[i] ?? 0;
    }
  }

  isEmpty(): boolean {
    for (let i = 0; i < this.wordCount; i++) {
      if (this.data[i]) return false;
    }
    return true;
  }

  /** Count set bits (Hamming weight, parallel reduction). */
  popcount(): number {
    let count = 0;
    for (let i = 0; i < this.wordCount; i++) {
      let v = this.data[i];
      v = v - ((v >>> 1) & 0x55555555);
      v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
      count += (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
    }
    return count;
  }

  clone(): BitSet {
    const bs = new BitSet(this.wordCount * 32);
    bs.data.set(this.data);
    return bs;
  }

  /** Iterate over indices of set bits. */
  forEachBit(cb: (index: number) => void): void {
    for (let w = 0; w < this.wordCount; w++) {
      let bits = this.data[w];
      const base = w << 5;
      while (bits) {
        const lsb = bits & -bits;
        const idx = 31 - Math.clz32(lsb);
        cb(base + idx);
        bits ^= lsb;
      }
    }
  }
}

/** Check if two bitsets have any common bit, without allocation. */
export function hasOverlap(a: BitSet, b: BitSet): boolean {
  const len = Math.min(a.wordCount, b.wordCount);
  for (let i = 0; i < len; i++) {
    if (a.data[i] & b.data[i]) return true;
  }
  return false;
}

/** Count bits set in (a AND b), without allocation. */
export function popcountAnd(a: BitSet, b: BitSet): number {
  let count = 0;
  const len = Math.min(a.wordCount, b.wordCount);
  for (let i = 0; i < len; i++) {
    let v = a.data[i] & b.data[i];
    v = v - ((v >>> 1) & 0x55555555);
    v = (v & 0x33333333) + ((v >>> 2) & 0x33333333);
    count += (((v + (v >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
  }
  return count;
}
