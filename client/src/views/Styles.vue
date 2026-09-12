<template>
  <Layout v-if="styles.length || solutions.length || activeGroupId !== null"
    :breadcrumbs="[{ text: $t('nav.styles') }]" :eltList="elements" :onCreate="activeGroupId === null ? createStyle : undefined"
    :onDelete="onDelete" :has-create-button="activeGroupId === null" :has-delete-button="activeGroupId === null"
    :getLink="getLink" @select="(s) => (selected = s)">
    <template v-slot:left-panel>
      <n-tabs v-model:value="mode" type="card">
        <n-tab-pane name="style" :tab="$t('nav.styles')">
        </n-tab-pane>
        <n-tab-pane name="solution" :tab="$t('nav.solutions')">
        </n-tab-pane>
      </n-tabs>
      <GroupFilter
        v-if="api.mode === 'remote' && myGroups.length > 0"
        v-model="activeGroupId"
        :groups="myGroups"
        :resource-label="$t('nav.styles')"
      />
    </template>
    <template v-slot:card-title="{ elt }">
      <StyleModal v-model="(elt as GridStyle)" />
      <span>
        {{ elt.name ? elt.name : $t("buttons.newStyle") }}
      </span>
    </template>
    <template #card-body="{ i }">
      <div class="preview">
        <span v-if="thumbnails[i]" v-html="thumbnails[i]"></span>
        <img v-else src="/placeholder.png" />
      </div>
    </template>
  </Layout>
  <Teleport to="#outside">
    <div>
      <StyleThumbnail v-if="elements" :styles="elements" v-model="thumbnails" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import "highlight.js/styles/monokai.css";
import Layout from "../layouts/GridLayout.vue";
import StyleThumbnail from "../components/svg-renderer/StyleThumbnail.vue";
import { GridStyle, SolutionStyle, isSolutionStyle, defaultStyles, defaultSolutionStyle } from "grid";
import StyleModal from "../components/modals/StyleModal.vue";
import GroupFilter from "../components/GroupFilter.vue";
import { api } from "../api";
import { v4 as uuid } from "uuid";
import { postEvent } from "../js/telemetry";
import type { GroupSummary } from "database";
/**
 * View to display all styles in a grid layout
 */
const styles = ref<GridStyle[]>([]);
const solutions = ref<SolutionStyle[]>([]);
const groupStyles = ref<GridStyle[]>([]);
const groupSolutions = ref<SolutionStyle[]>([]);
const myGroups = ref<GroupSummary[]>([]);
const activeGroupId = ref<number | null>(null);
const selected = ref<GridStyle[]>([]);
const thumbnails = ref<string[]>([]);
const mode = ref<'style' | 'solution'>('style');
const elements = computed(() => {
  if (activeGroupId.value !== null) {
    return mode.value === 'style' ? groupStyles.value : groupSolutions.value;
  }
  return mode.value === 'style' ? styles.value : solutions.value;
});

async function fetchMyGroups() {
  if (api.mode !== "remote") return;
  try {
    const { data } = await api.remote.fetcher.get("/groups");
    myGroups.value = data;
  } catch (e) {
    console.error(e);
  }
}

async function fetchGroupStyles(groupId: number) {
  try {
    const raw = await (api.remote as any).getGroupStyles(groupId);
    const stylesTmp: GridStyle[] = [];
    const solutionsTmp: SolutionStyle[] = [];
    for (const s of raw) {
      if (isSolutionStyle(s)) solutionsTmp.push(s as SolutionStyle);
      else stylesTmp.push(s as GridStyle);
    }
    groupStyles.value = stylesTmp;
    groupSolutions.value = solutionsTmp;
    thumbnails.value = [];
  } catch (e) {
    console.error(e);
  }
}

watch(activeGroupId, (id) => {
  if (id !== null) fetchGroupStyles(id);
  else { groupStyles.value = []; groupSolutions.value = []; }
});

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
  const group = activeGroupId.value !== null ? `?groupId=${activeGroupId.value}` : '';
  if (isSolutionStyle(style)) {
    return `/solutions/${style.id}/none${group}`;
  }
  return `/styles/${style.id}${group}`;
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
onMounted(async () => {
  await fetchMyGroups();
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

.preview {
  width: 170px;
  height: 170px;
  max-width: 170px;
  max-height: 170px;
  overflow: hidden;
}

.card-body>pre {
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: 275px;
  max-width: 295px;
}
</style>
