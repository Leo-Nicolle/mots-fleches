<template>
  <div class="definition">
    <div v-for="{ title, texts } in results" :key="title">
      <h3>{{ title }}</h3>
      <ul>
        <li v-for="text in texts" :key="text" @click="onSetDefinition(text)">{{ text }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, ref, onMounted, watch, watchEffect } from "vue";
import { workerController } from "../../search-worker";
import throttle from "lodash.throttle";
import { Cell, Grid } from "grid";
const props = defineProps<{
  grid: Grid;
  focus: Cell;
}>();
const results = ref<{ title: string; texts: string[]; }[]>([]);
const busy = ref(false);
function refreshGetDefinitions() {
  console.log('search');
  workerController.searchDefinition("ABAISSAIT");
}
const throttledSearch = throttle(refreshGetDefinitions, 200);

function onSetDefinition(text: string) {
  console.log('ici', text);
  props.grid.setText(props.focus, text);
}
watch([props.focus], () => {
  console.log('watch focus');
  throttledSearch();
});
workerController.on("searchdefinition-result", (data) => {
  busy.value = false;
  console.log(data);
  results.value = data.map(({ title, text }) => ({ title, texts: text.toLowerCase().split('\n') }));
});

onMounted(() => {
  throttledSearch();
});

</script>

<style scoped>
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
</style>