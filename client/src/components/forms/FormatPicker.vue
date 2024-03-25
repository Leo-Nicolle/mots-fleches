<template>
  <span class="formatpicker">
    <h3>{{ $t("forms.format") }}</h3>
    <n-form-item :label="$t('forms.format')" path="format.name">
      <n-select v-model:value="format" :options="options" />
    </n-form-item>
    <n-form-item :label="$t('forms.orientation')" path="format.orientation">
      <n-select v-model:value="orientation" :options="orientations" />
    </n-form-item>
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
import { ref, defineProps, defineEmits, computed, watchEffect, toRaw, watch } from "vue";
import { useI18n } from "vue-i18n";
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
const i18n = useI18n();
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
    label: i18n.t('forms.portrait'),
    value: "portrait",
  },
  {
    label: i18n.t('forms.landscape'),
    value: "landscape",
  },
]);


function getWH(format: string, orientation: string) {
  if (format === "custom") return [props.modelValue.height, props.modelValue.width];
  const [w, h] = format.split("x").map((e) => +e);
  if (orientation === "portrait") {
    return [Math.min(w, h), Math.max(w, h)];
  }
  return [Math.max(w, h), Math.min(w, h)];
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
        const [w, h] = getWH(o.value, orientation.value);
        if (w === width && h === height) return true;
      }) ||
      (options.value.find((o) => o.value === "custom") as {
        label: string;
        value: string;
      });
    return option.value;
  },
  set: (format) => {
    console.log("Set", format, orientation.value);
    const [width, height] = getWH(format, orientation.value);
    emit("update:modelValue", {
      ...toRaw(props.modelValue),
      width,
      height,
    });
  },
});

const orientation = computed({
  get: () => {
    const width = props.modelValue.width;
    const height = props.modelValue.height;
    return width > height ? "landscape" : "portrait";
  },
  set: (orientation) => {
    const w = props.modelValue.width;
    const h = props.modelValue.height;
    const width = orientation === "portrait" ? Math.min(w, h) : Math.max(w, h);
    const height = orientation === "portrait" ? Math.max(w, h) : Math.min(w, h);

    emit("update:modelValue", {
      ...toRaw(props.modelValue),
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