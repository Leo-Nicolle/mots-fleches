import { Bounds, CellBest, CellProba, Direction, Grid } from "grid";
import { getCellProbas } from "./heatmap";
import { cantor } from "./utils";

function hash(x: number, y: number, dir: Direction) {
  const z = dir === 'horizontal' ? 1 : 2;
  return cantor(cantor(x, y), z);
}
function hash2(x: number, y: number, index: number, dir: Direction) {
  const z = dir === 'horizontal' ? 1 : 2;
  return cantor(cantor(cantor(x, y), z), index);
}

type DBounds = Bounds & {
  direction: Direction;
};
type SpotsByLength = Map<number, DBounds[]>;
export function autoFill(grid: Grid, words: string[]) {
  let { cellProbas } = getCellProbas(grid);
  // find the words that match the best: 

  const spots: DBounds[] = [
    ...grid.getWords('horizontal').map(b => ({ ...b, direction: 'horizontal' as Direction })),
    ...grid.getWords('vertical').map(b => ({ ...b, direction: 'vertical' as Direction })),
  ];
  const wordsByLength = words.reduce((acc, word) => {
    const len = word.length;
    if (!acc.has(len)) {
      acc.set(len, []);
    }
    acc.get(len)!.push(word);
    return acc;
  }, new Map<number, string[]>());
  const spotsByLength = spots.reduce((acc, spot) => {
    const len = spot.length;
    if (!acc.has(len)) {
      acc.set(len, []);
    }
    acc.get(len)!.push(spot);
    return acc;
  }, new Map() as SpotsByLength);
  const spotsById = spots.reduce((acc, spot) => {
    spot.cells.forEach(({ x, y }) => {
      acc.set(hash(x, y, spot.direction), spot);
    });
    return acc;
  }, new Map<number, DBounds>());


  // words.forEach(word => {
  //   placeWord(cellProbas, word, spotsByLength, grid);
  //   const cbs = getCellProbas(grid);
  //   cellProbas = cbs.cellProbas;
  // });
  let placed = true;
  while (placed) {
    placed = placeBestWord(cellProbas, words, spotsByLength, grid);
    const cbs = getCellProbas(grid);
    cellProbas = cbs.cellProbas;

  }

}

// place the best word at the best spot
function placeBestWord(
  cellProbas: CellBest[][],
  words: string[],
  spotsByLength: SpotsByLength,
  grid: Grid) {
  const { score, spot, word, index } = words.map((word, index) => {
    const spots = spotsByLength.get(word.length);
    if (!spots) return { word, score: -1 };
    const { spot, score } = getBestSpot(cellProbas, word, spots);
    return { word, score, spot, index };
  }).reduce((acc, { word, score, spot, index }) => {
    if (score > acc.score) {
      return { word, score, spot, index };
    }
    return acc;
  }, { score: 0, });
  if (!spot || index === undefined || !score) return false;
  spotsByLength.set(word.length, spotsByLength.get(word.length)!.filter(s => s !== spot));
  grid.setWord(word, spot.start, spot.direction);
  words.splice(index, 1);
  return true;
}
// Get the best spot for a word
function getBestSpot(cellProbas: CellBest[][], word: string, spots: DBounds[]) {
  return spots.map(spot => {
    let impossible = 1;
    const score = spot.cells.reduce((acc, { x, y }, i) => {
      const { inter, total } = cellProbas[y][x];
      impossible *= inter[word.charAt(i)] > 0 ? 1 : 0;
      return impossible * (acc + inter[word.charAt(i)] / total);
    }, 0);
    return { score, spot };
  }).reduce((acc, { score, spot }) => {
    if (score > acc.score) {
      return { score, spot };
    }
    return acc;
  }, { score: -Infinity, spot: spots[0] });
}