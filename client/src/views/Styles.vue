<template>
  <Layout v-if="styles.length" :eltList="elements" :onCreate="createStyle" :onDelete="onDelete" :has-create-button="true"
    :has-delete-button="true" :onClick="onClick" @select="(s) => (selected = s)">
    <template v-slot:left-panel>
      <h3>{{ mode === 'style' ? $t("nav.styles") : $t("nav.solutions") }}</h3>
      <n-button round @click="switchMode">
        {{ mode === 'style' ? $t("nav.solutions") : $t("nav.styles") }}
      </n-button>
    </template>
    <template v-slot:card-title="{ elt }">
      <span>
        <n-button circle @click="editing = elt">
          <n-icon>
            <SettingsOutline />
          </n-icon>
        </n-button>
        {{ elt.name ? elt.name : $t("buttons.newStyle") }}
      </span>
    </template>
    <template #card-body="{ elt }">
      <pre v-highlightjs>
        <code class="JSON">{{ JSON.stringify(elt, 0, 2) }}</code>
      </pre>
    </template>
  </Layout>
  <Teleport to="#outside">
    <n-modal v-if="editing" v-model:show="editing" preset="dialog" title="Settings" :show-icon="false">
      <template #header>
        <!-- <div>{{ $t("modals.s") }}</div> -->
      </template>
      <div class="modalbody">
        <n-form label-placement="top">
          <n-form-item :label="$t('forms.name')" path="book.name">
            <n-input v-model:value="editing.name" />
          </n-form-item>
        </n-form>
      </div>
      <template #action>
        <n-button type="primary" @click="save">Ok</n-button>
      </template>
    </n-modal>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, toRaw } from "vue";
import "highlight.js/styles/monokai.css";
import Layout from "../layouts/GridLayout.vue";
import { GridStyle, SolutionStyle, isSolutionStyle, defaultStyles, defaultSolutionStyle } from "grid";
import {
  SettingsOutline
} from "@vicons/ionicons5";
import { api } from "../api";
import { computed } from "vue";
import { v4 as uuid } from "uuid";
import { useRouter } from "vue-router";
/**
 * View to display all styles in a grid layout
 */
const styles = ref<GridStyle[]>([]);
const solutions = ref<SolutionStyle[]>([]);
const selected = ref<GridStyle[]>([]);
const editing = ref<GridStyle | SolutionStyle | undefined>();
const elements = computed(() => mode.value === 'style' ? styles.value : solutions.value);
const mode = ref<'style' | 'solution'>('style');
const router = useRouter();

function switchMode() {
  mode.value = mode.value === 'style' ? 'solution' : 'style';
  console.log('click', mode.value);
}

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
  return api.deleteStyles(selected.value.map((style) => style.id)).then(() => fetch());
}
function onClick(style: GridStyle | SolutionStyle) {
  if (isSolutionStyle(style)) {
    return router.push(`/solutions/${style.id}`);
  }
  return router.push(`/styles/${style.id}`);
}
function save() {
  api.db.pushStyle(toRaw(editing.value as GridStyle)).then(() => fetch());
  editing.value = undefined;
}

function createStyle() {
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

