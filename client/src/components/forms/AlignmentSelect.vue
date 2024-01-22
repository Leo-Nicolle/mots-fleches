<template>
  <n-form-item :label="$t('forms.alignmentBaseline')" :path="`${prefix}.alignmentBaseline`">
    <n-select v-model:value="modelValue.alignmentBaseline" :options="alignmentBaselineOptions" />
  </n-form-item>
  <n-form-item :label="$t('forms.baselineShift')" :path="`${prefix}.baselineShift`">
    <n-input-number role="format-baselineShift" v-model:value="modelValue.offset" />
  </n-form-item>
</template>
<script setup lang="ts">
import { SVGTextStyle } from 'grid';
import { ref } from 'vue';

const alignmentBaselineOptions = ref([
  'auto', 'baseline', 'before-edge',
  'text-before-edge',
  'middle', 'central', 'after-edge',
  'text-top', 'text-after-edge', 'ideographic',
  'alphabetic', 'hanging', 'mathematical',
  'top', 'center', 'bottom'
].map(e => ({ label: e, value: e })));

const props = defineProps<{
  /** The format to edit */
  modelValue: SVGTextStyle;
  prefix: string;
}>();


</script>