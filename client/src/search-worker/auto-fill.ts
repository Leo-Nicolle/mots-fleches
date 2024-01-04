import { Bounds, CellBest, CellProba, Direction, Grid } from "grid";
import { getCellProbas } from "./heatmap";
import { cantor } from "./utils";
import { dico } from "./dico";

function hash(x: number, y: number, dir: Direction) {
  const z = dir === 'horizontal' ? 1 : 2;
  return cantor(cantor(x, y), z);
}
function hash2(x: number, y: number, index: number, dir: Direction) {
  const z = dir === 'horizontal' ? 1 : 2;
  return cantor(cantor(cantor(x, y), z), index);
}

function getSpotsByLength(spots: DBounds[]) {
  return spots.reduce((acc, spot) => {
    const len = spot.length;
    if (!acc.has(len)) {
      acc.set(len, []);
    }
    acc.get(len)!.push(spot);
    return acc;
  }, new Map() as SpotsByLength);
}

// function getSpotsByLength2(spots: DBounds[]) {
//   return spots.reduce((acc, spot, index) => {
//     const len = spot.length;
//     if (!acc.has(len)) {
//       acc.set(len, new Set());
//     }
//     acc.get(len)!.add(index);
//     return acc;
//   }, new Map() as SpotsByLength);
// }

function getScore(cellProbas: CellBest[][]) {
  let hasImpossible = false;
  const score = cellProbas.reduce((acc, row) => acc + row.reduce((acc, { inter }) => {
    const total = Object.values(inter).reduce((acc, v) => acc + v, 0);
    hasImpossible ||= total === 0;
    return acc + total;
  }, 0), 0);
  return hasImpossible ? 0 : score;
}
// function toString(grid: Grid) {
//   return grid.cells.reduce((acc, row) => acc + row
//     .reduce((acc, cell) => acc + cell.definition
//       ? 'd'
//       : cell.text.length
//         ? ' '
//         : cell.text, '')
//     + '\n', '');
// }
type State = {
  score: number;
  words: string[];
  grid: string;
  spots: DBounds[];
};

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
  ].filter((w) => {
    let isFull = w.cells.every(({ x, y }) => grid.cells[y][x].text.length > 0);
    const word = w.cells.map(({ x, y }) => grid.cells[y][x].text).join('');
    if (!isFull) return true;
    const idx = words.indexOf(word);
    if (idx > -1) words.splice(idx, 1);
    return false;
  });
  const visited = new Map<string, State>();
  const maxIter = 2000; //Math.min(words.length, 30);
  const baseScore = Math.max(1, getScore(cellProbas));
  const baseWords = words.length;
  let iter = 0;
  const queue: State[] = [{ score: 0, words, grid: grid.serialize(), spots }];
  visited.set(queue[0].grid, queue[0]);
  while (queue.length && iter < maxIter) {
    const { words, grid: sgrid, spots } = queue.shift()!;
    const grid = Grid.unserialize(sgrid);
    // const spotsByLength = getSpotsByLength(spots);
    const cbs = getCellProbas(grid);
    cellProbas = cbs.cellProbas;
    iter++;
    placeRandomWord2(cellProbas, words, spots, grid, baseScore, baseWords).forEach(state => {
      if (!visited.has(state.grid)) {
        visited.set(state.grid, state);
        queue.push(state);
      }
    });

    // while (words.length) {
    //   // const placed = placeBestWord(cellProbas, words, spotsByLength, grid);
    //   // dead end, we could not place any more word
    //   if (!states || !states.length) break;
    //   const cbs = getCellProbas(grid);
    //   cellProbas = cbs.cellProbas;       
    //   const score = getScore(cellProbas) / baseScore + 1 - words.length / baseWords;
    //   const state = { score, words: words.slice(), grid: grid.serialize(), spots: spots.slice() };

    // }
  }

  // get the grid from the state with max score from visited
  const { grid: bestGrid } = Array.from(visited.values()).reduce((acc, { score, grid }) => {
    if (score > acc.score) {
      return { score, grid };
    }
    return acc;
  }, { score: -Infinity, grid: '' });

  
  return fillupGrid(Grid.unserialize(bestGrid)).serialize();
  // const maxScore = Array.from(visited.values()).reduce((acc, { score }) => Math.max(acc, score), 0);
  // let placed = true;
  // while (placed) {
  //   placed = placeBestWord(cellProbas, words, spotsByLength, grid);
  //   const cbs = getCellProbas(grid);
  //   cellProbas = cbs.cellProbas;

  // }

}


function placeRandomWord2(
  cellProbas: CellBest[][],
  words: string[],
  spots: DBounds[],
  grid: Grid,
  baseScore: number,
  baseWords: number
): false | State[] {
  const spotsByLength = getSpotsByLength(spots);
  const bestSpots = words.map((word, index) => {
    const spots = spotsByLength.get(word.length);
    if (!spots) return { word, score: -1 };
    const { spot, score } = getBestSpot(cellProbas, word, spots);
    return { word, score, spot, index };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  if (!bestSpots.length) return [];
  // const { score, spot, word, index } = bestSpots[Math.floor(Math.random() * bestSpots.length / 4) | 0];

  return bestSpots
    .slice(0, Math.max(4, bestSpots.length / 4))
    .map(({ spot, word, index }) => {
      const grid2 = Grid.unserialize(grid.serialize());
      grid2.setWord(word, spot!.start, spot!.direction);

      const stwords = words.slice();
      stwords.splice(index!, 1);
      const { cellProbas } = getCellProbas(grid2);
      if (cellProbas.flat().filter(c => c.validH ||c.validV).some(c => c.total === 0)) return null;
      const score = getScore(cellProbas) / baseScore + 1 - words.length / baseWords;
      return { score, words: stwords, grid: grid2.serialize(), spots: spots.filter(s => s !== spot) };
    })
    .filter(e=> e) as State[];
  // spotsByLength.set(word.length, spotsByLength.get(word.length)!.filter(s => s !== spot));
  // grid.setWord(word, spot!.start, spot!.direction);
  // words.splice(index!, 1);
  // return true;
}


function placeRandomWord(
  cellProbas: CellBest[][],
  words: string[],
  spotsByLength: SpotsByLength,
  grid: Grid) {
  const bestSpots = words.map((word, index) => {
    const spots = spotsByLength.get(word.length);
    if (!spots) return { word, score: -1 };
    const { spot, score } = getBestSpot(cellProbas, word, spots);
    return { word, score, spot, index };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);
  if (!bestSpots.length) return false;
  const { score, spot, word, index } = bestSpots[Math.floor(Math.random() * bestSpots.length / 4) | 0];
  spotsByLength.set(word.length, spotsByLength.get(word.length)!.filter(s => s !== spot));
  grid.setWord(word, spot!.start, spot!.direction);
  words.splice(index!, 1);
  return true;
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

function fillupGrid(grid: Grid){
  // const { cellProbas } = getCellProbas(grid);

  const words = grid.getWords('horizontal')
  .map(c => ({...c, horizontal: true, vertical: false}))
  .concat(grid.getWords('vertical')
  .map(c => ({...c, horizontal: false, vertical: true})));
  let i =0;
  let maxCount = 1000;
  const queue = [{grid, score: 0}];
  const visited = new Map<string, unknown>();
  visited.set(queue[0].grid.serialize(), queue[0]);
  while (i < maxCount && queue.length ){
    i++;
    const {grid} = queue.shift()!;
    const { cellProbas } = getCellProbas(grid);
    const incomplete = words
    .filter(w => w.length> 1 && !w.cells.every(c => c.text && c.text.length))
    .map((w) => {
      const cp =cellProbas[w.start.y][w.start.x]; 
      const ws = (w.horizontal ? cp.bestWordsH : cp.bestWordsV);
      // if (!ws) return min;
      const ns = ws.length;
      return {...w, ns, ws};
      // return ns < min.ns
      //  ? {...w, ns, ws}
      //  : min;
    })
    .sort((a, b) => a.ns - b.ns)
    .filter(w => w.ns > 0)
    .slice(0,3);

    incomplete
    .map(({ws, start, vertical}) => {
      const cp =Grid.unserialize(grid.serialize());
      cp.setWord(ws[Math.floor(Math.random() * ws.length)], start, vertical? 'vertical': 'horizontal');
      const { cellProbas } = getCellProbas(cp);
      if (cellProbas.flat().filter(c => c.validH ||c.validV).some(c => c.total === 0)) return null;
      const score = getScore(cellProbas);
      return{
        grid: cp,
        score
      };
    })
    .filter(e => e)
    .forEach(state => {
      queue.push(state);
    });
  }
  const { grid: bestGrid } = Array.from(visited.values()).reduce((acc, { score, grid }) => {
    if (score > acc.score) {
      return { score, grid };
    }
    return acc;
  }, { score: -Infinity, grid: '' });
  return bestGrid;
}