<template>
  <div v-if="grids && options">
    <Paper
      v-for="(words, i) in wordsPerPage"
      :key="i"
      :format="options.paper"
      :showMargins="exportOptions.margins"
    >
      <span class="words" ref="wordsContainer">
        <span
          v-for="(word, j) in words"
          :class="typeof word === 'number' ? 'size' : 'word'"
          :key="word"
        >
          {{ word }}
        </span>
      </span>
    </Paper>
    <Paper class="paper ruler" :format="options.paper" :showMargins="false">
      <span class="words ruler" ref="ruler"> </span>
    </Paper>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, watch } from "vue";
import Paper from "./Paper.vue";
import { Grid, GridOptions, getAllWords } from "grid";
import { computed } from "vue";
import {
  ExportOptions,
  SolutionOptions,
} from "../components/svg-renderer/types";
import {
  getBodyPageHeight,
  getBodyPageWidth,
  getSizeNoPadding,
} from "../js/utils";
type WordMap = { [key: number]: string[] };
const ruler = ref(null);
const props = defineProps<{
  grids: Grid[];
  options: GridOptions;
  exportOptions: ExportOptions;
  solutionsOptions: SolutionOptions;
}>();

function makeid(length) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
const words = Array.from(getAllWords(props.grids));
  new Array(1000).fill(0).forEach((_, i) => {
    const length = 2 + Math.floor(Math.random() * 7);
    words.push(makeid(length));
  });
//   console.log(JSON.stringify(words));

// const words = JSON.parse(
//   `["ABCDEFGH","JAUNCDU","PYBPUKF","MF","KCGPGD","KWHA","HEQMXIMX","MFWUBC","ZLDD","RCTKDI","BMMWS","ISLBMNE","DKFH","VTUHZL","NGUTFRI","VEGVLE","QON","EE","NXRAQRFL","EXCGDR","EFLCVNZL"]`
// );
const  tolerance = 2;
const wordsPerPage = computed(() => {
  if (!props.grids || !ruler.value || !ruler.value.parentElement) return [];
  const r = ruler.value as HTMLDivElement;
  const bb = r.getBoundingClientRect();
  const maxX = bb.x + bb.width;
  // const maxHeight= r.clientHeight;

  const wordsMap = words
    .sort((a, b) => a.length - b.length)
    .reduce((acc, word) => {
      if (acc[word.length]) {
        acc[word.length].push(word);
      } else {
        acc[word.length] = [word];
      }
      return acc;
    }, {} as WordMap);

  let wordsOnCurrentPage: (string | number)[] = [];

  const res = Object.entries(wordsMap).reduce((wordsPerPage, [size, words]) => {
    [+size, ...words.sort((a, b) => a.localeCompare(b))].forEach((word) => {
      const span = document.createElement("span");
      span.innerHTML = `${word}`;
      span.classList.add(typeof word === "number" ? "size" : "word");
      r.appendChild(span);
      const { x, y, width, height } = span.getBoundingClientRect();
      if (x + width > maxX - tolerance) {
        r.innerHTML = "";
        r.appendChild(span);
        wordsPerPage.push(wordsOnCurrentPage);
        wordsOnCurrentPage = [word];
      } else {
        wordsOnCurrentPage.push(word);
      }
    });
    return wordsPerPage;
  }, [] as (string | number)[][]);
  res.push(wordsOnCurrentPage);
  return res;
});
</script>

<style lang="less">
.words {
  max-width: 100%;
  max-height: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-start;
  align-items: center;
  page-break-inside: auto;
  gap: 10px;
}
.words > span {
  page-break-after: auto;
}
.paper.ruler {
  position: absolute;
  top: 1000%;
  left: 0;
  z-index: 1000;
}
.words.ruler {
  background: red;
}
.size {
  font-size: 1.5em;
  font-weight: bold;
  text-align: center;
}
.word {
  font-size: 1em;
  text-align: center;
}
</style>
