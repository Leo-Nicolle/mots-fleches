import { Direction, Grid, CellProba, Vec, CellBest, Bounds } from "grid";
import { dico, ACode } from "./dico";
// window ? window.dico = dico: undefined;

type Interval = [number, number];
export type BailOptions =
  { sharedArray: Uint8Array };
export function initCellMap(grid: Grid) {
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
export function getCellProbasFast(grid: Grid, options?: BailOptions) {
  const cellMap = initCellMap(grid);
  let hasBailed = false;
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
          if (options && options.sharedArray[0]) {
            hasBailed = true;
            return;
          }
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
  return {
    hasBailed,
    cellProbas: cellMap,
  };
}

export function getCellProbasAccurate(grid: Grid, options?: BailOptions) {
  const cellMap = initCellMap(grid);
  const cellToWordIndexH: Record<string, number> = {};
  const cellToWordIndexV: Record<string, number> = {};
  const cellToBoundsH: Record<string, Bounds> = {};
  const cellToBoundsV: Record<string, Bounds> = {};
  const intervalsH: Interval[][] = [];
  const intervalsV: Interval[][] = [];
  const cellToIntervalsH: Record<string, number> = {};
  const cellToIntervalsV: Record<string, number> = {};
  let hasBailed = false;
  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    const cellToWordIndex =
      dir === "horizontal" ? cellToWordIndexH : cellToWordIndexV;
    const validKey = `valid${dir[0].toUpperCase()}` as 'validH' | 'validV';
    const cellToBounds = dir === "horizontal" ? cellToBoundsH : cellToBoundsV;
    const cellToIntervals = dir === "horizontal" ? cellToIntervalsH : cellToIntervalsV;
    const intervals = dir === "horizontal" ? intervalsH : intervalsV;

    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        if (options && options.sharedArray[0]) {
          hasBailed = true;
          return;
        }
        intervals.push(dico.findInterval(
          bounds.cells.map((c) => (c.text.length ? c.text : "*")).join("")
        ) as Interval[]);


        bounds.cells.forEach(({ x, y }, i) => {
          if (options && options.sharedArray[0]) {
            hasBailed = true;
            return;
          }
          const cell = cellMap[y][x];
          if (!cell.empty) {
            return;
          }
          const key = `${y}-${x}`;
          cell[validKey] = true;
          cellToWordIndex[key] = i;
          cellToBounds[key] = bounds;
          cellToIntervals[key] = intervals.length - 1;
        });
      });
  });

  const sortedCells = grid.cells.flat()
    .filter(({ x, y }) => cellMap[y][x].empty && !grid.cells[y][x].definition)
    .sort(({ x: xa, y: ya }, { x: xb, y: yb }) => {
      const dx = xa - xb;
      const dy = ya - yb;
      return dy === 0 ? dx : dy;
    });

  sortedCells.forEach(({ x, y }) => {
    const key = `${y}-${x}`;
    const iV = cellToIntervalsV[key];
    const iH = cellToIntervalsH[key];
    const indexH = cellToWordIndexH[key];
    const indexV = cellToWordIndexV[key];
    let newStackV: Interval[] = [];
    let newStackH: Interval[] = [];
    const validH = cellMap[y][x].validH;
    const validV = cellMap[y][x].validV;
    // console.log(key, {
    //   vTotal: (intervalsV[iV] || [])
    //     .reduce((acc, [start, end]) => acc + end - start + 1, 0),
    //   v: (intervalsV[iV] || []).length,
    //   hTotal: (intervalsH[iH] || [])
    //     .reduce((acc, [start, end]) => acc + end - start + 1, 0),
    //   h: (intervalsH[iH] || []).length,

    // })
    // console.time(`cell ${key}`);
    for (let j = 0; j < 26; j++) {
      let stackV = (validV && intervalsV[iV].slice()) as Interval[];
      let stackH = (validH && intervalsH[iH].slice()) as Interval[];
      const lengthH = newStackH.length;
      const lengthV = newStackV.length;
      while (validH && stackH.length) {
        const [start, end] = stackH.pop()!;
        const newStart = dico.stringBS.findStartIdx(
          ACode + j,
          indexH,
          start,
          end
        );
        const newEnd = dico.stringBS.findEndIdx(
          ACode + j,
          indexH,
          newStart,
          end
        );
        if (newStart > newEnd) continue;
        newStackH.push([newStart, newEnd]);
      }
      while (validV && stackV.length) {
        const [start, end] = stackV.pop()!;
        const newStart = dico.stringBS.findStartIdx(
          ACode + j,
          indexV,
          start,
          end
        );
        const newEnd = dico.stringBS.findEndIdx(
          ACode + j,
          indexV,
          newStart,
          end
        );
        if (newStart > newEnd) continue;
        newStackV.push([newStart, newEnd]);
      }
      if (stackV && stackH) {
        const dv = newStackV.length - lengthV;
        const dh = newStackH.length - lengthH;
        if (dh && !dv) {
          newStackH = newStackH.slice(0, lengthH);
        }
        if (!dh && dv) {
          newStackV = newStackV.slice(0, lengthV);
        }
      }
    }
    if (validH) {
      intervalsH[iH] = newStackH;
      newStackH = [];
    }
    if (validV) {
      intervalsV[iV] = newStackV;
      newStackV = [];
    }
    // console.timeEnd(`cell ${key}`);
  });

  // count how many words have each letter in each cell
  sortedCells.forEach(({ x, y }) => {
    const key = `${y}-${x}`;
    const iV = cellToIntervalsV[key];
    const iH = cellToIntervalsH[key];
    const indexH = cellToWordIndexH[key];
    const indexV = cellToWordIndexV[key];
    const stackV = (cellMap[y][x].validV && intervalsV[iV].slice()) as Interval[];
    const stackH = (cellMap[y][x].validH && intervalsH[iH].slice()) as Interval[];
    const occurencesV = {} as Record<string, number>;
    const occurencesH = {} as Record<string, number>;

    stackV && stackV.forEach(([start, end]) => {
      const letter = dico.words[dico.sorted[start]][indexV];
      occurencesV[letter] = (occurencesV[letter] || 0) + (end - start + 1);
    });
    stackH && stackH.forEach(([start, end]) => {
      const letter = dico.words[dico.sorted[start]][indexH];
      occurencesH[letter] = (occurencesH[letter] || 0) + (end - start + 1);
    });
    let total = 0;
    let inter: Record<string, number> = {};
    if (stackV && stackH) {
      for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(ACode + i);
        inter[letter] = Math.min(occurencesV[letter] || 0, occurencesH[letter] || 0);
        total += inter[letter];
      }
    } else {
      inter = stackV ? occurencesV : occurencesH;
      total = Object.entries(inter).reduce((total, [_, value]) => total + value, 0);
    }
    cellMap[y][x].inter = inter;
    cellMap[y][x].totalInter = total;
  }, []);

  // compute the scores for each words
  const bestWordsH: Record<string, number[]> = {};
  const bestWordsV: Record<string, number[]> = {};

  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    const cellToWordIndex =
      dir === "horizontal" ? cellToWordIndexH : cellToWordIndexV;
    const bestWords = dir === "horizontal" ? bestWordsH : bestWordsV;
    const cellToIntervals = dir === "horizontal" ? cellToIntervalsH : cellToIntervalsV;
    const intervalMap = dir === "horizontal" ? intervalsH : intervalsV;
    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        const scores = {} as Record<number, number>;
        bounds.cells.forEach(({ x, y }) => {
          (intervalMap[cellToIntervals[`${y}-${x}`]] || [])
            .forEach(([start, end]) => {
              const word = dico.words[dico.sorted[start]];
              const letter = word[cellToWordIndex[`${y}-${x}`]];
              const score = (cellMap[y][x].inter[letter] || 0) / cellMap[y][x].totalInter;
              for (let i = start; i <= end; i++) {
                scores[i] = (scores[i] || 0) + score;
              }
            });
        });
        const best = Object.entries(scores)
          .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
          .slice(0, 100)
          .map(([index]) => Number(index));
        bounds.cells.forEach(({ x, y }) => {
          bestWords[`${y}-${x}`] = best;
        });
      });

  });

  return {
    cellProbas: grid.cells.reduce((acc, row, y) => {
      acc.push(
        row.map((_, x) => {
          const { validH, validV, empty, inter } = cellMap[y][x];
          const key = `${y}-${x}`;
          return {
            validH,
            validV,
            empty,
            bestWordsV: bestWordsV[key] || [],
            bestWordsH: bestWordsH[key] || [],
            inter,
            x,
            y,
          };
        })
      );
      return acc;
    }, [] as CellBest[][]),
    hasBailed
  };

}


export function getCellProbas(grid: Grid, options: BailOptions) {
  const cellMap = initCellMap(grid);
  const cellToWordIndexH: Record<string, number> = {};
  const cellToWordIndexV: Record<string, number> = {};
  const cellToBoundsH: Record<string, Bounds> = {};
  const cellToBoundsV: Record<string, Bounds> = {};
  const intervalsH: Interval[][] = [];
  const intervalsV: Interval[][] = [];
  const cellToIntervalsH: Record<string, number> = {};
  const cellToIntervalsV: Record<string, number> = {};
  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    const cellToWordIndex =
      dir === "horizontal" ? cellToWordIndexH : cellToWordIndexV;
    const validKey = `valid${dir[0].toUpperCase()}` as 'validH' | 'validV';
    const cellToBounds = dir === "horizontal" ? cellToBoundsH : cellToBoundsV;
    const cellToIntervals = dir === "horizontal" ? cellToIntervalsH : cellToIntervalsV;
    const intervals = dir === "horizontal" ? intervalsH : intervalsV;
    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        intervals.push(dico.findInterval(
          bounds.cells.map((c) => (c.text.length ? c.text : "*")).join("")
        ) as Interval[]);

        bounds.cells.forEach(({ x, y }, i) => {
          const cell = cellMap[y][x];
          if (!cell.empty) {
            return;
          }
          const key = `${y}-${x}`;
          cell[validKey] = true;
          cellToWordIndex[key] = i;
          cellToBounds[key] = bounds;
          cellToIntervals[key] = intervals.length - 1;
        });
      });
  });
  const total = [intervalsH, intervalsV].reduce((total, is) => total + is
    .reduce((acc, intervals) => acc + intervals
      .reduce((acc, [start, end]) => acc + (end - start + 1), 0)
      , 0)
    , 0);
  // from tests, takes like 1sec to test 60k words.
  // TODO reuse computation above
  if (total > 60000) {
    // return getCellProbasFast(grid, options);
  }
  return getCellProbasAccurate(grid, options);

}
