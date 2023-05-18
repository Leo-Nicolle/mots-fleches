<template>
  <div v-if="grids && solutionOptions">
    <Paper
      v-for="(words, i) in layout.wordsPerPage"
      :key="i"
      :format="solutionOptions.paper"
      :showMargins="exportOptions.margins"
      bodyClass="body-index"
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
    <Paper
      class="paper ruler"
      :format="solutionOptions.paper"
      :showMargins="false"
    >
      <span class="words ruler" ref="ruler"> </span>
    </Paper>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from "vue";
import Paper from "./Paper.vue";
import { Grid, GridOptions, getAllWords, SolutionOptions } from "grid";
import { computed } from "vue";
import { ExportOptions } from "../types";
/**
 * Component to render the list of words used in an array of grids
 */
type WordMap = { [key: number]: string[] };
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
  solutionOptions: SolutionOptions;
}>();
const wordFont = computed(
  () =>
    `${props.solutionOptions.words.size} ${props.solutionOptions.words.font}`
);
const wordsColor = computed(() => props.solutionOptions.words.color);
const sizeFont = computed(
  () => `${props.solutionOptions.size.size} ${props.solutionOptions.size.font}`
);
const sizeColor = computed(() => props.solutionOptions.size.color);

const tolerance = 2;
const layout = computed(() => {
  if (!props.grids || !ruler.value || !ruler.value)
    return { wordsPerPage: [], heights: [] };
  const words = Array.from(getAllWords(props.grids))
    .sort((a, b) => a.length - b.length)
    .filter((w) => w.length > 1);
  const r = ruler.value as HTMLDivElement;
  let bb = r.getBoundingClientRect();
  const maxX = bb.x + bb.width;

  const wordsMap = words.reduce((acc, word) => {
    if (acc[word.length]) {
      acc[word.length].push(word);
    } else {
      acc[word.length] = [word];
    }
    return acc;
  }, {} as WordMap);

  let wordsOnCurrentPage: (string | number)[] = [];
  const heights: string[] = [];
  // cut the list into multiple pages using the ruler. When a word overflows the ruler => pagebreak
  const res = Object.entries(wordsMap).reduce(
    (wordsPerPage, [size, words], i, arr) => {
      [+size, ...words.sort((a, b) => a.localeCompare(b))].forEach(
        (word, j, arr1) => {
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
            heights.push("100%");
          } else {
            wordsOnCurrentPage.push(word);
          }
        }
      );
      return wordsPerPage;
    },
    [] as (string | number)[][]
  );
  res.push(wordsOnCurrentPage);
  bb = r.getBoundingClientRect();
  // TODO: this is not working properly
  // attempt to make the page take the less height possible
  // see https://stackoverflow.com/questions/75994487/css-how-to-make-flex-column-layout-grow-on-x-axis-first?noredirect=1#comment134032653_75994487
  const { x, y, width, height } = r.lastChild
    ? r.lastChild.getBoundingClientRect()
    : { x: 0, y: 0, width: 0, height: 0 };
  const area =
    (x - bb.x + width) * (y - bb.y + height) +
    (bb.height - y + bb.y) * (x - bb.x);
  const totalArea = bb.width * bb.height;
  const ratio = area / totalArea;
  heights.push(ratio * 100 + "%");

  return { wordsPerPage: res.reverse(), heights: heights.reverse() };
});
</script>

<style lang="less">
@media print {
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
}
.pushup {
  flex: 1;
}
</style>
