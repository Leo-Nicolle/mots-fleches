import MiniSearch from "minisearch";
import { StringBS } from "./string-bs";

export const ACode = "A".charCodeAt(0);
export const ZCode = "Z".charCodeAt(0);


/**
 * Dico is a sigleton class that contains the dictionnary
 * It is used to search for words in the grid
 */
export class Dico {
  /**
   * The list of words in the dictionnary
   */
  public words: string[] = [];
  /**
   * The map of words in the dictionnary
   */
  public wordsMap: Map<string, number> = new Map();

  public sorted: number[];
  public definitions: string[] = [];
  public stringBS: StringBS;

  constructor() {
    this.words = [];
    this.sorted = [];
    this.stringBS = new StringBS(this.words, this.sorted);
    this.wordsMap = new Map();
  }

  /**
   * Load the dictionnary from the files in the dictionnary folder
   * And in the user's dictionary
   */
  load(rawWords: string[], bannedWords: string[]) {
    const bannedMap = new Set(bannedWords);
    this.words = [];
    this.wordsMap = new Map();
    rawWords
      .map((w) =>
        w
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ ?\'?-?/g, "")
          .toUpperCase()
      )
      // .sort((a, b) => Math.abs(b.length - 10) - Math.abs(a.length - 10))
      .forEach((word) => {
        if (this.wordsMap.has(word) || bannedMap.has(word)) return;
        const dicoIndex = this.words.length;
        this.wordsMap.set(word, dicoIndex);
        this.words.push(word);
      });

    this.sorted = new Array(this.words.length)
      .fill(0)
      .map((e, i) => i)
      .sort((a, b) => {
        const d = this.words[a].length - this.words[b].length;
        if (d !== 0) return d;
        return this.words[a].localeCompare(this.words[b]);
      });
    this.stringBS = new StringBS(this.words, this.sorted);
  }


  findLengthInterval(length: number) {
    const start = this.stringBS.byLengthStart(length, 0, this.words.length - 1);
    const end = this.stringBS.byLengthEnd(length, start, this.words.length - 1);
    return [start, end];
  }

  findInterval(query: string) {
    const startL = this.stringBS.byLengthStart(
      query.length,
      0,
      this.words.length - 1
    );
    const endL = this.stringBS.byLengthEnd(
      query.length,
      startL,
      this.words.length - 1
    );

    let stack = [[startL, endL]];
    let newStack: number[][] = [];
    for (let i = 0; i < query.length; i++) {
      newStack = [];
      while (stack.length) {
        const [start, end] = stack.pop()!;
        const code = query.charCodeAt(i);
        if (query.charAt(i) === "*") {
          for (let j = 0; j < 26; j++) {
            const newStart = this.stringBS.findStartIdx(
              ACode + j,
              i,
              start,
              end
            );
            const newEnd = this.stringBS.findEndIdx(
              ACode + j,
              i,
              newStart,
              end
            );
            if (newStart > newEnd) continue;
            newStack.push([newStart, newEnd]);
          }
          continue;
        }
        const newStart = this.stringBS.findStartIdx(code, i, start, end);
        const newEnd = this.stringBS.findEndIdx(code, i, newStart, end);
        if (newStart > newEnd) continue;
        newStack.push([newStart, newEnd]);
      }
      stack = newStack;
    }

    return newStack;
  }

  queryBinary(query: string) {
    const intervals = this.findInterval(query);
    return intervals.reduce((acc, [start, end]) => {
      if (start > end) return acc;
      if (start === end) {
        acc.push(start);
        return acc;
      } else {
        acc.push(
          ...new Array(end - start + 1).fill(0).map((_, i) => start + i)
        );
      }
      return acc;
    }, [] as number[]);
  }

  /**
   * Get the list of words in the dictionnary
   * @returns All the words in the dictionnary
   */
  getWords() {
    return this.words;
  }

}

export const dico = new Dico();
