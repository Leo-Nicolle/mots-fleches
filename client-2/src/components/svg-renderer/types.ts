

export type ExportOptions = {
  arrows: boolean;
  definitions: boolean;
  outerBorders: boolean;
  borders: boolean;
  texts: boolean;
}

export const defaultExportOptions: ExportOptions = {
  outerBorders: true,
  borders: true,
  definitions: true,
  texts: true,
  arrows: true,
};