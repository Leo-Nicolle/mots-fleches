
import { REMOTE_ADDRESS } from "./api-key.mjs";
import { spawn } from 'child_process';

function run(cmd) {
  console.log(cmd);
  return new Promise(function (resolve, reject) {
    const [c, ...args] = cmd.split(' ');
    const sp = spawn(c, args);
    sp.stdout.pipe(process.stdout);
    sp.stderr.pipe(process.stderr);
    sp.on('close', (code) => {
      resolve(code);
    });
    sp.on('error', (err) => {
      reject(err);
    });
  });
}

const help = `
Deploy utility script: 
 -h --help: print help
 -w --fast -f deploy only .js,.css,.html files
 -a --all deploy everything
`

function main() {

  const args = {
    help: ['-h', '--help'],
    website: ['-w', '--fast', '-f'],
    all: ['-a', '--all']
  };
  const action = Object.entries(args)
    .reduce((acc, [key, value]) => {
      const vset = new Set(value);
      if (!process.argv.some(arg => vset.has(arg))) return acc;
      return key;
    }, 'help');

  let blob = [];
  if (action === 'help') {
    return console.log(help)
  } else if (action === 'website') {
    blob = ['dist/*.html', 'dist/*.js', 'dist/*.css']
    // blob = `'./dist/*.{html,css,js}'`
  } else if (action === 'all') {
    blob = [`dist/*`]
  }

  return Promise.all(blob.map(b => run(`scp -r ${b} ${REMOTE_ADDRESS}`)));
}

main();
