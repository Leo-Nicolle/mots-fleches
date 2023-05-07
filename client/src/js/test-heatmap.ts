import { Direction, Grid, CellProba, Vec, CellBest, Bounds } from "grid";
import { dico, ACode } from "./test-dico";
import { c } from "naive-ui";
window.dico = dico;
type Interval = [number, number];
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
  // a.sort((a1, b1) => a1[0] - b1[0]);
  // b.sort((a1, b1) => a1[0] - b1[0]);
  while (b.length) {
    const [b1, b2] = b.pop()!;
    for (let i = 0; i < a.length; i++) {
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
      inter = stackV ? occurencesV : occurencesH
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

  return grid.cells.reduce((acc, row, y) => {
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
  }, [] as CellBest[][]);

}
