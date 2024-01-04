import { Direction, Grid, CellProba, Vec, CellBest, Bounds } from "grid";
import { dico, ACode } from "./dico";
import { Tree, Node, intersect, mapToWords, getPossibleParents } from './tree';
import { cantor } from "./utils";

const trees = new Map<number, Tree>();
const cachedResult = new Map<string, CellBest[][]>();
const hashes: string[] = [];

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
// TODO Maybe, maybe?? split this monstuosity into smaller functions
// Maybe there is a more convinient intermediate data structure
// cause we always repeat vertical and horizontal operations and it is a mess
export function getCellProbasAccurate(grid: Grid) {
  const cellsA = grid.cells.reduce((acc: CellA[][], row, y) => {
    const r = row.map((cell, x) => {
      const { text } = cell;
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
  // top down pass
  sortedCells.forEach(cell => {
    const mapH = new Map();
    const mapV = new Map();
    const { previousH, previousV } = cell;
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
      if (!prev || !prevNodes) {
        return;
      };
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

  //bottom up pass
  const visitedH = new Set<number>();
  const visitedV = new Set<number>();
  sortedCells.slice().reverse().forEach(cell => {
    const { previousH, previousV, nodesH, nodesV } = cell;
    [{
      previous: previousH,
      key: 'nodesH',
      valid: previousH && previousH.validH,
      nodes: nodesH,
    }, {
      previous: previousV,
      key: 'nodesV',
      valid: previousV && previousV.validV,
      nodes: nodesV,
    }].forEach(({ previous, nodes, valid, key }) => {
      if (!valid) return;
      const map = new Map<number, Set<Node>>();
      for (let i = 0; i < 26; i++) {
        map.set(ACode + i, new Set<Node>());
      }
      nodes.forEach((nodes) => {
        nodes
          .forEach(node => {
            const parent = node.parent!;
            map.get(parent.code) && map.get(parent.code)!.add(parent);
          });
      });
      const resMap = new Map<number, Node[]>();
      map.forEach((set, key) => {
        resMap.set(key, Array.from(set));
      });
      previous[key] = resMap;
      filter(previous);
    });
  });
  // propagate impossible: 
  lastCells.forEach(cell => {
    let current = cell;
    let shouldClean = false;
    while (current) {
      // const ctr = cantor(current.x, current.y);
      const { previousH, validH, nodesH, x, y } = current;
      if (!previousH || !validH) break;
      if (!nodesH.size) {
        shouldClean = true;
        break;
      }
      current = previousH;
    }
    if (shouldClean) {
      current = cell;
      while (current) {
        const { previousH, validH, text } = current;
        if (!previousH || !validH) break;
        if (text !== '*') {
          current = previousH;
          continue;
        }
        current.nodesV = new Map();
        current.nodesH = new Map();
        for (let i = ACode; i < ACode + 26; i++) {
          current.impossible.add(i);
        }
        current = previousH;
      }
    }
    shouldClean = false;
    current = cell;
    while (current) {
      const { previousV, validV, nodesV, x, y } = current;
      if (!previousV || !validV) break;
      if (!nodesV.size) {
        shouldClean = true;
        break;
      }
      current = previousV;
    }
    if (shouldClean) {
      current = cell;
      while (current) {
        const { previousV, validV, text } = current;
        if (!previousV || !validV) break;
        if (text !== '*') {
          current = previousV;
          continue;
        }
        current.nodesV = new Map();
        current.nodesH = new Map();
        for (let i = ACode; i < ACode + 26; i++) {
          current.impossible.add(i);
        }
        current = previousV;
      }
    }
  });
  const res = cellsA.map((row, y) => {
    const r = row.map((cell, x) => {
      const { validH, validV, text } = cellsA[y][x];
      const res: CellBest = {
        x, y, validH, validV, empty: text === '*',
        occurencesH: {},
        occurencesV: {},
        total: 0,
        inter: {}
      };
      return res;
    });
    return r;
  });
  // compute occurences of each letters on each cell
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

  // compute scores for each word
  lastCells.forEach(({ previousH, previousV, x, y, nodesH, nodesV }) => {
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

    if (previousV && previousV.validV && !visitedV.has(cantor(x, y))) {
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

function getHash(grid: Grid){
  return grid.cells.reduce((acc, row) => acc + row.reduce((acc, cell) => acc + cell.text, '') + '\n', '');
}

export function getCellProbas(grid: Grid, useCache = true) {
  // console.time('getCellProbas');

  const hash = getHash(grid);
  if (cachedResult.has(hash) && useCache) {
    // console.timeEnd('getCellProbas');
    return { hasBailed: false, cellProbas: cachedResult.get(hash)! };
  }
  if (!trees.size) {
    const min = dico.words[dico.sorted[0]].length;
    const max = dico.words[dico.sorted[dico.sorted.length - 1]].length;
    for (let i = min; i <= max; i++) {
      trees.set(i, new Tree(i));
    }
  }
  const a = getCellProbasAccurate(grid);
  cachedResult.set(hash, a.cellProbas);
  hashes.push(hash);
  if (hashes.length > 250) {
    const hash = hashes.shift()!;
    cachedResult.delete(hash);
  }
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