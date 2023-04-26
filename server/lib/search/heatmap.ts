import { Direction, Grid, CellProba } from "grid";
import { search } from "./search";

export function heatmap(grid: Grid, words: string[]) {
  if (!grid) return [[]];
  const cellMap = grid.cells.reduce((acc, _, y) => {
    acc.push(
      new Array(grid.cols).fill(0).map((_, x) => ({
        horizontalL: {},
        verticalL: {},
        inter: {},
        empty: false,
        horizontal: 0,
        validH: false,
        validV: false,
        totalInter: 0,
        x,
        y,
        vertical: 0,
      }))
    );
    return acc;
  }, [] as CellProba[][]);

  const dirs = ["horizontal", "vertical"] as Direction[];
  for (let d = 0; d < dirs.length; d++) {
    const dir = dirs[d];
    const vec = Grid.getDirVec(dir);
    const allBounds = grid.getWords(dir).filter(({ length }) => length > 1);
    const allWords = allBounds.map((bounds) =>
      search.getWordsSimple({
        grid,
        bounds,
        words,
      })
    );
    // get all letters possible per cell
    allBounds.forEach((bounds, i) => {
      const words = allWords[i];
      const emptyCells = bounds.cells.map((cell, i) => (cell.text ? null : i));
      const valid = dir === "horizontal" ? "validH" : "validV";
      bounds.cells.forEach((cell) => {
        cellMap[cell.y][cell.x][valid] = true;
      });
      words.forEach((word) => {
        word.split("").forEach((letter, i) => {
          if (emptyCells[i] === null) return;
          const elt =
            cellMap[bounds.start.y + i * vec.y][bounds.start.x + i * vec.x];
          elt.empty = true;
          const letters = elt[(dir + "L") as "horizontalL" | "verticalL"];
          letters[letter] = letters[letter] ? letters[letter] + 1 : 1;
          elt[dir] = elt[dir] ? elt[dir] + 1 : 1;
        });
      });
    }, {});
  }
  // find intersection betwen horizontal and vertical
  cellMap.forEach((row, y) => {
    row.forEach(({ horizontalL, verticalL, empty, validH, validV }, x) => {
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
  cellMap.forEach((row, y) => {
    row.forEach(({ inter }, x) => {
      row[x].totalInter = Object.values(inter).reduce((acc, v) => acc + v, 0);
    });
  });
  return cellMap;
}
