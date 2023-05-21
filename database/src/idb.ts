import { openDB, DBSchema } from 'idb';
import { Grid, GridOptions, GridState } from 'grid';
import {  } from 'grid';
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
  options:{
    value: GridOptions;
    key: string;
    indexes: { 'by-id': string };
  }
}

async function create() {
  const db = await openDB<MotsFlexDB>('mots-flex-db', 1, {
    upgrade(db) {
      const gridStore = db.createObjectStore('grids', {
        keyPath: 'id',
      });
      gridStore.createIndex('by-id', 'id');
      const wordStore = db.createObjectStore('words', {
        keyPath: 'id',
      });
      wordStore.createIndex('by-word', 'id');
      const optionStore = db.createObjectStore('options', {
        keyPath: 'id',
      });
      optionStore.createIndex('by-id', 'id');

    },
  });

  return db;

}

export class Idatabase extends Database {
  private loadingPromise:ReturnType<typeof create>;
  constructor() {
    super();
    this.loadingPromise = create()
  }

  async getGrids() {
    return await this.loadingPromise.then((db) => 
      db.getAllFromIndex('grids', 'by-id')
    );
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