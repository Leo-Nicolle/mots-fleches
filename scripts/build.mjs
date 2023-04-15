import rimraf from "rimraf";
import { mkdir } from 'fs/promises'
import fs from "fs-extra";
import path from 'path';
import { execa } from 'execa';
import decompress from "decompress";
import wz from 'w-zip'
import { exec as pkg } from 'pkg';
import { tmpdir } from 'os';
import exe from '@angablue/exe'
import pkgJson from '../package.json' assert {type: 'json'};

const { description, name, version, homepage, contributors } = pkgJson
const outFolder = 'build/';

function buildExe() {
  const buildExe = `build/${name}.exe`;
  const tmpDir = path.resolve(tmpdir(), `mots-flex${Date.now()}`);
  return exe({
    entry: path.resolve(outFolder, 'server.js'),
    out: buildExe,
    pkg: ['-C', 'GZip'],
    version,
    target: 'latest-win-x64',
    icon: 'scripts/assets/icon.ico', // Application icons must be in .ico format
    properties: {
      FileDescription: description,
      ProductName: description,
      LegalCopyright: 'MIT',
      OriginalFilename: `${name}.exe`
    }
  })
    .then(fs.mkdir(tmpDir))
    .then(() => Promise.all(
      [
        fs.copy(buildExe, path.resolve(tmpDir, `${name}.exe`)),
        fs.copy(`${outFolder}dico`, path.resolve(tmpDir, `dico`)),
        fs.copy(`${outFolder}public`, path.resolve(tmpDir, `public`)),
      ]))
    .then(() => wz.mZip.zipFolder(tmpDir, 'dist/mots-flex-windows.zip'))
    .finally(() => rimraf(tmpDir))
}


function buildMac() {
  return pkg(['build/server.js', '--target', 'macos', '--output', `dist/${name}.app`, '--assets', '[build/dico, build/public]']);
}

function buildjs() {
  const outDir = 'dist/';
  const tmpDir = path.resolve(tmpdir(), `mots-flex-js${Date.now()}`);
  return fs.mkdir(outDir, { recursive: true })
    .then(() => Promise.all([
      fs.copy("build/public", path.resolve(tmpDir, "public")),
      fs.copy("build/dico", path.resolve(tmpDir, "dico")),
      fs.copy("build/server.js", path.resolve(tmpDir, "server.js")),
    ]))
    .then(() => wz.mZip.zipFolder(tmpDir, 'dist/mots-flex-js.zip'))
}

function buildLinux() {
  const tmpDir = path.resolve(tmpdir(), `mots-flex-deb${0}`);
  const control = Object.entries({
    'Package': name,
    'Version': version,
    'Description': description,
    'Homepage': homepage,
    'Maintainer': `${contributors[0].name} ${contributors[0].email}`,
    'Architecture': 'all'
  })
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n') + '\n';
  const controlDir = path.resolve(tmpDir, 'DEBIAN');

  return rimraf(tmpDir)
    .then(() => fs.mkdir(tmpDir, { recursive: true }))
    .then(() => fs.mkdir(controlDir))
    .then(() => fs.writeFile(path.resolve(controlDir, 'control'), control))
    .then(() => Promise.all([
      fs.copy("scripts/assets/mots-flex.desktop", path.resolve(tmpDir, "usr/share/applications/mots-flex.desktop")),
      fs.copy("build/", path.resolve(tmpDir, "usr/share/mots-flex/")),
      fs.copy("scripts/assets/icon.svg", path.resolve(tmpDir, "usr/share/icons/hicolor/scalable/apps/mots-flex.svg")),
      fs.copy("scripts/assets/mots-flex", path.resolve(tmpDir, "usr/bin/mots-flex")),
      fs.copy("scripts/assets/postbuild", path.resolve(controlDir, 'postinst'), {}),
    ]))
    .then(() =>  fs.readdir(controlDir))
    .then((files) => Promise.all(files.map(file => fs.chmod(path.resolve(controlDir, file), '0775'))))
    .then(() => execa("dpkg", ["-b", tmpDir, `dist/${name}.deb`]))
}

// rimraf(outFolder)
Promise.resolve()
.then(() => rimraf('dist'))
.then(() => fs.copy('server/dist', outFolder))
.then(() => fs.copy('client/dist', path.resolve(outFolder, 'public')))
.then(() => fs.copy('scripts/assets/dico.zip', path.resolve(outFolder, 'dico.zip')))
.then(() => fs.rm(path.resolve(outFolder, 'dico.zip')))
.then(() => buildjs())
// .then(() => buildExe())
// .then(() => buildMac())
.then(() => buildLinux())




