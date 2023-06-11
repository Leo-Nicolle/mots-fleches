import { Grid } from 'grid';
import { Idatabase, SupaDB } from 'database';

class API {
  public idb: Idatabase;
  public supadb: SupaDB;
  public _mode: string;
  constructor(mode: string = 'unknown') {
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

  isSignedIn() {
    return localStorage.getItem('db-mode') && this.db.isSignedIn();
  }
  signout() {
    localStorage.removeItem('db-mode');
    if (this.mode === 'supadb') {
      return this.supadb.supabase.auth.signOut();
    }
    return Promise.resolve();
  }
}

export const api = new API(localStorage.getItem('db-mode') || 'idb');