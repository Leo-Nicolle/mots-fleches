
import { autoFill } from '../utils/auto-fill';
import { dico } from '../utils/dico';
import { getCellProbas } from '../utils/heatmap';
import { Grid } from 'grid';
// was the old hasBailed shared array, might be used in autofill.
let options = { sharedArray: new Int8Array(1) };
onmessage = function (e) {
  const { type, data } = e.data;
  if (e.data.words && e.data.flags) {
    const { words, flags} = e.data as { words: string[], flags: ArrayBuffer; };
    options.sharedArray = new Int8Array(flags);
    console.time('dico-load');
    dico.load(words);
    console.timeEnd('dico-load');
    return this.postMessage({ type: 'loaded' });
  }
  if (type === 'run') {
    const grid = Grid.unserialize(data);
    const { cellProbas, hasBailed } = getCellProbas(grid);
    if (hasBailed) {
      return postMessage({ type: 'bail-result' });
    }
    postMessage({ type: 'run-result', data: cellProbas });
  }
  if (type === 'autofill') {
    const { grid: gridJson, words } = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    const res = autoFill(grid, words);
    postMessage({ type: 'autofill-result', data: res });
  }
};