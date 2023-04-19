import fs from "fs/promises";
import path from "path";
import { resolve } from "./utils";
import {
  Grid,
  GridOptions,
  defaultOptions,
  defaultSolutionOptions,
} from "grid";

/**
 * Database is a singleton class that contains the database
 * It is used to read/write the words, the grids and the options
 */
export class Database {
  /**
   * The list of words in the database
   */
  public words: string[];
  /**
   * The list of grids in the database
   */
  public grids: Grid[];
  /**
   * The list of options in the database
   */
  public options: GridOptions[];
  /**
   * The promise that will resolve when the database is loaded
   */
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
  /**
   * Read all the files and load the database
   * @returns loadingPromise
   */
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
      if (!this.options.find(({ id }) => id === "default")) {
        this.options.push(defaultOptions);
      }
      if (!this.options.find(({ id }) => id === "solution")) {
        this.options.push(defaultSolutionOptions);
      }
    });
    return this.loadingPromise;
  }
  /**
   * read a database file
   * @param file
   * @returns Promise<string>
   */
  loadFile(file) {
    return fs
      .mkdir(path.dirname(file), { recursive: true })
      .then(() => fs.access(file, 0))
      .catch((e) => fs.writeFile(file, file.match(/\.json/) ? "[]" : ""))
      .then(() => fs.readFile(file, "utf-8"));
  }
  /**
   * return all the words in the database
   * @returns The list of words
   */
  getWords() {
    return this.loadingPromise.then(() => this.words);
  }
  /**
   * Save the words in the database
   * @returns The writeFile promise
   */
  saveWords() {
    return this.getWords().then((words) =>
      fs.writeFile(
        resolve(APP_CROSSWORDS_WORDS_PATH as string),
        words.join(",")
      )
    );
  }
  /**
   * Add a word to the database
   * @param word The word to add
   * @returns The saving promise
   */
  pushWord(word) {
    return this.getWords().then((words) => {
      words.push(word);
      return this.saveWords();
    });
  }
  /**
   * Delete a word from the database
   * @param word The word to delete
   * @returns The saving promise
   */
  deleteWord(word) {
    return this.getWords().then((words) => {
      this.words = words.filter((w) => word.localeCompare(w));
      return this.saveWords();
    });
  }
  /**
   * Returns all the grids in the database
   * @returns The list of grids
   */
  getGrids() {
    return this.loadingPromise.then(() =>
      this.grids.sort((a, b) => a.created - b.created)
    );
  }
  /**
   * Returns a grid from its id
   * @param id The id of the grid
   * @returns The grid
   */
  getGrid(id) {
    return this.getGrids().then((grids) =>
      grids.find((grid) => grid.id === id)
    );
  }
  /**
   * Save the grids in the database
   * @returns The writeFile promise
   */
  saveGrids() {
    return this.getGrids().then((grids) =>
      fs.writeFile(
        resolve(APP_CROSSWORDS_GRIDS_PATH as string),
        `[${grids.map((grid) => grid.serialize()).join(", ")}]`
      )
    );
  }
  /**
   * Add a grid to the database
   * @param grid The grid to add
   * @returns The saving promise
   */
  pushGrid(grid) {
    return this.getGrids().then((grids) => {
      grids.push(grid);
      return this.saveGrids();
    });
  }
  /**
   * Update a grid in the database
   * @param gridstring JSON string of the grid
   * @returns The grid id
   */
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
  /**
   * Delete a grid from the database
   * @param gridId The id of the grid to delete
   * @returns The saving promise
   */
  deleteGrid(gridId) {
    return this.getGrids().then((grids) => {
      this.grids = grids.filter(({ id }) => id !== gridId);
      return this.saveGrids();
    });
  }
  /**
   * Returns all the options in the database
   * @returns The list of options
   */
  getOptions() {
    return this.loadingPromise.then(() => this.options);
  }
  /**
   * Get an option from its id
   * @param id The id of the option
   * @returns The option
   */
  getOption(id) {
    return this.getOptions().then((options) =>
      options.find((option) => option.id === id)
    );
  }
  /**
   * Save the options in the database
   * @returns The writeFile promise
   */
  saveOptions() {
    return this.getOptions().then((options) =>
      fs.writeFile(
        resolve(APP_CROSSWORDS_OPTIONS_PATH as string),
        `[${options.map((option) => JSON.stringify(option)).join(", ")}]`
      )
    );
  }
  /**
   * Add an option to the database
   * @param option The option to add
   * @returns The saving promise
   */
  pushOption(option) {
    return this.getOptions().then((options) => {
      options.push(option);
      return this.saveOptions();
    });
  }
  /**
   * Update an option in the database
   * @param newoption The option to update
   * @returns The saving promise
   */
  updateOption(newoption: GridOptions) {
    return this.getOptions().then(() => {
      this.options = this.options.filter(({ id }) => id !== newoption.id);
      this.options.push(newoption);
      return this.saveOptions();
    });
  }
  /**
   * Remove an option from the database
   * @param optionId The id of the option to remove
   * @returns The saving promise
   */
  deleteOption(optionId) {
    if (optionId === "default" || optionId === "solution")
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
