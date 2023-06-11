import { Grid } from 'grid';
import { Idatabase, FsdbClient, SupaDB } from 'database';

class API {
  public idb: Idatabase;
  public fsdb: FsdbClient;
  public supadb: SupaDB;
  public _mode: string = 'fsdb';
  constructor(mode: string = 'fsdb') {
    this.idb = new Idatabase();
    this.fsdb = new FsdbClient(`http://localhost:${import.meta.env.VITE_APIPORT}`);
    this.supadb = new SupaDB('https://tnvxmrqhkdlynhtdzmpw.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRudnhtcnFoa2RseW5odGR6bXB3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODIyNTM0MTEsImV4cCI6MTk5NzgyOTQxMX0.4PczPPAxbkwBvig7NTHNbR8JumuwPPqfyS_kGnkxP5I');
    this._mode = mode;
  }

  get db() {
    if (this.mode === 'fsdb') {
      return this.fsdb;
    } else if (this.mode === 'supadb') {
      return this.supadb;
    } else {
      return this.idb;
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
    return this.db.isSignedIn();
  }
}

export const api = new API(localStorage.getItem('db-mode') || 'idb');