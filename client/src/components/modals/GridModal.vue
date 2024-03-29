<template>
  <n-button role="modal-options-button" circle @click="visible = true">
    <n-icon>
      <CogIcon />
    </n-icon>
  </n-button>
  <n-modal preset="dialog" :title="$t('forms.options')" :showIcon="false" v-model:show="visible">
    <template #header>
      {{ grid.title }}
    </template>
    <template #action>
      <n-form :label-width="80">
        <n-form-item :label="$t('forms.title')" path="title">
          <n-input role="title" type="text" placeholder="Nouvelle Grille" v-model:value="grid.title" />
        </n-form-item>
        <n-form-item :label="$t('forms.comment')" path="description">
          <n-input role="comment" type="textarea" :placeholder="`${$t('forms.comment')}...`" v-model:value="grid.comment"
            :autosize="{
              minRows: 3,
            }" />
        </n-form-item>
        <span class="rowcols">
          <n-form-item :label="$t('forms.rows')" path="rows">
            <n-input-number role="rows" v-model:value="grid.rows" :on-change="v => resize(v, grid.cols)" />
          </n-form-item>
          <n-form-item path="randomize">
            <n-button role="randomize" @click="randomConfirmVisible = true; generating = false;" type="warning">
              {{ $t("forms.randomize") }}
            </n-button>
          </n-form-item>
          <n-form-item :label="$t('forms.cols')" path="grid.cols">
            <n-input-number role="cols" v-model:value="grid.cols" :on-change="v => resize(grid.rows, v)" />
          </n-form-item>
        </span>
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
  toRaw
} from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { Grid } from "grid";
import generate from "../../js/maze-generator";
import { api } from "../../api";
import { workerController } from "../../worker";
const grid = defineModel<Grid>('grid', { required: true });
const opts = ref<{ label: string; value: string; }[]>([]);
const randomConfirmVisible = ref(false);
const visible = ref(false);
const generating = ref(false);
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
watchEffect(() => {
  if (!visible.value) return;
  emit("open");
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
    g.resize(rows, cols);
    grid.value = g;
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