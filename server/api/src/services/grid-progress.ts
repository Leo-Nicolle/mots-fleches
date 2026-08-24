type ArrowDir = 'right' | 'down' | 'rightdown' | 'downright' | 'none';

type Cell = {
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

type GridState = {
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

function parseContent(content: string): GridState | null {
  try {
    return JSON.parse(content) as GridState;
  } catch {
    return null;
  }
}

function isFilled(cell: Cell): boolean {
  return !!cell.text && cell.text.trim().length > 0;
}

export function computeGridProgress(
  content: string,
  updatedAt: Date | null = null
): GridProgress | null {
  const state = parseContent(content);
  if (!state || !Array.isArray(state.cells)) return null;

  const cells = state.cells.flat();
  let lettersPlaced = 0;
  let lettersTotal = 0;
  let definitionsFilled = 0;
  let definitionsTotal = 0;
  let arrowsPlaced = 0;
  let arrowsTotal = 0;

  for (const cell of cells) {
    if (cell.definition) {
      definitionsTotal++;
      if (isFilled(cell)) definitionsFilled++;
      const arrows = cell.arrows || [];
      arrowsTotal += arrows.length;
      arrowsPlaced += arrows.filter((a) => a !== 'none').length;
    } else {
      lettersTotal++;
      if (isFilled(cell)) lettersPlaced++;
    }
  }

  const wordsPlaced = countWords(state);

  const totalProgress =
    lettersTotal + definitionsTotal + arrowsTotal;
  const doneProgress =
    lettersPlaced + definitionsFilled + arrowsPlaced;
  const completion = totalProgress > 0 ? doneProgress / totalProgress : 0;

  return {
    id: state.id,
    title: state.title ?? '',
    comment: state.comment ?? '',
    rows: state.rows,
    cols: state.cols,
    created: state.created,
    styleId: state.styleId ?? 'default',
    updatedAt: updatedAt ? updatedAt.getTime() : null,
    lettersPlaced,
    lettersTotal,
    definitionsFilled,
    definitionsTotal,
    arrowsPlaced,
    arrowsTotal,
    wordsPlaced,
    completion,
  };
}

function countWords(state: GridState): number {
  let count = 0;
  const cellMap: Record<string, Cell> = {};
  for (const row of state.cells) {
    for (const cell of row) {
      cellMap[`${cell.x}-${cell.y}`] = cell;
    }
  }
  const getCell = (x: number, y: number): Cell | undefined => cellMap[`${x}-${y}`];
  const dirs = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
  ];
  const visited = new Set<string>();
  for (const dir of dirs) {
    for (const cell of state.cells.flat()) {
      if (cell.definition) continue;
      const key = `${cell.x}-${cell.y}-${dir.dx}-${dir.dy}`;
      if (visited.has(key)) continue;

      // walk back to find the start of the word
      let sx = cell.x;
      let sy = cell.y;
      let start = getCell(sx, sy);
      while (start && !start.definition) {
        sx -= dir.dx;
        sy -= dir.dy;
        start = getCell(sx, sy);
      }
      sx += dir.dx;
      sy += dir.dy;

      // walk forward collecting letters
      let word = '';
      let complete = true;
      let cur = getCell(sx, sy);
      while (cur && !cur.definition) {
        visited.add(`${cur.x}-${cur.y}-${dir.dx}-${dir.dy}`);
        word += cur.text || '';
        if (!cur.text) complete = false;
        cur = getCell(cur.x + dir.dx, cur.y + dir.dy);
      }
      if (word.length > 1 && complete) {
        count++;
      }
    }
  }
  return count;
}
