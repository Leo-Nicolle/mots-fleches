import rimraf from "rimraf";
import fs from "fs-extra";
import path from 'path';
import json from "../package.json" assert { type: 'json' };
import decompress from "decompress";

const distFolder = 'dist/';
const { description, name, version } = json;
function getLinuxLauncher() {
  return `#!/usr/bin/env xdg-open
[Desktop Entry]
Version=${version}
Type=Application
Terminal=false
Exec=~/bin/mots-flex/index.sh
Name=${name}
Comment=${description}
Icon=mots-flex.png`
}


rimraf(distFolder)
  .then(() => fs.copy('server/dist', distFolder))
  .then(() => fs.copy('client/dist', path.resolve(distFolder, 'public')))
  .then(() => fs.copy('scripts/assets', path.resolve(distFolder)))
  .then(() => fs.writeFile(path.resolve(distFolder, `${name}.desktop`), getLinuxLauncher()))
  .then(() => decompress(path.resolve(distFolder, 'dico.zip'), path.resolve(distFolder, 'public/')))
  .then(() => fs.rm(path.resolve(distFolder, 'dico.zip')))


