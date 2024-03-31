<template>
  <Layout v-if="styles.length" :eltList="elements" :onCreate="createStyle" :onDelete="onDelete" :has-create-button="true"
    :has-delete-button="true" :getLink="getLink" @select="(s) => (selected = s)">
    <template v-slot:left-panel>
      <n-tabs v-model:value="mode" type="card">
        <n-tab-pane name="style" :tab="$t('nav.styles')">
        </n-tab-pane>
        <n-tab-pane name="solution" :tab="$t('nav.solutions')">
        </n-tab-pane>
      </n-tabs>
    </template>
    <template v-slot:card-title="{ elt }">
      <StyleModal v-model="(elt as GridStyle)" />
      <span>
        {{ elt.name ? elt.name : $t("buttons.newStyle") }}
      </span>
    </template>
    <template #card-body="{ elt, i }">
      <span v-if="thumbnails[i]" v-html="thumbnails[i]"></span>
      <img v-else src="/placeholder.png" />
    </template>
  </Layout>
  <Teleport to="#outside">
    <div>
      <StyleThumbnail v-if="elements" :styles="elements" v-model="thumbnails" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import "highlight.js/styles/monokai.css";
import Layout from "../layouts/GridLayout.vue";
import StyleThumbnail from "../components/svg-renderer/StyleThumbnail.vue";
import { GridStyle, SolutionStyle, isSolutionStyle, defaultStyles, defaultSolutionStyle } from "grid";
import StyleModal from "../components/modals/StyleModal.vue";
import { api } from "../api";
import { computed } from "vue";
import { v4 as uuid } from "uuid";
import { postEvent } from "../js/telemetry";
/**
 * View to display all styles in a grid layout
 */
const styles = ref<GridStyle[]>([]);
const solutions = ref<SolutionStyle[]>([]);
const selected = ref<GridStyle[]>([]);
const thumbnails = ref<string[]>([]);
// const editing = ref<GridStyle | SolutionStyle | undefined>();
const mode = ref<'style' | 'solution'>('style');
const elements = computed(() => mode.value === 'style' ? styles.value : solutions.value);

function fetch() {
  return api.db
    .getStyles()
    .then((data) => {
      const stylesTmp: GridStyle[] = [];
      const solutionsTmp: SolutionStyle[] = [];
      for (let i = 0; i < data.length; i++) {
        if (isSolutionStyle(data[i])) {
          solutionsTmp.push(data[i] as SolutionStyle);
        } else {
          stylesTmp.push(data[i] as GridStyle);
        }
      }
      styles.value = stylesTmp;
      solutions.value = solutionsTmp;
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onDelete() {
  postEvent(mode.value === 'solution' ? 'delete-solution-style' : 'delete-style');
  return api.deleteStyles(selected.value.map((style) => style.id)).then(() => fetch());
}
function getLink(style: GridStyle | SolutionStyle) {
  if (isSolutionStyle(style)) {
    return `/solutions/${style.id}/none`;
  }
  return `/styles/${style.id}`;
}

function createStyle() {
  postEvent(mode.value === 'solution' ? 'create-solution-style' : 'create-style');
  const newStyle = structuredClone(mode.value === 'style'
    ? defaultStyles
    : defaultSolutionStyle);
  newStyle.id = uuid();
  newStyle.name = mode.value === 'style' ? 'New Style' : 'New Solution Style';
  return api.db.pushStyle(newStyle).then(() => fetch());
}
onMounted(() => {
  fetch();
});
</script>

<style scoped>
.card-body {
  height: 100%;
  display: flex;
  align-items: center;
  align-content: space-around;
  justify-content: space-around;
}

.card-body>pre {
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: 275px;
  max-width: 295px;
}
</style>

