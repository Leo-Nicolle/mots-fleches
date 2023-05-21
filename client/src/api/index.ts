import { Grid } from 'grid';
import {Idatabase, FsdbClient} from 'database';
import { getUrl } from '../js/utils';

class API {
  public idb: Idatabase;
  public fsdb: FsdbClient;
  public mode: string = 'fsdb';
  constructor(mode: string = 'fsdb') {
    this.idb = new Idatabase();
    this.fsdb = new FsdbClient(getUrl('').slice(0,-1));
    this.mode = mode;
  }

  get db() {
    if (this.mode === 'fsdb') {
      return this.fsdb;
    } else {
      return this.idb;
    }
  }

  getGrids() {
    return this.db.getGrids()
    .then((grids) => grids.map(grid => Grid.unserialize(JSON.stringify(grid))));
  }

  getGrid(id: string): Promise<Grid>{
    return this.db.getGrid(id)
    .then((grid) => Grid.unserialize(JSON.stringify(grid)));
  }
}

export const api = new API();