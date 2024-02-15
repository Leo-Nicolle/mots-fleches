<template>
  <n-form-item :label="$t('forms.alignmentBaseline')" :path="`${rolePrefix}.alignmentBaseline`">
    <n-select v-model:value="modelValue.alignmentBaseline" :options="alignmentBaselineOptions" />
  </n-form-item>
  <n-form-item :label="$t('forms.baselineShift')" :path="`${rolePrefix}.baselineShift`">
    <n-input-number role="format-baselineShift" v-model:value="modelValue.offset" />
  </n-form-item>
</template>
<script setup lang="ts">
import { GridStyle } from 'grid';
import { ref } from 'vue';

const alignmentBaselineOptions = ref([
  "auto", "baseline", "before-edge", "text-before-edge",
  "middle", "central", "after-edge", "text-after-edge",
  "ideographic", "alphabetic", "hanging", "mathematical",
  "inherit"
].map(e => ({ label: e, value: e })));

const props = defineProps<{
  /** The format to edit */
  modelValue: GridStyle['solutions'];
  rolePrefix: string;
}>();


</script>