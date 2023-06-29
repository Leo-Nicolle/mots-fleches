import { Grid, GridStyle, GridState, SolutionStyle } from "grid";

export abstract class Database {
  abstract getGrids(): Promise<GridState[]>;
  abstract pushGrid(grid: Grid): Promise<string>;
  abstract updateGrid(grid: Grid): Promise<string>;
  abstract deleteGrid(gridId: string) : Promise<void>;
  abstract getGrid(gridId: string): Promise<GridState | undefined>;
  abstract getStyles() : Promise<(GridStyle | SolutionStyle)[]>;
  abstract getStyle(optionId: string) : Promise<GridStyle | SolutionStyle| undefined>;
  abstract pushStyle(option: any) : Promise<string>;
  abstract updateOption(option: any) : Promise<string>;
  abstract deleteStyle(optionId: string) : Promise<void>;
  abstract getWords() : Promise<string[]>;
  abstract getWord(wordId: string) : Promise<string | undefined>;
  abstract pushWord(word: any) : Promise<string>;
  abstract deleteWord(wordId: string) : Promise<void>;
  abstract isSignedIn() : Promise<boolean>;

}
