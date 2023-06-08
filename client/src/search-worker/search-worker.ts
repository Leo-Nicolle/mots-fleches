
import { dico } from './dico';
import { getCellProbas } from './heatmap';
import { Direction, Grid } from 'grid';
import { getWordsSimple } from './search';

let options = { sharedArray: new Int8Array(1) };
export function run(grid: Grid) {
  return getCellProbas(grid, options);
}

export function search(grid: Grid, coords: {x: number, y: number}, dir: Direction) {
  return getWordsSimple({grid, coords, dir});

}
onmessage = function (e) {

  const { type, data } = e.data;
  if (e.data.words && e.data.flags){
    const {words, flags} = e.data as {words: ArrayBuffer, flags: ArrayBuffer};
    options.sharedArray = new Int8Array(flags);
    const encoded = new Uint8Array(words.byteLength);
    encoded.set(new Uint8Array(e.data.words));
    dico.load(new TextDecoder().decode(encoded).split(','));
    return;
  }
  if (type === 'run') {
    const grid = Grid.unserialize(data);
    const {cellProbas, hasBailed} = run(grid);
    if (hasBailed){
      return postMessage({ type: 'bail-result'});
    }
    postMessage({ type: 'run-result', data: cellProbas });
  }
  if (type === 'search') {
    const {grid: gridJson,coords, dir} = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    const wordIndexes =  search(grid, coords, dir);
    postMessage({ type: 'search-result', data: wordIndexes });
  }

};