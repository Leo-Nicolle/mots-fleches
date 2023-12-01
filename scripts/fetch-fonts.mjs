import fs from 'fs/promises';
import {API_KEY} from './api-key.mjs';


fetch(`https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}`)
.then(r => r.json())
.then((json) => {
  console.log(json);
  return fs.writeFile('fonts.json', JSON.stringify(json));
});
