<template>
  <span>
    <n-button role="modal-options-button" @click="visible = true">
      <n-icon>
        <CogIcon />
      </n-icon>
    </n-button>
    <n-modal preset="dialog" :title="$t('forms.options')" :showIcon="false" v-model:show="visible">
      <template #header>
        {{ value.title }}
      </template>
      <template #action>
        <n-form :label-width="80" :model="value">
          <n-form-item :label="$t('forms.title')" path="title">
            <n-input role="title" type="text" placeholder="Nouvelle Grille" v-model:value="value.title" />
          </n-form-item>
          <n-form-item :label="$t('forms.comment')" path="description">
            <n-input role="comment" type="textarea" :placeholder="`${$t('forms.comment')}...`"
              v-model:value="value.comment" :autosize="{
                minRows: 3,
              }" />
          </n-form-item>
          <span class="rowcols">
            <n-form-item :label="$t('forms.rows')" path="rows">
              <n-input-number role="rows" v-model:value="value.rows" :on-update:value="(v) => onUpdate('rows', v)" />
            </n-form-item>
            <n-form-item path="randomize">
              <n-button role="randomize" @click="randomConfirmVisible = true; generating = false;" type="warning">
                {{ $t("forms.randomize") }}
              </n-button>
            </n-form-item>
            <n-form-item :label="$t('forms.cols')" path="grid.cols">
              <n-input-number role="cols" v-model:value="value.cols" :on-update:value="(v) => onUpdate('cols', v)" />
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
  </span>
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { Grid } from "grid";
import { useModel } from "../../js/useModel";
import generate from "../../js/maze-generator";
import { api } from "../../api";
import { workerController } from "../../worker";

/**
 * Form to edit grid metadata: rows, cols. title, comment and options
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  modelValue: Grid;
}>();
const opts = ref<{ label: string; value: string; }[]>([]);
const randomConfirmVisible = ref(false);
const visible = ref(false);
const generating = ref(false);
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new grid
   */
  (event: "update:modelValue", value: Grid): void;
  /**
   * Grid size changed
   */
  (event: "update-size", value: Grid): void;
  /**
   * Modal open
   */
  (event: "open"): void;
}>();
const value = useModel<Grid>(props, emit);
function onUpdate(path: string, newvalue: string | number) {
  value.value[path] = newvalue;
  nextTick(() => {
    emit("update-size", value.value);
  });
}
function onRandomize() {
  generating.value = true;
  nextTick()
    .then(() => workerController.getDistribution())
    .then((distribution) => {
      generate({ grid: value.value, distribution });
      emit("update-size", value.value);
      randomConfirmVisible.value = false;
      generating.value = false;
    });
}
watchEffect(() => {
  if (!visible.value) return;
  emit("open");
});
// watch(value.value, () => {
//   if (!visible.value) return;
//   emit("update:modelValue", value.value);
// });
const defaultSelectOpt = computed(() => {
  if (!props.modelValue) return "default";
  return opts.value.find((opt) => opt.value === props.modelValue.styleId)
    ?.label;
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