import { Grid } from "./Grid";
import { GridOptions } from "./types";


export function parse(str: string): [number, string] {
  return [
    +str.slice(0, -2),
    str.slice(-2)
  ]
}

export function format(num: number, unit: string): string {
  return `${num}${unit}`;
}

export function cellWidth(options: GridOptions){
  const {cellSize} = options.grid;
  const [width] = parse(cellSize);
  return width;
}
export function borderWidth(options: GridOptions){
  const {borderSize} = options.grid;
  const [width] = parse(borderSize);
  return width;
}
export function outerBorderWidth(options: GridOptions){
  const {outerBorderSize} = options.grid;
  const [width] = parse(outerBorderSize);
  return width;
}
export function cellAndBorderWidth(options: GridOptions){
  return cellWidth(options) + borderWidth(options);
}

export function gridWidth(grid: Grid, options: GridOptions){
  const {cellSize, borderSize} = options.grid;
  const {cols} = grid;
  const [cellWidth] = parse(cellSize);
  const [border] = parse(borderSize);
  return cols * cellWidth + (cols - 1) * border;
}
export function gridHeight(grid: Grid, options: GridOptions){
  const {cellSize, borderSize} = options.grid;
  const {rows} = grid;
  const [cellHeight] = parse(cellSize);
  const [border] = parse(borderSize);
  return rows * cellHeight + (rows - 1) * border;
}

export function gridTotalWidth(grid: Grid, options: GridOptions){
  const a = gridWidth(grid, options) + 2 * outerBorderWidth(options);
  return a;
}

export function gridTotalHeight(grid: Grid, options: GridOptions){
  return gridHeight(grid, options) + 2 * outerBorderWidth(options);
}