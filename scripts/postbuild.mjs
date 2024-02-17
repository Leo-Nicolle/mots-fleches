import rimraf from "rimraf";
import { mkdir } from 'fs/promises';
import fs from "fs-extra";
import path from 'path';
const outFolder = 'dist/';

Promise.resolve()
  .then(() => rimraf(outFolder))
  .then(() => mkdir(outFolder))
  .then(() => fs.copy('server/dist', outFolder))
  .then(() => fs.copy('client/dist', path.resolve(outFolder, 'public')))




