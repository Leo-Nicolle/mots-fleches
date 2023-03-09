import { Grid } from "./Grid";
import { Cell, GridOptions } from "./types";


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

export function isSplited(cell:Cell){
  return cell.text.includes("\n\n");
}
export function getLines(cell: Cell){
  return cell.text.split("\n\n").map(line => line.split("\n")).flat();
}
export function splitIndex(cell: Cell){
  const split  = cell.text.split("\n\n");
  return split.length === 2 
  ? split[0].split("\n").length 
  : 0;
}

export function arrowPositions(cell: Cell){
  const lines = getLines(cell);
  const splited = isSplited(cell);
  const index = splitIndex(cell);

  const rightArrows =  splited && lines.length === 2 ||lines.length === 4
   ? [{x: 1, y: 0.25}, {x: 1, y: 0.75}]
   : splited && lines.length === 3
    ? index === 1
      ? [{x: 1, y: 1/6}, {x: 1, y: 2/3}]
      : [{x: 1, y: 1/3}, {x: 1, y:5/6}]
    : [{x: 1, y: 0.5}, {x: 1, y: 0.5}];

   return rightArrows.concat({
    x: 0.5,y: 1
   });
}

export const arrowDirs =[['right', 'rightdown'], ['right', 'rightdown'], ['down' , 'downright']];