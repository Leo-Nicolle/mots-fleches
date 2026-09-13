<template>
  <n-button circle @click="open">
    <n-icon>
      <CogIcon />
    </n-icon>
  </n-button>
  <n-modal preset="dialog" :showIcon="false" v-model:show="visible">
    <template #header>{{ font.family }}</template>
    <template #action>
      <n-form :label-width="80">
        <n-form-item v-if="api.mode === 'remote' && myGroups.length > 0" :label="$t('groups.share')">
          <n-select
            :value="sharedGroupId"
            :options="groupOptions"
            :loading="sharingLoading"
            clearable
            :placeholder="$t('groups.notShared')"
            @update:value="onShareChange"
          />
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { api } from "../../api";
import type { Font, GroupSummary } from "database";

const props = defineProps<{ font: Font }>();

const visible = ref(false);
const myGroups = ref<GroupSummary[]>([]);
const sharedGroupId = ref<number | null>(null);
const sharingLoading = ref(false);
const groupOptions = computed(() => myGroups.value.map((g) => ({ label: g.name, value: g.id })));

async function open() {
  if (api.mode === 'remote') {
    sharingLoading.value = true;
    try {
      const [groupsRes, sharingRes] = await Promise.all([
        api.remote.fetcher.get('/groups'),
        (api.remote.fetcher as any).get(`/font/${encodeURIComponent(props.font.family)}/sharing`),
      ]);
      myGroups.value = groupsRes.data;
      sharedGroupId.value = (sharingRes.data as any).group_id ?? null;
    } catch (e) {
      console.error(e);
    } finally {
      sharingLoading.value = false;
    }
  }
  visible.value = true;
}

async function onShareChange(groupId: number | null) {
  try {
    if (groupId === null) {
      await (api.remote as any).unshareFont(sharedGroupId.value ?? 0, props.font.family);
    } else {
      await (api.remote as any).shareFont(groupId, props.font.family);
    }
    sharedGroupId.value = groupId;
  } catch (e) {
    console.error(e);
  }
}
</script>
