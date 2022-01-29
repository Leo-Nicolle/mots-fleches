/* eslint-disable no-unreachable */
/* eslint-disable no-continue */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-loop-func */
import fs from "fs/promises";
import path from "path";
import axios from 'axios';
import apiMixin from '../../client/src/js/apiMixin';
interface Point{
  x: number;
  y: number;
}
type Char = string  & { length: 1 };
type Grid = Char[][] 
type BoolGrid = Boolean[][]
type DicoIndex = number;
type OccurenceMap = Record<string, Record<number, Map<number, boolean>>>;

type Lemme = {
    indexLemme: number;
    indexWord: number;
    takeIndex: number;
    length: number,
    totalLength: number,
    lemme: string,
}
class Crosswords {
  private dico: string[] = [];
  private words: string[] = [];
  private wordsMap: Map<string, number> = new Map();
  private wordsLengthMap: Map<number, string[]> = new Map();
  private loadingPromise: Promise<void> | null;
  private occurencies: OccurenceMap[];
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
        .map((letter) => fs.readFile(path.resolve(`./public/result-${letter}.txt`), 'utf-8')),
      fs.readFile(path.resolve('./public/allwords.txt'), 'utf-8'),
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

  addWordsToDictionnary(data: string, countOccurences = false) {
    const { wordsMap } = this;
    let rawWords: string[] = [];
    if (typeof data === 'string') {
      rawWords = data.split(/,|\n/);
    } else {
      rawWords = data;
    }
    const minIndex = this.words.length;
    rawWords.map((w) => w
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase())
      .forEach((word) => {
        if (wordsMap.has(word)) return;
        wordsMap.set(word, this.words.length);
        this.words.push(word);
      });

    if (!countOccurences) return;
    this.words.slice(minIndex)
      .forEach((word, i) => {
        for(let l = 0; l < 2; l++) {
          const occurencies = Crosswords.countOccurences([word], l+2)
          Object.entries(occurencies)
            .forEach(([lemme, occs]) => {
              Object.keys(occs)
                .forEach(j => {
                  if (!this.occurencies[l][lemme]) {
                    this.occurencies[l][lemme] = {}
                  }
                  if (!this.occurencies[l][lemme][j]) {
                    this.occurencies[l][lemme][j] = new Map()
                  }
                  this.occurencies[l][lemme][j].set(i + minIndex, true);
                })
            })
        }
      })
  }
  removeWordsFromDictionary(data) {
    const { wordsMap } = this;
    let rawWords: string[] = [];
    if (typeof data === 'string') {
      rawWords = data.split(/,|\n/);
    } else {
      rawWords = data;
    }
    const offset = this.words.length
    rawWords.map((w) => w
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase())
      .forEach((word) => {
        if (!wordsMap.get(word)) return;
        const index = wordsMap.get(word) as number;
        this.words.splice(index, 1);
        wordsMap.set(word, 0);
        for (let l = 0; l < 2; l++) {
          const occurencies = Crosswords.countOccurences([word], l+2)
          Object.entries(occurencies)
            .forEach(([lemme, occs]) => {
              Object.keys(occs)
                .forEach(j => {
                  if (!this.occurencies[l] 
                    ||!this.occurencies[l][lemme] 
                    || !this.occurencies[l][lemme][j]) return;
                  this.occurencies[l][lemme][j].set(index, false);
                })
            })
        }
      });
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

  static getCooords({ start, length, vec }) {
    const coords: Point[] = [];
    for (let i = 0; i < length; i++) {
      coords.push({
        x: start.x + vec.x * i,
        y: start.y + vec.y * i,
      });
    }
    return coords;
  }

  getBestWords({
    words, lemmes, grid, start, length, vec,
  }: {
    words: string[], lemmes: Lemme[], grid: Grid, start: Point, length: number, vec: Point,
  }) {
    if (!words.length) return { words: [], impossible: Crosswords.getCooords({ start, length, vec }) };
    // find all the words that could fit on each crossing
    const possibleLetters: Map<Char, boolean>[] = new Array(words[0].length).fill(0).map((e) => new Map());
    const impossibleLetters: Map<Char, boolean>[] = new Array(words[0].length).fill(0).map((e) => new Map());
    const bestWords = words.filter((word) => {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i] as Char;
        if (impossibleLetters[i].get(letter)) return false;
        if (possibleLetters[i].get(letter)) continue;
        const lemmesForIndex = lemmes.filter((l) => l.indexWord === i);
        if (!lemmesForIndex.length) continue;
        let impossibleLetter = false;
        const possibleWords = lemmesForIndex.reduce((occurencies: null | false | DicoIndex[] , lemme) => {
          if (occurencies === false 
            || impossibleLetter
            || (Array.isArray(occurencies) && !occurencies.length)) return false;
          const reg = Crosswords.strToReg(lemme.lemme.replace('.', letter), '');
          const entries = Object.entries(this.occurencies[lemme.length - 2] || {});
          const occs = entries.filter(([l, o]) => l.match(reg));
          if (!entries.length || !occs.length) {
            impossibleLetter = true;
            return false;
          }
          if (occurencies === null) {
            return [...occs.reduce((indexes, [_, maps]) => {
              const map = maps[lemme.indexLemme];
              if (!map) return indexes;
              [...map.keys()].forEach((k) => {
                if (this.words[k] && 
                  this.words[k].length === lemme.totalLength) indexes.set(k, true);
              });
              return indexes;
            }, new Map()).keys()];
          }

          return occurencies
            .filter((o) => occs.some(([_, maps]) => maps[lemme.indexLemme] && maps[lemme.indexLemme].get(o)));
        }, null);
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
    const impossible = Crosswords.getCooords({ start, length, vec })
      .filter((coords, i) => {
        const letter = grid[coords.y][coords.x];
        if (!letter.length || !letter.match(/\w/i)) return false;
        if (!impossibleLetters[i].get(letter.toUpperCase() as Char)) return false;
        return true;
      });
    return {
      words: bestWords,
      impossible,
    };
  }

  static countOccurences(words: string[], length = 1, offset = 0): OccurenceMap {
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
        occurencies[lemme][j].set(i + offset, true);
      }
    });
    return occurencies;
  }

  static getLemmes({
    grid, isDefinition, coord, wordLength, vec,
  }: {grid: Grid, isDefinition:BoolGrid, coord: Point, wordLength: number, vec: Point}) {
    const lemmes: Lemme[] = [];
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
    grid, isDefinition, coord, dir, method = '',
  }) {
    const vec = Crosswords.getVector(dir);
    const {
      start, length,
    } = Crosswords.findBoundaries({
      grid, coord, vec, isDefinition,
    });
    let str = '';
    const cells: Point[] = [];
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
          }, [] as string[]);
        if (method === 'fastest') {
          return Promise.race([
            this.getBestWords({
              words: matches, lemmes, grid, start, length, vec,
            }),
            new Promise((resolve) => setTimeout(() => resolve({ words: matches, impossible: [] }), 3000)),
          ]);
        } if (method === 'simple') {
          return { words: matches, impossible: [] };
        }
        return this.getBestWords({
          words: matches, lemmes, grid, start, length, vec,
        });
      })
      .then(({ words, impossible }) => ({
        words, impossible, cells, query: regString.replace(/\/i?|\^|\$/g, '').replace(/\\w\?/g, '*'),
      }));
  }
}

const crosswords = new Crosswords();

export default crosswords;
