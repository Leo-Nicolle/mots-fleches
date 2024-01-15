import { Direction, Grid, Vec } from "grid";
import { wordsSearch } from "./words-search";

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
  let str = "";
  for (let i = 0; i < length; i++) {
    const current = cells[i];
    const letter = grid.cells[current.y][current.x].text;
    str += letter.length ? letter.toLowerCase() : "*";
    cells.push(current);
  }
  if (cells.length < 2) return [];
  // TODO: test this wildcard search
  return wordsSearch.searchWord(str, {fuzzy: 0});
  // return dico.queryBinary(str.toUpperCase())
  // .map(index => dico.words[dico.sorted[index]]);
}