import axios from 'axios';

export default class Crosswords {
  constructor() {
    this.dico = [
      'abc',
      'aac',
      'bbc',
      'bac',
    ];
    this.words = [];
    this.loadingPromise = null;
    this.loadDictionary();
    this.getWords().then((words) => {
      // console.log(words);
    });
  }

  loadDictionary() {
    if (this.loadingPromise) return this.loadingPromise;
    // Promise.all(
    //   [
    //     axios.get('http://localhost:3010/result-complete-A.txt'),
    //     axios.get('http://localhost:3010/result-A.txt'),
    //   ],
    // )
    //   .then((datasets) => {
    //     const [a, b] = datasets
    //       .map(({ data }) => data.split(/,|\n/).reduce((map, word) => map.set(word, true), new Map()));
    //     const aNotB = [...a.keys()].reduce((aNotB, word) => (b.has(word) ? aNotB : aNotB.concat(word)), []);
    //     const bNotA = [...b.keys()].reduce((bNotA, word) => (a.has(word) ? bNotA : bNotA.concat(word)), []);
    //     console.log('aNotB', aNotB);
    //     console.log('bNotA', bNotA);
    //   });
    const wordsMap = new Map();
    this.loadingPromise = Promise.all([
      ...new Array(26).fill(0)
        .map((_, i) => String.fromCharCode('A'.charCodeAt(0) + i))
        .map((letter) => axios.get(`http://localhost:3010/result-${letter}.txt`)),
      axios.get('http://localhost:3010/allwords.txt'),
    ])
      .then((responses) => {
        responses.forEach(({ data }) => {
          data.split(/,|\n/)
            .map((w) => w
              .trim()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .toUpperCase())
            .forEach((word) => {
              if (wordsMap.has(word)) return;
              wordsMap.set(word, true);
              this.words.push(word);
            });
        });
      });
    return this.loadingPromise;
  }

  getWords() {
    return this.loadDictionary()
      .then(() => this.words);
  }

  static coordValid(grid, coord) {
    return coord.y < grid.length
      && coord.y >= 0
      && coord.x < grid[0].length
      && coord.x >= 0
      && grid[coord.y][coord.x] !== '\n';
  }

  static findBoundaries({
    grid, coord, dir,
  }) {
    let vec = { x: 1, y: 0 };
    let curr = { ...coord };
    let start = { ...coord };
    let end = { ...coord };
    if (dir === 'vertical') {
      vec.x = 0;
      vec.y = -1;
    } else {
      vec.x = -1;
      vec.y = 0;
    }
    let lookingForStart = true;
    let currValid = Crosswords.coordValid(grid, curr);
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
        currValid = Crosswords.coordValid(grid, curr);
      }
    }

    return {
      start,
      end,
      vec,
      length: end.x - start.x + end.y - start.y + 1,
    };
  }

  computeScores() {
    if (this.scoresPromise || true) return Promise.resolve(this.scores);
    const aCharCode = 'a'.charCodeAt(0);
    const frequencies = new Array(26).fill(0).reduce((acc, _, i) => {
      acc[String.fromCharCode(aCharCode + i)] = new Array(40).fill(0);
      return acc;
    }, {});

    this.scoresPromise = this.getWords()
      .then((words) => {
        words.forEach((w) => {
          w.split('').forEach((letter, i) => {
            const arr = frequencies[letter.toLowerCase()];
            if (!arr) return;
            arr[i] += 1;
          });
        });
        Object.values(frequencies).forEach((freqByPos) => {
          freqByPos.forEach((freq) => { freq /= this.words.length; });
        });

        this.scores = this.words.reduce((map, w) => map.set(w, w.split('')
          .reduce((score, letter, i) => (score + frequencies[letter.toLowerCase()] ? frequencies[letter.toLowerCase()][i] : 0),
            0)), new Map());
        return this.scores;
      });
    return this.scoresPromise;
  }

  findWords({
    grid, coord, dir, query,
  }) {
    const {
      start, vec, length,
    } = Crosswords.findBoundaries({ grid, coord, dir });
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
    let reg;
    if (true || !query.length) {
      reg = new RegExp(`^${str.split('').reduce((reg, char) => (char === '*'
        ? `${reg}\\w?`
        : `${reg}${char}`),
      '')}$`, 'i');
    } else {
      reg = new RegExp(`^${query.split('').reduce((reg, char) => (char === '*'
        ? `${reg}\\w?`
        : `${reg}${char}`),
      '')}$`, 'i');
    }
    const regString = reg.toString();
    console.log('Reg', regString, regString.replaceAll('/', ''));
    return this.computeScores()
      .then(() => this.getWords())
      .then((words) => words
        .filter((word) => word.length === length && word.match(reg))
        // .sort((a, b) => Math.abs(a.length - length) - Math.abs(b.length - length)))
        .sort((a, b) => Math.abs(a.length - length) - Math.abs(b.length - length)))

      .then((words) => ({
        words, cells, query: regString.replace(/\/i?|\^|\$/g, '').replace(/\\w\?/g, '*'),
      }));
  }
}
