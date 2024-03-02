<template>
  <div v-if="grids && solutionStyle">

    <FontLoader :value="solutionStyle.grids.gridN" />
    <FontLoader :value="solutionStyle.words" />
    <Paper v-for="(words, i) in layout.wordsPerPage" :key="i" :format="solutionStyle.paper"
      :showMargins="exportOptions.margins" :showPagination="exportOptions.pagination" :pageNumber="page + i"
      :pagination="solutionStyle.pagination" bodyClass="body-index">
      <span class="words" ref="wordsContainer">
        <span v-for="(word, j) in words" :class="typeof word === 'number' ? 'size' : 'word'" :key="word">
          {{ word }}
        </span>
      </span>
    </Paper>
    <Teleport to="#outside">
      <Paper class="paper ruler" :format="solutionStyle.paper" :showMargins="true" :showPagination="true" :pageNumber="1">
        <span class="words ruler" ref="ruler"> </span>
      </Paper>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits, watch } from "vue";
import { Grid, getAllWords, SolutionStyle } from "grid";
import { computed } from "vue";
import Paper from "./Paper.vue";
import FontLoader from "./fonts/FontLoader.vue";
import { ExportOptions } from "../types";
import { getFont } from "../js/useFont";
import { onMounted } from "vue";
/**
 * Component to render the list of words used in an array of grids
 */
type WordMap = { [key: number]: string[]; };
const ruler = ref(null);
const props = defineProps<{
  /**
   * The gridss to get words from
   */
  grids: Grid[];
  /**
   * What to render (margins)
   */
  exportOptions: ExportOptions;
  /**
   * The styles to render list
   */
  solutionStyle: SolutionStyle;
  page: number;
}>();

const emit = defineEmits<{
  (event: "pageCount", value: number): void;
}>();

const wordFont = computed(() => getFont(props.solutionStyle.words));
const wordsColor = computed(() => props.solutionStyle.words.color);
const sizeFont = computed(() => getFont(props.solutionStyle.size));
const sizeColor = computed(() => props.solutionStyle.size.color);
const layout = ref<{ wordsPerPage: (number | string)[][]; heights: string[]; }>({
  wordsPerPage: [],
  heights: [],
});
const columnGap = 10;
const gap = computed(() => `${columnGap}px`);
const tolerance = 2;
function nodesBSStart(
  nodes: HTMLDivElement[], start: number, end: number, query: number
) {
  while (start <= end) {
    const middle = (start + end) >>> 1;
    const node = nodes[middle];
    if (!node) break;
    const { x, width } = node.getBoundingClientRect();
    const right = x + width;
    if (isNaN(right) || right < query) start = middle + 1;
    else end = middle - 1;
  }
  return start;
}

function refresh() {
  if (!props.grids || !ruler.value) {
    layout.value = { wordsPerPage: [], heights: [] };
    return;
  }
  const words = Array.from(getAllWords(props.grids))
    .sort((a, b) => {
      const l = a.length - b.length;
      return l === 0 ? a.localeCompare(b) : l;
    })
    .filter((w) => w.length > 1);
  const r = ruler.value as HTMLDivElement;
  r.innerHTML = "";
  const { x: startX, width: W, height: H } = r.parentElement!.getBoundingClientRect();
  const wordsMap = words.reduce((acc, word) => {
    if (acc[word.length]) {
      acc[word.length].push(word);
    } else {
      acc[word.length] = [word];
    }
    return acc;
  }, {} as WordMap);
  const allTexts: (string | number)[] = [];
  Object.entries(wordsMap)
    .forEach(([size, words]) => {
      allTexts.push(+size);
      const span = document.createElement("span");
      span.classList.add("size");
      span.innerHTML = size.toString();
      r.appendChild(span);
      words.forEach((word) => {
        const span = document.createElement("span");
        span.classList.add("word");
        span.innerHTML = word;
        r.appendChild(span);
        allTexts.push(word);
      });
    });

  // find the first node outside boundaries: 
  const nodes = Array.from(r.children) as HTMLDivElement[];
  const maxX = nodes[nodes.length - 1].getBoundingClientRect().x;
  const pages = Math.ceil(maxX / W);
  const indexes = [0];
  const wordsPerPage = [];
  for (let i = 0; i < pages; i++) {
    indexes.push(nodesBSStart(nodes, 0, nodes.length - 1, startX + (i + 1) * W - tolerance));
    wordsPerPage.push(allTexts.slice(indexes[i], indexes[i + 1]));
  }
  if (indexes[indexes.length - 1] < allTexts.length - 1) {
    wordsPerPage.push(wordsPerPage.slice(indexes.length - 1));
  }
  // r.innerHTML = "";
  layout.value = {
    wordsPerPage,
    heights: ['100%']
  };
  emit('pageCount', wordsPerPage.length);
}
onMounted(() => {
  document.fonts.onloadingdone = () => {
    refresh();
  };
});


watch([props.grids, ruler, wordFont, sizeFont, props.solutionStyle,
props.exportOptions], () => {
  refresh();
});
</script>

<style lang="less">
@media print {

  #outisde,
  .ruler {
    display: none;
  }
}

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
  gap: v-bind(gap);
  flex: 2;
}

.words>span {
  page-break-after: auto;
}

.paper.ruler {
  position: absolute;
  top: 1000%;
  left: 0;
  z-index: 1000;
}

.words.ruler {}

.size {
  font: v-bind(sizeFont);
  color: v-bind(sizeColor);
  font-weight: bold;
  text-align: center;
}

.word {
  font: v-bind(wordFont);
  color: v-bind(wordsColor);
  text-align: center;
}

.body.body-index {
  align-content: flex-start;
  margin: 0;
}

.pushup {
  flex: 1;
}
</style>
