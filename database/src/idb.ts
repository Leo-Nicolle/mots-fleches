import { openDB, DBSchema } from 'idb';
import { Grid, GridOptions, GridState } from 'grid';
import {
  defaultOptions,
  defaultSolutionOptions,
} from 'grid';
import { Database } from './db';

export interface MotsFlexDB extends DBSchema {
  grids: {
    value: GridState;
    key: string;
    indexes: { 'by-id': number };
  };
  words: {
    value: { id: string };
    key: string;
    indexes: { 'by-word': string };
  };
  options: {
    value: GridOptions;
    key: string;
    indexes: { 'by-id': string };
  }
}

async function create() {
  const db = await openDB<MotsFlexDB>('mots-flex-db', 3, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('grids')) {
        const gridStore = db.createObjectStore('grids', {
          keyPath: 'id',
        });
        gridStore.createIndex('by-id', 'id');
      }
      if (!db.objectStoreNames.contains('words')) {
        const wordStore = db.createObjectStore('words', {
          keyPath: 'id',
        });
        wordStore.createIndex('by-word', 'id');
      }
      if (!db.objectStoreNames.contains('options')) {
        const optionStore = db.createObjectStore('options', {
          keyPath: 'id',
        });
        optionStore.createIndex('by-id', 'id');
      }
    },
  });

  return db;

}

export class Idatabase extends Database {
  private loadingPromise: ReturnType<typeof create>;
  constructor() {
    super();
    this.loadingPromise = create()
      .then((db) => {
        return db.get('options', defaultOptions.id)
          .then((options) => options ? Promise.resolve('')
            : db.put('options', defaultOptions))
          .then(() => db.get('options', defaultSolutionOptions.id))
          .then((options) => options ? Promise.resolve('') :
            db.put('options', defaultSolutionOptions))
          .then(() => db);
      });
  }

  async getGrids() {
    return await this.loadingPromise.then((db) =>
      db.getAllFromIndex('grids', 'by-id')
    ).then((grid) => {
      return grid;
    });

  }

  async pushGrid(grid: Grid) {
    const g = JSON.parse(grid.serialize());
    return await this.loadingPromise.then((db) =>
      db.put('grids', g)
    );
  }

  async updateGrid(grid: Grid) {
    // things with same id are overwritten
    return this.pushGrid(grid);
  }

  async deleteGrid(gridId: string) {
    return await this.loadingPromise.then((db) =>
      db.delete('grids', gridId)
    );
  }

  async getGrid(gridId: string) {
    return await this.loadingPromise.then((db) =>
      db.get('grids', gridId)
    );
  }

  async getOptions() {
    return await this.loadingPromise.then((db) =>
      db.getAllFromIndex('options', 'by-id')
    );
  }
  async getOption(optionId: string) {
    return await this.loadingPromise.then((db) =>
      db.get('options', optionId)
    );
  }
  async pushOption(option: GridOptions) {
    return await this.loadingPromise.then((db) =>
      db.put('options', option)
    );
  }
  async updateOption(option: GridOptions) {
    return await this.pushOption(option);
  }
  async deleteOption(optionId: string) {
    return await this.loadingPromise.then((db) =>
      db.delete('options', optionId)
    );
  }

  async getWords() {
    return await this.loadingPromise.then((db) =>
      db.getAllFromIndex('words', 'by-word')
    ).then((words) =>
      words.map(({ id }) => id)
    );
  }
  async getWord(wordId: string) {
    return await this.loadingPromise.then((db) =>
      db.get('words', wordId)
    ).then((word) => word ? word.id : undefined);
  }
  async pushWord(word: string) {
    return await this.loadingPromise.then((db) =>
      db.put('words', { id: word })
    );
  }
  async deleteWord(wordId: string) {
    return await this.loadingPromise.then((db) =>
      db.delete('words', wordId)
    );
  }
  async isSignedIn() {
    return Promise.resolve(true);
  }
}