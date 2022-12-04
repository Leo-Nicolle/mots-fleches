<template>
  <div ref="suggestion" class="suggestion" :version="version">
    <n-button icon-placement="right" @click="ordering *= -1">
      <template #icon>
        <n-icon>
          <ArrowDown v-if="ordering === 1" />
          <ArrowUp v-else />
        </n-icon>
      </template>
    </n-button>
    <n-button
      icon-placement="right"
      @click="method = method === 'fastest' ? 'simple' : 'fastest'"
    >
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
    <n-data-table
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
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, watch } from "vue";
import {
  ArrowDown,
  ArrowUp,
  ArrowForward,
  Hammer,
  Flash,
  ReturnUpBackOutline,
} from "@vicons/ionicons5";

import axios from "axios";
import { Cell, Direction, Vec } from "../grid/types";
import { getUrl } from "../js/utils";

let method = ref("fastest");
let ordering = ref(1);
let results = ref([]);
let totalResults = ref(0);
let hovered = "";
let queryPromise: Promise<void> = Promise.resolve();
let loading = false;
const props = defineProps<{ query: string; gridId: string; point: Vec,
dir: Direction }>();
const emit = defineEmits<{
  (event: "hover", value: string): void;
  (event: "click", value: string): void;
  (event: "dir", value: Direction): void;

}>();

const suggestion = ref(null);
let version = ref(0);

watch(props, () => {
  getSuggestions();
});
watch([method, ordering], () => {
  getSuggestions();
});
setTimeout(() => {
  getSuggestions();
}, 200);

function getSuggestions() {
  if (!props.point) return Promise.resolve();
  queryPromise = queryPromise
    .then(() => {
      loading = true;
      return new Promise((resolve) => setTimeout(() => resolve(), 200)).then(
        () =>
          axios.post(getUrl("search"), {
            gridId: props.gridId,
            coord: props.point,
            dir: props.dir,
            ordering: ordering.value,
            query: "",
            method: method.value,
            max: 100,
          })
      );
    })
    .then((response) => response.data)
    .then(({ words, cells, impossible, nbResults }) => {
      if (!words) return;
      loading = false;
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
      loading = false;
    });

  return queryPromise;
}
function onMouseEvt(evt: MouseEvent, click = false) {
  const t = evt.target as HTMLDivElement;
  if (!t.classList.contains("n-data-table-td")) return;
  const text = t.innerText;
  if (text === hovered && !click) return;
  hovered = text;
  return click ? emit("click", text) : emit("hover", text);
}

function refresh() {
  version.value++;
}
</script>

<style>
.n-data-table-tr > td {
  cursor: pointer;
}
</style>