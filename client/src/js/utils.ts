import axios from "axios";
import {Cell, Grid} from "grid";
import { NIcon } from "naive-ui";
import { h,  Component, Ref,ref } from "vue";


export function getUrl(param: string) {
  return `http://localhost:${import.meta.env.VITE_APIPORT}/${param}`;
}

export function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

export function save(grid: Grid){
  return axios.post(getUrl("grid"), {
    grid: grid.serialize(),
  });
}

export function measureText(text, size:string, font: string) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.font = font;
  const metrics = context.measureText(text);
  return metrics;
}


export function getCellClass(cell: Cell, focus: Cell) {
  const classes = [cell.definition ? "definition" : "text"];

  if (cell.x === focus.x && cell.y === focus.y) {
    classes.push(`focused`);
  }
  if (cell.highlighted) {
    classes.push(`highlighted`);
  }
  if (cell.suggestion && !cell.text.length) {
    classes.push(`suggested`);
  }
  return classes.concat('cell').join(" ");
}