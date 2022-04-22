import randomNormal from 'random-normal';

function getLength({ vec, grid, pos }) {
  let length = 0;
  const { x, y } = pos.x;
  let x2 = pos.x + vec.x;
  let y2 = pos.y + vec.y;
  while (grid[y2] && grid[y2][x2] === false) {
    length++;
    x2 = x + vec.x;
    y2 = y + vec.y;
  }
  return length;
}

export default function generate({ rows, cols }) {
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

  const length = Math.floor(rows / (maxWord + minWord) / 2 * 10);
  // const lengthHorizontal = new Array(  ).fill(0).map((_, i) => minWord
  //   + Math.floor(Math.abs(randomNormal()) * (maxWord - minWord)));
  const lengths = new Array(rows * cols).fill(0).map((_, i) => minWord
    + Math.floor(Math.abs(randomNormal()) * (maxWord - minWord)));
  for (let i = 0; i < 10000000; i++) {
    if (!lengths.length) break;
    let found = false;
    const lh = lengths.pop()
    const lv = lengths.pop()

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const lengthLeft = getLength({ vec: { x: -1, y: 0 }, grid, pos: { x: j, y: i } });
        const lengthTop = getLength({ vec: { x: 0, y: -1 }, grid, pos: { x: j, y: i } });
        if (lengthLeft !== lh || lengthTop !== lv) {
          continue;
        }
        grid[i][j] = true;
        found = true;
        break;
      }
      if (found) break;
    }

  }

  return grid;
}
