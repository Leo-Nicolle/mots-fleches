<template>
  <div class="definition-editor">
    <div class="def-context">
      <span class="coords">({{ focus.x }}, {{ focus.y }})</span>
      <span v-if="pointedWords.length" class="pointed">
        → {{ pointedWords.join(", ") }}
      </span>
      <span v-if="splited" class="splited">{{ $t("modes.splitedDefinition") }}</span>
    </div>
    <textarea class="def-textarea" :value="focus.text" @input="onText"
      @keydown="onKeydown" :placeholder="$t('modes.definitionPlaceholder')"></textarea>
    <div class="arrow-controls">
      <div v-for="(handle, i) in handles" :key="i" class="arrow-row">
        <span class="arrow-pos-label">
          <svg class="arrow-pos-icon" viewBox="-100 -100 200 200" fill="none" stroke="currentColor" stroke-width="18"
            stroke-linecap="round">
            <path :d="posIconD(handle)" :transform="posIconTransform(handle)" />
          </svg>
        </span>
        <n-button v-for="dir in handle.dirs" :key="dir" size="small"
          :type="currentArrow(handle) === dir ? 'primary' : 'default'" @click="setArrow(dir, handle.index)">
          <template #icon>
            <svg viewBox="0 -35 110 150" fill="none" stroke="currentColor" stroke-width="10" stroke-linecap="round"
              xmlns="http://www.w3.org/2000/svg">
              <path :class="dir" :d="getD(dir)"></path>
            </svg>
          </template>
        </n-button>
      </div>
    </div>
    <div class="preview">
      <svg class="preview-svg" :viewBox="`0 0 ${previewSize} ${previewSize}`"
        :width="previewSize * previewScale" :height="previewSize * previewScale">
        <rect x="0" y="0" :width="previewSize" :height="previewSize" :fill="defBackgroundColor" />
        <text v-for="(line, k) in previewLines" :key="k" :x="previewSize / 2" :y="line.y"
          :font-size="defSize" :font-family="defFontFamily" :font-weight="defFontWeight" :fill="defColor"
          text-anchor="middle" dominant-baseline="hanging">
          {{ line.text }}
        </text>
        <g v-for="(arrow, i) in previewArrows" :key="i" stroke-linecap="round" stroke-width="10"
          fill="none" :stroke="arrowColor">
          <g :transform="`translate(${arrow.x},${arrow.y})scale(${arrowScale},${arrowScale})`">
            <path :d="getD(arrow.dir)" :transform="arrow.transform" />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  Cell,
  Direction,
  Grid,
  Vec,
  ArrowDir,
  cellAndBorderWidth,
  cellWidth,
  arrowPositions,
  getLines,
  isSplited,
  splitIndex,
  getOffsetY,
  GridStyle,
} from "grid";
import { getD } from "../../js/paths";
import { matches } from "../../js/shortcuts";
import { Handle } from "../../types";

const emit = defineEmits<{
  (event: "update"): void;
  (event: "next", delta: number): void;
}>();
const props = defineProps<{
  grid: Grid;
  focus: Cell;
  dir: Direction;
  style: GridStyle;
}>();

const splited = computed(() => isSplited(props.focus));

/**
 * The words pointed to by the current arrows (same mapping as the suggestion
 * search), shown as context for the user.
 */
const pointedWords = computed(() => {
  const arrows = props.focus.arrows;
  const vecs: Vec[] = [];
  if (props.dir === "horizontal") {
    if (arrows.find((e) => e === "downright")) vecs.push({ x: 0, y: 1 });
    if (arrows.find((e) => e === "right")) vecs.push({ x: 1, y: 0 });
  } else {
    if (arrows.find((e) => e === "rightdown")) vecs.push({ x: 1, y: 0 });
    else if (arrows.find((e) => e === "down")) vecs.push({ x: 0, y: 1 });
  }
  if (!vecs.length) return [];
  const { x, y } = props.focus;
  return vecs
    .map((vec) =>
      props.grid.getBounds({ x: x + vec.x, y: y + vec.y }, props.dir)
    )
    .filter(({ cells }) => cells.length)
    .map(({ cells }) => cells.map((c) => c.text).join(""));
});

function onText(evt: Event) {
  const text = (evt.target as HTMLInputElement).value || "";
  props.grid.setText(props.focus, text);
  emit("update");
}

function onKeydown(evt: KeyboardEvent) {
  if (matches(evt, "nextDefinition")) {
    evt.preventDefault();
    emit("next", 1);
    return;
  }
  if (matches(evt, "prevDefinition")) {
    evt.preventDefault();
    emit("next", -1);
    return;
  }
  if (matches(evt, "exitDefinition")) {
    evt.preventDefault();
    emit("next", 1);
  }
}

/**
 * Computes the position of the dots to add arrows (same as the on-grid handles).
 */
const handles = computed<Handle[]>(() => {
  const w = cellAndBorderWidth(props.style);
  return arrowPositions(props.focus)
    .filter(({ y }) => y > 0)
    .map(({ x, y }, i) => {
      return {
        top: `${y * w}px`,
        left: `${x * w}px`,
        index: x === 1 ? i : 2,
        dirs:
          x === 1
            ? ["right", "rightdown", "none"]
            : ["down", "downright", "none"],
      };
    });
});

function currentArrow(handle: Handle): ArrowDir {
  return props.focus.arrows[handle.index] || "none";
}

function setArrow(dir: ArrowDir, index: number) {
  Grid.setArrow(props.focus, index, dir);
  emit("update");
}

function posIconD(handle: Handle) {
  return getD(handle.dirs[0] === "right" ? "right" : "down");
}
function posIconTransform(handle: Handle) {
  return handle.dirs[0] === "right" ? "rotate(0)" : "scale(-1,1)rotate(90)";
}

/* ---- Magnified WYSIWYG preview of the focused definition cell ---- */
const previewScale = 3;
const previewSize = computed(() => cellWidth(props.style));
const defSize = computed(
  () => (props.style.grid.cellSize / 4) * props.style.definition.size
);
const defFontFamily = computed(() => props.style.definition.family);
const defFontWeight = computed(() => props.style.definition.weight);
const defColor = computed(() => props.style.definition.color);
const defBackgroundColor = computed(
  () => props.style.definition.backgroundColor
);
const arrowColor = computed(() => props.style.arrow.color);
const arrowScale = computed(() => 0.01 * props.style.arrow.size);

const previewLines = computed(() => {
  const cellHeight = cellWidth(props.style);
  const cell = props.focus;
  const sp = isSplited(cell);
  const split = splitIndex(cell);
  const lines = getLines(cell);
  const ln = lines.length;
  const borderSize = props.style.grid.borderSize;
  const fourth = cellHeight / 4;
  const freeSpace =
    Math.max(0, cellHeight - +sp * borderSize - ln * fourth) / (ln + 1);
  const oys = getOffsetY(cell.text, props.style.definition.lineSpacings);
  return lines.map((text, i) => {
    const y =
      (oys[i] || 0) +
      freeSpace * (i + 1) +
      i * fourth +
      (sp && i >= split ? borderSize : 0);
    return { text, y };
  });
});

const previewArrows = computed(() =>
  arrowPositions(props.focus)
    .map(({ x, y }, i) => {
      const dir = props.focus.arrows[i] || "none";
      return dir === "none" || y < 0
        ? null
        : {
          dir,
          x: cellAndBorderWidth(props.style) * x,
          y: cellAndBorderWidth(props.style) * y,
          transform: dir.startsWith("right")
            ? "rotate(180)scale(-1, -1)"
            : "scale(-1, 1)rotate(90)",
        };
    })
    .filter((e) => e) as unknown as {
      dir: ArrowDir;
      x: number;
      y: number;
      transform: string;
    }[]
);
</script>

<style scoped>
.definition-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.def-context {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  font-size: 0.85rem;
  color: #555;
}

.def-context .coords {
  font-weight: 700;
}

.def-context .splited {
  color: #b90;
  font-style: italic;
}

.def-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
  resize: vertical;
  font: inherit;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.arrow-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.arrow-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.arrow-pos-label {
  width: 22px;
  height: 22px;
  color: #888;
  flex-shrink: 0;
}

.arrow-pos-icon {
  width: 100%;
  height: 100%;
}

.preview {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px;
  display: flex;
  justify-content: center;
  background: #fafafa;
}

.preview-svg {
  border: 1px solid #eee;
}

.rightdown {
  transform: rotate(180deg) scale(-1, -1);
}

.right {
  transform: translate(0, 30px) rotate(180deg) scale(-1, -1);
}

.downright {
  transform: translate(8px, 0) scale(-1, 1) rotate(90deg);
}

.down {
  transform: translate(50px, 0) scale(-1, 1) rotate(90deg);
}

.none {
  transform: translate(10px, 0);
}
</style>
