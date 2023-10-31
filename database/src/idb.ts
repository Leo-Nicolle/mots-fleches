import { openDB, DBSchema } from 'idb';
import {
  Grid, GridStyle, GridState,
  defaultStyles,
  defaultSolutionStyle,
  isSolutionStyle,
  Font as GridFont,
} from 'grid';
import { Database } from './db';
import { mergeOptionsWithDefaults } from './utils';
import { Font } from './types';

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
  styles: {
    value: GridStyle;
    key: string;
    indexes: { 'by-id': string };
  },
  fonts: {
    value: Font;
    key: string;
    indexes: { 'by-id': string };
  }
}

async function create() {
  let promise = Promise.resolve();
  const db = await openDB<MotsFlexDB>('mots-flex-db', 5, {
    upgrade(db, old, _, transaction) {
      // @ts-ignore
      if (db.objectStoreNames.contains('style')) {
        // @ts-ignore
        db.deleteObjectStore('style');
      }
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
      if (!db.objectStoreNames.contains('styles')) {
        const optionStore = db.createObjectStore('styles', {
          keyPath: 'id',
        });
        optionStore.createIndex('by-id', 'id');
      }
      if (!db.objectStoreNames.contains('fonts')) {
        const gridStore = db.createObjectStore('fonts', {
          keyPath: 'id',
        });
        gridStore.createIndex('by-id', 'id');
      }

      // @ts-ignore
      if (db.objectStoreNames.contains('options')) {
        // @ts-ignore
        const store = transaction.objectStore('options');
        // @ts-ignore
        promise = promise.then(() => store.getAll())
          .then(styles => {
            styles.forEach(style => {
              store.put(mergeOptionsWithDefaults(style as GridStyle));
            })
            // @ts-ignore
          }).then(() => db.deleteObjectStore('options'));
      }

      if (old <= 3) {
        const gridStore = transaction.objectStore('grids');
        promise = promise.then(() => gridStore.getAll())
          .then(grids => {
            grids.forEach(grid => {
              // @ts-ignore
              grid.styleId = grid.optionsId;
              // @ts-ignore
              delete grid.optionsId;
              gridStore.put(grid as GridState);
            });
          });
      }
      if (old <= 5) {
        const styleStore = transaction.objectStore('styles');
        promise = promise.then(() => styleStore.getAll())
          .then(styles => {
            styles.forEach(style => {
              const defs: GridFont[] = [style.definition];
              if (isSolutionStyle(style)) {
                //@ts-ignore
                delete style.pagination.margin.top
                defs.push(style.grids.gridN);
                defs.push(style.pagination);
                defs.push(style.words);
                defs.push(style.size);
              }
              defs.forEach(def => {
                // @ts-ignore
                delete def.font;
                // @ts-ignore
                delete def.name;
                def.family = 'Roboto';
                def.isGoogle = true;
                def.weight = "400";
                styleStore.put(style as GridStyle);
              })
            });
          });
      }

    },
  })

  return promise.then(() => db);

}

export class Idatabase extends Database {
  private loadingPromise: ReturnType<typeof create>;
  constructor() {
    super();
    this.loadingPromise = create()
      .then((db) => {
        return db.get('styles', defaultStyles.id)
          .then((style) => style ? Promise.resolve('')
            : db.put('styles', defaultStyles))
          .then(() => db.get('styles', defaultSolutionStyle.id))
          .then((style) => style ? Promise.resolve('') :
            db.put('styles', defaultSolutionStyle))
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
    )
  }

  async getStyles() {
    return await this.loadingPromise.then((db) =>
      db.getAllFromIndex('styles', 'by-id')
    );
  }
  async getStyle(styleId: string) {
    return await this.loadingPromise.then((db) =>
      db.get('styles', styleId)
    );
  }
  async pushStyle(style: GridStyle) {
    return await this.loadingPromise.then((db) =>
      db.put('styles', style)
    );
  }
  async updateOption(style: GridStyle) {
    return await this.pushStyle(style);
  }
  async deleteStyle(styleId: string) {
    return await this.loadingPromise.then((db) =>
      db.delete('styles', styleId)
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
  async getFonts() {
    return await this.loadingPromise.then((db) =>
      db.getAllFromIndex('fonts', 'by-id')
    )
  }
  async getFont(fontId: string) {
    return await this.loadingPromise.then((db) =>
      db.get('fonts', fontId)
    )
  }
  async pushFont(font: Font) {
    return await this.loadingPromise.then((db) =>
      db.put('fonts', font)
    );
  }
  async deleteFont(fontId: string) {
    return await this.loadingPromise.then((db) =>
      db.delete('fonts', fontId)
    );
  }
  async isSignedIn() {
    return Promise.resolve(true);
  }
}
export function deleteDatabase() {
  return new Promise((resolve, reject) => {
    const rq = indexedDB.deleteDatabase('mots-flex-db')
    rq.onsuccess = resolve;
    rq.onerror = reject;
  });
}
export function setDatabase(json: any, version: number) {
  return deleteDatabase()
    .then(() => {
      return openDB<MotsFlexDB>('mots-flex-db', version, {
        upgrade(db, __, _, transaction) {
          let promise = Promise.resolve();
          Object.entries(json).forEach(([key, values]) => {
            // @ts-ignore
            const objstore = db.createObjectStore(key, {
              keyPath: 'id',
            });
            if(key === 'words'){
              // @ts-ignore
              objstore.createIndex('by-word', 'id');
            }else{
              // @ts-ignore
              objstore.createIndex('by-id', 'id');
            }
            console.log('creating', key);
            // @ts-ignore
            const store = transaction.objectStore(key);
            promise = promise
            // @ts-ignore
              .then(() => Promise.all(values.map((value: any) => store.put(value))))
          });
        }
      });
    });
}