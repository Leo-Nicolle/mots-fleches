import { Direction, Grid, Vec } from "grid";
import { dico } from "./dico";

export function getWordsSimple({
  grid,
  coords,
  dir
}: {
  grid: Grid;
  coords: Vec;
  dir: Direction;
}) {
  const { length, cells } = grid.getBounds(coords, dir);
  if (cells.length < 2) return [];
  let str = "";
  for (let i = 0; i < length; i++) {
    const current = cells[i];
    const letter = grid.cells[current.y][current.x].text;
    str += letter.length ? letter.toLowerCase() : "*";
  }
  // TODO: test this wildcard search
  return dico.queryBinary(str.toUpperCase())
    .map(index => dico.words[dico.sorted[index]]);
}
