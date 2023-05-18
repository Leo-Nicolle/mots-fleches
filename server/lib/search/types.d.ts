import { Cell } from "../../../grid/src";

declare global {
  const APP_CROSSWORDS_PORT: string;
  const APP_CROSSWORDS_WORDS_PATH: string;
  const APP_CROSSWORDS_GRIDS_PATH: string;
  const APP_CROSSWORDS_DICO_PATH: string;
  const APP_CROSSWORDS_OPTIONS_PATH: string;
  const APP_OPEN_BROWSER: boolean;
}

export interface Point {
  x: number;
  y: number;
}
export type Char = string & { length: 1 };
export type BoolGrid = Boolean[][];
export type DicoIndex = number;
/**
 * Data structure for fast access.
 * Key is the index of the letter within the word
 * Value is a set of indexes within the words array
 */
export type OccurenceByIndex = Record<number, Set<DicoIndex>>;
/**
 * Data structure for fast access.
 * key is a sequence of 2 or 3 letters
 * value is an OccurenceByIndex.
 */
export type OccurenceMap = Record<string, OccurenceByIndex>;

/**
 * Result of a search
 */
export type SearchResult = {
  /**
   * The list of words found
   */
  words: string[];
  /**
   * Cells to fit the word into
   */
  cells: Cell[];
  /**
   * Letters that make it impossible to find words
   */
  impossible?: string[];
};

/**
 * Part of a word withing a grid
 */
export type Lemme = {
  /**
   * index of the letter in the perpandicular word
   */
  indexLemme: number;
  /**
   * index of the letter in the word
   */
  indexWord: number;
  /**
   * length of the lemme (2 or 3)
   */
  length: number;
  /**
   * length of the perpandicular word
   */
  totalLength: number;
  /**
   * the lemme (. or a letter)
   */
  lemme: string;
};
