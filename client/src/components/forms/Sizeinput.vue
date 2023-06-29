<template>
  <span class="sizeinput">
    <n-input-number v-model:value="value" />
    <n-select v-model:value="unit" :options="options" />
  </span>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from "vue";
/**
 * Form edit a string value like "10px" or "10mm"
 * Has a unit picker and a number input
 */
const props = defineProps<{
  /**
   * The value to edit
   */
  modelValue: string;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new value
   */
  (event: "update:modelValue", value: string): void;
}>();
const units = ["cm", "mm", "px", "pt", "em", "rem"];
const unitSet = new Set(units);

const options = ref(units.map((u) => {
    return { label: u, value: u };
}));
const value = computed<number>({
  get: () => {
    const res = +props.modelValue.slice(0, -2);
    return isNaN(res) ? 0 : res;
  },
  set: (value) =>
    emit(
      "update:modelValue",
      value ? `${value}${unit.value}` : `0${unit.value}`
    ),
});
const unit = computed<string>({
  get: () => {
    const res = props.modelValue.slice(-2);
    return unitSet.has(res) ? res : "px";
  },
  set: (unit) => emit("update:modelValue", `${value.value}${unit}`),
});
</script>

<style>
.sizeinput {
  display: flex;
}
.n-base-selection-label {
  min-width: 72px;
}
</style>