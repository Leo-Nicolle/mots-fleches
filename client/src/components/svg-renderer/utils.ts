import { Cell, Direction, Grid, GridOptions, cellAndBorderWidth, cellWidth, outerBorderWidth } from "grid";
import { computed, ref, unref, watchEffect } from "vue";

type Props = {
  options: GridOptions;
  zoom?: number;
  offset: [number, number];
}
export function cellAndBorderSize(props: Props, scale = 1) {
  return `${cellAndBorderWidth(props.options) * (props.zoom || 1) * scale}px`;
}

export function cellSize(props: Props, scale = 1) {
  return `${cellWidth(props.options) * (props.zoom || 1) * scale}px`;
}
export function useSvgSizes(props: Props) {
  const cellSizeC = computed(() => cellSize(props));
  const textSize = computed(() => props.options.grid.cellSize * (props.zoom || 1));
  const textFont = computed(() => `${textSize.value}px roboto`);
  const defSize = computed(() => props.options.definition.size * (props.zoom || 1));
  const defFont = computed(() => `${defSize.value}px ${props.options.definition.font}`);

  return {
    cellSize: cellSizeC,
    textSize,
    textFont,
    defSize,
    defFont,
  };
}
export function useTransform(props: Props, origin: Cell) {
  const o = {
    x: unref(origin.x),
    y: unref(origin.y),
  }
  const { x, y } = o;
  return `translate(${(x * cellAndBorderWidth(props.options) +
    outerBorderWidth(props.options)) *
    (props.zoom || 1) -
    props.offset[0]
    }px, ${(y * cellAndBorderWidth(props.options) +
      outerBorderWidth(props.options)) *
    (props.zoom || 1) -
    props.offset[1]
    }px)`;
}