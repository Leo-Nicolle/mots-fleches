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
export function useSvgSizes(props: Props) {
  const cellSizeC = computed(() => cellSize(props));
  const textSize = computed(() => props.style.grid.cellSize * (props.zoom || 1));
  const textFont = computed(() => `${textSize.value}px roboto`);
  const defSize = computed(() => +Number(props.style.grid.cellSize / 4 * props.style.definition.size * (props.zoom || 1)).toFixed(1));
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