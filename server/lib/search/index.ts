import dico from "./dico";
import {
  OccurenceMap,
  Lemme,
  Point,
  Char,
  BoolGrid,
  Grid,
  DicoIndex,
  OccurenceByIndex,
} from "./types";
import {
  getCoords,
  strToReg,
  findBoundaries,
  getVector,
  distance,
} from "./utils";
class Crosswords {
  /**
   *
   * @param words: the list of words candidates to be returned (they match simple criteria)
   * @param lemmes: The list of lemmes in the perpendicular direction words have to match with
   * @param grid: the grid
   * @param start: the starting point of the word
   * @param length: the length of the candidate words
   * @returns a list of words that match the perpandicular lemmes
   */
  getBestWords({
    words,
    lemmes,
    grid,
    start,
    length,
    vec,
  }: {
    words: string[];
    lemmes: Lemme[];
    grid: Grid;
    start: Point;
    length: number;
    vec: Point;
  }) {
    if (!words.length)
      return { words: [], impossible: getCoords({ start, length, vec }) };
    // No need to wait for the loading: we already have the words
    const allWords = dico.getWordsSync();

    // map to avoid redoing work: if a letter at a position is known as possible, no need to check again
    const possibleLetters: Map<Char, boolean>[] = new Array(words[0].length)
      .fill(0)
      .map((e) => new Map());
    // map to avoid redoing work: if a letter at a position is known as impossible, no need to check again
    const impossibleLetters: Map<Char, boolean>[] = new Array(words[0].length)
      .fill(0)
      .map((e) => new Map());
    const bestWords = words.filter((word) => {
      for (let i = 0; i < word.length; i++) {
        const letter = word[i] as Char;
        if (impossibleLetters[i].get(letter)) return false;
        if (possibleLetters[i].get(letter)) continue;
        // TODO: avoid this filter for a O(1) check
        const lemmesForIndex = lemmes.filter((l) => l.indexWord === i);
        if (!lemmesForIndex.length) continue;
        let impossibleLetter = false;
        // check for possible words if this letter is set
        const possibleWords = lemmesForIndex.reduce(
          (occurencies: null | false | DicoIndex[], lemme) => {
            // if we had a for loop here, we could break => faster ?
            if (
              occurencies === false ||
              impossibleLetter ||
              (Array.isArray(occurencies) && !occurencies.length)
            )
              return false;
            const reg = strToReg(lemme.lemme.replace(".", letter), "");
            // TODO: find a way to avoid this filter
            const occs: [string, OccurenceByIndex][] = Object.entries(
              dico.occurencies[lemme.length - 2] || {}
            ).filter(([l]) => l.match(reg));
            if (!occs.length) {
              impossibleLetter = true;
              return false;
            }
            // if we are in the first iteration, we can return the occurencies
            if (occurencies === null) {
              return [
                ...occs
                  .reduce((indexes, [_, sets]) => {
                    const set = sets[lemme.indexLemme];
                    if (!set) return indexes;
                    [...set.keys()].forEach((k: DicoIndex) => {
                      if (
                        allWords[k] &&
                        allWords[k].length === lemme.totalLength
                      )
                        indexes.set(k, true);
                    });
                    return indexes;
                  }, new Map())
                  .keys(),
              ];
            }

            // this is quadratic, make it linear.
            return occurencies.filter((o) =>
              occs.some(
                ([_, maps]) =>
                  maps[lemme.indexLemme] && maps[lemme.indexLemme].has(o)
              )
            );
          },
          null
        );
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
    // iterate through all the word's positions and get where an impossible flag was set
    const impossible = getCoords({ start, length, vec }).filter((coords, i) => {
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

  static getLemmes({
    grid,
    isDefinition,
    coord,
    wordLength,
    vec,
  }: {
    grid: Grid;
    isDefinition: BoolGrid;
    coord: Point;
    wordLength: number;
    vec: Point;
  }) {
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
      const { start, length } = findBoundaries({
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
            let letter = "";
            if (distance(coord, current) === 0) {
              if (grid[coord.y][coord.x].match(/\w+/i)) {
                letter = grid[coord.y][coord.x];
              } else {
                letter = ".";
              }
              // seems like here we are pushing too many lemmes:
              // we want only the ones which overlap with the word
            } else if (grid[coord.y][coord.x].match(/\w+/i)) {
              letter = grid[coord.y][coord.x];
            } else {
              letter = "*";
            }
            return letter;
          });
        lemmes.push({
          indexLemme: j,
          indexWord: i,
          length: letters.length,
          totalLength: length,
          lemme: letters.join(""),
        });
      }
    }

    return lemmes.filter((l) => l.lemme.length > 1 && l.lemme.match(/(\w)+/));
  }

  findWords({ grid, isDefinition, coord, dir, method = "" }) {
    const vec = getVector(dir);
    const { start, length } = findBoundaries({
      grid,
      coord,
      vec,
      isDefinition,
    });
    let str = "";
    const cells: Point[] = [];
    for (let i = 0; i < length; i++) {
      const current = {
        x: start.x + vec.x * i,
        y: start.y + vec.y * i,
      };
      const letter = grid[current.y][current.x];
      str += letter.length ? letter.toLowerCase() : "*";
      cells.push(current);
    }
    if (cells.length < 2) return Promise.resolve();
    // transform str into regexp:
    const reg = strToReg(str);

    const regString = reg.toString();
    // console.log('Reg', regString, regString.replaceAll('/', ''));
    const lemmes = Crosswords.getLemmes({
      grid,
      isDefinition,
      coord: start,
      wordLength: length,
      vec,
    });
    return dico
      .getWords()
      .then((words) => {
        const matches = words.reduce((acc, word, i) => {
          if (word.length === length && word.match(reg)) {
            acc.push(word);
          }
          return acc;
        }, [] as string[]);
        if (method === "fastest") {
          return Promise.race([
            this.getBestWords({
              words: matches,
              lemmes,
              grid,
              start,
              length,
              vec,
            }),
            new Promise((resolve) =>
              setTimeout(
                () => resolve({ words: matches, impossible: [] }),
                3000
              )
            ),
          ]);
        }
        if (method === "simple") {
          return { words: matches, impossible: [] };
        }
        return this.getBestWords({
          words: matches,
          lemmes,
          grid,
          start,
          length,
          vec,
        });
      })
      .then(({ words, impossible }) => ({
        words,
        impossible,
        cells,
        query: regString.replace(/\/i?|\^|\$/g, "").replace(/\\w\?/g, "*"),
      }));
  }
}

const crosswords = new Crosswords();

export default crosswords;
