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
    width: 210,
    height: 297,
    orientation: 'portrait',
    dpi: 300,
    margin: {
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    }
  }
};

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
export const DPI_TO_PIXEL = 25.4;
