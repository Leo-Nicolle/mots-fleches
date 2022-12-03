import { Bounds, Cell, Direction, Vec } from "./types";
import { add, mult } from "./utils";

export const nullCell:Cell = {
  x: -1,
  y: -1,
  definition: false,
  text: ''
};

export default class Grid {
  public rows: number;
  public cols: number;
  public cells: Cell[][];
  public id: string;
  constructor(rows: number, cols: number, id?: string) {
    this.cols = cols;
    this.rows = rows;
    this.id = id || `${Math.random()}`;
    this.cells =  new Array(rows)
      .fill(0)
      .map((_, y) => new Array(cols)
        .fill(0)
        .map((_, x) => ({
          x,
          y,
          definition: false,
          text: "",
        }))
      );
  }

  isValid({x, y}: Vec): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }

  isDefinition({x, y}: Vec): boolean {
    return this.cells[y][x].definition;
  }

  setDefinition({x, y}: Vec, value: boolean): void {
    this.cells[y][x].definition = value;
    this.cells[y][x].text = '';
  }

  setText({x, y}: Vec, value:string){
    const cell = this.cells[y][x];
    if (cell.definition){
      cell.text = value;
    } else {
      cell.text = value.slice(-1);
    }
  }
  increment(v: Vec, direction: Direction): Cell {
    const {x,y} = add(v, Grid.getDirVec(direction));
    if (this.isValid({x,y})) return this.cells[y][x];
    return nullCell;
  }
  getCell({x, y}: Vec): Cell{
    return this.cells[y][x];
  }


  static equal(a: Cell, b: Cell): boolean {
    return a.x === b.x && a.y === b.y;
  }

  static getDirVec(direction: Direction): Vec {
    return direction === 'horizontal' 
      ? {x: 1, y: 0}
      : {x: 0, y: 1};
  }

  getBounds({x, y}: Vec, direction: Direction): Bounds {
    if (!this.isValid({x,y}) || this.isDefinition({x,y})) return {
      start: {x, y},
      end: {x, y},
      cells: [],
      length: 0
    };
    const v = Grid.getDirVec(direction);
    const vm = mult(v, -1);
    let start = {x, y};
    let end = {x, y};
    let length = 0;
    while (this.isValid(start) && !this.isDefinition(start)){
      length++;
      start = add(start, vm);
    }
    start = add(start, v);

    length--;
    while (this.isValid(end) && !this.isDefinition(end)){
      end = add(end, v);
      length++;
    }
    end = add(end, vm);
    const cells = new Array(length)
      .fill(0)
      .map((_, i) => this.cells[start.y + v.y * i][start.x + v.x * i]);
    
    return {
      start,end, length,
      cells
    };
  }

}