export class StringBS {
  public words: string[];
  public sorted: number[];
  constructor(words: string[] = [], sorted: number[] = []) {
    this.words = words;
    this.sorted = sorted;
  }

  findStartIdx(codeQuery: number, index: number, start: number, end: number) {
    while (start <= end) {
      const middle = (start + end) >>> 1;
      const word = this.words[this.sorted[middle]];
      if (!word) break;
      const code = word.charCodeAt(index);
      if (isNaN(code) || code < codeQuery) start = middle + 1;
      else end = middle - 1;
    }
    return start;
  }
  findEndIdx(codeQuery: number, index: number, start: number, end: number) {
    while (start <= end) {
      const middle = (start + end) >>> 1;
      const word = this.words[this.sorted[middle]];
      if (!word) break;
      const code = word.charCodeAt(index);
      if (isNaN(code) || code > codeQuery) end = middle - 1;
      else start = middle + 1;
    }
    return end;
  }

  byLengthStart(length: number, start: number, end: number) {
    while (start <= end) {
      const middle = (start + end) >>> 1;
      const word = this.words[this.sorted[middle]];
      if (!word) break;
      if (word.length < length) start = middle + 1;
      else end = middle - 1;
    }
    return start;
  }
  byLengthEnd(length: number, start: number, end: number) {
    while (start <= end) {
      const middle = (start + end) >>> 1;
      const word = this.words[this.sorted[middle]];
      if (!word) break;
      if (word.length > length) end = middle - 1;
      else start = middle + 1;
    }
    return end;
  }
}
