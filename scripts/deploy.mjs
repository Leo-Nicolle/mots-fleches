
import { REMOTE_ADDRESS } from "./api-key.mjs";
import { spawn } from 'child_process';

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
  await run(`ssh ${REMOTE_HOST} "rm -rf ${REMOTE_DIR}/server/api ${REMOTE_DIR}/server/db && mkdir -p ${REMOTE_DIR}/server/api ${REMOTE_DIR}/server/db"`);
  await run(`scp -r server/api/src server/api/prisma server/api/test ${REMOTE_ADDRESS}/server/api/`);
  await run(`scp server/api/Dockerfile server/api/.dockerignore server/api/.npmrc server/api/.prettierrc server/api/esbuild.config.js server/api/eslint.config.mjs server/api/nodemon.json server/api/package.json server/api/package-lock.json server/api/tsconfig.json ${REMOTE_ADDRESS}/server/api/`);
  await run(`scp -r server/db/init-scripts ${REMOTE_ADDRESS}/server/db/`);
  await run(`scp server/docker-compose.yml ${REMOTE_ADDRESS}/server/`);
  await run(`ssh ${REMOTE_HOST} "cd ${REMOTE_DIR}/server && docker compose --env-file .env --profile production up -d --build"`);
}

async function deployNginx() {
  await run(`scp nginx-proxy.conf ${REMOTE_HOST}:motsflex.conf`);
  await run(`ssh ${REMOTE_HOST} "sudo cp ~/mostflex.conf /etc/nginx/sites-available/motsflex.conf && sudo nginx -t && sudo systemctl reload nginx && rm ~/mostflex.conf"`);
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
