
import { REMOTE_ADDRESS } from "./api-key.mjs";
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const ADMIN_SERVER_API = path.resolve(REPO_ROOT, '..', 'mots-fleches-admin', 'server-api');

const REMOTE_HOST = REMOTE_ADDRESS.slice(0, REMOTE_ADDRESS.lastIndexOf(':'));
const REMOTE_DIR = REMOTE_ADDRESS.slice(REMOTE_ADDRESS.lastIndexOf(':') + 1);

function run(cmd) {
  return new Promise(function (resolve, reject) {
    const sp = spawn(cmd, { shell: true, stdio: 'inherit' });
    sp.on('close', (code) => {
      if (code === 0) return resolve(0);
      reject(new Error(`Command failed with exit code ${code}: ${cmd}`));
    });
    sp.on('error', (err) => {
      reject(err);
    });
  });
}

// Admin routes live in the sibling `mots-fleches-admin` repo. Locally they are
// symlinked into server/api/src, so before shipping we materialize them as real
// files, then restore the symlinks afterwards.
const ADMIN_FILES = [
  'routes/admin.ts',
  'routes/plausible.ts',
  'middleware/admin.ts',
  'services/grid-progress.ts',
];

async function withAdminSources(fn) {
  const srcDir = path.join(REPO_ROOT, 'server', 'api', 'src');
  const backupDir = fs.mkdtempSync(path.join(REPO_ROOT, '.deploy-admin-backup-'));
  const backups = [];
  try {
    for (const rel of ADMIN_FILES) {
      const target = path.join(srcDir, rel);
      const source = path.join(ADMIN_SERVER_API, rel);
      if (!fs.existsSync(source)) {
        throw new Error(`Admin source not found: ${source}`);
      }
      if (fs.existsSync(target)) {
        const backup = path.join(backupDir, rel.replace(/[\/\\]/g, '_'));
        fs.renameSync(target, backup);
        backups.push([target, backup]);
      }
      fs.copyFileSync(source, target);
    }
    return await fn();
  } finally {
    for (const [target, backup] of backups) {
      fs.rmSync(target, { force: true });
      fs.renameSync(backup, target);
    }
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
}

const help = `
Deploy utility script: 
 -h --help: print help
 -w --fast -f deploy only client .js,.css,.html files
 -s --server Deploy the server only
 -c --config Deploy the nginx config and reload nginx
 -a --all deploy client + server folder, then refresh the API container
`;

async function deployClient() {
  await run(`ssh ${REMOTE_HOST} "rm -rf ${REMOTE_DIR}/public && mkdir -p ${REMOTE_DIR}/public"`);
  await run(`scp -r dist/public/* ${REMOTE_ADDRESS}/public`);
}

async function deployServer() {
  await withAdminSources(async () => {
    await run(`ssh ${REMOTE_HOST} "rm -rf ${REMOTE_DIR}/server/api ${REMOTE_DIR}/server/db && mkdir -p ${REMOTE_DIR}/server/api ${REMOTE_DIR}/server/db"`);
    await run(`scp -r server/api/src server/api/prisma server/api/test ${REMOTE_ADDRESS}/server/api/`);
    await run(`scp server/api/Dockerfile server/api/.dockerignore server/api/.npmrc server/api/.prettierrc server/api/esbuild.config.js server/api/eslint.config.mjs server/api/nodemon.json server/api/package.json server/api/package-lock.json server/api/tsconfig.json ${REMOTE_ADDRESS}/server/api/`);
    await run(`scp -r server/db/init-scripts ${REMOTE_ADDRESS}/server/db/`);
    await run(`scp server/docker-compose.yml ${REMOTE_ADDRESS}/server/`);
    await run(`ssh ${REMOTE_HOST} "cd ${REMOTE_DIR}/server && docker compose --env-file .env --profile production up -d --build"`);
  });
}

async function deployNginx() {
  await run(`scp nginx-proxy.conf ${REMOTE_HOST}:motsflex.conf`);
  // -t allocates a TTY so sudo can prompt for the password interactively
  // (direct non-interactive sudo over SSH is disabled on the server).
  await run(`ssh -t ${REMOTE_HOST} "sudo cp ~/motsflex.conf /etc/nginx/sites-available/motsflex.conf && sudo nginx -t && sudo systemctl reload nginx && rm ~/motsflex.conf"`);
}

async function main() {

  const args = {
    help: ['-h', '--help'],
    website: ['-w', '--fast', '-f'],
    server: ['-s', '--server'],
    config: ['-c', '--config'],
    all: ['-a', '--all']
  };
  const action = Object.entries(args)
    .reduce((acc, [key, value]) => {
      const vset = new Set(value);
      if (!process.argv.some(arg => vset.has(arg))) return acc;
      return key;
    }, 'help');

  if (action === 'help') {
    return console.log(help);
  } else if (action === 'website') {
    return deployClient();
  } else if (action === 'server') {
    return deployServer();
  } else if (action === 'config') {
    return deployNginx();
  } else if (action === 'all') {
    await deployClient();
    return deployServer();
  }
}

main();
