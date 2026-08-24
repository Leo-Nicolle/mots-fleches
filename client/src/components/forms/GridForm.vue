<template>
  <n-form :label-width="80" :model="value">
    <h3>{{ $t("forms.gridSize") }}</h3>
    <n-form-item :label="$t('forms.rows')" path="rows">
      <n-input-number v-model:value="value.rows" :min="1" :max="50" />
    </n-form-item>
    <n-form-item :label="$t('forms.cols')" path="grid.cols">
      <n-input-number v-model:value="value.cols" :min="1" :max="50" />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, watch } from "vue";
import { Grid } from "grid";
import { useModel } from "../../js/useModel";
/**
 * Form to change the number of rows and columns of a grid.
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  modelValue: Grid;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new grid
   */
  (event: "update:modelValue", value: Grid): void;
}>();
const value = useModel<Grid>(props, emit);

watch(
  () => [value.value.rows, value.value.cols],
  () => {
    const rows = Number(value.value.rows);
    const cols = Number(value.value.cols);
    if (!Number.isFinite(rows) || !Number.isFinite(cols) || rows < 1 || cols < 1) return;
    value.value.resize(Math.floor(rows), Math.floor(cols));
  }
);
</script>

<style scoped>
.n-form {
  width: 192px;
}
</style>
