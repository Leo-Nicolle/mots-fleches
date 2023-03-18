import { DicoIndex, OccurenceMap } from "./types";
const { readFile } = require("fs").promises;
// import fs from "fs/promises";
const { resolve } = require("path");

export class Dico {
  public words: string[] = [];
  private wordsMap: Map<string, number> = new Map();
  private loadingPromise: Promise<void> | null;
  public occurencies: OccurenceMap[];
  constructor() {
    this.words = [];
    this.wordsMap = new Map();
    this.loadingPromise = null;
    this.occurencies = [{}, {}];
    this.loadDictionary();
  }

  /**
   * @param words the list of words you want to count occurences of
   * @param length The length of the lemmes you want to count
   * @returns The occurence map of the words
   */
  countOccurences({
    word,
    index,
    occs,
    length,
  }: {
    word: string;
    index: DicoIndex;
    occs: OccurenceMap;
    length: 2 | 3;
  }): void {
    for (
      let letterIndex = 0;
      letterIndex < word.length - length + 1;
      letterIndex++
    ) {
      const subWord = word.slice(letterIndex, letterIndex + length);
      if (!occs[subWord]) {
        occs[subWord] = {};
      }
      if (!occs[subWord][letterIndex]) {
        occs[subWord][letterIndex] = new Set();
      }
      occs[subWord][letterIndex].add(index);
    }
  }

  removeOccurence(
    occsToRemove: OccurenceMap,
    targetOccs: OccurenceMap,
    dicoIndex: DicoIndex
  ) {
    Object.entries(occsToRemove).forEach(([subWord, occByIndex]) => {
      Object.keys(occByIndex).forEach((letterIndex) => {
        const set = targetOccs[subWord][+letterIndex];
        set.delete(dicoIndex);
        if (set.size === 0) {
          delete targetOccs[subWord][+letterIndex];
        }
      });
      if (!Object.keys(targetOccs[subWord]).length) {
        delete targetOccs[subWord];
      }
    });
  }

  loadDictionary() {
    if (this.loadingPromise) return this.loadingPromise;
    const paths = APP_CROSSWORDS_DICO_PATH.split(",") || [];
    this.loadingPromise = Promise.all(
      paths.map((filePath) => readFile(resolve(__dirname, filePath), "utf8"))
    ).then((responses) => {
      responses.forEach((response) => {
        this.addWordsToDictionnary(response as any as string);
      });
    });
    return this.loadingPromise;
  }

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
          .toUpperCase()
      )
      // .sort((a, b) => Math.abs(b.length - 10) - Math.abs(a.length - 10))
      .forEach((word) => {
        if (wordsMap.has(word)) return;
        const dicoIndex = this.words.length;
        wordsMap.set(word, dicoIndex);
        this.words.push(word);
        this.countOccurences({
          word,
          index: dicoIndex,
          length: 2,
          occs: this.occurencies[0],
        });
        this.countOccurences({
          word,
          index: dicoIndex,
          length: 3,
          occs: this.occurencies[1],
        });
      });
  }
  removeWordsFromDictionary(data) {
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
          // do not remove it from the array of words,
          //it would be unneficcient to reassign all the indexes.
          // Just unference it from the occurence map and from the wordsMap
          const occs2: OccurenceMap = {};
          const occs3: OccurenceMap = {};
          this.countOccurences({
            word,
            index: dicoIndex,
            length: 2,
            occs: occs2,
          });
          this.countOccurences({
            word,
            index: dicoIndex,
            length: 3,
            occs: occs3,
          });
          this.removeOccurence(occs2, this.occurencies[0], dicoIndex);
          this.removeOccurence(occs3, this.occurencies[1], dicoIndex);
          wordsMap.delete(word);
        });
    });
  }

  getWords() {
    return this.loadDictionary().then(() => this.words);
  }
  getWordsSync() {
    return this.words;
  }
}

const dico = new Dico();
export default dico;
