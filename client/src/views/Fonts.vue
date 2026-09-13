<template>
  <Layout v-if="fonts" :breadcrumbs="[{ text: $t('nav.fonts') }]" :eltList="displayedFonts" :onDelete="onDelete"
    @select="(s) => (selected = s)" :has-create-button="false" :has-delete-button="activeGroupId === null">
    <template v-slot:left-panel>
      <UploadModal v-if="activeGroupId === null" :title="$t('titles.newFont')" :buttonText="$t('buttons.create')"
        :readAsDataURL="true" :single="true" @ok="onUpload" />
      <GroupFilter
        v-if="api.mode === 'remote' && myGroups.length > 0"
        v-model="activeGroupId"
        :groups="myGroups"
        :resource-label="$t('nav.fonts')"
      />
    </template>
    <template #card-title="{ elt }">
      <FontLoader :value="elt" />
      <span class="font-body" :style="{ 'font-family': elt.family }">
        {{ elt.family }}
      </span>
      <FontModal v-if="activeGroupId === null" :font="elt" />
    </template>
  </Layout>
</template>

<script setup lang="ts">
import Layout from "../layouts/GridLayout.vue";
import UploadModal from "../components/modals/UploadModal.vue";
import FontLoader from "../components/fonts/FontLoader.vue";
import GroupFilter from "../components/GroupFilter.vue";
import FontModal from "../components/modals/FontModal.vue";

import { api } from "../api";
import { onMounted, ref, computed, watch } from "vue";
import { Font } from "database";
import type { GroupSummary } from "database";
import { loadFont } from "../components/fonts/load-font";
import { postEvent } from "../js/telemetry";

const fonts = ref<Font[]>([]);
const groupFonts = ref<Font[]>([]);
const myGroups = ref<GroupSummary[]>([]);
const activeGroupId = ref<number | null>(null);
const selected = ref<Font[]>([]);
const displayedFonts = computed(() => activeGroupId.value !== null ? groupFonts.value : fonts.value);
async function fetchMyGroups() {
  if (api.mode !== "remote") return;
  try {
    const { data } = await api.remote.fetcher.get("/groups");
    myGroups.value = data;
  } catch (e) {
    console.error(e);
  }
}

async function fetchGroupFonts(groupId: number) {
  try {
    const raw = await (api.remote as any).getGroupFonts(groupId);
    groupFonts.value = raw;
    await Promise.all(groupFonts.value.map((font) => loadFont(font)));
  } catch (e) {
    console.error(e);
  }
}

watch(activeGroupId, (id) => {
  if (id !== null) fetchGroupFonts(id);
  else groupFonts.value = [];
});

onMounted(async () => {
  await fetchMyGroups();
  getFonts();
});
function getFonts() {
  return api.db.getFonts().then((fs) => {
    fonts.value = fs
      .sort((a, b) => a.updated - b.updated)
      .map((f) => ({ ...f, name: f.name ? f.name : "unamed" }));
    return Promise.all(fonts.value.map((font) => loadFont(font)));
  });
}
function onUpload(filesContents: [string, string][]) {
  postEvent("create-font");
  return Promise.all(
    filesContents.map(([filename, dataURL]) => {
      const family = filename
        .replace(/\..*/, "")
        .replace(/[^\w]/gi, "")
        .replace(/[0-9]+/gi, "");
      return api.db.pushFont({
        family,
        updated: Date.now(),
        content: dataURL,
      });
    })
  ).then(() => getFonts());
}
function onDelete() {
  return Promise.all(
    selected.value.map((font) => api.db.deleteFont(font.family))
  ).then(() => getFonts());
}
</script>

<style>
.n-card:has(.font-body) {
  height: 75px;
}

.font-body {
  grid-column: 1 / 3;
  text-align: center;
}
</style>
