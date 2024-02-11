import MiniSearch from "minisearch";

const userMarker = '__USER__';
export class WordsSearch {
  private minisearch: MiniSearch;
  private userDefinitions: [string, string[]][];
  constructor() {
    this.userDefinitions = [];
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
        text: defs.map(d => d.slice(1, -1).replaceAll('\n', ' ')).join('\n')
      });
    });
  }

  getDefinitions(words: string[]) {
    const query = words.length === 1 ? words[0] : {
      combineWith: 'OR',
      queries: words
    };
    return this.minisearch.search(query, { fuzzy: 0.2, fields: ['title'] })
      .slice(0, 40)
      .map(({ title, text }) => ({ title, text }));
  }

  setUserDefinitions(userDefinitions: [string, string[]][]) {
    // clean old user definitions:
    this.userDefinitions
      .forEach(([word, oldDefs]) => {
        const entry = this.minisearch.search(word, { fuzzy: 0, fields: ['title'] })[0];
        if (!entry) {
          return;
        }
        const { title, text, id } = entry;
        const newDefs = new Set<string>(text.split('\n'));
        oldDefs.forEach(d => newDefs.delete(d));
        const newDefsArr = Array.from(newDefs).map(d => d.replaceAll('\n', ' ').trim());
        if (!newDefsArr.length || newDefsArr[0] === userMarker) {
          return this.minisearch.remove({ id });
        }
        this.minisearch.replace({ id, title, text: newDefsArr.join('\n') });
      });
    // add new user definitions:
    let newId = this.minisearch.documentCount;
    userDefinitions
      .forEach(([word, newDefs]) => {
        const entry = this.minisearch.search(word, { fuzzy: 0, fields: ['title'] })[0];
        if (!entry) {
          const texts = [userMarker, ...newDefs.map(d => d.replaceAll('\n', ' ').trim())];
          return this.minisearch.add({
            title: word,
            id: newId++,
            text: texts.join('\n')
          });
        }
        const { title, text, id } = entry;
        const oldDefs = new Set<string>(text.split('\n'));
        if (!oldDefs.has(userMarker)) {
          oldDefs.add(userMarker);
        }
        newDefs.forEach(d => oldDefs.add(d));
        const newDefsArr = Array.from(oldDefs).map(d => d.replaceAll('\n', ' ').trim());
        this.minisearch.replace({ id, title, text: newDefsArr.join('\n') });
      });
    this.userDefinitions = userDefinitions;
  }
}

export const definitionSearch = new WordsSearch();
