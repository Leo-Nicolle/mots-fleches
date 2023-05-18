import fs from "fs-extra";
import { resolve } from "path";

const globals = {
  APP_CROSSWORDS_WORDS_PATH: "./dist/test/db/words.txt",
  APP_CROSSWORDS_GRIDS_PATH: "./dist/test/db/grids.json",
  APP_CROSSWORDS_OPTIONS_PATH: "./dist/db/options.json",
  APP_CROSSWORDS_DICO_PATH: "./dist/test/dico/",
  APP_OPEN_BROWSER: "false",
  APP_CROSSWORDS_MODE: "test",
  APP_CROSSWORDS_PORT: 3011,
};
Object.entries(globals).forEach(([key, value]) => {
  value = key.endsWith("_PATH") ? resolve(value as string) : value;
  process.env[key] = value as string;
  global[key] = value as string;
});

fs.copy(resolve("test/dico/"), resolve(globals.APP_CROSSWORDS_DICO_PATH));
