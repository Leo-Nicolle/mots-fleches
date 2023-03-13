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

const options = ref([
  {
    label: "cm",
    value: "cm",
  },
  {
    label: "mm",
    value: "mm",
  },
  {
    label: "px",
    value: "px",
  },
  {
    label: "pt",
    value: "pt",
  },
  {
    label: "em",
    value: "em",
  },
]);

const value = computed({
  get: () => +props.modelValue.slice(0, -2),
  set: (value) => emit("update:modelValue", value + props.modelValue.slice(-2)),
});

const unit = computed({
  get: () => props.modelValue.slice(-2),
  set: (unit) =>
    emit("update:modelValue", props.modelValue.slice(0, -2) + unit),
});

// const value = useModel(props, emit);
</script>

<style>

.sizeinput{
  display: flex;
}
.n-base-selection-label{
  min-width: 72px;
}
</style>