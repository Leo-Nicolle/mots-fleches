/* eslint-disable no-unreachable */
/* eslint-disable no-continue */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-loop-func */
import axios from 'axios';
import apiMixin from './apiMixin';

class Crosswords {
  constructor() {
    this.dico = [
      'abc',
      'aac',
      'bbc',
      'bac',
    ];
    this.words = [];
    this.wordsMap = new Map();
    this.wordsLengthMap = new Map();
    this.loadingPromise = null;
    this.loadDictionary();
    this.getWords().then((words) => {
      // console.log(words);
    });
  }

  static getAlphabet() {
    return new Array(26).fill(0)
      .map((_, i) => String.fromCharCode('A'.charCodeAt(0) + i));
  }

  loadDictionary() {
    if (this.loadingPromise) return this.loadingPromise;
    this.loadingPromise = Promise.all([
      ...Crosswords.getAlphabet()
        .map((letter) => axios.get(`http://localhost:3010/result-${letter}.txt`)),
      axios.get('http://localhost:3010/allwords.txt'),
      axios.get(apiMixin.methods.getUrl('word')),
    ])
      .then((responses) => {
        responses.forEach((response) => {
          this.addWordsToDictionnary(response);
        });
        return Crosswords.countOccurences(this.words, 2);
      })
      .then((occurences) => {
        this.occurencies = [occurences];
        return Crosswords.countOccurences(this.words, 3);
      })
      .then((occurences) => {
        this.occurencies.push(occurences);
      });

    return this.loadingPromise;
  }

  addWordsToDictionnary(response) {
    const { data } = response;
    const { wordsMap, wordsLengthMap } = this;
    let rawWords = [];
    if (typeof data === 'string') {
      rawWords = data.split(/,|\n/);
    } else {
      rawWords = data;
    }
    rawWords.map((w) => w
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase())
      .forEach((word) => {
        if (wordsMap.has(word)) return;
        wordsMap.set(word, true);
        // wordsLengthMap.set(this.words.length - 1, word.length);
        // if (word.length === 3 || Math.random() < 0.4) {
        this.words.push(word);
        // }
      });
  }

  refreshDictionnary() {
    axios.get(apiMixin.methods.getUrl('word'))
      .then((response) => this.addWordsToDictionnary(response));
  }

  getWords() {
    return this.loadDictionary()
      .then(() => this.words);
  }

  static coordValid(grid, isDefinition, coord) {
    return coord.y < grid.length
      && coord.y >= 0
      && coord.x < grid[0].length
      && coord.x >= 0
      && !isDefinition[coord.y][coord.x];
  }

  static getVector(dir, factor = 1) {
    const vec = { x: 1, y: 0 };
    if (dir === 'vertical') {
      vec.x = 0;
      vec.y = 1;
    } else {
      vec.x = 1;
      vec.y = 0;
    }
    return Crosswords.scale(vec, factor);
  }

  static distance(v1, v2) {
    return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y);
  }

  static strToReg(str, n = '?') {
    return new RegExp(`^${str.split('').reduce((reg, char) => (char === '*'
      ? `${reg}\\w${n}`
      : `${reg}${char}`),
    '')}$`, 'i');
  }

  static scale(v, factor = 1) {
    return {
      x: v.x * factor,
      y: v.y * factor,
    };
  }

  static findBoundaries({
    grid, isDefinition, coord, vec,
  }) {
    vec = Crosswords.scale(vec, -1);
    let curr = { ...coord };
    let start = { ...coord };
    let end = { ...coord };
    let lookingForStart = true;
    let currValid = Crosswords.coordValid(grid, isDefinition, curr);
    // eslint-disable-next-line no-cond-assign
    if (currValid) {
      while (currValid || lookingForStart) {
        if (lookingForStart) {
          if (currValid) {
            start = { ...curr };
          } else {
            vec = { x: vec.x * -1, y: vec.y * -1 };
            lookingForStart = false;
          }
        } else if (currValid) {
          end = { ...curr };
        } else { break; }
        curr = { x: curr.x + vec.x, y: curr.y + vec.y };
        currValid = Crosswords.coordValid(grid, isDefinition, curr);
      }
    }

    return {
      start,
      end,
      vec,
      length: end.x - start.x + end.y - start.y + 1,
    };
  }

  getBestWords(words, lemmes) {
    if (!words.length) return [];
    // find all the words that could fit on each crossing
    const possibleLetters = new Array(words[0].length).fill().map((e) => new Map());
    const impossibleLetters = new Array(words[0].length).fill().map((e) => new Map());
    return words.filter((word) => {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i];
        if (impossibleLetters[i].get(letter)) return false;
        if (possibleLetters[i].get(letter)) continue;
        const lemmesForIndex = lemmes.filter((l) => l.indexWord === i);
        if (!lemmesForIndex.length) continue;
        let impossibleLetter = false;
        const possibleWords = lemmesForIndex.reduce((occurencies, lemme) => {
          if (impossibleLetter) return false;
          const reg = Crosswords.strToReg(lemme.lemme.replace('.', letter), '');
          const entries = Object.entries(this.occurencies[lemme.length - 2] || {});
          const occs = entries.filter(([l, o]) => l.match(reg));
          if (!entries.length || !occs.length) {
            impossibleLetter = true;
            return false;
          }
          if (!occurencies) {
            return [...occs.reduce((indexes, [_, maps]) => {
              const map = maps[lemme.indexLemme];
              if (!map) return indexes;
              [...map.keys()].forEach((k) => {
                if (this.words[k].length === lemme.totalLength) indexes.set(k, true);
              });
              return indexes;
            }, new Map()).keys()];
          }

          return occurencies.filter((o) => occs.some(([_, maps]) => maps[lemme.indexLemme] && maps[lemme.indexLemme].get(o, true)));
        }, false);
        if (impossibleLetter) {
          impossibleLetters[i].set(letter, true);
          return false;
        }
        if (possibleWords && possibleWords.length) {
          possibleLetters[i].set(letter, true);
        } else {
          impossibleLetters[i].set(letter, true);
          return false;
        }
      }
      return true;
    });
  }

  static countOccurences(words, length = 1) {
    const occurencies = {};
    words.forEach((word, i) => {
      for (let j = 0; j < word.length; j++) {
        const lemme = word.slice(j, j + length);
        if (lemme.length < length) return;
        if (!occurencies[lemme]) {
          occurencies[lemme] = {};
        }
        if (!occurencies[lemme][j]) {
          occurencies[lemme][j] = new Map();
        }
        occurencies[lemme][j].set(i, true);
      }
    });
    return occurencies;
  }

  static getLemmes({
    grid, isDefinition, coord, wordLength, vec,
  }) {
    const lemmes = [];
    const perp = {
      x: vec.y,
      y: vec.x,
    };

    for (let i = 0; i < wordLength; i++) {
      const current = {
        x: coord.x + vec.x * i,
        y: coord.y + vec.y * i,
      };
      const { start, length } = Crosswords.findBoundaries({
        grid,
        isDefinition,
        coord: current,
        vec: perp,
      });
      for (let j = 0; j < length; j++) {
        const letters = new Array(Math.max(0, Math.min(3, length - j)))
          .fill(0)
          .map((_e, k) => {
            // @eslint-disable
            const coord = {
              y: start.y + perp.y * (k + j),
              x: start.x + perp.x * (k + j),
            };
            let letter = '';
            if (Crosswords.distance(coord, current) === 0) {
              if (grid[coord.y][coord.x].match(/\w+/i)) {
                letter = grid[coord.y][coord.x];
              } else {
                letter = '.';
              }
            } else if (grid[coord.y][coord.x].match(/\w+/i)) {
              letter = grid[coord.y][coord.x];
            } else {
              letter = '*';
            }
            return letter;
          });
        lemmes.push({
          indexLemme: j,
          indexWord: i,
          takeIndex: letters.findIndex((l) => l === '.'),
          length: letters.length,
          totalLength: length,
          lemme: letters.join(''),
        });
      }
    }

    return lemmes.filter((l) => l.lemme.length > 1 && l.lemme.match(/(\w)+/));
  }

  findWords({
    grid, isDefinition, coord, dir,
  }) {
    const vec = Crosswords.getVector(dir);
    const {
      start, length,
    } = Crosswords.findBoundaries({
      grid, coord, vec, isDefinition,
    });
    let str = '';
    const cells = [];
    for (let i = 0; i < length; i++) {
      const current = {
        x: start.x + vec.x * i,
        y: start.y + vec.y * i,
      };
      const letter = grid[current.y][current.x];
      str += letter.length ? letter.toLowerCase() : '*';
      cells.push(current);
    }
    if (cells.length < 2) return Promise.resolve();
    // transform str into regexp:
    const reg = Crosswords.strToReg(str);

    const regString = reg.toString();
    // console.log('Reg', regString, regString.replaceAll('/', ''));
    const lemmes = Crosswords.getLemmes({
      grid, isDefinition, coord: start, wordLength: length, vec,
    });
    return this.getWords()
      .then((words) => {
        const matches = words
          .reduce((acc, word, i) => {
            if (word.length === length && word.match(reg)) {
              acc.push(word);
            }
            return acc;
          }, []);
        return Promise.race([
          this.getBestWords(matches, lemmes, length),
          new Promise((resolve) => setTimeout(() => resolve(matches), 3000)),
        ]);
      })
      .then((words) => ({
        words, cells, query: regString.replace(/\/i?|\^|\$/g, '').replace(/\\w\?/g, '*'),
      }));
  }
}

const crosswords = new Crosswords();

export default crosswords;
