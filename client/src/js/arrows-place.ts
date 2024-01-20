import { ArrowDir, Grid } from "grid";
import { cantor, reverseCantor } from "../worker/utils/math";

export function arrowsPlace(grid: Grid){
  const map = new Map();
  const uniqs = new Map();
  grid.getWords("horizontal")
  .forEach(w  => {
    const {x,y} = w.start;
    [
      {x: x-1, y, arrow: 'right'},
      {x, y: y-1, arrow: 'downright'},
    ]
    .filter(pos =>  grid.isValid(pos) &&  grid.cells[pos.y][pos.x].definition)
    .forEach(({x, y, arrow}, i, candidates) => {
      const id = cantor(x,y);
      const arr = map.get(id) || [];
      arr.push(arrow);
      map.set(id, arr);
      if (candidates.length === 1){
        uniqs.set(`${id}-horizontal`, arrow);
      }
    });
  });

  grid.getWords("vertical")
  .forEach(w  => {
    const {x,y} = w.start;
    [
      {x, y: y-1, arrow: 'down'},
      {x: x-1, y, arrow: 'rightdown'},
    ]
    .filter(pos => grid.isValid(pos) && grid.cells[pos.y][pos.x].definition)
    .forEach(({x, y, arrow}, i, candidates) => {
      const id = cantor(x,y);
      const arr = map.get(id) || [];
      arr.push(arrow);
      map.set(id, arr);
      if (candidates.length === 1){
        uniqs.set(`${id}-vertical`, arrow);
      }
    });
    [...uniqs.entries()]
    .forEach(([key, value]) => {
      const [_, id, direction ]= key.match(/(\d+)-(vertical|horizontal)/);
      const {x, y} = reverseCantor(+id);
      const cell = grid.cells[y][x];
      
    });
  });




}