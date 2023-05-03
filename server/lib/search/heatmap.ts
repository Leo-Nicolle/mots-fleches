import { Direction, Grid, CellProba, Vec } from "grid";
import { dico, ACode } from "./dico";

export function heatmap(grid: Grid) {
  const cellMap = grid.cells.reduce((acc, row, y) => {
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
            }
            continue;
          }
          stack = newStack;
        });
      });
  });

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
    });
  });
  cellMap.forEach((row) => {
    row.forEach(({ inter }, x) => {
      row[x].totalInter = Object.values(inter).reduce((acc, v) => acc + v, 0);
    });
  });
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
      for (let j = 0; j < 26; j++) {
        const newStart = dico.stringBS.findStartIdx(ACode + j, i, start, end);
        const newEnd = dico.stringBS.findEndIdx(ACode + j, i, newStart, end);
        if (newStart > newEnd) continue;
        const letter = String.fromCharCode(ACode + j);
        if (!inter[letter]) {
          for (let k = newStart; k <= newEnd; k++) {
            scores[k] = -1;
          }
        }
        for (let k = newStart; k <= newEnd; k++) {
          const oldScore = scores[k] || 0;
          scores[k] =
            oldScore < 0 ? oldScore : oldScore + inter[letter] / total;
        }
        newStack.push([newStart, newEnd]);
      }
      continue;
    }
    stack = newStack;
  });
  return intervals
    .reduce((acc, [start, end]) => {
      acc.push(...new Array(end - start + 1).fill(start).map((e, i) => e + i));
      return acc;
    }, [])
    .sort((a, b) => (scores[b] || 0) - (scores[a] || 0))
    .filter((e) => scores[e] > 0)
    .map((w) => dico.words[dico.sorted[w]]);
}
