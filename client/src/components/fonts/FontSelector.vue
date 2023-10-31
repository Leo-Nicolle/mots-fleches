<template>
  <div :version="version">
    <n-form-item :label="$t('forms.fontFamily')" path="font-family">
      <n-select
        v-model:value="fontIndex"
        :options="options"
        :style="style"
        filterable
        @update:value="onChange"
      />
    </n-form-item>
    <n-form-item :label="$t('forms.fontWeight')" path="font-weight">
      <n-select
        v-model:value="value.weight"
        :options="weightOptions"
        filterable
      />
    </n-form-item>
    <n-form-item :label="$t('forms.size')" path="size">
      <Sizeinput
        v-if="typeof value.size === 'string'"
        :role="`${rolePrefix}-size`"
        v-model="value.size"
      />
      <n-input-number
        v-else
        :role="`${rolePrefix}-size`"
        v-model:value="value.size"
      />
    </n-form-item>
    <n-form-item :label="$t('forms.color')" path="color">
      <n-color-picker
        :role="`${rolePrefix}-color`"
        v-model:value="value.color"
        :show-alpha="false"
        size="small"
      />
    </n-form-item>
    <FontLoader :value="value" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, defineProps, ref, defineEmits } from "vue";
import { api } from "../../api";
import { TextSyle, Font } from "grid";
import FontLoader from "./FontLoader.vue";
import Sizeinput from "../forms/Sizeinput.vue";

import { useModel } from "../../js/useModel";

const props = defineProps<{
  /**
   * The TextStyle to edit
   */
  modelValue: TextSyle;
  rolePrefix: string;
}>();
const emit = defineEmits<{
  /** v-model event
   * @param value The new format
   */
  (event: "update:modelValue", value: string): void;
}>();
const fontIndex = ref(0);
const version = ref(0);
const fonts = ref<Font[]>([]);
const value = useModel<TextSyle>(props, emit);

const options = computed(() =>
  fonts.value.map((f, i) => ({
    label: f.family,
    value: i,
  }))
);
const weightOptions = ref(
  [100, 200, 300, 400, 500, 600, 700, 800, 900].map((e) => ({
    label: e,
    value: `${e}`,
  }))
);
const style = computed(() => {
  return {
    "font-family": value.value.family,
    "font-weight": value.value.weight,
  };
});

onMounted(() => {
  Promise.all([api.db.getFonts(), fetch("/fonts.json")])
    .then(([fonts, response]) => Promise.all([fonts, response.json()]))
    .then(([fts, data]) => {
      fonts.value = fts
        .map((f) => ({ ...f, isGoogle: false }))
        .concat(data.items.map((f) => ({ ...f, isGoogle: true })));
      const index = fonts.value.findIndex(
        (f) => f.family === value.value.family
      );
      if (index !== -1) {
        fontIndex.value = index;
      }
    });
});

function onChange(e) {
  const selectedFont = fonts.value[e];
  value.value = {
    ...value.value,
    family: selectedFont.family,
    isGoogle: selectedFont.isGoogle,
  };
}
</script>

<style lang="less">
</style>
