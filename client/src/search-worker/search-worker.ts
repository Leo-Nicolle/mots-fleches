
import { dico } from './dico';
import { getCellProbas } from './heatmap';
import { Direction, Grid } from 'grid';
import { getWordsSimple } from './search';

let options = { sharedArray: new Int8Array(1) };
export function run(grid: Grid) {
  return dico.getWords()
    .then(() => getCellProbas(grid, options));
}

export function search(grid: Grid, coords: {x: number, y: number}, dir: Direction) {
  return dico.getWords()
  .then(() =>getWordsSimple({grid, coords, dir}));

}
onmessage = function (e) {

  const { type, data } = e.data;
  if (e.data instanceof SharedArrayBuffer){
    options.sharedArray = new Int8Array(e.data);
    return;
  }
  if (type === 'run') {
    const grid = Grid.unserialize(data);
    return run(grid).then(({cellProbas, hasBailed}) =>{
      if (hasBailed){
        return postMessage({ type: 'bail-result'});
      }
      postMessage({ type: 'run-result', data: cellProbas });
    });
  }
  if (type === 'search') {
    const {grid: gridJson,coords, dir} = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    return search(grid, coords, dir).then((wordIndexes) =>{
      postMessage({ type: 'search-result', data: wordIndexes });
    });
  }

};