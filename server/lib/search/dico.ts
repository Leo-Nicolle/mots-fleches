import { OccurenceMap } from "./types";
import { getAlphabet } from "./utils";
import fs from "fs/promises";
import path from "path";

class Dico {
  private words: string[] = [];
  private wordsMap: Map<string, number> = new Map();
  private loadingPromise: Promise<void> | null;
  public occurencies: OccurenceMap[];
  constructor() {
    this.words = [];
    this.wordsMap = new Map();
    this.loadingPromise = null;
    this.loadDictionary();
  }

  /**
   * @param words the list of words you want to count occurences of
   * @param length The length of the lemmes you want to count
   * @returns The occurence map of the words
   */
  static countOccurences(words: string[], length = 1): OccurenceMap {
    const occurencies = {};
    words.forEach((word, i) => {
      for (let j = 0; j < word.length; j++) {
        const lemme = word.slice(j, j + length);
        if (lemme.length < length) return;
        if (!occurencies[lemme]) {
          occurencies[lemme] = {};
        }
        // j is the place of the lemme start in the word: 
        //  for lemme "or" in the word word, j = 1
        if (!occurencies[lemme][j]) {
          occurencies[lemme][j] = new Set();
        }
        // store the index of that word in the array of words
        occurencies[lemme][j].add(i);
      }
    });
    return occurencies;
  }

  loadDictionary() {
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = Promise.all([
      ...getAlphabet().map((letter) =>
        fs.readFile(path.resolve(`./public/result-${letter}.txt`), "utf-8")
      ),
      fs.readFile(path.resolve("./public/allwords.txt"), "utf-8"),
    ])
      .then((responses) => {
        responses.forEach((response) => {
          this.addWordsToDictionnary(response);
        });
        return Dico.countOccurences(this.words, 2);
      })
      .then((occurences) => {
        this.occurencies = [occurences];
        return Dico.countOccurences(this.words, 3);
      })
      .then((occurences) => {
        this.occurencies.push(occurences);
      });

    return this.loadingPromise;
  }

  addWordsToDictionnary(data: string, countOccurences = false) {
    const { wordsMap } = this;
    let rawWords: string[] = [];
    if (typeof data === "string") {
      rawWords = data.split(/,|\n/);
    } else {
      rawWords = data;
    }
    const minIndex = this.words.length;
    rawWords
      .map((w) =>
        w
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase()
      )
      .forEach((word) => {
        if (wordsMap.has(word)) return;
        wordsMap.set(word, this.words.length);
        this.words.push(word);
      });

    if (!countOccurences) return;
    this.words.slice(minIndex).forEach((word, i) => {
      for (let l = 0; l < 2; l++) {
        const occurencies = Dico.countOccurences([word], l + 2);
        Object.entries(occurencies).forEach(([lemme, occs]) => {
          Object.keys(occs).forEach((j) => {
            if (!this.occurencies[l][lemme]) {
              this.occurencies[l][lemme] = {};
            }
            if (!this.occurencies[l][lemme][j]) {
              this.occurencies[l][lemme][j] = new Map();
            }
            this.occurencies[l][lemme][j].add(i + minIndex);
          });
        });
      }
    });
  }
  removeWordsFromDictionary(data) {
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
        if (!wordsMap.get(word)) return;
        const index = wordsMap.get(word) as number;
        this.words.splice(index, 1);
        wordsMap.set(word, 0);
        for (let l = 0; l < 2; l++) {
          const occurencies = Dico.countOccurences([word], l + 2);
          Object.entries(occurencies).forEach(([lemme, occs]) => {
            Object.keys(occs).forEach((j) => {
              if (
                !this.occurencies[l] ||
                !this.occurencies[l][lemme] ||
                !this.occurencies[l][lemme][j]
              )
                return;
              this.occurencies[l][lemme][j].delete(index);
            });
          });
        }
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
