import { Point } from "./types";


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
