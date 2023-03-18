import { Grid, isSplited } from "./Grid";
import { Cell, defaultOptions, GridOptions, } from "./types";
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
  const [width] = parse(cellSize);
  return width;
}
export function borderWidth(options: GridOptions) {
  const { borderSize } = options.grid;
  const [width] = parse(borderSize);
  return width;
}
export function outerBorderWidth(options: GridOptions) {
  const { outerBorderSize } = options.grid;
  const [width] = parse(outerBorderSize);
  return width;
}
export function cellAndBorderWidth(options: GridOptions) {
  return cellWidth(options) + borderWidth(options);
}

export function gridWidth(grid: Grid, options: GridOptions) {
  const { cellSize, borderSize } = options.grid;
  const { cols } = grid;
  const [cellWidth] = parse(cellSize);
  const [border] = parse(borderSize);
  return cols * cellWidth + (cols - 1) * border;
}
export function gridHeight(grid: Grid, options: GridOptions) {
  const { cellSize, borderSize } = options.grid;
  const { rows } = grid;
  const [cellHeight] = parse(cellSize);
  const [border] = parse(borderSize);
  return rows * cellHeight + (rows - 1) * border;
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
