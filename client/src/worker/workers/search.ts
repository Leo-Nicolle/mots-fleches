
import { wordsSearch } from '../utils/words-search';
import { Grid } from 'grid';

// was the old hasBailed shared array, might be used in autofill.
onmessage = function (e) {
  const { type, data } = e.data;
  if (e.data.words) {
    const { words, bannedWords } = e.data as { words: string[]; bannedWords: string[]; };
    wordsSearch.load(words, bannedWords);
    return this.postMessage({ type: 'loaded' });
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