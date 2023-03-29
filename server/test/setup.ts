import fs from "fs-extra";

const globals = {
  APP_CROSSWORDS_WORDS_PATH: "./dist/test/db/words.txt",
  APP_CROSSWORDS_GRIDS_PATH: "./dist/test/db/grids.json",
  APP_CROSSWORDS_OPTIONS_PATH: "./dist/db/options.json",
  APP_CROSSWORDS_DICO_PATH: "./dist/test/dico/",
  APP_OPEN_BROWSER: "false",
  MODE: "test",
  APP_CROSSWORDS_PORT: 3011,
};
Object.entries(globals).forEach(([key, value]) => {
  process.env[key] = value as string;
  global[key] = value as string;
});

fs.copy("test/dico/", globals.APP_CROSSWORDS_DICO_PATH);
