<template>
  <div ref="suggestion" class="suggestion" :version="version">
    <span>
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
import { defineProps, defineEmits, ref, watchEffect } from "vue";
import {
  ArrowDown,
  ArrowUp,
  ArrowForward,
  Hammer,
  Flash,
  ReturnUpBackOutline,
} from "@vicons/ionicons5";

import axios from "axios";
import { Grid, Direction, Vec } from "../grid";
import { getUrl } from "../js/utils";

const method = ref("fastest");
const ordering = ref(1);
const results = ref([]);
const totalResults = ref(0);
const suggestion = ref(null);
const loading = ref(false);
const version = ref(0);
const props =
  defineProps<{ query: string; gridId: string; point: Vec; dir: Direction }>();
const emit = defineEmits<{
  (event: "hover", value: string): void;
  (event: "click", value: string): void;
  (event: "dir", value: Direction): void;
}>();

let hovered = "";
let queryPromise: Promise<void> = Promise.resolve();


function getSuggestions(
  point: Vec,
  dir: Direction,
  ordering: number,
  method: string,
  gridId: string
) {
  if (!props.point) {
    loading.value = true;
    return Promise.resolve();
  }
  loading.value = true;
  queryPromise = queryPromise
    .then(() => {
      return new Promise((resolve) => setTimeout(() => resolve(), 200)).then(
        () =>
          axios.post(getUrl("search"), {
            gridId: gridId,
            coord: point,
            dir: dir,
            ordering: ordering,
            query: "",
            method: method,
            max: 100,
          })
      );
    })
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

watchEffect(() => {
  getSuggestions(
    props.point,
    props.dir,
    ordering.value,
    method.value,
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

function refresh() {
  version.value++;
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
}
.suggestion > .loading {
  flex: 1;
}

</style>