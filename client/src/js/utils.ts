import { Cell, Format } from "grid";
import { NIcon } from "naive-ui";
import { h, Component } from "vue";
import { RouteLocationNormalizedLoaded } from "vue-router";


export function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
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

export function mergeRouteWithDefault<T extends { [s: string]: unknown; }>(route: RouteLocationNormalizedLoaded, defaultP: T) {
  return Object.entries(defaultP)
    .reduce((acc, [key, value]) => {
      if (typeof value === 'boolean') {
        // @ts-ignore
        acc[key] = route.query[key] ? route.query[key] === 'true' : value;
      }
      else if (typeof value === 'number') {
        // @ts-ignore
        acc[key] = route.query[key] ? Number(route.query[key]) : value;
      }
      else if (typeof value === 'string') {
        // @ts-ignore
        acc[key] = route.query[key] ? route.query[key] : value;
      }

      return acc;
    }, {} as T);
}

export function getBodyPageWidth(format: Format) {
  return `${format.width - format.margin.left - format.margin.right}cm`;
}

export function getBodyPageHeight(format: Format) {
  return `${format.height - format.margin.top - format.margin.bottom}cm`;
}

export function getSizeNoPadding(elt: HTMLDivElement) {
  const computedStyle = getComputedStyle(elt);
  return {
    height: elt.clientHeight - parseFloat(computedStyle.paddingTop) - parseFloat(computedStyle.paddingBottom),
    width: elt.clientWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight),
  };
}