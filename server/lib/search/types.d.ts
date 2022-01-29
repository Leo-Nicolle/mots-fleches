export interface Point {
  x: number;
  y: number;
}
export type Char = string & { length: 1 };
export type Grid = Char[][];
export type BoolGrid = Boolean[][];
export type DicoIndex = number;
export type OccurenceByIndex = Record<number, Set<DicoIndex>>;
export type OccurenceMap = Record<string, OccurenceByIndex>;

export type Lemme = {
  // index of the letter in the perpandicular word
  indexLemme: number;
  // index of the letter in the word
  indexWord: number;
  // length of the lemme (2 or 3)
  length: number;
  // length of the perpandicular word
  totalLength: number;
  // the lemme (. or a letter)
  lemme: string;
};
