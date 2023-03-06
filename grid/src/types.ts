export type Vec = {x: number, y: number};
export type Lookup<T> = { [key: number | string]: T };
export type DefGrid = boolean[][];

export type ArrowDir = 'right' | 'down' | 'rightdown' | 'downright' | 'none';
export type Arrow = {
  position: Vec;
  direction: ArrowDir;
}

export type Cell = {
  x: number;
  y: number;
  definition: boolean;
  highlighted: boolean;
  suggestion: string;
  arrows: Arrow[];
  splited: number;
  text: string;
}

export type Format = {
  width: number;
  height: number;
  orientation: string;
  dpi: number;
  margin: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  }
}

export type GridOptions = {
  grid: {
    cellSize: string;
    borderSize: string;
    borderColor: string;
    outerBorderSize: string;
    outerBorderColor: string;
  };
  definition: {
    font: string;
    size: string;
    color: string;
    backgroundColor: string;
  };
  arrow: {
    size: string;
    color: string;
  };
  paper: Format;
};

export type Bounds = {
  start: Vec;
  end: Vec;
  cells: Cell[];
  length: number;
}
export type Direction = 'horizontal' | 'vertical';

export const DPI_TO_PIXEL = 25.4;
