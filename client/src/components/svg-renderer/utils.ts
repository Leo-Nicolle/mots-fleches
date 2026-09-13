import { Cell, Direction, Grid, GridStyle, cellAndBorderWidth, cellWidth, outerBorderWidth } from "grid";
import { computed, ref, unref, watchEffect } from "vue";

type Props = {
  style: GridStyle;
  zoom?: number;
  offset: [number, number];
};
export function cellAndBorderSize(props: Props, scale = 1) {
  return `${cellAndBorderWidth(props.style) * (props.zoom || 1) * scale}px`;
}

export function cellSize(props: Props, scale = 1) {
  return `${cellWidth(props.style) * (props.zoom || 1) * scale}px`;
}
/**
 * Effective font size (px) for a definition cell's text, at a given zoom.
 * Shared by useSvgSizes (on-grid rendering) and definitionLayout.ts's
 * auto-wrap (which needs the exact same size to measure text correctly).
 */
export function definitionFontSize(style: GridStyle, zoom = 1) {
  return +Number(style.grid.cellSize / 4 * style.definition.size * zoom).toFixed(1);
}
export function useSvgSizes(props: Props) {
  const cellSizeC = computed(() => cellSize(props));
  const textSize = computed(() => props.style.grid.cellSize * (props.zoom || 1));
  const textFont = computed(() => `${textSize.value}px roboto`);
  const defSize = computed(() => definitionFontSize(props.style, props.zoom || 1));
  const defFont = computed(() => `${defSize.value}px ${props.style.definition.family}`);

  return {
    cellSize: cellSizeC,
    textSize,
    textFont,
    defSize,
    defSizePx: `${Math.floor(defSize.value)}px`,
    defFont,
  };
}
export function useTransform(props: Props, origin: Cell) {
  const o = {
    x: unref(origin.x),
    y: unref(origin.y),
  };
  const { x, y } = o;
  return `translate(${(x * cellAndBorderWidth(props.style) +
    outerBorderWidth(props.style)) *
    (props.zoom || 1) -
    props.offset[0] * 0
    }px, ${(y * cellAndBorderWidth(props.style) +
      outerBorderWidth(props.style)) *
    (props.zoom || 1) -
    props.offset[1] * 0
    }px)`;
}