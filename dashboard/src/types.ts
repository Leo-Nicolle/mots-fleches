export type ArrowDir = "right" | "down" | "rightdown" | "downright" | "none";

export type Cell = {
  x: number;
  y: number;
  definition: boolean;
  highlighted?: boolean;
  suggestion?: string;
  arrows?: ArrowDir[];
  text?: string;
  spaceV?: boolean;
  spaceH?: boolean;
};

export type GridState = {
  rows: number;
  cols: number;
  id: string;
  created: number;
  comment?: string;
  styleId?: string;
  title?: string;
  cells: Cell[][];
};

export type GridProgress = {
  id: string;
  title: string;
  comment: string;
  rows: number;
  cols: number;
  created: number;
  styleId: string;
  updatedAt: number | null;
  lettersPlaced: number;
  lettersTotal: number;
  definitionsFilled: number;
  definitionsTotal: number;
  arrowsPlaced: number;
  arrowsTotal: number;
  wordsPlaced: number;
  completion: number;
};

export type Summary = {
  totalUsers: number;
  totalGrids: number;
  totalStyles: number;
  gridsPerUser: { userId: number; count: number }[];
  stylesPerUser: { userId: number; count: number }[];
  signupsOverTime: Record<string, number>;
};

export type AdminUser = {
  id: number;
  email: string;
  pseudo: string | null;
  createdAt: number | null;
  lastConnection: number | null;
  status: string | null;
  tierId: number | null;
  diskUsage: string;
  gridCount: number;
  styleCount: number;
  bookCount: number;
  fontCount: number;
};

export type GridDetail = {
  content: GridState;
  progress: GridProgress;
};
