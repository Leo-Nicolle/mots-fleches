import { Direction, Grid, CellProba, Vec, CellBest, Bounds } from "grid";
import { dico, ACode } from "./dico";
import { Tree, Node, intersect, mapToWords, getPossibleParents } from './tree';

interface Possibles {
  nodes: Node[];
  isImpossible: boolean;
}

// window ? window.dico = dico: undefined;
const trees = new Map<number, Tree>();
type Interval = [number, number];
const cachedResult = new Map<string, CellBest[][]>();
export type BailOptions = { sharedArray: Uint8Array; };
export function initCellMap(grid: Grid) {
  const res = grid.cells.reduce((acc, row, y) => {
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
  return res;
}

function cantor(x: number, y: number) {
  return ((x + y) * (x + y + 1)) / 2 + y;
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

interface CellA {
  previousH: CellA | null;
  previousV: CellA | null;
  nextH: CellA | null;
  nextV: CellA | null;
  x: number;
  y: number;
  text: string;
  validH: boolean;
  validV: boolean;
  nodesH: Map<number, Node[]>;
  nodesV: Map<number, Node[]>;
  impossible: Set<number>;
  // impossibleV: Set<number>;
}

function filter(cell: CellA) {
  const { text, validH, validV, nodesH, nodesV, impossible } = cell;
  // filter out and intersect
  if (text !== '*') {
    const code = text.charCodeAt(0);
    if (validH) {
      const key = nodesH.get(code);
      nodesH.clear();
      nodesH.set(code, key || []);
    }
    if (validV) {
      const key = nodesV.get(code);
      nodesV.clear();
      nodesV.set(code, key || []);
    }
  } else if (validH && validV) {
    intersect(nodesH, nodesV);
    for (let i = ACode; i < ACode + 26; i++) {
      const h = nodesH.get(i);
      const v = nodesV.get(i);
      if (!h || !v || h.length === 0 || v.length === 0) {
        impossible.add(i);
      }
    }
  }
  //TODO: check if needed
  impossible.forEach(code => {
    nodesH.delete(code);
    nodesV.delete(code);
  });
}
export function getCellProbasAccurate2(grid: Grid, options?: BailOptions) {
  const cellsA = grid.cells.reduce((acc: CellA[][], row, y) => {
    const r = row.map((cell, x) => {
      const { definition, text } = cell;
      return {
        previousH: null,
        previousV: null,
        nextH: null,
        nextV: null,
        text: text.length ? text : '*',
        x,
        y,
        validH: false,
        validV: false,
        nodesH: new Map(),
        nodesV: new Map(),
        impossible: new Set<number>(),
        // impossibleV: new Set<number>(),
      };
    });
    acc.push(r);
    return acc;
  }, [] as CellA[][]);


  let hasBailed = false;
  (["horizontal", "vertical"] as Direction[]).forEach((dir) => {
    grid
      .getWords(dir)
      .filter(({ length }) => length > 1)
      .forEach((bounds) => {
        const tree = trees.get(bounds.length);
        const query = bounds.cells[0].text.length ? bounds.cells[0].text : '*';
        const suffix = dir === 'horizontal' ? 'H' : 'V';
        cellsA[bounds.start.y][bounds.start.x][`nodes${suffix}`] = tree?.getIntervals(query) || new Map<number, Node[]>();
        bounds.cells.forEach(({ x, y }, i) => {
          const cellA = cellsA[y][x];
          const isV = +(dir === 'vertical');
          const isH = +(dir === 'horizontal');
          cellA[`previous${suffix}`] = i === 0 ? null : cellsA[y - 1 * isV][x - 1 * isH];
          cellA[`next${suffix}`] = i === bounds.length - 1 ? null : cellsA[y + 1 * isV][x + 1 * isH];
          cellA[`index${suffix}`] = i;
          cellA[`valid${suffix}`] = true;
        });
      });
  });
  const sortedCells = cellsA.flat()
    .filter(({ x, y }) => !grid.cells[y][x].definition)
    .sort(({ x: xa, y: ya }, { x: xb, y: yb }) => {
      const dx = xa - xb;
      const dy = ya - yb;
      return dy === 0 ? dx : dy;
    });
  const lastCells = sortedCells.slice().reverse().filter(({ nextH, nextV }) => !nextH || !nextV);
  sortedCells.forEach(cell => {
    const mapH = new Map();
    const mapV = new Map();
    const { previousH, previousV, nodesH, nodesV, impossible } = cell;
    [
      {
        prev: previousH,
        prevNodes: previousH && previousH.nodesH,
        map: mapH,
        key: 'nodesH',
      },
      {
        prev: previousV,
        prevNodes: previousV && previousV.nodesV,
        map: mapV,
        key: 'nodesV',
      }
    ].forEach(({ prev, key, map, prevNodes }) => {
      if (!prev || !prevNodes) return;
      for (let i = 0; i < 26; i++) {
        map.set(ACode + i, []);
      }
      prevNodes.forEach((nodes) => {
        nodes
          .forEach(node => {
            node.children.forEach(child => {
              map.get(child.code) && map.get(child.code).push(child);
            });
          });
      });
      cell[key] = map;
    });
    filter(cell);

  });
  // console.log('sortedCells', sortedCells.some(c => Array.isArray(c.nodesH) || Array.isArray(c.nodesV)))
  let shouldRerun = true;
  const max = 1;
  let i = 0;
  // console.time('firstloop');
  while (false && i++ < max) {
    shouldRerun = false;
    const Q = lastCells.slice();
    // console.time('firstloop2')
    while (Q.length) {
      const cell = Q.shift()!;
      const { previousH, previousV, nodesH, nodesV } = cell;
      [{ prev: previousH, nodes: nodesH, key: 'nodesH' }, { prev: previousV, nodes: nodesV, key: 'nodesV' }]
        .forEach(({ prev, nodes, key }) => {
          if (!prev) return;
          Q.push(prev);
          const possibleParentsCode = new Set<number>();
          getPossibleParents(nodes, possibleParentsCode);
          [...prev[key].keys()].forEach(code => {
            if (!possibleParentsCode.has(code)) {
              prev[key].delete(code);
            }
          });
        });
    }
    // console.timeEnd('firstloop2')
    // console.time('firstloop3')
    sortedCells.forEach(cell => {
      if (cell.validH && cell.validV) {
        for (let i = 0; i < 26; i++) {
          if (!cell.nodesH.has(ACode + i) || !cell.nodesV.has(ACode + i)) {
            cell.impossible.add(ACode + i);
          }
        }
      } else if (cell.validH) {
        for (let i = 0; i < 26; i++) {
          if (!cell.nodesH.has(ACode + i)) {
            cell.impossible.add(ACode + i);
          }
        }
      } else if (cell.validV) {
        for (let i = 0; i < 26; i++) {
          if (!cell.nodesH.has(ACode + i)) {
            cell.impossible.add(ACode + i);
          }
        }
      }
    });
    // console.timeEnd('firstloop3')
    // console.time('firstloop4')
    sortedCells.forEach(cell => {
      const { nextH, nextV, nodesH, nodesV, impossible } = cell;
      if (nextV) {
        const keys = [...nextV.nodesV.keys()];
        keys.forEach(code => {
          nextV.nodesV.set(code, nextV.nodesV.get(code)!.filter(n => !impossible.has(n.parent.code)));
        });
      }
      if (nextH) {
        const keys = [...nextH.nodesH.keys()];
        keys.forEach(code => {
          nextH.nodesH.set(code, nextH.nodesH.get(code)!.filter(n => !impossible.has(n.parent.code)));
        });
      }
    });
    // console.timeEnd('firstloop4')
  }


  const res = cellsA.map((row, y) => {
    const r = row.map((cell, x) => {
      const { validH, validV, text } = cellsA[y][x];
      const res: CellBest = {
        x, y, validH, validV, empty: text === '*',
        occurencesH: {},
        occurencesV: {},
        total: 0,
        // bestWordsH: [],
        // bestWordsV: [],
        inter: {}
      };
      return res;
    });
    return r;
  });

  cellsA.forEach((row) => {
    row.forEach(({ x, y, nodesH, nodesV, validH, validV }) => {
      res[y][x].occurencesH = new Map();
      res[y][x].occurencesV = new Map();
      if (!validH && !validV) return;
      for (let i = ACode; i < ACode + 26; i++) {
        validH && res[y][x].occurencesH.set(i, (nodesH.get(i) || []).reduce((acc, n) => acc + n.end - n.start + 1, 0));
        validV && res[y][x].occurencesV.set(i, (nodesV.get(i) || []).reduce((acc, n) => acc + n.end - n.start + 1, 0));
        res[y][x].inter[i] = validH && validV
          ? Math.min(res[y][x].occurencesH.get(i), res[y][x].occurencesV.get(i))
          : validH ? res[y][x].occurencesH.get(i) : res[y][x].occurencesV.get(i);
      }
      res[y][x].total = Object.values(res[y][x].inter).reduce((acc, v) => acc + v, 0);
    });
  });

  const visitedH = new Set<number>();
  const visitedV = new Set<number>();

  lastCells.forEach(({ previousH, previousV, x, y, nodesH, nodesV }) => {
    // const wordsV = mapToWords(cell.nodesV);
    if (previousH && previousH.validH && !visitedH.has(cantor(x, y))) {
      const wordsH = mapToWords(nodesH);
      const scores = new Map();
      for (let i = 0; i < wordsH.length; i++) {
        const word = wordsH[i];
        let score = 0;
        for (let j = 0; j < word.length; j++) {
          const letter = word.charCodeAt(j);
          const xh = x + 1 - word.length + j;
          score += res[y][xh].inter[letter] / res[y][xh].total;
        }
        scores.set(i, score);
      }
      let i = 1;
      visitedH.add(cantor(x, y));
      let prev = previousH;
      while (prev && prev.validH) {
        visitedH.add(cantor(x - i++, y));
        prev = prev.previousH;
      }
      res[y][x - i + 1].bestWordsH = [...scores.entries()]
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 100)
        .map(([index]) => wordsH[index]);

    }

    if (previousV && previousV.validH && !visitedV.has(cantor(x, y))) {
      const wordsV = mapToWords(nodesV);
      const scores = new Map();
      for (let i = 0; i < wordsV.length; i++) {
        const word = wordsV[i];
        let score = 0;
        for (let j = 0; j < word.length; j++) {
          const letter = word.charCodeAt(j);
          const yh = y + 1 - word.length + j;
          score += res[yh][x].inter[letter] / res[yh][x].total;
        }
        scores.set(i, score);
      }
      let i = 1;
      visitedV.add(cantor(x, y));
      let prev = previousV;
      while (prev && prev.validV) {
        visitedV.add(cantor(x, y - i++));
        prev = prev.previousV;
      }
      res[y - i + 1][x].bestWordsV = [...scores.entries()]
        .sort(([, scoreA], [, scoreB]) => scoreB - scoreA)
        .slice(0, 100)
        .map(([index]) => wordsV[index]);
    }
  });
  res.forEach((row) => {
    row.forEach(c => {
      c.inter = Object.entries(c.inter).reduce((acc, [k, v]) => {
        acc[String.fromCharCode(k)] = v;
        return acc;
      }, {});
    });
  });
  return {
    hasBailed,
    cellProbas: res,
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
            bestWordsV: (bestWordsV[key] || []).map((index) => dico.words[dico.sorted[index]]),
            bestWordsH: (bestWordsH[key] || []).map((index) => dico.words[dico.sorted[index]]),
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
  const hash = grid.serialize();
  if (cachedResult.has(hash)) {
    return { hasBailed: false, cellProbas: cachedResult.get(hash)! };
  }
  if (!trees.size) {
    console.time('initTree');
    const min = dico.words[dico.sorted[0]].length;
    const max = dico.words[dico.sorted[dico.sorted.length - 1]].length;
    for (let i = min; i <= max; i++) {
      trees.set(i, new Tree(i));
    }
    console.timeEnd('initTree');
  }
  console.log('getCellProbas');
  const cellMap = initCellMap(grid);
  console.time('getCellProbasAccurate2');
  const a = getCellProbasAccurate2(grid, options);
  console.timeEnd('getCellProbasAccurate2');
  // console.time('getCellProbasAccurate1');
  // const b = getCellProbasAccurate(grid, options);
  // console.timeEnd('getCellProbasAccurate1');
  return a;
}

export function copyCellProbas(cellProbas: CellBest[][]) {
  const visitedH = new Set<number>();
  const visitedV = new Set<number>();
  return cellProbas.forEach((row) => {
    row.forEach(cell => {
      const { x, y, bestWordsH, bestWordsV } = cell;
      const ctor = cantor(x, y);
      if (!visitedH.has(ctor) && bestWordsH) {
        let i = 0;
        let current = cell;
        while (current && current.validH) {
          visitedH.add(ctor);
          current.bestWordsH = bestWordsH;
          current = row[x + i++];
        }
      }
      if (!visitedV.has(ctor) && bestWordsV) {
        let i = 0;
        let current = cell;
        while (current && current.validV) {
          current.bestWordsV = bestWordsV;
          visitedV.add(ctor);
          const nextRow = cellProbas[y + i++];
          if (!nextRow) break;
          current = nextRow[x];
        }
      }
    });
  });
}