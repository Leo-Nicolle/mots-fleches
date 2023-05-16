import { Direction, Grid, CellProba, Vec, CellBest } from "grid";
import { dico, ACode } from "./dico";
global.dico = dico;
function initCellMap(grid: Grid) {
  return grid.cells.reduce((acc, row, y) => {
    acc.push(
      row.map(({ definition, text }, x) => {
        return {
          inter: {},
          empty: !definition && !text.length,
          horizontal: 0,
          horizontalL: {},
          verticalL: {},
          validH: false,
          validV: false,
          totalInter: 0,
          x,
          y,
          vertical: 0,
        };
      })
    );
    return acc;
  }, [] as CellProba[][]);
}
function initCellBest(grid: Grid, cellProba: CellProba[][]) {
  return grid.cells.reduce((acc, row, y) => {
    acc.push(
      row.map((_, x) => {
        const { validH, validV, empty } = cellProba[y][x];
        return {
          validH,
          validV,
          empty,
          bestWordsV: [] as number[],
          bestWordsH: [] as number[],
          inter: {},
          x,
          y,
        };
      })
    );
    return acc;
  }, [] as CellBest[][]);
}
//TODO make more tests abou this one
function subtractIntervals(a: [number, number][], b: [number, number][]) {
  a.sort((a1, b1) => a1[0] - b1[0]);
  b.sort((a1, b1) => a1[0] - b1[0]);
  let aIndex = 0;
  while (b.length) {
    const [b1, b2] = b.pop()!;
    for (let i = aIndex; i < a.length; i++) {
      const [a1, a2] = a[i];
      if (a2 < b1) continue;
      if (a1 > b2) break;
      const lBefore = a.length;
      a.splice(
        i,
        1,
        ...([
          [a1, b1 - 1],
          [b2 + 1, a2],
        ].filter(([a1, a2]) => a1 <= a2) as [number, number][])
      );
      if (lBefore > a.length) {
        i--;
      }
    }
  }
  return a;
}

function intersection(cellMap: CellProba[][], cellBest?: CellBest[][]) {
  cellMap.forEach((row, y) => {
    row.forEach((cell, x) => {
      const { empty, horizontalL, verticalL, validH, validV } = cell;
      if (!empty) return;
      if (validV && validH) {
        row[x].inter = Object.keys(horizontalL).reduce((acc, letter) => {
          if (verticalL[letter]) {
            acc[letter] = Math.min(horizontalL[letter], verticalL[letter]);
          }
          return acc;
        }, {} as Record<string, number>);
      } else if (!validV) {
        row[x].inter = horizontalL;
      } else if (!validH) {
        row[x].inter = verticalL;
      }
      if (cellBest) {
        cellBest[y][x].inter = row[x].inter;
      }
    });
  });
  cellMap.forEach((row) => {
    row.forEach(({ inter }, x) => {
      row[x].totalInter = Object.values(inter).reduce((acc, v) => acc + v, 0);
    });
  });
}

/**
 * Returns an Array of cellProba object
 * inter record just takes the min between row and col, but do not
 * consider entire words, so it is inexact
 * @param grid The grid to compute proba on
 * @returns an array of "local" proba for each cell
 */
export function getCellProbas(grid: Grid) {
  const cellMap = initCellMap(grid);
  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        const validKey = `valid${dir[0].toUpperCase()}`;
        const reccordKey = `${dir}L`;
        const intervals = dico.findInterval(
          bounds.cells.map((c) => (c.text.length ? c.text : "*")).join("")
        );
        const total = intervals.reduce(
          (acc, [start, end]) => acc + end - start + 1,
          0
        );

        let stack = intervals;
        let newStack: number[][] = [];
        bounds.cells.forEach(({ x, y }, i) => {
          const cell = cellMap[y][x];
          if (!cell.empty) {
            return;
          }
          cell[validKey] = true;
          cell[dir] = total;
          const occurences = cell[reccordKey];
          newStack = [];
          while (stack.length) {
            const [start, end] = stack.pop()!;
            // this could be slightly optimised by updating start
            // on each iteration
            // also we could try and sort the array to simplify the algo.
            // Would it be faster ? I think both are nlogn
            for (let j = 0; j < 26; j++) {
              const newStart = dico.stringBS.findStartIdx(
                ACode + j,
                i,
                start,
                end
              );
              const newEnd = dico.stringBS.findEndIdx(
                ACode + j,
                i,
                newStart,
                end
              );
              if (newStart > newEnd) continue;
              const letter = String.fromCharCode(ACode + j);
              occurences[letter] = (occurences[letter] || 0) + 1;
              newStack.push([newStart, newEnd]);
              if (newEnd === end) break;
            }
          }
          stack = newStack;
        });
      });
  });
  intersection(cellMap);
  return cellMap;
}

export function getBestWords(
  grid: Grid,
  cellMap: CellProba[][],
  coord: Vec,
  dir: Direction
) {
  const bounds = grid.getBounds(coord, dir);
  const intervals = dico.findInterval(
    bounds.cells.map((c) => (c.text.length ? c.text : "*")).join("")
  );
  let stack = intervals.slice();
  let newStack: number[][] = [];
  const scores: Record<number, number> = {};
  bounds.cells.forEach(({ x, y }, i) => {
    const { empty, inter } = cellMap[y][x];
    if (!empty) {
      return;
    }
    newStack = [];
    const total = Object.values(inter).reduce((total, n) => total + n, 0);
    while (stack.length) {
      const [start, end] = stack.pop()!;
      if (start === end) {
        const word = dico.words[dico.sorted[start]];
        if (!inter[word[i]]) {
          scores[start] = -1;
        } else {
          scores[start] = inter[word[i]] / total;
          newStack.push([start, end]);
        }
        continue;
      }
      for (let j = 0; j < 26; j++) {
        const newStart = dico.stringBS.findStartIdx(ACode + j, i, start, end);
        const newEnd = dico.stringBS.findEndIdx(ACode + j, i, newStart, end);
        if (newStart > newEnd) continue;
        const letter = String.fromCharCode(ACode + j);
        if (!inter[letter]) {
          for (let k = newStart; k <= newEnd; k++) {
            scores[k] = -1;
          }
          if (newEnd === end) {
            break;
          }
          continue;
        }
        for (let k = newStart; k <= newEnd; k++) {
          const oldScore = scores[k] || 0;
          scores[k] =
            oldScore < 0 ? oldScore : oldScore + inter[letter] / total;
        }
        newStack.push([newStart, newEnd]);
        if (newEnd === end) break;
      }
    }
    stack = newStack;
  });
  const indexes = stack
    .reduce((acc, [start, end]) => {
      acc.push(...new Array(end - start + 1).fill(start).map((e, i) => e + i));
      return acc;
    }, [])
    .filter((e) => scores[e] > 0);

  return { intervals: stack, scores, indexes };
  // .sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
  // .map((w) => dico.words[dico.sorted[w]]);
}

export function getCellBest(grid: Grid, cellMap: CellProba[][]) {
  const newCellMap = initCellMap(grid);
  const res = initCellBest(grid, cellMap);

  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    const reccordKey = `${dir}L`;
    const bestWordKey = `bestWords${dir === "horizontal" ? "H" : "V"}`;
    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        // const validKey = `valid${dir[0].toUpperCase()}`;
        if (bounds.length < 2) return;
        // we have to filter out the words with score < 0,
        // so we have to take all the valid words, sort them and then count on thoose words
        // We should do it only if the number of valid words is under a certain threshold
        const { intervals, scores } = getBestWords(
          grid,
          cellMap,
          bounds.cells[0],
          dir
        );
        const { x, y } = bounds.cells[0];
        res[y][x][bestWordKey] = intervals
          .reduce((acc, [start, end]) => {
            acc.push(
              ...new Array(end - start + 1).fill(start).map((e, i) => e + i)
              // .filter((e) => scores[e] > 0)
            );
            return acc;
          }, [])
          .sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
          .slice(0, 100);
        console.log({ x, y, bestWordKey, res: res[y][x][bestWordKey] });
        // let newStack: number[][] = [];

        bounds.cells.forEach(({ x, y }, i) => {
          const { empty } = newCellMap[y][x];
          const occurences = newCellMap[y][x][reccordKey];
          if (!empty) {
            return;
          }
          // newStack = [];
          const stack = intervals.slice();
          while (stack.length) {
            const [start, end] = stack.pop()!;
            if (start === end) {
              const letter = dico.words[dico.sorted[start]][i];
              occurences[letter] = (occurences[letter] || 0) + 1;
              continue;
            }
            for (let j = 0; j < 26; j++) {
              const newStart = dico.stringBS.findStartIdx(
                ACode + j,
                i,
                start,
                end
              );
              const newEnd = dico.stringBS.findEndIdx(
                ACode + j,
                i,
                newStart,
                end
              );
              if (newStart > newEnd) continue;
              const letter = String.fromCharCode(ACode + j);
              occurences[letter] = (occurences[letter] || 0) + 1;
              if (newEnd === end) break;
            }
          }
          // stack = newStack;
        });
      });
  });

  intersection(newCellMap, res);
  return res;
}

export function getCellProbas2(grid: Grid) {
  const cellMap = initCellMap(grid);
  const cellToWordIndexH = {};
  const cellToWordIndexV = {};

  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    const cellToWordIndex =
      dir === "horizontal" ? cellToWordIndexH : cellToWordIndexV;

    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        const validKey = `valid${dir[0].toUpperCase()}`;
        const intervals = dico.findInterval(
          bounds.cells.map((c) => (c.text.length ? c.text : "*")).join("")
        );
        let stack = intervals;
        let newStack: number[][] = [];
        bounds.cells.forEach(({ x, y }, i) => {
          const cell = cellMap[y][x];
          if (!cell.empty) {
            return;
          }
          cell[validKey] = true;
          newStack = [];
          while (stack.length) {
            const [start, end] = stack.pop()!;
            for (let j = 0; j < 26; j++) {
              const newStart = dico.stringBS.findStartIdx(
                ACode + j,
                i,
                start,
                end
              );
              const newEnd = dico.stringBS.findEndIdx(
                ACode + j,
                i,
                newStart,
                end
              );
              if (newStart > newEnd) continue;
              newStack.push([newStart, newEnd]);
              if (newEnd === end) break;
            }
          }
          stack = newStack;
        });
        bounds.cells.forEach(({ x, y }, i) => {
          cellToWordIndex[`${y}-${x}`] = i;
          cellMap[y][x][`${dir}I`] = stack;
        });
      });
  });
  const reverseCellMap = cellMap
    .map((row) => row.slice().reverse())
    .slice()
    .reverse();
  [cellMap, reverseCellMap].forEach((cellMap) =>
    cellMap.forEach((row) =>
      row.forEach((cell) => {
        const { validH, validV, horizontalI, verticalI, x, y } = cell;
        if (!validH || !validV || !horizontalI || !verticalI) return;
        const indexH = cellToWordIndexH[`${y}-${x}`];
        const indexV = cellToWordIndexV[`${y}-${x}`];

        for (let i = 0; i < 26; i++) {
          let stackH = horizontalI.slice();
          let stackV = verticalI.slice();
          const verticalIntervals: [number, number][] = [];
          const horizontalIntervals: [number, number][] = [];
          while (stackH.length) {
            const [start, end] = stackH.pop()!;
            const newStart = dico.stringBS.findStartIdx(
              ACode + i,
              indexH,
              start,
              end
            );
            const newEnd = dico.stringBS.findEndIdx(
              ACode + i,
              indexH,
              newStart,
              end
            );
            if (newStart > newEnd) continue;
            horizontalIntervals.push([newStart, newEnd]);
          }
          while (stackV.length) {
            const [start, end] = stackV.pop()!;
            const newStart = dico.stringBS.findStartIdx(
              ACode + i,
              indexV,
              start,
              end
            );
            const newEnd = dico.stringBS.findEndIdx(
              ACode + i,
              indexV,
              newStart,
              end
            );
            if (newStart > newEnd) continue;
            verticalIntervals.push([newStart, newEnd]);
          }
          if (!horizontalIntervals.length && verticalIntervals.length) {
            subtractIntervals(verticalI, verticalIntervals);
          }
          if (!verticalIntervals.length && horizontalIntervals.length) {
            subtractIntervals(horizontalI, horizontalIntervals);
          }
        }
      })
    )
  );

  return cellMap;
}
