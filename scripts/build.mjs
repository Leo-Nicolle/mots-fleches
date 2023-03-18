import rimraf from "rimraf";
import fs from "fs-extra";
import path from 'path';
import decompress from "decompress";

const outFolder = 'build/';
rimraf(outFolder)
  .then(() => fs.copy('server/dist', outFolder))
  .then(() => fs.copy('client/dist', path.resolve(outFolder, 'public')))
  .then(() => fs.copy('scripts/assets/dico.zip', path.resolve(outFolder, 'dico.zip')))
  .then(() => decompress(path.resolve(outFolder, 'dico.zip'), path.resolve(outFolder, 'public/')))
  .then(() => fs.rm(path.resolve(outFolder, 'dico.zip')))


