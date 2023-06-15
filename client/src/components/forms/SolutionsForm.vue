<template>
  <h3>{{ $t("forms.solutions") }}</h3>
  <n-form-item :label="$t('forms.rows')" path="rows">
    <n-input-number role="rows" v-model:value="value.grids.rows" />
  </n-form-item>
  <n-form-item :label="$t('forms.cols')" path="cols">
    <n-input-number role="cols" v-model:value="value.grids.cols" />
  </n-form-item>
  <h3>{{ $t("forms.pagination") }}</h3>
  <PaginationStyle v-model="value.pagination" role-prefix="pagination"/>
  <h3>{{ $t("forms.gridNum") }}</h3>
  <TextStyle v-model="value.grids.gridN" role-prefix="gridN"/>
  <h3>{{ $t("forms.wordIndex") }}</h3>
  <TextStyle v-model="value.words" role-prefix="wordIndex"/>
  <h3>{{ $t("forms.wordLength") }}</h3>
  <TextStyle v-model="value.size" role-prefix="wordLength"/>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, ref } from "vue";
import TextStyle from "./TextStyle.vue";
import PaginationStyle from "./PaginationStyle.vue";
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