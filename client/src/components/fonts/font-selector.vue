<template>
  <div>
    <n-form-item :label="$t('forms.family')" path="font-family">
      <n-select v-model:value="value.family" :options="options" filterable />
    </n-form-item>
    <n-form-item :label="$t('forms.weight')" path="font-weight">
      <n-select
        v-model:value="value.weight"
        :options="weightOptions"
        filterable
      />
    </n-form-item>
    <link
      :href="`https://fonts.googleapis.com/css?family=${value.family}:${value.weight}`"
      rel="stylesheet"
    />
    <p :style="{ fontFamily: value.family, fontWeight: value.weight }">
      Test Rendering font
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, defineProps, ref, watch, defineEmits } from "vue";
const props = defineProps<{
  /**
   * The TextStyle to edit
   */
  modelValue: string;
  rolePrefix: string;
}>();
const fonts = ref([]);
const value = ref({
  family: "sans-serif",
  isGoogle: true,
  weight: "400",
});
const options = computed(() =>
  fonts.value.map((f, i) => ({
    // @ts-ignore
    label: f.family,
    value: f.family,
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

onMounted(() => {
  fetch("/fonts.json")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      fonts.value = data.items;
    });
});

watch([value], () => {
  if (!value.value) return;
  // @ts-ignore

  // emit("update:modelValue", fonts.value[value.value].family);
});

function onUpload(filesContents: string[]) {
  console.log(filesContents);
  // const newFonts = JSON.parse(filesContents[0]);
  // fonts.value = [...fonts.value, ...newFonts.items];
}
</script>

<style lang="less">
</style>
