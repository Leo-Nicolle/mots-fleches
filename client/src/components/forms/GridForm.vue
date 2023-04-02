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
  defineEmits,
  defineProps,
  watch,
} from "vue";
import { Grid } from "grid";
import { useModel } from "../../js/useModel";
const props = defineProps<{
  modelValue: Grid;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: Grid): void;
  (event: "update"): void;
}>();
const value = useModel(props, emit);
watch(value.value, () => {
  emit("update:modelValue", value.value);
});

</script>

<style scoped>
.n-form {
  width: 192px;
  
}
</style>