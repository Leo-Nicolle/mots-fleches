
type Place = {
  y: number;
  x: number;
  idH: any;
  idV: any;
  lengthLeft: number;
  lengthRight: number;
  lengthBottom: number;
  lengthTop: number;
  lengthH: number;
  lengthV: number;
};

export function getLength({ vec, grid, pos }) {
  let length = -1;
  let { x, y } = pos;
  while (grid[y] && grid[y][x] === false) {
    length++;
    x += vec.x;
    y += vec.y;
  }
  return length;
}


function placeDefinition({minWord, rows, cols, scaledDistib, grid}){
  const cellToWordIdH ={}; 
  const cellToWordIdV ={};
  let idH = 1;
  let idV = 1;
   const lengths = new Array(rows).fill(0)
    .map((_, y) => new Array(cols).fill(0)
    .map((cell, x) => {
        if (grid[y][x]) return;
        const lengthLeft = getLength({ vec: { x: -1, y: 0 }, grid, pos: { x, y } });
        const lengthRight = getLength({ vec: { x: 1, y: 0 }, grid, pos: { x, y } });
        const lengthTop = getLength({ vec: { x: 0, y: -1 }, grid, pos: { x, y } });
        const lengthBottom = getLength({ vec: { x: 0, y: 1 }, grid, pos: { x, y } });
        const lengthH = lengthLeft + lengthRight +1;
        const lengthV = lengthTop + lengthBottom +1;
        let validH = false;
        let validV = false;
        if (lengthH > minWord){
          for (let i = x - lengthLeft; i < x + lengthRight + 1; i++){
            const key = `${y},${i}`;
            if (cellToWordIdH[key]) continue;
            cellToWordIdH[key] = idH;
            validH = true;
          }
          if (validH){
            idH++;
          }
        }
        if (lengthV > minWord){
          for (let i = y - lengthTop; i < y + lengthBottom + 1; i++){
            const key = `${i},${x}`;
            if (cellToWordIdV[key]) continue;
            cellToWordIdV[key] = idV;
            validV = true;
          }
          if (validV){
            idV++;
          }
        }
        const key = `${y},${x}`;
        return {
          y,
          x,
          idH: cellToWordIdH[key],
          idV: cellToWordIdV[key],
          lengthLeft,
          lengthRight,
          lengthBottom,
          lengthTop,
          lengthH,
          lengthV,
        };
    }))
    .reduce((flat, row) => flat.concat(row), [])
    .filter(e => e && (e.idV || e.idH)) as Place[];


    // compute the actual distribution
    const visited = {};
    let actDistrib = lengths.reduce((acc, e) => {
      if (e.idH && !visited[`h-${e.idH}`]){
        visited[`h-${e.idH}`] = true;
        acc[e.lengthH - minWord] += 1;
      }
      if (e.idV && !visited[`v-${e.idV}`]){
        visited[`v-${e.idV}`] = true;
        acc[e.lengthV - minWord] += 1;
      }
      return acc;
    }, new Array(scaledDistib.length).fill(0));

    const totalWords = actDistrib.reduce((acc, e) => acc + e, 0);
    actDistrib = actDistrib.map(e => e / totalWords);

    const probas = lengths.map(e => {
      // actual length probas: closer to required distrib => lower
      const proba =   
        Math.max(0, actDistrib[e.lengthH - minWord] - scaledDistib[e.lengthH - minWord] || 0) 
        + Math.max(0, actDistrib[e.lengthLeft - minWord] - scaledDistib[e.lengthV - minWord] || 0) 
        // potential lengths if we cut it: closed to required => higher
        +  1 - Math.max(0, actDistrib[e.lengthTop - minWord] - scaledDistib[e.lengthTop - minWord] || 0) 
        +  1 - Math.max(0, actDistrib[e.lengthBottom - minWord] - scaledDistib[e.lengthBottom - minWord] || 0) 
        +  1 - Math.max(0, actDistrib[e.lengthLeft - minWord] - scaledDistib[e.lengthLeft - minWord] || 0) 
        +  1 - Math.max(0, actDistrib[e.lengthRight - minWord] - scaledDistib[e.lengthRight - minWord] || 0);

      const impossible = e.lengthLeft < minWord
       ||   e.lengthTop < minWord
       || (e.x < cols - 1 && e.lengthRight < minWord)
       || (e.y < rows - 1 && e.lengthBottom < minWord)
       || (e.x == cols - 1 && e.y === rows - 1);


      return {
        x: e.x,
        y: e.y,
        proba: proba * (1 - +impossible)
      };
    }).sort((a, b) => a.proba - b.proba);

    const totalProba = probas.reduce((acc, p) => acc + p.proba, 0);
    
    const chosenCut = Math.random() * totalProba;

    const cut = probas.reduce((acc, e) => {
      if (acc.chosen) return acc;
      acc.total+=e.proba;
      // @ts-ignore
      if (acc.total > chosenCut)acc.chosen = e;
      return acc;
    }, {total: 0, chosen: null}).chosen;

    //@ts-ignore
    grid[cut.y][cut.x] = true;
}

export default function generate({ rows, cols , distribution}: {
  rows: number;
  cols: number;
  distribution: Record<string, number>
}) {
  const minWord = 2;
  const maxWord = 10;

  const grid = new Array(rows).fill(0).map(() => new Array(cols).fill(false));
  // init the usual one word out of two on top and left
  grid[0].forEach((_, i) => {
    if (i % 2 === 0) grid[0][i] = true;
  });

  for (let i = 0; i < rows; i++) {
    if (i % 2 === 0) grid[i][0] = true;
  }
  // Sum of all the % of each length
  const total = Object.values(distribution).slice(minWord, Math.max(rows, cols) + 1).reduce((acc, e) => acc + e, 0);
  // scale it to [0;1]  
  // const scaledDistib = Object.values(distribution).slice(minWord,Math.max(rows, cols) + 1).reduce((acc, e) => acc.concat(e / total), []);
 
  for (let i = 0; i< rows; i++ ){
    // placeDefinition({minWord, rows, cols, scaledDistib, grid});
  }
  return grid;
}
