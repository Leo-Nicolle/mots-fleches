import { Grid, GridState, GridStyle, SolutionStyle, getDefinitions } from 'grid';
import { Database, Idatabase, SupaDB } from 'database';
import { v4 as uuid } from 'uuid';
import throttle from 'lodash.throttle';
import axios from 'axios';
const debugMigration = true;

class API {
  public idb: Idatabase;
  public supadb: SupaDB;
  public _mode: string;
  constructor(mode: string = 'unknown') {
    // axios.get('/debug-db.json').then(({ data }) => setDatabase(data, 7));
    this.idb = new Idatabase();
    this.supadb = new SupaDB('https://tnvxmrqhkdlynhtdzmpw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnhtcnFoa2RseW5odGR6bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIyNTM0MTEsImV4cCI6MTk5NzgyOTQxMX0.4PczPPAxbkwBvig7NTHNbR8JumuwPPqfyS_kGnkxP5I');
    this._mode = mode;
  }

  get db(): Database {
    if (this.mode === 'idb') {
      return this.idb;
    } else if (this.mode === 'supadb') {
      return this.supadb;
    } else {
      throw new Error('Unknown database mode');
    }
  }

  set mode(mode: string) {
    localStorage.setItem('db-mode', mode);
    this._mode = mode;
  }
  get mode() {
    return this._mode;
  }

  getGrids() {
    return this.db.getGrids()
      .then((grids) => grids.map(grid => Grid.unserialize(grid)));
  }

  getGrid(id: string): Promise<Grid | undefined> {
    return this.db.getGrid(id)
      .then((grid) => grid ? Grid.unserialize(grid) : undefined);
  }

  getBookGrids(bookId: string) {
    return this.db.getBook(bookId)
      .then((book) => book
        ? Promise.all(book.grids.map(id => this.db.getGrid(id)))
        : [] as Grid[]);
  }

  duplicateGrids(ids: string[], bookId: string) {
    return Promise.all(ids.map(id => this.db.getGrid(id)))
      .then(grids => {
        const newGrids = grids
          .filter(g => g)
          .map(grid => {
            grid!.id = uuid();
            return grid;
          }) as GridState[];

        return Promise.all(newGrids.map(g => this.db.pushGrid(g)));
      })
      .then(grids => {
        this.db.getBook(bookId)
          .then((book) => {
            if (!book) {
              // TODO: cleanup the grids
              return Promise.reject('Book not found');
            }
            book.grids.push(...grids);
            return this.db.pushBook(book);
          });
      });
  }

  moveGrids(grids: string[], sourceBook: string, targetBook: string) {
    const set = new Set(grids);
    return Promise.all([sourceBook, targetBook].map(id => this.db.getBook(id)))
      .then(([source, target]) => {
        if (!source || !target) return Promise.reject('Book not found');
        source.grids = source.grids.filter(id => !set.has(id));
        const targetSet = new Set(target.grids);
        grids.filter(id => !targetSet.has(id)).forEach(id => target.grids.push(id));
        return Promise.all([source, target].map(book => this.db.pushBook(book)));
      });
  }

  reuseGrids(grids: string[], targetBook: string) {
    this.db.getBook(targetBook)
      .then(book => {
        if (!book) return Promise.reject('Book not found');
        const targetSet = new Set(book.grids);
        grids.filter(id => !targetSet.has(id)).forEach(id => book.grids.push(id));
        return this.db.pushBook(book);
      });
  }

  pushGridToBook(bookId: string, gridId: string) {
    return this.db.getBook(bookId)
      .then((book) => {
        if (!book) {
          return Promise.reject('book not found');
        }
        book.grids.push(gridId);
        return this.db.updateBook(book);
      });
  }

  deleteGridFromBook(bookId: string, gridId: string) {
    return this.db.getBook(bookId)
      .then((book) => {
        if (!book) {
          return Promise.reject('book not found');
        }
        book.grids = book.grids.filter(id => id !== gridId);
        return this.db.updateBook(book);
      });
  }
  deleteGridsFromBook(bookId: string, gridIds: string[]) {
    return this.db.getBook(bookId)
      .then((book) => {
        if (!book) {
          return Promise.reject('book not found');
        }
        const idsSet = new Set(gridIds);
        book.grids = book.grids.filter(id => !idsSet.has(id));
        return this.db.updateBook(book);
      });
  }

  getUserDefinitions(gridids?: string[]) {
    const res = new Map<string, Set<string>>();
    const idsSet = new Set(gridids || []);
    return this.getGrids()
      .then((grids) => {
        grids
          .filter(grid => gridids && gridids.length ? idsSet.has(grid.id) : true)
          .forEach(grid => {
            getDefinitions(grid, res);
          });
        return res;
      });
  }

  deleteStyles(ids: string[]) {
    const set = new Set(ids);
    set.delete('default');
    set.delete('solution');
    return this.db.getBooks()
      .then(books => Promise.all(books.map(book => {
        let shouldSave = false;
        if (set.has(book.style)) {
          shouldSave = true;
          book.style = 'default';
        }
        if (set.has(book.solutionStyle)) {
          shouldSave = true;
          book.solutionStyle = 'solution';
        }
        if (shouldSave) {
          return this.db.updateBook(book);
        }
        return Promise.resolve();
      })))
      .then(() => Promise.all([...ids].map(id => this.db.deleteStyle(id))));
  }

  deleteGrids(ids: string[]) {
    const idsSet = new Set(ids);
    return this.db.getBooks()
      .then(books =>
        Promise.all(books.map(book => {
          const l = book.grids.length;
          book.grids = book.grids.filter(g => !idsSet.has(g));
          if (l === book.grids.length) return;
          return this.db.updateBook(book);
        })))
      .then(() => Promise.all(ids.map(id => this.db.deleteGrid(id))));
  }

  _saveGrid(grid: Grid | GridState) {
    return this.db.pushGrid(grid instanceof Grid ? grid.serialize() : grid);
  }
  saveGrid(grid: Grid | GridState) {
    return this._saveGrid(grid);
  }
  _saveStyle(style: GridStyle | SolutionStyle) {
    return this.db.pushStyle(style);
  }
  saveStyle(style: GridStyle | SolutionStyle) {
    return this._saveStyle(style);
  }

  isSignedIn() {
    return localStorage.getItem('db-mode') === 'idb' ?
      Promise.resolve(true) :
      localStorage.getItem('db-mode') === 'supadb'
        ? this.db.isSignedIn()
        : Promise.resolve(false);
  }
  signout() {
    console.log('signout');
    localStorage.removeItem('db-mode');
    if (this.mode === 'supadb') {
      return this.supadb.supabase.auth.signOut();
    }
    return Promise.resolve();
  }
}

export const api = new API(localStorage.getItem('db-mode') || 'idb');
// add throttled saveGrid function to the api
api.saveGrid = throttle(api._saveGrid, 50);
api.saveStyle = throttle(api._saveStyle, 50);
