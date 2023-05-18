import axios from "axios";
import { StringBS } from "./string-bs";
import { getUrl } from "../js/utils";

export const ACode = "A".charCodeAt(0);

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
  /**
   * The promise that will resolve when the dictionnary is loaded
   */
  private loadingPromise: Promise<void> | undefined;
  /**
   * The occurences of the words in the dictionnary
   * The first element is for 2 letters lemmes
   * The second element is for 3 letters lemmes
   */
  // public occurencies: OccurenceMap[];

  public maxLength: number;
  // public sorted: Record<number, number[]>;
  // public stringBS: Record<number, StringBS>;
  public sorted: number[];
  public stringBS: StringBS;
  public dicoHash: number;


  /**
   * The locale dictionary folder
   */
  public locale: string;

  constructor() {
    this.words = [];
    this.maxLength = 0;
    this.sorted = [];
    this.stringBS = new StringBS(this.words, this.sorted);
    this.wordsMap = new Map();
    this.locale = "fr-fr";
    this.loadingPromise = this.loadDictionary();
    this.dicoHash = 0;
  }

  /**
   * Load the dictionnary from the files in the dictionnary folder
   * And in the user's dictionary
   * @returns The promise that will resolve when the dictionnary is loaded
   */
  loadDictionary() {
    const loadingPromise = axios.get(getUrl("word/hash"))
      .then(({ data }) => {
        const { uuid, locale } = data;
        if (uuid === this.dicoHash && locale === this.locale) return Promise.resolve();
        if (locale !== this.locale) {
          console.log('set locale', locale, 'old: ', this.locale);

          this.setLocale(locale);
        }
        this.dicoHash = data.uuid;
        return axios.get(getUrl('dico'))
        .then(({ data }) => {
          console.log('refresh dico');
          this.addWordsToDictionnary(data);
          this.sort();
        });
      });
    this.loadingPromise = loadingPromise;
    return this.loadingPromise;
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
   * Add a word or a list of words to the dictionnary
   * @param data The word or the list of words to add
   */
  addWordsToDictionnary(data: string | string[]) {
    const { wordsMap } = this;
    let rawWords: string[] = [];
    if (typeof data === "string") {
      rawWords = data.split(/,|\n/);
    } else {
      rawWords = data;
    }
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
        if (wordsMap.has(word)) return;
        const dicoIndex = this.words.length;
        wordsMap.set(word, dicoIndex);
        this.words.push(word);
        this.maxLength = Math.max(this.maxLength, word.length);
      });
  }
  /**
   * Remove a word or a list of words from the dictionnary
   * Do not remove it from the array of words, just unreference it
   * from the occurence map and from the wordsMap
   * @param data The word or the list of words to remove
   */
  removeWordsFromDictionary(data: string | string[]) {
    return this.loadDictionary().then(() => {
      const { wordsMap } = this;
      let rawWords: string[] = [];
      if (typeof data === "string") {
        rawWords = data.split(/,|\n/);
      } else {
        rawWords = data;
      }
      rawWords
        .map((w) =>
          w
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toUpperCase()
        )
        .forEach((word) => {
          const dicoIndex = wordsMap.get(word);
          if (!dicoIndex) return;
          wordsMap.delete(word);
        });
    });
  }

  sort() {
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

  sortWords() {
  }

  /**
   * Get the list of words in the dictionnary
   * @returns All the words in the dictionnary
   */
  getWords() {
    return this.loadDictionary().then(() => this.words);
  }
  /**
   * If you know that the dictionnary is already loaded
   * @returns All the words in the dictionnary
   */
  getWordsSync() {
    return this.words;
  }

  /**
   * Get the map of words in the dictionnary
   * @returns All the words in the dictionnary
   */
  getWordsMap() {
    return this.loadDictionary().then(() => this.wordsMap);
  }

  /**
   * Set locale and reload dictionnary
   */
  setLocale(locale: string) {
    this.locale = locale;
    this.loadingPromise = undefined;
    this.words = [];
    this.wordsMap = new Map();
    this.maxLength = 0;
    this.stringBS = new StringBS();
  }
}

export const dico = new Dico();
