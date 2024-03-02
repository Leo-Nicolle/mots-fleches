import { GridStyle, GridState, SolutionStyle } from "grid";
import { Book, Font } from "./types";

export abstract class Database {
  abstract getGrids(): Promise<GridState[]>;
  abstract pushGrid(grid: GridState): Promise<string>;
  abstract updateGrid(grid: GridState): Promise<string>;
  abstract deleteGrid(gridId: string): Promise<void>;
  abstract getGrid(gridId: string): Promise<GridState | undefined>;
  abstract getBooks(): Promise<Book[]>;
  abstract pushBook(book: Book): Promise<string>;
  abstract updateBook(book: Book): Promise<string>;
  abstract deleteBook(bookId: string): Promise<void>;
  abstract getBook(bookId: string): Promise<Book | undefined>;
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

}
