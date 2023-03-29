// import axios from 'axios';
// import {execa} from 'execa';

// execa('npm', ['run', 'e2e:reset-db'], {stdio: 'inherit', cwd: '../server'})
// .then(() => {
//   const server =  execa('npm', ['run', 'e2e:start'], {stdio: 'inherit', cwd: '../server'});
//   ['exit', 'SIGINT', 'SIGUSR1', 'SIGUSR2', 'uncaughtException', 'SIGTERM', 'beforeExit', ''].forEach((eventType) => {
//     process.on(eventType, () => {
//       console.log('Exit', server);
//       server.kill();
//     });
//   });
//   return server;
// })
// .finally(() => axios.get('http://localhost:3015/reload'))
// .then(() => console.log("RELOAD"));