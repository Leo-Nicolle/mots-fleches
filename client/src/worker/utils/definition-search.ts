import MiniSearch from "minisearch";

export class WordsSearch {
  private minisearch: MiniSearch;
  constructor() {
    this.minisearch = new MiniSearch({
      fields: ['title'],
      storeFields: ['title', 'text']
    });
  }

  loadDefinitions(definitions: string) {
    const defs = definitions.split('\n');
    this.minisearch.removeAll();
    let id = 0;
    defs.forEach(d => {
      const [word, ...defs] = d.split(',');
      this.minisearch.add({
        title: word,
        id: id++,
        text: defs.map(d => d.slice(1,-1).replaceAll('\n', ' ')).join('\n')
      });
    });
  }
  
  getDefinitions(words: string[]) {
   return words.reduce((acc,word) => {
      const res = this.minisearch.search(word, { fuzzy: 0.2, fields: ['title']})
      .slice(0, 40);
      acc.push(...res.map(({ title, text }) => ({title, text})));
      return acc;
    }, [] as {title: string, text: string}[]);
  }
}

export const definitionSearch = new WordsSearch();
