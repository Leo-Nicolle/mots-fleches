<template>
  <n-button role="modal-options-button" circle @click="visible = true">
    <n-icon>
      <CogIcon />
    </n-icon>
  </n-button>
  <n-modal preset="dialog" :title="$t('modals.style')" :showIcon="false" v-model:show="visible">
    <template #header>
      {{ $t('modals.style') }}
    </template>
    <template #action>
      <n-form :label-width="80">
        <n-form-item :label="$t('forms.name')" path="name">
          <n-input role="name" type="text" placeholder="name" v-model:value="style.name" />
        </n-form-item>
        <n-form-item v-if="api.mode === 'remote' && myGroups.length > 0" :label="$t('groups.share')">
          <n-select
            :value="sharedGroupIds"
            :options="groupOptions"
            :loading="sharingLoading"
            multiple
            :placeholder="$t('groups.notShared')"
            @update:value="onShareChange"
          />
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {
  ref,
  watchEffect,
  defineModel,
  watch,
  toRaw,
  computed,
} from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { GridStyle, SolutionStyle } from "grid";
import { api } from "../../api";
import type { GroupSummary } from "database";
const style = defineModel<GridStyle | SolutionStyle>({ required: true });
const visible = ref(false);
const myGroups = ref<GroupSummary[]>([]);
const sharedGroupIds = ref<number[]>([]);
const sharingLoading = ref(false);
const groupOptions = computed(() => myGroups.value.map((g) => ({ label: g.name, value: g.id })));

async function loadSharing() {
  if (api.mode !== 'remote') return;
  sharingLoading.value = true;
  try {
    const [groupsRes, sharingRes] = await Promise.all([
      api.remote.fetcher.get('/groups'),
      (api.remote.fetcher as any).get(`/style/${style.value.id}/sharing`),
    ]);
    myGroups.value = groupsRes.data;
    sharedGroupIds.value = (sharingRes.data as any).group_ids ?? [];
  } catch (e) {
    console.error(e);
  } finally {
    sharingLoading.value = false;
  }
}

async function onShareChange(newGroupIds: number[]) {
  try {
    const added = newGroupIds.filter((id) => !sharedGroupIds.value.includes(id));
    const removed = sharedGroupIds.value.filter((id) => !newGroupIds.includes(id));
    await Promise.all([
      ...added.map((id) => (api.remote as any).shareStyle(id, style.value.id)),
      ...removed.map((id) => (api.remote as any).unshareStyle(id, style.value.id)),
    ]);
    sharedGroupIds.value = newGroupIds;
  } catch (e) {
    console.error(e);
  }
}

watchEffect(() => {
  if (!visible.value) return;
  loadSharing();
});

watch(style, (n) => {
  api.saveStyle(toRaw(n));
}, { deep: true });
</script>

<style scoped>
.n-form {
  width: 100%;
}

.rowcols {
  display: flex;
  justify-content: space-between;
}

.rowcols>.n-form-item {
  max-width: 100px;
}
</style>../../worker