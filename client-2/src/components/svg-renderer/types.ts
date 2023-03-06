

export type ExportOptions = {
  arrows: boolean;
  definitions: boolean;
  outerBorders: boolean;
  borders: boolean;
  texts: boolean;
  highlight:boolean;

}

export const defaultExportOptions: ExportOptions = {
  outerBorders: true,
  borders: true,
  definitions: true,
  texts: true,
  arrows: true,
  highlight: false,
};

export type Rect = {
  x: number;
  y: number;
  width: number; 
  height: number;
}