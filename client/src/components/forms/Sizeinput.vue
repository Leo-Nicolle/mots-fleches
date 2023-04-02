<template>
  <span class="sizeinput">
    <n-input-number v-model:value="value" />
    <n-select v-model:value="unit" :options="options" />
  </span>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from "vue";
const props = defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();
const units = ["cm", "mm", "px", "pt", "em"];
const unitSet = new Set(units);

const options = ref([
  units.map((u) => {
    return { label: u, value: u };
  }),
]);

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

// const value = useModel(props, emit);
</script>

<style>
.sizeinput {
  display: flex;
}
.n-base-selection-label {
  min-width: 72px;
}
</style>