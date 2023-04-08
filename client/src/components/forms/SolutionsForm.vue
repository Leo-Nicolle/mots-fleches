<template>
    <h3>Solutions</h3>
    <n-form-item label="Lignes" path="rows">
      <n-input-number role="rows" v-model:value="value.grids.rows" />
    </n-form-item>
    <n-form-item label="Colonnes" path="cols">
      <n-input-number role="cols" v-model:value="value.grids.cols" />
    </n-form-item>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from "vue";
import { useModel } from "../../js/useModel";
import { SolutionOptions } from "../svg-renderer/types";

const props = defineProps<{
  modelValue: SolutionOptions;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: SolutionOptions): void;
}>();
const value = useModel(props, emit);

watch(value.value, () => {
  emit("update:modelValue", value.value);
});
</script>

<style scoped>
.n-form {
  flex-direction: column;
}
.n-color-picker {
  width: 150px;
}
</style>