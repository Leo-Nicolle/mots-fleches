<template>
  <n-tooltip trigger="hover">
    <template #trigger>
      <n-button role="modal-options-button" circle @click="visible = true">
        <n-icon>
          <CogIcon />
        </n-icon>
      </n-button>
    </template>
    {{ $t("tooltips.gridSettings") }}
  </n-tooltip>
  <n-modal preset="dialog" :title="$t('forms.options')" :showIcon="false" v-model:show="visible">
    <template #header>
      {{ grid.title }}
    </template>
    <template #action>
      <n-form :label-width="80">
        <n-form-item :label="$t('forms.title')" path="title">
          <n-input role="title" type="text" :placeholder="$t('buttons.newGrid')" v-model:value="grid.title" />
        </n-form-item>
        <n-form-item :label="$t('forms.comment')" path="description">
          <n-input role="comment" type="textarea" :placeholder="`${$t('forms.comment')}...`" v-model:value="grid.comment"
            :autosize="{
              minRows: 3,
            }" />
        </n-form-item>
        <span class="rowcols">
          <n-form-item :label="$t('forms.rows')" path="rows">
            <n-input-number role="rows" v-model:value="grid.rows" :min="1" @update:value="v => resize(v, grid.cols)" />
          </n-form-item>
          <n-form-item path="randomize">
            <n-button role="randomize" @click="randomConfirmVisible = true; generating = false;" type="warning">
              {{ $t("forms.randomize") }}
            </n-button>
          </n-form-item>
          <n-form-item :label="$t('forms.cols')" path="grid.cols">
            <n-input-number role="cols" v-model:value="grid.cols" :min="1" @update:value="v => resize(grid.rows, v)" />
          </n-form-item>
        </span>
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
  <n-modal preset="dialog" :title="`${$t('forms.randomize')} ?`" :showIcon="false" v-model:show="randomConfirmVisible">
    <template #action>
      <n-button :disabled="generating" @click="randomConfirmVisible = false">{{
        $t("buttons.no")
      }}</n-button>
      <n-button :disabled="generating" @click="onRandomize()" type="warning">{{
        $t("buttons.yes")
      }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {
  defineEmits,
  nextTick,
  onMounted,
  ref,
  watchEffect,
  defineModel,
  watch,
  toRaw,
  computed,
} from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { Grid } from "grid";
import generate, { generateExtension } from "../../js/maze-generator";
import { api } from "../../api";
import { workerController } from "../../worker";
import type { GroupSummary } from "database";
const grid = defineModel<Grid>('grid', { required: true });
const opts = ref<{ label: string; value: string; }[]>([]);
const randomConfirmVisible = ref(false);
const visible = ref(false);
const generating = ref(false);
const myGroups = ref<GroupSummary[]>([]);
const sharedGroupId = ref<number | null>(null);
const sharingLoading = ref(false);
const groupOptions = computed(() => myGroups.value.map((g) => ({ label: g.name, value: g.id })));
const emit = defineEmits<{
  /**
   * Modal open
   */
  (event: "open"): void;
}>();
function onRandomize() {
  generating.value = true;
  nextTick()
    .then(() => workerController.getDistribution())
    .then((distribution) => {
      generate({ grid: grid.value, distribution });
      randomConfirmVisible.value = false;
      generating.value = false;
    });
}
async function loadSharing() {
  if (api.mode !== 'remote') return;
  sharingLoading.value = true;
  try {
    const [groupsRes, sharingRes] = await Promise.all([
      api.remote.fetcher.get('/groups'),
      (api.remote.fetcher as any).get(`/grid/${grid.value.id}/sharing`),
    ]);
    myGroups.value = groupsRes.data;
    sharedGroupId.value = (sharingRes.data as any).group_id ?? null;
  } catch (e) {
    console.error(e);
  } finally {
    sharingLoading.value = false;
  }
}

async function onShareChange(groupId: number | null) {
  try {
    if (groupId === null) {
      await (api.remote as any).unshareGrid(sharedGroupId.value ?? 0, grid.value.id);
    } else {
      await (api.remote as any).shareGrid(groupId, grid.value.id);
    }
    sharedGroupId.value = groupId;
  } catch (e) {
    console.error(e);
  }
}

watchEffect(() => {
  if (!visible.value) return;
  emit("open");
  loadSharing();
});
onMounted(() => {
  api.db
    .getStyles()
    .then((res) => {
      opts.value = res.map((opt) => {
        return { label: opt.name, value: opt.id };
      });
    })
    .catch((err) => {
      console.error(err);
    });
});

function resize(rows: number, cols: number) {
  nextTick(() => {
    const g = toRaw(grid.value);
    const oldRows = g.cells.length;
    const oldCols = g.cells[0]?.length || 0;
    const isEmpty = g.cells.every((row) => row.every((c) => !c.text));
    g.resize(rows, cols);
    if (isEmpty) g.clear();
    grid.value = g;
    if (isEmpty) {
      workerController.getDistribution().then((distribution) => {
        generate({ grid: g, distribution });
        grid.value = g;
        api.saveGrid(g);
      });
      return;
    }
    if (rows > oldRows || cols > oldCols) {
      workerController.getDistribution().then((distribution) => {
        generateExtension({ grid: g, distribution, oldRows, oldCols });
        grid.value = g;
        api.saveGrid(g);
      });
      return;
    }
    api.saveGrid(g);
  });
}

watch(grid, (n, o) => {
  if (!n) return;
  nextTick(() => {
    api.saveGrid(toRaw(grid.value));
  });
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