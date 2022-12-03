import { Bounds, Cell, Direction, Vec } from "./types";
import Vector from "vector2js";
export declare const nullCell: Cell;
export default class Grid {
    rows: number;
    cols: number;
    cells: Cell[][];
    id: string;
    constructor(rows: number, cols: number, id?: string);
    isValid({ x, y }: Vec): boolean;
    isDefinition({ x, y }: Vec): boolean;
    setDefinition({ x, y }: Vec, value: boolean): void;
    setText({ x, y }: Vec, value: string): void;
    increment(v: Vec, direction: Direction): Cell;
    getCell({ x, y }: Vec): Cell;
    static equal(a: Cell, b: Cell): boolean;
    static getDirVec(direction: Direction): Vector;
    getBounds({ x, y }: Vec, direction: Direction): Bounds;
    serialize(): string;
    static unserialize(s: string): Grid;
}
