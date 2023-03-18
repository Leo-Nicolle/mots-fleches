import { Grid, Cell, Direction, Vec } from "../../../grid/src";
import dico from "./dico";
import {
  Lemme,
  Point,
  Char,
  DicoIndex,
  OccurenceByIndex,
  SearchResult,
} from "./types";
import { getCoords, strToReg, distance, cantor } from "./utils";

export class Search {
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
    dir,
  }: {
    words: string[];
    lemmes: Lemme[];
    grid: Grid;
    start: Point;
    length: number;
    dir: Direction;
  }) {
    const vec = Grid.getDirVec(dir);
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
      .map(() => new Map());
    // console.log(
    //   "All occurencies",
    //   Object.entries(dico.occurencies[1] || {}).forEach(([k, v]) => {
    //     Object.entries(v).forEach(([k2, v2]) => {
    //       console.log({
    //         lemme: k,
    //         index: k2,
    //         dicoIndexdes: [...v2.keys()],
    //       });
    //     });
    //   }),
    //   Object.entries(dico.occurencies[0] || {}).forEach(([k, v]) => {
    //     Object.entries(v).forEach(([k2, v2]) => {
    //       console.log({
    //         lemme: k,
    //         index: k2,
    //         dicoIndexdes: [...v2.keys()],
    //       });
    //     });
    //   }),
    //   JSON.stringify(dico.getWordsSync(), undefined, 3)
    // );
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
      const letter = grid.cells[coords.y][coords.x].text;
      if (!letter.length || !letter.match(/\w/i)) return false;
      if (!impossibleLetters[i].get(letter.toUpperCase() as Char)) return false;
      return true;
    });
    // console.log({ impossibleLetters,possibleLetters, bestWords });
    return {
      words: bestWords,
      impossible,
    };
  }

  static getLemmes({
    grid,
    coord,
    wordLength,
    dir,
  }: {
    grid: Grid;
    coord: Point;
    wordLength: number;
    dir: Direction;
  }) {
    const lemmes: Lemme[] = [];
    const vec = Grid.getDirVec(dir);
    const perp = {
      x: vec.y,
      y: vec.x,
    };
    for (let i = 0; i < wordLength; i++) {
      const current = {
        x: coord.x + vec.x * i,
        y: coord.y + vec.y * i,
      };
      const { start, length } = grid.getBounds(
        current,
        Grid.perpendicular(dir)
      );
      const { cells } = grid;
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
              if (cells[coord.y][coord.x].text.match(/\w+/i)) {
                letter = cells[coord.y][coord.x].text;
              } else {
                letter = ".";
              }
            } else if (cells[coord.y][coord.x].text.match(/\w+/i)) {
              letter = cells[coord.y][coord.x].text;
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

    // remove smaller lemmes with the same indexLemme and indexWord:
    const map = new Map();
    lemmes
      .filter((l) => l.lemme.length > 1 && l.lemme.match(/(\w)+/))
      .forEach((lemme) => {
        const index = cantor(lemme.indexLemme, lemme.indexWord);
        if (!map.has(index)) {
          map.set(index, lemme);
        } else if (map.get(index).length < lemme.length) {
          map.set(index, lemme);
        }
      });
    return [...map.values()];
  }

  findWords({
    grid,
    coord,
    dir,
    method = "simple",
  }: {
    grid: Grid;
    coord: Vec;
    dir: Direction;
    method: "simple" | "fastest";
  }): Promise<SearchResult> {
    const vec = Grid.getDirVec(dir);
    const { start, length } = grid.getBounds(coord, dir);
    let str = "";
    const cells: Point[] = [];
    for (let i = 0; i < length; i++) {
      const current = {
        x: start.x + vec.x * i,
        y: start.y + vec.y * i,
      };
      const letter = grid.cells[current.y][current.x].text;
      str += letter.length ? letter.toLowerCase() : "*";
      cells.push(current);
    }
    if (cells.length < 2)
      return Promise.resolve({
        words: [] as string[],
        impossible: [] as string[],
        cells: [] as Cell[],
        query: "",
      });
    // transform str into regexp:
    const reg = strToReg(str);

    const regString = reg.toString();
    // console.log('Reg', regString, regString.replaceAll('/', ''));
    const lemmes = Search.getLemmes({
      grid,
      coord: start,
      wordLength: length,
      dir,
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
              dir,
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
          dir,
        });
      })
      .then(({ words, impossible }) => {
        return {
          words,
          impossible,
          cells,
          query: regString.replace(/\/i?|\^|\$/g, "").replace(/\\w\?/g, "*"),
        } as SearchResult;
      });
  }
}

const search = new Search();

export default search;
