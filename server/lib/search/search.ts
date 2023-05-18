import { Bounds } from "grid";
import { Grid, Direction, Vec } from "../../../grid/src";
import { dico } from "./dico";
import {
  SearchResult,
} from "./types";

/**
 * Search is a singleton containing the search algorithm
 * It is used to find the suggestions
 */
export class Search {
  /**
   * Returns all the words that fit within the bounds, matching letters within thoose bounds
   * @param words: All the words from the dictionnary
   * @param bounds: The bounds of the word
   * @param grid: The grid
   * @returns a list of words that fit
   */
  getWordsSimple({
    grid,
    bounds,
    words,
  }: {
    grid: Grid;
    bounds: Bounds;
    words: string[];
  }): string[] {
    const { length, cells } = bounds;
    let str = "";
    for (let i = 0; i < length; i++) {
      const current = cells[i];
      const letter = grid.cells[current.y][current.x].text;
      str += letter.length ? letter.toLowerCase() : "*";
      cells.push(current);
    }
    if (cells.length < 2) return [];

    return dico.queryBinary(str.toUpperCase());
  }

  /**
   * Entry point of the search algo
   * @param grid The grid
   * @param coord A position in the grid
   * @param dir The searching direction
   * @param method The method to use (simple | fastest)
   * @returns
   */
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
    const bounds = grid.getBounds(coord, dir);
    const { cells } = bounds;
    return dico
      .getWords()
      .then((words) => {
        const wordsSimple = this.getWordsSimple({
          grid,
          bounds,
          words,
        });
        return { words: wordsSimple, impossible: [] };
      })
      .then(({ words, impossible }) => {
        return {
          words,
          impossible,
          cells,
        } as SearchResult;
      });
  }
}

export const search = new Search();
