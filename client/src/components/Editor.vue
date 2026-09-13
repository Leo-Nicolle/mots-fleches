<template>
  <Layout :breadcrumbs="breadcrumbs" @scroll="onScroll" :left-panel-scroll="highlightMode !== 'autofill'">
    <template #left-panel>
      <div class="editor-panel">
        <span class="title">
          <h2 class="grid-title">
            {{ grid.title ? grid.title : $t("buttons.newGrid") }}
          </h2>
          <span class="title-actions">
            <span v-for="user in remoteUsers" :key="user.clientId" class="collab-user"
              :style="{ background: user.color }" :title="user.name + (user.focus ? ` (${user.focus.x},${user.focus.y})` : '')">
              {{ user.name.slice(0, 1).toUpperCase() }}
            </span>
            <n-tooltip v-if="collabStatus" trigger="hover">
              <template #trigger>
                <span class="collab-dot" :class="collabStatus"></span>
              </template>
              {{ $t(`collab.${collabStatus}`) }}
            </n-tooltip>
            <GridModal v-model:grid="grid" @open="focus = nullCell" />
          </span>
        </span>
        <ModeControl v-model:mode="highlightMode" :suggested="suggestedMode" />
        <Buttons v-model:dir="dir" v-model:method="method" v-model:ordering="ordering" :mode="highlightMode"></Buttons>
        <Autofill v-if="highlightMode === 'autofill'" :grid="grid" />
        <Suggestion v-else-if="!focus.definition" :point="focus" :dir="dir" :grid-id="grid.id" :method="method"
          :ordering="ordering" :cellProbas="cellProbas" :searchResult="searchResult" :loading="isLoadingSuggestions"
          @hover="onHover" @click="onClick" @mouseout="onMouseOut">
        </Suggestion>
        <Definition v-else-if="focus.definition" :grid="grid" :focus="focus" :dir="dir" />
      </div>
    </template>
    <template #body>
      <div class="container" ref="container">
        <div class="controls">
          <n-tooltip trigger="hover">
            <template #trigger>
              <n-button class="zoom-controls" @click="resetGrid">
                {{ $t("buttons.reset") }}
              </n-button>
            </template>
            {{ $t("tooltips.reset") }}
          </n-tooltip>
          <span class="zoom-controls">
            {{ $t("buttons.zoom") }}
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button @click="onZoomIn" circle>
                  <n-icon>
                    <AddCircleOutline />
                  </n-icon>
                </n-button>
              </template>
              {{ $t("tooltips.zoomIn") }}
            </n-tooltip>
            <n-tooltip trigger="hover">
              <template #trigger>
                <n-button @click="onZoomOut" circle>
                  <n-icon>
                    <RemoveCircleOutline />
                  </n-icon>
                </n-button>
              </template>
              {{ $t("tooltips.zoomOut") }}
            </n-tooltip>
          </span>
          <span class="zoom-controls help">
            <ShortcutHelp auto-open />
          </span>
        </div>
        <div class="superpose">
          <SVGGrid @focus="onGridFocus" @hover="(cell) => (hoveredCell = cell)" @toggle-direction="toggleDirection"
            :grid="grid" :focus="focus"
            :dir="dir" :style="style" :zoom="1 / zoom" class="svg-grid" :export-options="{
    ...defaultExportOptions,
    texts: true,
    highlight: true,
  }"></SVGGrid>
          <GridHighlight :grid="grid" :style="style" :cell="hoveredCell" :cellProbas="cellProbas" :zoom="zoom"
            :mode="highlightMode" :offset="offset" :dir="dir" @update="onGridUpdate" />
          <CollabCursors v-if="remoteUsers && remoteUsers.length" :style="style" :zoom="zoom"
            :remote-users="remoteUsers" />
          <GridInput :grid="grid" :dir="dir" :style="style" :cell="focus" :offset="offset" :zoom="zoom"
            @focus="onGridFocus" @update="onGridUpdate" @keyup="onKeyUp">
          </GridInput>
        </div>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, watchEffect, onMounted, computed, onBeforeUnmount, watch, unref, defineModel } from "vue";
import type { CollabStatus, RemoteUser } from '../js/useCollab';
import {
  AddCircleOutline,
  RemoveCircleOutline,
} from "@vicons/ionicons5";
import throttle from "lodash.throttle";
import {
  Grid,
  Cell,
  Direction,
  nullCell,
  GridStyle,
  CellProba,
  GridValidity,
  ProblemBound,
} from "grid";
import Layout from "../layouts/Main.vue";
import SVGGrid from "./svg-renderer/Grid.vue";
import GridInput from "./svg-renderer/GridInput.vue";
import { Breadcrumbs, defaultExportOptions, Method, Mode, Ordering } from "../types";
import GridModal from "./modals/GridModal.vue";
import Autofill from "./sidebars/Autofill.vue";
import GridHighlight from "./svg-renderer/GridHighlight.vue";
import Suggestion from "./sidebars/Suggestion.vue";
import Definition from './sidebars/Definition.vue';
import Buttons from './sidebars/Buttons.vue';
import ModeControl from './sidebars/ModeControl.vue';
import CollabCursors from './svg-renderer/CollabCursors.vue';
import ShortcutHelp from './ShortcutHelp.vue';
import { workerController } from "../worker";
import { postEvent } from "../js/telemetry";
import { useRouter } from "vue-router";
import { api } from "../api";
import { useI18n } from "vue-i18n";
import { matches } from "../js/shortcuts";
/**
 * Component to edit a grid
 */
const props = defineProps<{
  style: GridStyle;
  collabStatus?: CollabStatus;
  remoteUsers?: RemoteUser[];
}>();
const emit = defineEmits<{
  (event: "update"): void;
  (event: "focus-change", x: number, y: number): void;
}>();
const i18n = useI18n();
const breadcrumbs = ref<Breadcrumbs>([]);
const router = useRouter();
const grid = defineModel<Grid>({ required: true });
const dir = ref<Direction>("horizontal");
const focus = ref<Cell>(nullCell);
const hoveredCell = ref<Cell>(nullCell);
const container = ref(null as unknown as HTMLDivElement);
const offset = ref<[number, number]>([-10, 0]);
const method = ref<Method>("accurate");
const ordering = ref<Ordering>("best");
const orderings = ref<Ordering[]>(["best", "alpha", "inverse-alpha", "random"]);
const zoom = ref(1);
const highlightMode = ref<Mode>("heatmap");
const cellProbas = ref<CellProba[][]>([]);
const searchResult = ref<string[]>([]);
const refreshingRun = ref(false);
const refreshingSearch = ref(false);
const gridComplete = ref(false);
const suggestCheck = ref(false);
const modeGuideSeen = ref(
  localStorage.getItem("motsflex-mode-guide-seen") === "1"
);
const suggestedMode = computed<Mode | undefined>(() =>
  suggestCheck.value ? "check" : undefined
);
const throttledCheckGrid = throttle(
  () => workerController.checkGrid(grid.value),
  500
);
function resetGrid() {
  grid.value.cells.forEach((row) => {
    row.forEach((cell) => {
      if (cell.definition) {
        cell.arrows = ['none', 'none', 'none'];
      }
      // cell.text = '';
    });
  });
  onGridUpdate();
}
function refreshCellProba() {
  refreshingRun.value = true;
  workerController.run(grid.value);
}
function refreshSimpleSearch() {
  refreshingSearch.value = true;
  workerController.search(grid.value, focus.value, dir.value);
}
const throttledRefresSimpleSearch = throttle(refreshSimpleSearch, 60);
function onGridUpdate() {
  refreshCellProba();
  throttledCheckGrid();
  emit("update");
}

watch(focus, (cell) => {
  if (cell) {
    emit("focus-change", cell.x, cell.y);
  }
});
function computeOffset(e) {
  const topOffset =
    container.value.querySelector(".svg-grid").getBoundingClientRect().top -
    container.value.getBoundingClientRect().top;
  offset.value = [
    (e ? e.target.scrollLeft : 0) - 10,
    (e ? e.target.scrollTop : 0) - topOffset,
  ];
}
function onScroll(e) {
  computeOffset(e);
}
watchEffect(() => {
  grid.value.highlight(grid.value.getBounds(focus.value, dir.value).cells);
});
watch(method, () => {
  if (method.value === "accurate") {
    return refreshCellProba();
  }
  throttledRefresSimpleSearch();
});
onMounted(() => {
  console.log("HERE");
  computeOffset(null);
  workerController.checkGrid(grid.value);
  refreshCellProba();
  const prev = router.options.history.state.back as string | null;
  if (prev && prev.startsWith('/book')) {
    api.db.getBook(prev.split('/')[2]).then((book) => {
      if (!book) return;
      breadcrumbs.value = [
        { text: i18n.t('nav.books'), to: `/books` },
        { text: book?.title, to: `/book/${book.id}` },
        { text: grid.value.title }
      ];
    });
  } else {
    breadcrumbs.value = [
      { text: i18n.t('nav.grids'), to: `/grids` },
      { text: grid.value.title }
    ];
  }
});

onBeforeUnmount(() => { });
function onZoomIn() {
  zoom.value = zoom.value + 0.1;
}
function onZoomOut() {
  zoom.value = Math.max(0.5, zoom.value - 0.1);
}
function onHover(value: string) {
  const cells = grid.value.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  grid.value.suggest([value], [cells[0]], [dir.value]);
}
function onMouseOut(value: string) {
  grid.value.suggest([], [], []);
}
function onClick(value: string) {
  const cells = grid.value.getBounds(focus.value, dir.value).cells;
  if (!cells || !cells.length) return;
  grid.value.setWord(value, cells[0], dir.value);
  postEvent("suggestion-click");
  onGridUpdate();
}
function toggleDirection() {
  dir.value = dir.value === "horizontal" ? "vertical" : "horizontal";
}
function onGridFocus(cell: Cell) {
  focus.value = cell;
  if (cell.definition) return;
  // If the cell is a single-letter slot in the current direction (boxed
  // between definition cells), switch to the perpendicular direction.
  if (grid.value.getBounds(cell, dir.value).length === 1) {
    const perp = Grid.perpendicular(dir.value);
    if (grid.value.getBounds(cell, perp).length > 1) {
      dir.value = perp;
    }
  }
}
function onKeyUp(evt: KeyboardEvent) {
  let consumed = false;
  if (matches(evt, "setDirection")) {
    dir.value = evt.key === "ArrowUp" || evt.key === "ArrowDown"
      ? "vertical"
      : "horizontal";
    consumed = true;
  }
  // Only cycle ordering / method when not editing a definition,
  // otherwise typing a space or < > would trigger them.
  if (!focus.value.definition) {
    if (matches(evt, "cycleOrdering")) {
      const ords = unref(orderings);
      ordering.value =
        ords[(ords.findIndex((o) => o === ordering.value) + 1) % ords.length];
      consumed = true;
    }
    if (matches(evt, "switchMethod")) {
      method.value = method.value === "simple" ? "accurate" : "simple";
      consumed = true;
    }
  }
  // @ts-ignore
  evt.canceled = consumed;
}
workerController.on("run-result", (data) => {
  cellProbas.value = data;
  refreshingRun.value = false;
});
workerController.on("bail-result", () => {
  cellProbas.value = [];
});
workerController.on("search-result", (data) => {
  refreshingSearch.value = false;
  searchResult.value = data;
});

workerController.on("locale-changed", () => {
  refreshCellProba();
  throttledRefresSimpleSearch();
  throttledCheckGrid();
});
workerController.on("start-locale-change", () => {
  refreshingRun.value = true;
  refreshingSearch.value = true;
});

const stageEvents = [
  { key: "filled", event: "grid-filled", check: (problems: Set<string>) => !problems.has("incomplete") },
  { key: "arrows", event: "grid-arrows", check: (problems: Set<string>) => !problems.has("noarrow") && !problems.has("too-many-arrows") },
  { key: "definitions", event: "grid-definitions", check: (problems: Set<string>) => !problems.has("nodef") },
  { key: "valid", event: "grid-valid", check: (problems: Set<string>) => !problems.has("unknown") },
];

const reached: Record<string, boolean> = {
  filled: false,
  arrows: false,
  definitions: false,
  valid: false,
};

function problemsOf(data: GridValidity): Set<string> {
  const problems = new Set<string>();
  const scan = (rec: Record<string, ProblemBound>) =>
    Object.values(rec).forEach((b) => problems.add(b.problem));
  scan(data.horizontal);
  scan(data.vertical);
  return problems;
}

let checkedOnce = false;
workerController.on("check-result", (data: GridValidity) => {
  const problems = problemsOf(data);
  if (checkedOnce) {
    for (const stage of stageEvents) {
      const isReached = stage.check(problems);
      if (isReached && !reached[stage.key]) {
        reached[stage.key] = true;
        postEvent(stage.event);
      } else if (!isReached) {
        reached[stage.key] = false;
      }
    }
  }
  const complete = problems.size === 0;
  if (complete && !gridComplete.value && checkedOnce) {
    postEvent("grid-completed");
  }
  gridComplete.value = complete;
  checkedOnce = true;
});

watch(
  () => grid.value?.id,
  () => {
    checkedOnce = false;
    for (const key in reached) reached[key] = false;
  }
);

watch([gridComplete, highlightMode], () => {
  suggestCheck.value =
    gridComplete.value &&
    highlightMode.value === "normal" &&
    !modeGuideSeen.value;
});

watch(highlightMode, (mode) => {
  if (mode === "check" && suggestCheck.value) {
    modeGuideSeen.value = true;
    localStorage.setItem("motsflex-mode-guide-seen", "1");
    suggestCheck.value = false;
  }
});

watch(highlightMode, (mode) => {
  postEvent("editor-mode", { props: { mode } });
});

watch([focus, dir], () => {
  throttledRefresSimpleSearch();
});

const isLoadingSuggestions = computed(() => {
  return method.value === "accurate"
    ? refreshingRun.value
    : refreshingSearch.value;
});
</script>

<style>
.container {
  box-sizing: border-box;
  margin-left: 10px;
}

.editor-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 100%;
}

.editor-panel > .title,
.editor-panel > .buttons {
  flex-shrink: 0;
}

.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.title .grid-title {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.svg-grid {
  padding-right: 20px;
  padding-bottom: 20px;
}

.controls {
  position: fixed;
  bottom: 10px;
  right: 10px;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  margin-left: 10px;
  justify-content: flex-end;
  z-index: 100;
  pointer-events: none;
}

.zoom-controls {
  pointer-events: auto;
  background-color: #fff;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 5px;
}

text.highlighted {
  fill: #000;
}

.text.suggested {
  fill: #777;
}

.text.highlighted>rect {
  fill: #def;
}

.superpose {
  display: grid;
}

.superpose>* {
  grid-area: 1 / 1 / 1 / 1;
}

.collab-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  cursor: default;
}
.collab-dot.connected    { background: #2ecc71; }
.collab-dot.connecting   { background: #f39c12; }
.collab-dot.disconnected { background: #e74c3c; }

.collab-user {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  cursor: default;
}
</style>