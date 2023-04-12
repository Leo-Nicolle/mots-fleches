import { TextSyle } from "grid";
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
  };
  words: TextSyle & {
    tolerance: number;
  };
  size: TextSyle;
};

export const defaultSolutionOptions: SolutionOptions = {
  grids: {
    rows: 2,
    cols: 2
  },
  words: {
    font: "sans-serif",
    size: "1em",
    color: "black",
    tolerance: 2
  },
  size:{
    font: "sans-serif",
    size: "1.5em",
    color: "black",
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