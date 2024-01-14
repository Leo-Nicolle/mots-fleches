
import { wordsSearch } from '../utils/words-search';
import { Grid } from 'grid';
import { getWordsSimple } from '../utils/search';

// was the old hasBailed shared array, might be used in autofill.
onmessage = function (e) {
  const { type, data } = e.data;
  if (e.data.words) {
    const { words} = e.data as { words: string[]; };
    console.log('start words load');
    console.time('words-load');
    wordsSearch.load(words);
    console.timeEnd('words-load');
    return this.postMessage({ type: 'loaded' });
  }
  if (type === 'search') {
    const { grid: gridJson, coords, dir } = JSON.parse(data);
    const grid = Grid.unserialize(gridJson);
    const wordIndexes = getWordsSimple({ grid, coords, dir });
    postMessage({ type: 'search-result', data: wordIndexes });
  }
  if (type === 'distribution') {
    const distribution = wordsSearch.getDistribution();
    postMessage({ type: 'distrib-result', data: distribution });
  }
  if (type === 'searchword') {
    const res = wordsSearch.searchWord(data);
    postMessage({ type: 'searchword-result', data: res });
  }

  if (type === 'check') {
    const grid = Grid.unserialize(data);
    const check = grid.check(wordsSearch.wordsMap);
    postMessage({ type: 'check-result', data: check });
  }
};