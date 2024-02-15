import MiniSearch from "minisearch";

export class WordsSearch {
  /**
   * The map of words in the dictionnary
   */
  public wordsMap: Map<string, number> = new Map();
  private minisearch: MiniSearch;
  private distribution: Map<number, number> = new Map();
  constructor() {
    this.wordsMap = new Map();
    this.minisearch = new MiniSearch({
      fields: ['text'],
      storeFields: ['text']
    });
  }

  /**
   * Load the dictionnary from the files in the dictionnary folder
   * And in the user's dictionary
   */
  load(rawWords: string[], bannedWords: string[]) {
    const bannedSet = new Set(bannedWords);
    this.wordsMap = new Map();
    this.distribution = new Map();
    this.minisearch.removeAll();
    console.time('words-map');
    rawWords
      .map((w) =>
        w
          .trim()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/ ?\'?-?/g, "")
          .toUpperCase()
      )
      .forEach((word) => {
        if (this.wordsMap.has(word) || bannedSet.has(word)) return;
        const dicoIndex = this.wordsMap.size;
        this.wordsMap.set(word, dicoIndex);
        const length = word.length;
        if (!this.distribution.has(length)) {
          this.distribution.set(length, 0);
        }
        this.distribution.set(length, this.distribution.get(length)! + 1);
        // this.minisearch.add({
        //   id: dicoIndex,
        //   text: word
        // });
      });
    console.timeEnd('words-map');
    console.time('minisearch-load');
    this.minisearch.addAll(Array.from(this.wordsMap.keys()).map((text, id) => ({ text, id })));
    console.timeEnd('minisearch-load');
  }

  searchWord(word: string, options?: { fuzzy: number; }) {
    options = options ? options : {
      fuzzy: 0.4
    };
    return this.minisearch.search(word, options).slice(0, 20).map(({ text }) => text);
  }

  getDistribution() {
    return Array.from(this.distribution.entries()).sort(([a], [b]) => a - b);
  }

}

export const wordsSearch = new WordsSearch();
