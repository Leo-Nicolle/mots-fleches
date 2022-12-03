import fs from "fs/promises";
import path from "path";
import Grid from "../../grid/src/Grid";

export class Database {
  public words: string[];
  public grids: Grid[];
  public loadingPromise: Promise<void>;
  constructor() {
    this.words = [];
    this.grids = [];
    console.log("loading database");
    console.log("path words: ", APP_CROSSWORDS_WORDS_PATH);
    console.log("path grids:", APP_CROSSWORDS_GRIDS_PATH);
    console.log("path dico:", APP_CROSSWORDS_DICO_PATH);

    this.loadingPromise = Promise.all([
      this.loadFile(APP_CROSSWORDS_WORDS_PATH),
      this.loadFile(APP_CROSSWORDS_GRIDS_PATH),
    ]).then(([words, grids]) => {
      this.words = words
        .split(",")
        .map((w) => w.trim())
        .filter((e) => e.length);
      this.grids = (grids && grids.length ? JSON.parse(grids) : []).map((g) =>
        Grid.unserialize(g)
      );
    });
  }

  loadFile(file) {
    return fs
      .mkdir(path.dirname(file), { recursive: true })
      .then(() => fs.access(path.resolve(file), 0))
      .catch((e) =>
        fs.writeFile(path.resolve(file), file.match(/\.json/) ? "[]" : "")
      )
      .then(() => fs.readFile(path.resolve(file), "utf-8"));
  }

  getWords() {
    return this.loadingPromise.then(() => this.words);
  }
  saveWords() {
    return this.getWords().then((words) =>
      fs.writeFile(
        path.resolve(APP_CROSSWORDS_WORDS_PATH as string),
        words.join(",")
      )
    );
  }
  pushWord(word) {
    return this.getWords().then((words) => {
      words.push(word);
      return this.saveWords();
    });
  }
  deleteWord(word) {
    return this.getWords().then((words) => {
      this.words = words.filter((w) => word.localeCompare(w));
      return this.saveWords();
    });
  }

  getGrids() {
    return this.loadingPromise.then(() => this.grids);
  }

  getGrid(id) {
    return this.getGrids().then((grids) =>
      grids.find((grid) => grid.id === id)
    );
  }

  saveGrids() {
    return this.getGrids().then((grids) =>
      fs.writeFile(
        path.resolve(APP_CROSSWORDS_GRIDS_PATH as string),
        JSON.stringify(grids.map((grid) => grid.serialize()))
      )
    );
  }
  pushGrid(grid) {
    return this.getGrids().then((grids) => {
      grids.push(grid);
      return this.saveGrids();
    });
  }
  updateGrid(gridstring: string) {
    const newgrid = Grid.unserialize(gridstring);
    return this.getGrids().then((grids) => {
      this.grids = this.grids.filter(({ id }) => id !== newgrid.id);
      this.grids.push(newgrid);
      return this.saveGrids();
    });
  }
  deleteGrid(gridId) {
    return this.getGrids().then((grids) => {
      this.grids = grids.filter(({ id }) => id !== gridId);
      return this.saveGrids();
    });
  }
}

const db = new Database();

export default db;
