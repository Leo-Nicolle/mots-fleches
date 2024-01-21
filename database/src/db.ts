import { Grid, GridStyle, GridState, SolutionStyle } from "grid";
import { Font } from "./types";

export abstract class Database {
  abstract getGrids(): Promise<GridState[]>;
  abstract pushGrid(grid: Grid): Promise<string>;
  abstract updateGrid(grid: Grid): Promise<string>;
  abstract deleteGrid(gridId: string): Promise<void>;
  abstract getGrid(gridId: string): Promise<GridState | undefined>;
<<<<<<< HEAD
  abstract getStyles(): Promise<(GridStyle | SolutionStyle)[]>;
  abstract getStyle(optionId: string): Promise<GridStyle | SolutionStyle | undefined>;
  abstract pushStyle(option: any): Promise<string>;
  abstract updateOption(option: any): Promise<string>;
  abstract deleteStyle(optionId: string): Promise<void>;
  abstract getWords(): Promise<string[]>;
  abstract getWord(wordId: string): Promise<string | undefined>;
  abstract pushWord(word: any): Promise<string>;
  abstract deleteWord(wordId: string): Promise<void>;
  abstract getBannedWords(): Promise<string[]>;
  abstract getBannedWord(wordId: string): Promise<string | undefined>;
  abstract pushBannedWord(word: any): Promise<string>;
  abstract deleteBannedWord(wordId: string): Promise<void>;
  abstract getFonts(): Promise<Font[]>;
  abstract getFont(fontId: string): Promise<Font | undefined>;
  abstract pushFont(font: Font): Promise<string>;
  abstract deleteFont(wordId: string): Promise<void>;
  abstract isSignedIn(): Promise<boolean>;
=======
  abstract getStyles() : Promise<(GridStyle | SolutionStyle)[]>;
  abstract getStyle(optionId: string) : Promise<GridStyle | SolutionStyle| undefined>;
  abstract pushStyle(option: any) : Promise<string>;
  abstract updateOption(option: any) : Promise<string>;
  abstract deleteStyle(optionId: string) : Promise<void>;
  abstract getWords() : Promise<string[]>;
  abstract getWord(wordId: string) : Promise<string | undefined>;
  abstract pushWord(word: any) : Promise<string>;
  abstract deleteWord(wordId: string) : Promise<void>;
  abstract getBannedWords() : Promise<string[]>;
  abstract getBannedWord(wordId: string) : Promise<string | undefined>;
  abstract pushBannedWord(word: any) : Promise<string>;
  abstract deleteBannedWord(wordId: string) : Promise<void>;
  abstract getDefinitions() : Promise<string[]>;
  abstract getDefinition(wordId: string) : Promise<string | undefined>;
  abstract pushDefinition(word: any, def: string) : Promise<string>;
  abstract deleteDefinition(wordId: string) : Promise<void>;
  abstract getFonts() : Promise<Font[]>;
  abstract getFont(fontId: string) : Promise<Font | undefined>;
  abstract pushFont(font: Font) : Promise<string>;
  abstract deleteFont(wordId: string) : Promise<void>;
  abstract isSignedIn() : Promise<boolean>;
>>>>>>> @{-1}

}
