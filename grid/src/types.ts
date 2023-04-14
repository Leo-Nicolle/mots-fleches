import merge from 'merge';
export type Vec = { x: number, y: number };
export type Lookup<T> = { [key: number | string]: T };
export type DefGrid = boolean[][];
export type DeepPartial<T> = T extends object ? {
  [P in keyof T]?: DeepPartial<T[P]>;
} : T;
export type ArrowDir = 'right' | 'down' | 'rightdown' | 'downright' | 'none';
export type Arrow = {
  position: Vec;
  direction: ArrowDir;
}

export interface TextSyle<T = string> {
  font: string;
  size: T;
  color: string;
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
    cellSize: number;
    borderSize: number;
    borderColor: string;
    outerBorderSize: number;
    outerBorderColor: string;
  };
  definition: TextSyle<number> & {
    backgroundColor: string;
  };
  arrow: {
    size: number;
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
    cellSize: 54,
    borderSize: 1,
    borderColor: '#000000',
    outerBorderSize: 2,
    outerBorderColor: '#000000',
  },
  definition: {
    font: "sans-serif",
    size: 12,
    color: "black",
    backgroundColor: "#ccc",
  },
  arrow: {
    size: 10,
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

export type SolutionOptions = GridOptions & {
  isSolution: true;
  grids: {
    rows: number;
    cols: number;
    gridN: TextSyle;
  };
  words: TextSyle & {
    tolerance: number;
  };
  size: TextSyle;
};

const expOptions: DeepPartial<SolutionOptions> = {
  id: 'solution',
  name: 'solution',
  grid: {
    cellSize: 20
  },
  grids: {
    rows: 2,
    cols: 2,
    gridN: {
      font: "sans-serif",
      size: "1em",
      color: "black",
    },
  },
  words: {
    font: "sans-serif",
    size: "1em",
    color: "black",
    tolerance: 2
  },
  size: {
    font: "sans-serif",
    size: "1.5em",
    color: "black",
  },
  isSolution: true
}
export const defaultSolutionOptions: SolutionOptions = merge.recursive(
  JSON.parse(JSON.stringify(defaultOptions)),
  expOptions,
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
