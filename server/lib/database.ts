import { resolve } from "./utils";
import { FSDatabase } from "database";

const db = new FSDatabase({
  wordsPath: resolve(APP_CROSSWORDS_WORDS_PATH),
  gridsPath: resolve(APP_CROSSWORDS_GRIDS_PATH),
  optionsPath: resolve(APP_CROSSWORDS_OPTIONS_PATH),
});

export default db;
