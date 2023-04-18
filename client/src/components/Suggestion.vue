<template>
  <div ref="suggestion" class="suggestion" :version="version">
    <span class="buttons">
      <n-button icon-placement="right" @click="emit('orderswitch')">
        <template #icon>
          <n-icon>
            <ArrowDown v-if="ordering === 1" />
            <ArrowUp v-else />
          </n-icon>
        </template>
      </n-button>
      <n-button icon-placement="right" @click="emit('methodswitch')">
        <template #icon>
          <n-icon>
            <Hammer v-if="method === 'fastest'" />
            <Flash v-else />
          </n-icon>
        </template>
      </n-button>
      <n-button
        icon-placement="right"
        @click="emit('dir', dir === 'horizontal' ? 'vertical' : 'horizontal')"
      >
        <template #icon>
          <n-icon>
            <ArrowForward v-if="dir === 'horizontal'" />
            <ArrowDown v-else />
          </n-icon>
        </template>
      </n-button>
    </span>

    <n-data-table
      v-if="!loading"
      :bordered="false"
      :single-line="false"
      :columns="[
        {
          title: `${totalResults} résultats`,
          key: 'word',
        },
      ]"
      :data="results"
      :pagination="{
        pageSize: 10,
        simple: true,
      }"
      @mousemove="onMouseEvt($event, false)"
      @click="onMouseEvt($event, true)"
    />
    <n-button class="loading" v-else :loading="true"></n-button>
  </div>
</template>

<script setup lang="ts">
import { CancelablePromise as CPromise } from "cancelable-promise";
import { defineProps, defineEmits, ref, watchEffect, computed } from "vue";
import {
  ArrowDown,
  ArrowUp,
  ArrowForward,
  Hammer,
  Flash,
  ReturnUpBackOutline,
} from "@vicons/ionicons5";

import axios from "axios";
import { Direction, Vec } from "grid";
import { getUrl } from "../js/utils";
/**
 * Component to display words suggestions
 */
const results = ref([]);
const totalResults = ref(0);
const suggestion = ref(null);
const loading = ref(false);
const version = ref(0);
let hovered = "";
let queryPromise: CPromise<void> = CPromise.resolve();

const props = defineProps<{
  /**
   * The letters in the current line
   */
  query: string;
  /**
   * The grid id
   */
  gridId: string;
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
  method: string;
  /**
   * ordering asc/desc(-1|1)
   */
  ordering: number;
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
  ordering: number,
  method: string,
  gridId: string
) {
  loading.value = false;
  queryPromise.cancel();
  if (!props.point) {
    return CPromise.resolve();
  }
  loading.value = true;
  queryPromise = new CPromise((resolve) => setTimeout(() => resolve(null), 200))
    .then(() =>
      axios.post(getUrl("search"), {
        gridId: gridId,
        coord: point,
        dir: dir,
        ordering: ordering,
        query: "",
        method: method,
        max: 100,
      })
    )
    .then((response) => response.data)
    .then(({ words, cells, impossible, nbResults }) => {
      if (!words) return;
      loading.value = false;
      totalResults.value = nbResults;
      results.value = words.map((word) => ({
        word,
        link: `https://google.com/search?q=${word}+definition`,
      }));
      // this.impossibleLetters = impossible;
      // this.selectedCells = cells;
      // this.statusSearch = "ok";
    })
    .catch((e) => {
      console.error(e);
      // this.statusSearch = "error";
      // this.resultLength = 0;
      // this.selectedCells = [];
      // this.suggestions = [];
      // this.impossibleLetters = [];
      loading.value = false;
    });

  return queryPromise;
}

// send request everytime props change
watchEffect(() => {
  getSuggestions(
    props.point,
    props.dir,
    props.ordering,
    props.method,
    props.gridId
  );
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
.n-data-table-tr > td {
  cursor: pointer;
}
.suggestion {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}
.suggestion > .loading {
  flex: 1;
}
.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 2px;
}
</style>