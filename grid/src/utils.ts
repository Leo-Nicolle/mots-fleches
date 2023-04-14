import { Grid, isSplited } from "./Grid";
import { Cell, defaultOptions, Direction, GridOptions, WordAndPosition, } from "./types";
import { v4 as uuid } from "uuid";

export function parse(str: string): [number, string] {
  return [
    +str.slice(0, -2),
    str.slice(-2)
  ];
}

export function format(num: number, unit: string): string {
  return `${num}${unit}`;
}

export function cellWidth(options: GridOptions) {
  const { cellSize } = options.grid;
  return cellSize;
}
export function borderWidth(options: GridOptions) {
  return options.grid.borderSize;
}
export function outerBorderWidth(options: GridOptions) {
  return options.grid.outerBorderSize;
}
export function cellAndBorderWidth(options: GridOptions) {
  return cellWidth(options) + borderWidth(options);
}

export function gridWidth(grid: Grid, options: GridOptions) {
  const { cellSize, borderSize } = options.grid;
  const { cols } = grid;
  return cols * cellSize + (cols - 1) * borderSize;
}
export function gridHeight(grid: Grid, options: GridOptions) {
  const { cellSize, borderSize } = options.grid;
  const { rows } = grid;
  return rows * cellSize + (rows - 1) * borderSize;
}

export function gridTotalWidth(grid: Grid, options: GridOptions) {
  const a = gridWidth(grid, options) + 2 * outerBorderWidth(options);
  return a;
}

export function gridTotalHeight(grid: Grid, options: GridOptions) {
  return gridHeight(grid, options) + 2 * outerBorderWidth(options);
}

export function getLines(cell: Cell) {
  return cell.text.split("\n\n").map(line => line.split("\n")).flat();
}
export function splitIndex(cell: Cell) {
  const split = cell.text.split("\n\n");
  return split.length === 2
    ? split[0].split("\n").length
    : 0;
}

export function arrowPositions(cell: Cell) {
  const lines = getLines(cell).length;
  const splited = isSplited(cell);
  const index = splitIndex(cell);

  const rightArrowYs = splited
    ? lines === 4
      ? index === 1
        ? [1 / 8, 5 / 8]
        : index === 2
          ? [0.25, 0.75]
          : [3 / 8, 7 / 8]
      : lines === 3
        ? index === 1
          ? [1 / 3, 5 / 6]
          : [1 / 6, 2 / 3]
        : [0.25, 0.75]
    : [0.5, 0.5];
  return rightArrowYs.map(y => ({ x: 1, y })).concat({
    x: 0.5, y: 1
  });
}

export const arrowDirs = [['right', 'rightdown'], ['right', 'rightdown'], ['down', 'downright']];

export function duplicate(options: GridOptions) {
  return {
    ...options,
    id: uuid(),
  }
}

export function newOptions() {
  return duplicate(defaultOptions);
}


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
    })
  })
  return { words, wordsAndBounds };
}

export function getAllWords(grids: Grid[]) {

  const words = new Set<string>();
  grids.forEach(grid => {
    const { words: gridWords } = getWords(grid);
    gridWords.forEach(word => words.add(word));
  })
  return words;
}