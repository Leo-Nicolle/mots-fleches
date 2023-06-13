import rimraf from "rimraf";
import { mkdir } from 'fs/promises'
import fs from "fs-extra";
import path from 'path';
import { tmpdir } from 'os';

const outFolder = 'dist/';

// function buildjs() {
//   const outDir = 'dist/';
//   const tmpDir = path.resolve(tmpdir(), `mots-flex-js${Date.now()}`);
//   return fs.mkdir(outDir, { recursive: true })
//     .then(() => Promise.all([
//       fs.copy("build/public", path.resolve(tmpDir, "public")),
//       fs.copy("build/dico", path.resolve(tmpDir, "dico")),
//       fs.copy("build/server.js", path.resolve(tmpDir, "server.js")),
//     ]))
//     .then(() => wz.mZip.zipFolder(tmpDir, 'dist/mots-flex-js.zip'))
// }


Promise.resolve()
.then(() => rimraf(outFolder))
.then(() => mkdir(outFolder))
.then(() => fs.copy('server/dist', outFolder))
.then(() => fs.copy('client/dist', path.resolve(outFolder, 'public')))




