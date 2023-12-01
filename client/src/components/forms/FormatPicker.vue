<template>
  <span class="formatpicker">
    <h3>{{ $t("forms.format") }}</h3>
    <n-form-item :label="$t('forms.format')" path="fomat.name">
      <n-select v-model:value="format" :options="options" />
    </n-form-item>
    <!-- <n-form-item label="Orientation" path="fomat.orientation">
        <n-select v-model:value="value.orientation" :options="orientations" />
      </n-form-item> -->
    <n-form-item :label="$t('forms.width')" path="format.width">
      <n-input-number role="format-width" v-model:value="value.width" />
    </n-form-item>
    <n-form-item :label="$t('forms.height')" path="format.height">
      <n-input-number role="format-height" v-model:value="value.height" />
    </n-form-item>
    <h3>{{ $t("forms.margins") }}</h3>
    <MarginForm v-if="value" v-model="value.margin" role-prefix="format.margins" />
  </span>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, watchEffect } from "vue";
import { useModel } from "../../js/useModel";
import { Format } from "grid";
import MarginForm from "./MarginForm.vue";
/**
 * Form to edit paper format and margins
 */

const props = defineProps<{
  /** The format to edit */
  modelValue: Format;
}>();
const emit = defineEmits<{
  /** v-model event
   * @param value The new format
   */
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
/**
 * The format selected
 */
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
    const lengths =
      format === "custom"
        ? [props.modelValue.height, props.modelValue.width]
        : decompose(format);
    if (format === "portrait") {
      lengths.sort((a, b) => a - b);
    } else if (format === "paysage") {
      lengths.sort((a, b) => b - a);
    }
    const [height, width] = lengths;
    emit("update:modelValue", {
      ...props.modelValue,
      width,
      height,
    });
  },
});

const value = useModel<Format>(props, emit);
</script>

<style>
.sizeinput {
  display: flex;
}
.n-base-selection-label {
  min-width: 72px;
}
</style>