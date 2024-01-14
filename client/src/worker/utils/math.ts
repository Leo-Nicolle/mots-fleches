
export function cantor(x: number, y: number) {
  return ((x + y) * (x + y + 1)) / 2 + y;
}
// reverse cantor
export function reverseCantor(z: number) {
  const w = Math.floor((Math.sqrt(8 * z + 1) - 1) / 2);
  const t = (w * w + w) / 2;
  const y = z - t;
  const x = w - y;
  return { x, y };
}
