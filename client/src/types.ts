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
  spaces: boolean;
  fills: boolean;
  pagination: boolean;
};

export const defaultExportOptions: ExportOptions = {
  outerBorders: true,
  borders: true,
  definitions: true,
  texts: true,
  arrows: true,
  highlight: false,
  splits: true,
  margins: true,
  spaces: true,
  fills: true,
  pagination: true,
};

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};
export type Handle = {
  top: string;
  left: string;
  index: number;
  dirs: ArrowDir[];
};
export type Ordering = 'best' | 'alpha' | 'inverse-alpha' | 'random';
export type Method = 'simple' | 'accurate';
export type Mode = "normal" | "check" | "heatmap" | "autofill";


export type Breadcrumbs = { text: string, to?: string; }[];