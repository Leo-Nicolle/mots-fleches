import { Grid } from "./Grid";
import { Cell, defaultStyles, Direction, GridStyle, lineCases, LineSpacings, rightArrowYs, splitPositions, WordAndPosition, } from "./types";
import { v4 as uuid } from "uuid";

/**
 * From a string like 10cm returns [10.cm]
 * @param str input string
 * @returns [value, unit]
 */
export function parse(str: string): [number, string] {
  return [
    +str.slice(0, -2),
    str.slice(-2)
  ];
}
/**
 * From an array of [value, unit] returns a string like 10cm
 * @param num value
 * @param unit unit
 * @returns the formatted string
 */
export function format(num: number, unit: string): string {
  return `${num}${unit}`;
}

export function cellWidth(style: GridStyle) {
  const { cellSize } = style.grid;
  return cellSize;
}
export function borderWidth(style: GridStyle) {
  return style.grid.borderSize;
}
export function outerBorderWidth(style: GridStyle) {
  return style.grid.outerBorderSize;
}
/**
 * Returns the width of a cell and its border
 * @param style 
 * @returns 
 */
export function cellAndBorderWidth(style: GridStyle) {
  return cellWidth(style) + borderWidth(style);
}
/**
 * Returns the width of the grid (without outer border)
 * @param grid 
 * @param style 
 * @returns 
 */
export function gridWidth(grid: Grid, style: GridStyle) {
  const { cellSize, borderSize } = style.grid;
  const { cols } = grid;
  return cols * cellSize + (cols - 1) * borderSize;
}
/**
 * Returns the height of the grid (without outer border)
 * @param grid 
 * @param style 
 * @returns 
 */
export function gridHeight(grid: Grid, style: GridStyle) {
  const { cellSize, borderSize } = style.grid;
  const { rows } = grid;
  return rows * cellSize + (rows - 1) * borderSize;
}
/**
 * Returns the total width of the grid (with outer border)
 * @param grid 
 * @param style 
 * @returns 
 */
export function gridTotalWidth(grid: Grid, style: GridStyle) {
  const a = gridWidth(grid, style) + 2 * outerBorderWidth(style);
  return a;
}
/**
 * Returns the total height of the grid (with outer border)
 * @param grid 
 * @param style 
 * @returns 
 */
export function gridTotalHeight(grid: Grid, style: GridStyle) {
  return gridHeight(grid, style) + 2 * outerBorderWidth(style);
}
/**
 * From a definition cell, returns the lines of text
 * @param cell 
 * @returns 
 */
export function getLines(cell: Cell) {
  return cell.text.split("\n\n").map(line => line.split("\n")).flat();
}
/**
 * From a definition cell, returns where is the split
 * @param cell 
 * @returns 
 */
export function splitIndex(cell: Cell) {
  const split = cell.text.split("\n\n");
  return split.length === 2
    ? split[0].split("\n").length
    : 0;
}

const regs = lineCases
  .map((c) => new RegExp(c.replaceAll('-', '[^\n]+')));

export function getLineCaseIndex(txt: string) {
  return regs.reduce((acc, e, i) => txt.match(e) ? i : acc, 0);
}
export function getOffsetY(txt: string, spacings: LineSpacings) {
  return spacings[getLineCaseIndex(txt)];
}
/**
 * From a definition cell, returns the position of the arrows
 * @param cell 
 * @returns 
 */
export function arrowPositions(cell: Cell) {
  return rightArrowYs[getLineCaseIndex(cell.text)]
    .map(y => ({ x: 1, y }))
    .concat({
      x: 0.5, y: 1
    });
}
export function splitPosition(cell: Cell) {
  return splitPositions[getLineCaseIndex(cell.text)];
}

export const arrowDirs = [['right', 'rightdown'], ['right', 'rightdown'], ['down', 'downright']];

export function duplicate(style: GridStyle) {
  return {
    ...style,
    id: uuid(),
  };
}

export function newStyle() {
  return duplicate(defaultStyles);
}

/**
 * From a grid, returns all the words and their positions
 * @param grid 
 * @returns 
 */
export function getWords(grid: Grid) {
  const words = new Set<string>();
  const wordsAndBounds: WordAndPosition[] = [];
  (['horizontal', 'vertical'] as Direction[]).forEach(direction => {
    const visited = new Array(grid.rows).fill(0).map(() => new Array(grid.cols).fill(false));
    grid.cells.forEach((row) => {
      row.forEach((cell) => {
        if (cell.definition) return;
        const bounds = grid.getBounds(cell, direction);
        if (!bounds.length) return;
        let word = '';
        let valid = true;
        bounds.cells.forEach((cell) => {
          word += cell.text;
          if (!cell.text) valid = false;
          visited[cell.y][cell.x] = true;
        });
        if (!valid) return;
        words.add(word);
        wordsAndBounds.push({ word, start: bounds.start, direction });
      });
    });
  });
  return { words, wordsAndBounds };
}
/**
 * From a list of grids, returns all the words
 * @param grids
 * @returns
 */
export function getAllWords(grids: Grid[]) {

  const words = new Set<string>();
  grids.forEach(grid => {
    const { words: gridWords } = getWords(grid);
    gridWords.forEach(word => words.add(word));
  });
  return words;
}

export function getDefinitions(grid: Grid, defs?: Map<string, Set<string>>) {
  const definitions = defs || new Map<string, Set<string>>();
  const { wordsAndBounds } = getWords(grid);
  const directions = {
    'horizontal': new Set(['right', 'downright']),
    'vertical': new Set(['down', 'rightdown']),
  };
  wordsAndBounds.filter(({ word }) => word.length > 1)
    .forEach(({ word, start, direction }) => {
      const candidates = [
        { x: start.x - 1, y: start.y },
        { x: start.x, y: start.y - 1 }
      ].filter(({ x, y }) => {
        if (!grid.isValid({ x, y })) return false;
        const { definition, arrows } = grid.cells[y][x];
        if (!definition) return false;
        if (!arrows.some(a => directions[direction].has(a))) return false;
        return true;
      });

      if (candidates.length !== 1) return;
      const { x, y } = candidates[0];
      const { text, arrows } = grid.cells[y][x];
      const lines = text.split("\n\n").map(line => line.replace("\n", ' '));
      const index = arrows.findIndex(a => directions[direction].has(a));
      const line = index === 0 ? lines[0] : lines[lines.length - 1];
      if (!line) return;

      const set = definitions.get(word) || new Set<string>();
      set.add(line);
      definitions.set(word, set);
    });
  return definitions;
}