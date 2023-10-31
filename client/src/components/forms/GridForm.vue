<template>
  <n-form :label-width="80" :model="value">
    <h3>{{ $t("forms.gridSize") }}</h3>
    <n-form-item :label="$t('forms.rows')" path="rows">
      <n-input-number v-model:value="value.rows" />
    </n-form-item>
    <n-form-item :label="$t('forms.cols')" path="grid.cols">
      <n-input-number v-model:value="value.cols" />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, watch } from "vue";
import { Grid } from "grid";
import { useModel } from "../../js/useModel";
/**
 * Form to Rows and Columns (used only in ModalOptions for now)
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
watch(value.value, () => {
  emit("update:modelValue", value.value);
});
</script>

<style scoped>
.n-form {
  width: 192px;
}
</style>