<template>
  <n-form :label-width="80"  :model="value">
    <h3>Grille</h3>
    <n-form-item label="Lignes" path="rows">
      <n-input-number v-model:value="value.rows" />
    </n-form-item>
    <n-form-item label="Colones" path="grid.cols">
      <n-input-number v-model:value="value.cols" />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  ref,
  watch,
} from "vue";
import { Grid } from "grid";
const props = defineProps<{
  grid: Grid;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: Grid): void;
  (event: "update"): void;
}>();
const value = computed({
  get: () => props.grid,
  set: (value) => {
    return emit("update:modelValue", value);
  },
});
watch(props.grid, () => {
  if (
    value.value.rows !== props.grid.rows ||
    value.value.cols !== props.grid.cols
  ) {
    props.grid.resize(value.value.rows, value.value.cols);
    emit("update");
  }
});
</script>

<style scoped>
.n-form {
  width: 192px;
  
}
</style>