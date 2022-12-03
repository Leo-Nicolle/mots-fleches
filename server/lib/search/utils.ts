import { Point } from "./types";

export function coordValid(grid, isDefinition, coord) {
  return (
    coord.y < grid.length &&
    coord.y >= 0 &&
    coord.x < grid[0].length &&
    coord.x >= 0 &&
    !isDefinition[coord.y][coord.x]
  );
}

export function getVector(dir, factor = 1) {
  const vec = { x: 1, y: 0 };
  if (dir === "vertical") {
    vec.x = 0;
    vec.y = 1;
  } else {
    vec.x = 1;
    vec.y = 0;
  }
  return scale(vec, factor);
}

export function distance(v1, v2) {
  return Math.abs(v1.x - v2.x) + Math.abs(v1.y - v2.y);
}

export function strToReg(str, n = "?") {
  return new RegExp(
    `^${str
      .split("")
      .reduce(
        (reg, char) => (char === "*" ? `${reg}\\w${n}` : `${reg}${char}`),
        ""
      )}$`,
    "i"
  );
}

export function scale(v, factor = 1) {
  return {
    x: v.x * factor,
    y: v.y * factor,
  };
}

export function getCoords({ start, length, vec }) {
  const coords: Point[] = [];
  for (let i = 0; i < length; i++) {
    coords.push({
      x: start.x + vec.x * i,
      y: start.y + vec.y * i,
    });
  }
  return coords;
}

export function getAlphabet() {
  return new Array(26)
    .fill(0)
    .map((_, i) => String.fromCharCode("A".charCodeAt(0) + i));
}

export function cantor(x, y) {
  return ((x + y) * (x + y + 1)) / 2 + y;
}
