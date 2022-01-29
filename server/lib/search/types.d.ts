export interface Point {
  x: number;
  y: number;
}
export type Char = string & { length: 1 };
export type Grid = Char[][];
export type BoolGrid = Boolean[][];
export type DicoIndex = number;
export type OccurenceMap = Record<string, Record<number, Map<number, boolean>>>;

export type Lemme = {
  indexLemme: number;
  indexWord: number;
  takeIndex: number;
  length: number;
  totalLength: number;
  lemme: string;
};
