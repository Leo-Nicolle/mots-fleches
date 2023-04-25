import { ArrowDir, Bounds, Cell, Direction, GridState, GridValidity, ProblemBound, Vec } from "./types";
import Vector from "vector2js";
import { v4 as uuid } from "uuid";

/**
 * Null cell
 * Used to represent a cell that is not in the grid
 */
export const nullCell: Cell = {
  x: -1,
  y: -1,
  definition: false,
  highlighted: false,
  spaceH: false,
  spaceV: false,
  suggestion: '',
  arrows: [],
  text: ''
};
/**
 * Checks that a definition cell is splited or not
 * @param cell cell to check 
 * @returns wether the cell is splited or not
 */
export function isSplited(cell: Cell) {
  return cell.text.includes("\n\n");
}

/**
 * Grid class
 * Represents a grid
 * has many helper functions to manipulate the grid
 */
export class Grid {
  /**
   * nuber of rows within the grid
   */
  public rows: number;
  /**
   * number of columns within the grid
   */
  public cols: number;
  /**
   * Comment of the grid
   */
  public comment: string;
  /**
   * Title of the grid
   */
  public title: string;
  /**
   * Cells of the grid
   */
  public cells: Cell[][];
  /**
   * Id of the grid(db)
   */
  public id: string;
  /**
   * Date of creation(db)
   */
  public created: number;
  /**
   * Id of the options(db)
   * @see GridOptions
   * Might be removed soon with books
   */
  public optionsId: string;

  /**
   * Grid constructor
   * @param rows Number of rows
   * @param cols Number of columns
   * @param id id of the grid
   */
  constructor(rows: number, cols: number, id?: string) {
    this.cols = cols;
    this.rows = rows;
    this.comment = '';
    this.title = '';
    this.optionsId = 'default';
    this.id = id || uuid();
    this.created = Date.now();
    this.cells = new Array(rows)
      .fill(0)
      .map((_, y) => new Array(cols)
        .fill(0)
        .map((_, x) => Grid.newCell(x, y))
      );
  }

  /**
   * Checks wether coordinates are within the bounds of the grid
   * @param point coordinates 
   * @returns false if x or y is out of bounds
   */
  isValid({ x, y }: Vec): boolean {
    return x >= 0 && x < this.cols && y >= 0 && y < this.rows;
  }
  /**
   * Checks if the cell at the given coordinates is a definition cell
   * @param point coordinates
   * @returns true if the cell is a definition cell
   */
  isDefinition({ x, y }: Vec): boolean {
    return this.isValid({ x, y }) && this.cells[y][x].definition;
  }

  /**
   * Resizes the grid to the given dimensions
   * @param rows height of the grid
   * @param cols width of the grid
   */
  resize(rows: number, cols: number) {
    const newCells = new Array(rows)
      .fill(0)
      .map((_, i) => new Array(cols).fill(0)
        .map((_, j) => {
          if (this.cells[i] && this.cells[i][j]) {
            return this.cells[i][j];
          }
          return Grid.newCell(j, i);
        }));
    this.rows = rows;
    this.cols = cols;
    this.cells = newCells;
  }

  /**
   * Set the cell at the given coordinates as a definition cell (or not)
   * @param coordinates
   * @param value true to make it a definition cell, false to make it a normal cell 
   */
  setDefinition({ x, y }: Vec, value: boolean): void {
    this.cells[y][x].definition = value;
    this.cells[y][x].text = '';
    if (value) {
      this.cells[y][x].arrows = ['none', 'none', 'none'];
    } else {
      this.cells[y][x].arrows = [];

    }
  }

  /**
   * Set the text to the cell at the given coordinates
   * @param coordinates 
   * @param value text to set 
   */
  setText({ x, y }: Vec, value: string) {
    const cell = this.cells[y][x];
    if (cell.definition) {
      cell.text = value;
    } else {
      cell.text = value.slice(-1);
    }
  }
  /**
   * Write a word within the grid, one letter per cell 
   * @param word word to write
   * @param point start coordinates of the word
   * @param direction writing direction
   */
  setWord(word: string, point: Vec, direction: Direction) {
    const v = Grid.getDirVec(direction);
    const s = new Vector(point.x, point.y);
    word.split('')
      .forEach((letter, i) => {
        const { x, y } = s.add(v.mulScalar(i));
        this.cells[y][x].text = letter;
        this.cells[y][x].suggestion = '';
      });
  }
  /**
   * Set one of the arrows of a definition cell
   * @param cell cell to set the arrow 
   * @param index The index of the arrow to set
   * @param direction arrow direction
   */
  static setArrow(cell: Cell, index: number, direction: ArrowDir): void {
    if (!cell.arrows) {
      cell.arrows = ['none', 'none', 'none'];
    }
    if (!isSplited(cell)) {
      cell.arrows[1] = 'none';
    }
    cell.arrows[index] = direction;
  }

  /**
   * Set the arrow of a definition cell
   * @param coordinates coordinates of the cell
   * @param index The index of the arrow to set
   * @param direction arrow direction
   * @see Grid.setArrow
   */
  setArrow(v: Vec, index: number, direction: ArrowDir): void {
    if (!this.isValid(v)) return;
    Grid.setArrow(this.cells[v.y][v.x], index, direction);
  }
  /**
   * Set horizontal space of a cell
   * @param coordinates coordinates of the cell
   * @param value true to set the space, false to remove it
   */
  setSpaceH({ x, y }: Vec, value: boolean): void {
    this.cells[y][x].spaceH = value;
  }
  /**
   * Set vertical space of a cell
   * @param coordinates coordinates of the cell
   * @param value true to set the space, false to remove it
   */
  setSpaceV({ x, y }: Vec, value: boolean): void {
    this.cells[y][x].spaceV = value;
  }

  /**
   * Increment a position by a direction, and return the cell at the new position
   * @param v starting position
   * @param direction direction to increment
   * @returns the cell at the new position, or nullCell if the new position is out of bounds
   */
  increment(v: Vec, direction: Direction): Cell {
    const { x, y } = new Vector(v.x, v.y).add(Grid.getDirVec(direction));
    if (this.isValid({ x, y })) return this.cells[y][x];
    return nullCell;
  }

  /**
   * Decrement a position by a direction, and return the cell at the new position
   * @param v starting position
   * @param direction direction to decrement
   * @returns the cell at the new position, or nullCell if the new position is out of bounds
   */
  decrement(v: Vec, direction: Direction): Cell {
    const { x, y } = new Vector(v.x, v.y).sub(Grid.getDirVec(direction));
    if (this.isValid({ x, y })) return this.cells[y][x];
    return nullCell;
  }

  /**
   * Get the cell at the given coordinates
   * @param coordinates coordinates of the cell
   * @returns the cell at the given coordinates
   */
  getCell({ x, y }: Vec): Cell {
    return this.cells[y][x];
  }
  /**
   * Highlight the given cells (unhighlight all other cells)
   * @param cells cells to highlight
   */
  highlight(cells: Cell[]) {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.highlighted = false;
      });
    });
    cells.forEach((c) => {
      c.highlighted = true;
    });
  }
  /**
   * Set the suggestion of the given cells
   * @param words Words to suggest
   * @param start start position of each word
   * @param directions direction of each word
   */
  suggest(words: string[], start: Vec[], directions: Direction[]) {
    this.cells.forEach((row) => {
      row.forEach((cell) => {
        cell.suggestion = '';
      });
    });
    words.forEach((word, i) => {
      const s = new Vector(start[i].x, start[i].y);
      const v = Grid.getDirVec(directions[i]);
      word.split('').forEach((letter, j) => {
        const { x, y } = s.add(v.mulScalar(j));
        this.cells[y][x].suggestion = letter;
      });
    });
  }
  /**
   * Checks if two cells have the same coordinates
   * @param a First cell
   * @param b Second cell
   * @returns Weather the two cells have the same coordinates
   */
  static equal(a: Vec, b: Vec): boolean {
    return a.x === b.x && a.y === b.y;
  }

  /**
   * Converts a direction to a vector
   * @param direction Direction to convert
   * @returns Vector corresponding to the direction
   */
  static getDirVec(direction: Direction): Vector {
    return direction === 'horizontal'
      ? new Vector(1, 0)
      : new Vector(0, 1);
  }
  /**
   * Converts a direction to its perpendicular vector
   * @param direction Direction to convert
   * @returns Vector perpendicular to the direction
   */
  static perpendicular(direction: Direction): Direction {
    return direction === 'vertical' ? 'horizontal' : 'vertical';
  }
  /**
   * Given a cell and a direction, returns the bounds of the word
   * @param coordinates coordinates of the cell
   * @param direction The direction of the word
   * @returns All the cells of the word, and the start and end positions
   */
  getBounds({ x, y }: Vec, direction: Direction): Bounds {
    if (!this.isValid({ x, y }) || this.isDefinition({ x, y })) return {
      start: { x, y },
      end: { x, y },
      cells: [],
      length: 0
    };
    const v = Grid.getDirVec(direction);
    const vm = v.mulScalar(-1);
    const start = new Vector(x, y);
    const end = new Vector(x, y);
    let length = 0;
    while (this.isValid(start) && !this.isDefinition(start)) {
      length++;
      start.addSelf(vm);
    }
    start.addSelf(v);

    length--;
    while (this.isValid(end) && !this.isDefinition(end)) {
      end.addSelf(v);
      length++;
    }
    end.addSelf(vm);
    const cells = new Array(length)
      .fill(0)
      .map((_, i) => this.cells[start.y + v.y * i][start.x + v.x * i]);

    return {
      start, end, length,
      cells
    };
  }
  /**
   * Converts the grid to a sreialized string
   * @returns GridState JSON string
   */
  serialize() {
    const gridState: GridState = {
      id: this.id,
      rows: this.rows,
      cols: this.cols,
      cells: this.cells,
      comment: this.comment,
      created: this.created,
      title: this.title,
      optionsId: this.optionsId
    };
    return JSON.stringify(gridState);
  }
  /**
   * Creates a grid from a serialized string
   * @param s GridState JSON string
   * @returns A new grid
   */
  static unserialize(s: string) {
    const { rows, cols, comment, title, id, cells, created, optionsId } = JSON.parse(s) as GridState
    const res = new Grid(rows, cols, id);
    cells.forEach((row, i) => {
      row.forEach((cell, j) => {
        cell.highlighted = false;
        cell.suggestion = '';
        res.cells[i][j] = cell;
      });
    });
    res.title = title;
    res.comment = comment;
    res.created = created;
    res.optionsId = optionsId;
    return res;
  }
  /**
   * Creates a new cell
   * @param x x coordinate
   * @param y y coordinate
   * @returns new cell
   */
  static newCell(x: number, y: number): Cell {
    return {
      x,
      y,
      definition: false,
      highlighted: false,
      spaceV: false,
      spaceH: false,
      arrows: [],
      suggestion: '',
      text: "",
    };
  }

  getWords(direction: Direction) {
    const words: Bounds[] = [];
    const visited = new Set<string>();
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const id = `${i}-${j}`;
        if (visited.has(id)) continue;
        const bounds = this.getBounds({ x: j, y: i }, direction);
        if (bounds.length < 1) continue;
        for (let k = 0; k < bounds.length; k++) {
          visited.add(`${bounds.start.y + k}-${bounds.start.x + k}`);
        }
        words.push(bounds);
      }
    }
    return words;
  }

  check(words: Map<string, number>): GridValidity {
    const arrows: { x: number; y: number; arrow: ArrowDir }[][] = [
      [
        { x: -1, y: 0, arrow: 'right' },
        { x: 0, y: -1, arrow: 'downright' },
      ],
      [
        { x: 0, y: -1, arrow: 'down' },
        { x: -1, y: 0, arrow: 'rightdown' },
      ]
    ];


    const [horizontal, vertical] = [this.getWords('horizontal'), this.getWords('vertical')]
      .map((boundsVH, i) => boundsVH
        .reduce((acc, bounds) => {
          if (bounds.length < 2) return acc;
          const text = bounds.cells.map((c) => c.text).join('');
          if (text.length !== bounds.length) {
            acc[`${bounds.start.y}-${bounds.start.x}`] = {
              ...bounds,
              problem: 'incomplete'
            };
          } else if (!words.has(text)) {
            acc[`${bounds.start.y}-${bounds.start.x}`] = {
              ...bounds,
              problem: 'unknown'
            };
          } else if (!arrows[i].some(({ x, y, arrow }) => {
            const pos = { x: bounds.start.x + x, y: bounds.start.y + y };
            if (!this.isValid(pos)) return false;
            const cell = this.cells[pos.y][pos.x];
            return cell && this.isDefinition(cell) && cell.arrows.includes(arrow);
          })) {
            acc[`${bounds.start.y}-${bounds.start.x}`] = {
              ...bounds,
              problem: 'noarrow'
            };
          } else if (arrows[i].some(({ x, y, arrow }) => {
            const pos = { x: bounds.start.x + x, y: bounds.start.y + y };
            if (!this.isValid(pos)) return false;
            const cell = this.cells[pos.y][pos.x];
            if (!this.isDefinition(cell)) return false;
            const arrowIndex = cell.arrows.findIndex(a => a === arrow);
            if (arrowIndex < 0) return false;
            const lines = cell.text.split('\n\n');
            const lineIndex = arrowIndex === 2 ? 1 : 0;
            return !lines[lineIndex] || !lines[lineIndex].length;
          })) {
            acc[`${bounds.start.y}-${bounds.start.x}`] = {
              ...bounds,
              problem: 'nodef'
            };
          }

          return acc;
        }, {} as Record<string, ProblemBound>));
    // const definitions = this.cells
    //   .flat()
    //   .filter(c => c.definition)
    //   .reduce((acc, c) => {
    //     const splited = isSplited(c);
    //     const arrows = c.arrows;
    //   }, {} as Record<string, ProblemBound>)
    return { horizontal, vertical };
  }
}