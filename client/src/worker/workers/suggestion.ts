
import { autoFill } from '../utils/auto-fill';
import { dico } from '../utils/dico';
import { getCellProbas } from '../utils/heatmap';
import { Grid } from 'grid';
import { getWordsSimple } from '../utils/search';
// was the old hasBailed shared array, might be used in autofill.
let options = { sharedArray: new Int8Array(1) };
onmessage = function (e) {
  const { type, data } = e.data;
  if (e.data.words && e.data.flags) {
    const { words, flags, bannedWords } = e.data as {
      words: string[],
      bannedWords: string[],
      flags: ArrayBuffer;
    };
    options.sharedArray = new Int8Array(flags);
    dico.load(words, bannedWords);
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
  if (type === 'search') {
    const { grid: gridJson, coords, dir } = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    const wordIndexes = getWordsSimple({ grid, coords, dir });
    postMessage({ type: 'search-result', data: wordIndexes });
  }
  if (type === 'autofill') {
    const { grid: gridJson, words } = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    const res = autoFill(grid, words);
    postMessage({ type: 'autofill-result', data: res });
  }
};