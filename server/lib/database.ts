import fs from "fs/promises";
import path from "path";
import { resolve } from "./utils";
import { Grid, GridOptions, defaultOptions } from "grid";

export class Database {
  public words: string[];
  public grids: Grid[];
  public options: GridOptions[];

  public loadingPromise: Promise<void>;
  constructor() {
    this.words = [];
    this.grids = [];
    this.options = [];

    console.log("loading database");
    console.log("path words: ", resolve(APP_CROSSWORDS_WORDS_PATH));
    console.log("path grids:", resolve(APP_CROSSWORDS_GRIDS_PATH));
    console.log("path dico:", resolve(APP_CROSSWORDS_DICO_PATH));
    console.log("path options:", resolve(APP_CROSSWORDS_OPTIONS_PATH));

    this.loadingPromise = this.load();
  }

  load() {
    this.loadingPromise = Promise.all([
      this.loadFile(resolve(APP_CROSSWORDS_WORDS_PATH)),
      this.loadFile(resolve(APP_CROSSWORDS_GRIDS_PATH)),
      this.loadFile(resolve(APP_CROSSWORDS_OPTIONS_PATH)),
    ]).then(([words, grids, options]) => {
      this.words = words
        .split(",")
        .map((w) => w.trim())
        .filter((e) => e.length);
      this.grids = (grids && grids.length ? JSON.parse(grids) : []).map((g) =>
        Grid.unserialize(JSON.stringify(g))
      );
      this.options = options && options.length ? JSON.parse(options) : [];
      if (!this.options.length) {
        this.options.push(defaultOptions);
      }
    });
    return this.loadingPromise;
  }

  loadFile(file) {
    return fs
      .mkdir(path.dirname(file), { recursive: true })
      .then(() => fs.access(file, 0))
      .catch((e) => fs.writeFile(file, file.match(/\.json/) ? "[]" : ""))
      .then(() => fs.readFile(file, "utf-8"));
  }

  getWords() {
    return this.loadingPromise.then(() => this.words);
  }
  saveWords() {
    return this.getWords().then((words) =>
      fs.writeFile(
        resolve(APP_CROSSWORDS_WORDS_PATH as string),
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
    return this.loadingPromise.then(() =>
      this.grids.sort((a, b) => a.created - b.created)
    );
  }

  getGrid(id) {
    return this.getGrids().then((grids) =>
      grids.find((grid) => grid.id === id)
    );
  }

  saveGrids() {
    return this.getGrids().then((grids) =>
      fs.writeFile(
        resolve(APP_CROSSWORDS_GRIDS_PATH as string),
        `[${grids.map((grid) => grid.serialize()).join(", ")}]`
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
    return this.getGrids()
      .then(() => {
        this.grids = this.grids.filter(({ id }) => id !== newgrid.id);
        this.grids.push(newgrid);
        return this.saveGrids();
      })
      .then(() => newgrid.id);
  }
  deleteGrid(gridId) {
    return this.getGrids().then((grids) => {
      this.grids = grids.filter(({ id }) => id !== gridId);
      return this.saveGrids();
    });
  }

  getOptions() {
    return this.loadingPromise.then(() => this.options);
  }

  getOption(id) {
    return this.getOptions().then((options) =>
      options.find((option) => option.id === id)
    );
  }

  saveOptions() {
    return this.getOptions().then((options) =>
      fs.writeFile(
        resolve(APP_CROSSWORDS_OPTIONS_PATH as string),
        `[${options.map((option) => JSON.stringify(option)).join(", ")}]`
      )
    );
  }
  pushOption(option) {
    return this.getOptions().then((options) => {
      options.push(option);
      return this.saveOptions();
    });
  }
  updateOption(newoption: GridOptions) {
    return this.getOptions().then(() => {
      this.options = this.options.filter(({ id }) => id !== newoption.id);
      this.options.push(newoption);
      return this.saveOptions();
    });
  }
  deleteOption(optionId) {
    if (optionId === "default")
      throw new Error("Cannot delete default options");
    return this.getOptions()
      .then((options) => {
        this.options = options.filter(({ id }) => id !== optionId);
        this.grids.forEach((grid) => {
          if (grid.optionsId === optionId) {
            grid.optionsId = "default";
          }
        });
        return this.saveOptions();
      })
      .then(() => this.saveGrids());
  }
}

const db = new Database();

export default db;
