import { Grid, GridOptions, GridState } from "grid";

export abstract class Database {
  abstract getGrids(): Promise<GridState[]>;
  abstract pushGrid(grid: Grid): Promise<string>;
  abstract updateGrid(grid: Grid): Promise<string>;
  abstract deleteGrid(gridId: string) : Promise<void>;
  abstract getGrid(gridId: string): Promise<GridState | undefined>;
  abstract getOptions() : Promise<GridOptions[]>;
  abstract getOption(optionId: string) : Promise<GridOptions | undefined>;
  abstract pushOption(option: any) : Promise<string>;
  abstract updateOption(option: any) : Promise<string>;
  abstract deleteOption(optionId: string) : Promise<void>;
  abstract getWords() : Promise<string[]>;
  abstract getWord(wordId: string) : Promise<string | undefined>;
  abstract pushWord(word: any) : Promise<string>;
  abstract deleteWord(wordId: string) : Promise<void>;
  abstract isSignedIn() : Promise<boolean>;

}
