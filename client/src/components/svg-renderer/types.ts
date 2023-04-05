import { ArrowDir } from "grid";


export type ExportOptions = {
  arrows: boolean;
  definitions: boolean;
  outerBorders: boolean;
  borders: boolean;
  texts: boolean;
  highlight: boolean;
  splits: boolean;
  margins: boolean;
}

export const defaultExportOptions: ExportOptions = {
  outerBorders: true,
  borders: true,
  definitions: true,
  texts: true,
  arrows: true,
  highlight: false,
  splits: true,
  margins: true
};

export type SolutionOptions = {
  grids: {
    rows: number;
    cols: number;
    margin: number;
  }
  words: {
    font: string;
    size: string;
    color: string;
    cols: number;
  }
};

export const defaultSolutionOptions: SolutionOptions = {
  grids: {
    rows: 4,
    cols: 4
  },
  words: {
    font: "sans-serif",
    size: "12px",
    color: "black",
    cols: 2
  }
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
}
export type Handle = {
  top: string;
  left: string;
  index: number;
  dirs: ArrowDir[];
}