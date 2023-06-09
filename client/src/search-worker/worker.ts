
import { dico } from './dico';
import { getCellProbas } from './heatmap';
import { Grid } from 'grid';
import { getWordsSimple } from './search';

let options = { sharedArray: new Int8Array(1) };
onmessage = function (e) {
  const { type, data } = e.data;
  if (e.data.words && e.data.flags){
    const {words, flags} = e.data as {words: ArrayBuffer, flags: ArrayBuffer};
    options.sharedArray = new Int8Array(flags);
    const encoded = new Uint8Array(words.byteLength);
    encoded.set(new Uint8Array(e.data.words));
    dico.load(new TextDecoder().decode(encoded).split(','));
    return this.postMessage({ type: 'loaded' });
  }
  if (type === 'run') {
    console.log('run', dico.words.length);
    const grid = Grid.unserialize(data);
    const {cellProbas, hasBailed} = getCellProbas(grid, options);
    if (hasBailed){
      console.log('bail')
      return postMessage({ type: 'bail-result'});
    }
    console.log('run end', cellProbas[2][2].bestWordsH)
    postMessage({ type: 'run-result', data: cellProbas });
  }
  if (type === 'search') {
    const {grid: gridJson,coords, dir} = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    const wordIndexes =  getWordsSimple({grid, coords, dir});
    postMessage({ type: 'search-result', data: wordIndexes });
  }

};