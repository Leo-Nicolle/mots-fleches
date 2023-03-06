import { ArrowDir } from "grid";


export function getTransform(dir: string) {
  const translate = `translate(-50%,-50%)`;
  return dir.startsWith("right") ?
    `rotate(180deg)scale(${-1}, ${-1})${translate}`
    : `scale(${-1},${1})rotate(90deg)${translate}`;
  // return simple ? path.replace('deg', '') :path;
}
export function getD(dir: ArrowDir, relative = false) {
  const p = dir === "none" ? "M 0 50 L 100 -50 M 0 -50 L 100 50"
    : dir === "rightdown" || dir === "downright"
      ? "M 0 0 L 75 0 75 100 M 100 75 L 75 100 M 50 75 L 75 100"
      : "M 0 0 L 90 0 75 25 M 75 -25 L 90 0";
  return p;//.toLowerCase()
}