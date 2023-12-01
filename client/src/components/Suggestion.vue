<template>
  <div ref="suggestion" class="suggestion" :version="version">
    <span class="buttons">
      <n-button icon-placement="right" @click="emit('orderswitch')">
        {{ orderingText() }}
      </n-button>
      <n-button icon-placement="right" @click="emit('methodswitch')">
        <template #icon>
          <n-icon>
            <Hammer v-if="method === 'accurate'" />
            <Flash v-else />
          </n-icon>
        </template>
      </n-button>
      <n-button icon-placement="right" @click="emit('dir', dir === 'horizontal' ? 'vertical' : 'horizontal')">
        <template #icon>
          <n-icon>
            <ArrowForward v-if="dir === 'horizontal'" />
            <ArrowDown v-else />
          </n-icon>
        </template>
      </n-button>
    </span>

    <n-data-table v-if="!loading" :bordered="false" :single-line="false" :columns="[
      {
        title: `${totalResults} ${$t('suggestions.results')}`,
        key: 'word',
      },
    ]" :data="results" :pagination="{
  pageSize: 13,
  simple: true,
}" @mousemove="onMouseEvt($event, false)" @click="onMouseEvt($event, true)" />
    <n-button class="loading" v-else :loading="true"></n-button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watchEffect, computed } from "vue";
import {
  ArrowDown,
  ArrowUp,
  ArrowForward,
  Hammer,
  Flash,
  ReturnUpBackOutline,
} from "@vicons/ionicons5";

import { CellProba, Direction, Vec } from "grid";
import { Method, Ordering } from "../types";
/**
 * Component to display words suggestions
 */
const results = ref<{ word: string; }[]>([]);
const totalResults = ref(0);
const suggestion = ref(null);
const version = ref(0);
let hovered = "";

const props = defineProps<{
  cellProbas: CellProba[][];
  searchResult: string[];
  /**
   * The coords of the current cell
   */
  point: Vec;
  /**
   * input direction
   */
  dir: Direction;
  /**
   * search method
   */
  method: Method;
  /**
   * ordering
   */
  ordering: Ordering;
  /**
   * loading
   */
  loading: boolean;
}>();
const emit = defineEmits<{
  /**
   * Hover of a suggestion
   */
  (event: "hover", value: string): void;
  /**
   * Click on a suggestion
   */
  (event: "click", value: string): void;
  /**
   * Change direction
   */
  (event: "dir", value: Direction): void;
  /**
   * Change method
   */
  (event: "methodswitch"): void;
  /**
   * Change ordering
   */
  (event: "orderswitch"): void;
}>();

function getSuggestions(
  point: Vec,
  dir: Direction,
  ordering: Ordering,
  method: string
) {
  let words = [];
  if (method === "simple") {
    words = props.searchResult;
  } else if (
    !props.cellProbas.length ||
    !props.cellProbas[point.y] ||
    !props.cellProbas[point.y][point.x]
  ) {
    words = [];
  } else {
    const { bestWordsH, bestWordsV } = props.cellProbas[point.y][point.x];
    words = (dir === "horizontal" ? bestWordsH : bestWordsV) || [];
  }
  if (ordering === "alpha") {
    words.sort((a, b) => a.localeCompare(b));
  } else if (ordering === "inverse-alpha") {
    words.sort((a, b) => b.localeCompare(a));
  } else if (ordering === "random") {
    words.sort(() => Math.random() - 0.5);
  }
  totalResults.value = words.length;
  results.value = words.map((word) => ({ word }));
}

function orderingText() {
  switch (props.ordering) {
    case "alpha":
      return "A-Z";
    case "inverse-alpha":
      return "Z-A";
    case "best":
      return "Score";
    case "random":
      return "Random";
  }
}
// send request everytime props change
watchEffect(() => {
  getSuggestions(props.point, props.dir, props.ordering, props.method);
});

function onMouseEvt(evt: MouseEvent, click = false) {
  const t = evt.target as HTMLDivElement;
  if (!t.classList.contains("n-data-table-td")) return;
  const text = t.innerText;
  if (text === hovered && !click) return;
  hovered = text;
  return click ? emit("click", text) : emit("hover", text);
}
</script>

<style>
.n-data-table-tr>td {
  cursor: pointer;
}

.suggestion {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.suggestion>.loading {
  flex: 1;
  padding: 150px 0;
}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2px;
}
</style>