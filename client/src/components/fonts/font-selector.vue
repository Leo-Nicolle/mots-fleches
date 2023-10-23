<template>
  <div :version="version">
    <n-form-item :label="$t('forms.family')" path="font-family"
    >
      <n-select
        v-model:value="fontIndex"
        :options="options"
        :style="style"
        filterable
        @update:value="onChange"
      />
    </n-form-item>
    <n-form-item :label="$t('forms.weight')" path="font-weight">
      <n-select
        v-model:value="value.weight"
        :options="weightOptions"
        filterable
      />
    </n-form-item>
    <FontLoader :value="value"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, defineProps, ref, defineEmits } from "vue";
import { api } from "../../api";
import { Font } from "database";
import { loadFont } from "./load-font";
import FontLoader from "./FontLoader.vue";

const props = defineProps<{
  /**
   * The TextStyle to edit
   */
  modelValue: string;
  rolePrefix: string;
}>();
const fontIndex = ref(0);
const version = ref(0);
const fonts = ref([]);
const value = ref({
  family: "sans-serif",
  isGoogle: true,
  weight: "400",
});
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
const emit = defineEmits<{
  /** v-model event
   * @param value The new format
   */
  (event: "update:modelValue", value: string): void;
}>();
const style = computed(() => {
  return {
    "font-family": value.value.family,
    "font-weight": value.value.weight,
  };
})

onMounted(() => {
  Promise.all([api.db.getFonts(), fetch("/fonts.json")])
    .then(([fonts, response]) => Promise.all([fonts, response.json()]))
    .then(([fts, data]) => {
      console.log(fts, data);
      fonts.value = fts
        .map((f: Font) => ({ ...f, isGoogle: false, family: f.name }))
        .concat(data.items.map((f) => ({ ...f, isGoogle: true })));
    })
    .then(() =>{
      onChange(fontIndex.value);
    })
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
