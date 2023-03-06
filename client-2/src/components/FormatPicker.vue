<template>
  <span class="formatpicker">
    <h3>Format</h3>
    <n-form-item label="Format" path="fomat.name">
      <n-select v-model:value="format" :options="options" />
    </n-form-item>
    <n-form-item label="Orientation" path="fomat.orientation">
      <n-select v-model:value="value.orientation" :options="orientations" />
    </n-form-item>
    <n-form-item label="Largeur" path="format.width">
      <n-input-number v-model:value="value.width" />
    </n-form-item>
    <n-form-item label="Hauteur" path="format.height">
      <n-input-number v-model:value="value.height" />
    </n-form-item>
    <h3>Marges</h3>
    <n-form-item label="Gauche" path="format.margin.left">
      <n-input-number v-model:value="value.margin.left" />
    </n-form-item>
    <n-form-item label="Droite" path="format.margin.right">
      <n-input-number v-model:value="value.margin.right" />
    </n-form-item>
    <n-form-item label="Haut" path="format.margin.top">
      <n-input-number v-model:value="value.margin.top" />
    </n-form-item>
    <n-form-item label="Bas" path="format.margin.bottom">
      <n-input-number v-model:value="value.margin.bottom" />
    </n-form-item>
  </span>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed } from "vue";
import { useModel } from "../js/useModel";
import { Format } from "grid";

const props = defineProps<{ modelValue: Format }>();
const emit = defineEmits<{
  (event: "update:modelValue", value: Format): void;
}>();

const options = ref([
  {
    label: "A5",
    value: "14.8x21",
  },
  {
    label: "A4",
    value: "21x29.7",
  },
  {
    label: "A3",
    value: "29.7x42",
  },
  {
    label: "custom",
    value: "custom",
  },
]);

const orientations = ref([
  {
    label: "Portrait",
    value: "portrait",
  },
  {
    label: "Paysage",
    value: "paysage",
  },
]);

function decompose(format: string) {
  return format.split("x").map((e) => +e);
}
const format = computed({
  get: () => {
    const width = props.modelValue.width;
    const height = props.modelValue.height;
    const option =
      options.value.find((o) => {
        const [h, w] = decompose(o.value);
        if (w === width && h === height) return true;
      }) ||
      (options.value.find((o) => o.value === "custom") as {
        label: string;
        value: string;
      });
    return option.value;
  },
  set: (format) => {
    const [height, width] =
      format === "custom"
        ? [props.modelValue.height, props.modelValue.width]
        : decompose(format);
    emit("update:modelValue", {
      ...props.modelValue,
      width,
      height,
    });
  },
});

const value = useModel(props, emit);
</script>

<style>
.sizeinput {
  display: flex;
}
.n-base-selection-label {
  min-width: 72px;
}
</style>