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
    value: string;
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
  const db = await openDB<MotsFlexDB>('mots-flex-db', 2, {
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
      console.log(grid);
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
    )
      .then((grid) => {
        console.log(grid);
        return grid;
      });
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
  async pushOption(option: any) {
    return await this.loadingPromise.then((db) =>
      db.put('options', option)
    );
  }
  async updateOption(option: any) {
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
    );
  }
  async getWord(wordId: string) {
    return await this.loadingPromise.then((db) =>
      db.get('words', wordId)
    );
  }
  async pushWord(word: any) {
    return await this.loadingPromise.then((db) =>
      db.put('words', word)
    );
  }
  async deleteWord(wordId: string) {
    return await this.loadingPromise.then((db) =>
      db.delete('words', wordId)
    );
  }
}