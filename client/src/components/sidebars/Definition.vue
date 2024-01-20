<template>
  <div class="definition">
    <div v-if="error">
      {{ $t(`errors.${error}`) }}
    </div>
    <n-button v-else-if="busy" class="loading" :loading="true"></n-button>
    <div v-else v-for="{ title, user, dico } in results" :key="title">
      <h3>{{ title }}</h3>
      <ul v-if="user">
        <li v-for="text in user" :key="text" @click="onSetDefinition($event, text)">{{ text }}</li>
      </ul>
      <ul v-if="dico">
        <li v-for="text in dico" :key="text" @click="onSetDefinition($event, text)">{{ text }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, watch, watchEffect } from "vue";
import { workerController } from "../../worker";

import throttle from "lodash.throttle";
import { Cell, Grid, Direction, Vec } from "grid";
const props = defineProps<{
  grid: Grid;
  focus: Cell;
  dir: Direction;
}>();
const results = ref<{ title: string; texts: string[]; }[]>([]);
const busy = ref(false);
const error = ref('');
function refreshGetDefinitions() {
  const arrows = props.focus.arrows;
  const vecs: Vec[] = [];
  if (props.dir === 'horizontal') {
    if (arrows.find(e => e === 'downright')) {
      vecs.push({
        x: 0,
        y: 1
      });
    }
    if (arrows.find(e => e === 'right')) {
      vecs.push({
        x: 1,
        y: 0
      });
    }
    if (!vecs.length) {
      return error.value = 'no-horizontal-arrow';
    }
  } else {
    if (arrows.find(e => e === 'rightdown')) {
      vecs.push({
        x: 1,
        y: 0
      });
    }
    else if (arrows.find(e => e === 'down')) {
      vecs.push({
        x: 0,
        y: 1
      });
    }
    if (!vecs.length) {
      return error.value = 'no-vertical-arrow';
    }
  }
  const { x, y } = props.focus;
  const bounds = vecs.map(vec => props.grid.getBounds({
    x: x + vec.x,
    y: y + vec.y,
  }, props.dir));

  if (bounds.some(({ cells }) => cells.some(b => !b.text))) {
    return error.value = 'incomplete-word';
  }
  error.value = '';
  const words = bounds.map(({ cells }) => cells
    .map(c => c.text)
    .join(''));

  workerController.searchDefinition(words);
}
const throttledSearch = throttle(refreshGetDefinitions, 200);

function onSetDefinition(event: MouseEvent, text: string) {
  event.preventDefault();
  event.stopPropagation();
  const t = props.focus.text;
  props.grid.setText(props.focus, `${t}${t.length ? '\n' : ''}${text}`);
}
watch(() => [props.focus.x, props.focus.y, props.focus.arrows[0],
props.focus.arrows[1], props.focus.arrows[2], props.dir], () => {
  throttledSearch();
});
workerController.on("searchdefinition-result", (data) => {
  busy.value = false;
  results.value = data.map(({ title, text }) => {
    const texts = text.toLowerCase().split('\n');
    let isUser = false;
    const [user, dico] = texts.reduce((acc, text) => {
      const [user, dico] = acc;
      if (text === '__user__') {
        isUser = true;
        return acc;
      }
      if (isUser) {
        user.push(text);
      } else {
        dico.push(text);
      }
      return acc;
    }, [[], []] as [string[], string[]]);
    return {
      title, user, dico
    };

  });
  if (!results.value.length) {
    error.value = 'no-definition';
  }
});

onMounted(() => {
  throttledSearch();
});

</script>

<style>
.definition {
  margin: 10px 0;
  gap: 5px;
  display: flex;
  flex-direction: column;
  max-height: min(900px, calc(100vh - 200px));
  width: 100%;
}

.definition h3 {
  margin: 0;
}

.definition ul {
  margin: 0;
  margin-top: 5px;
  padding-left: 10px;
}

.definition li {
  list-style: none;
  cursor: pointer;
  font-size: 0.9rem;
}

.definition li:hover {
  text-decoration: underline;
}

.definition .loading {
  padding: 150px 0;
}
</style>../../worker