import { ArrowDir } from "grid";


export type ExportOptions = {
  arrows: boolean;
  definitions: boolean;
  outerBorders: boolean;
  borders: boolean;
  texts: boolean;
  highlight:boolean;
  splits: boolean;
}

export const defaultExportOptions: ExportOptions = {
  outerBorders: true,
  borders: true,
  definitions: true,
  texts: true,
  arrows: true,
  highlight: false,
  splits: true,
};

export type Rect = {
  x: number;
  y: number;
  width: number; 
  height: number;
}
export type Handle ={
  top:string;
  left:string;
  index: number;
  dirs: ArrowDir[];
}