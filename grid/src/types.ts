import merge from 'merge';
export type Vec = { x: number, y: number };
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
  arrows: ArrowDir[];
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
  id: string;
  name: string;
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


export const defaultOptions: GridOptions = {
  id: 'default',
  name: 'Default',
  grid: {
    cellSize: '54px',
    borderSize: '1px',
    borderColor: '#000000',
    outerBorderSize: '2px',
    outerBorderColor: '#000000',
  },
  definition: {
    font: "sans-serif",
    size: "12px",
    color: "black",
    backgroundColor: "#ccc",
  },
  arrow: {
    size: '10px',
    color: '#000000',
  },
  paper: {
    width: 21,
    height: 29.7,
    orientation: 'portrait',
    dpi: 300,
    margin: {
      top: 1,
      bottom: 1,
      left: 1,
      right: 1,
    }
  }
};

export const defaultExportOptions: GridOptions = merge.recursive(
  JSON.parse(JSON.stringify(defaultOptions)), 
  {
    id: 'defaultExport',
    name: 'DefaultExport',
    grid: {
      cellSize: '20px'
    }
  }
);

export type GridState = {
  rows: number;
  cols: number;
  id: string;
  created: number;
  comment: string;
  optionsId: string;
  title: string;
  cells: Cell[][];
};

export type WordAndPosition = {
  word: string;
  start: Vec;
  direction: Direction;
}
export const DPI_TO_PIXEL = 25.4;
