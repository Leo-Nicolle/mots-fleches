import { Grid, getDefinitions } from 'grid';
import { Idatabase, SupaDB, setDatabase } from 'database';
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

  get db() {
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
      .then((grids) => grids.map(grid => Grid.unserialize(JSON.stringify(grid))));
  }

  getGrid(id: string): Promise<Grid | undefined> {
    return this.db.getGrid(id)
      .then((grid) => grid ? Grid.unserialize(JSON.stringify(grid)) : undefined);
  }

  pushGridToBook(bookId: string, gridId: string) {
    return this.db.getBook(bookId)
      .then((book) => {
        if (book) {
          book.grids.push(gridId);
          return this.db.updateBook(book);
        }
        return Promise.reject('book not found');
      });
  }

  deleteGridFromBook(bookId: string, gridId: string) {
    return this.db.getBook(bookId)
      .then((book) => {
        if (book) {
          book.grids = book.grids.filter(id => id !== gridId);
          return this.db.updateBook(book);
        }
        return Promise.reject('book not found');
      });
  }
  deleteGridsFromBook(bookId: string, gridIds: string[]) {
    return this.db.getBook(bookId)
      .then((book) => {
        if (book) {
          const idsSet = new Set(gridIds);
          book.grids = book.grids.filter(id => !idsSet.has(id));
          return this.db.updateBook(book);
        }
        return Promise.reject('book not found');
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