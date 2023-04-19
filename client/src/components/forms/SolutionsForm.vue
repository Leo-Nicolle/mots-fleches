<template>
  <h3>{{ $t("forms.solutions") }}</h3>
  <n-form-item :label="$t('forms.rows')" path="rows">
    <n-input-number role="rows" v-model:value="value.grids.rows" />
  </n-form-item>
  <n-form-item :label="$t('forms.cols')" path="cols">
    <n-input-number role="cols" v-model:value="value.grids.cols" />
  </n-form-item>
  <h3>{{ $t("forms.gridNum") }}</h3>
  <TextStyle v-model="value.grids.gridN" />
  <h3>{{ $t("forms.wordIndex") }}</h3>
  <TextStyle v-model="value.words" />
  <h3>{{ $t("forms.size") }}</h3>
  <TextStyle v-model="value.size" />
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from "vue";
import TextStyle from "./TextStyle.vue";
import { useModel } from "../../js/useModel";
import { SolutionOptions } from "grid";
/**
 * Form to modify SolutionOptions.
 */
const props = defineProps<{
  /**
   * The SolutionOptions to edit
   */
  modelValue: SolutionOptions;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new SolutionOptions
   */
  (event: "update:modelValue", value: SolutionOptions): void;
}>();
const value = useModel(props, emit);

watch(value.value, () => {
  emit("update:modelValue", value.value);
});
</script>

<style scoped>
.n-form {
  flex-direction: column;
}
.n-color-picker {
  width: 150px;
}
</style>