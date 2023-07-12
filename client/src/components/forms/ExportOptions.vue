<template>
  <n-form label-placement="left" label-width="auto">
    <n-form-item
      v-for="s in switches"
      :key="s"
      :label="$t(`forms.${s}`)"
      :path="s"
    >
      <n-switch :role="s" v-model:value="value[s]" />
    </n-form-item>
  </n-form>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, computed, watch } from "vue";
import { useModel } from "../../js/useModel";
import { ExportOptions } from "../../types";

const switches = ref([
  "arrows",
  "definitions",
  "outerBorders",
  "borders",
  "texts",
  "highlight",
  "splits",
  "margins",
  "spaces",
  "fills",
]);
/**
 * Form edit a string value like "10px" or "10mm"
 * Has a unit picker and a number input
 */
const props = defineProps<{
  /**
   * The value to edit
   */
  modelValue: ExportOptions;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new value
   */
  (event: "update:modelValue", value: ExportOptions): void;
}>();
const value = useModel(props, emit);
</script>


<style>
</style>