<template>
  <h3>{{ $t("forms.gridNum") }}</h3>
  <FontSelector v-model="value.grids.gridN" role-prefix="gridN" />
  <MarginForm v-model="value.grids.gridN.margin" margin-label role-prefix="margin" />
  <h3>{{ $t("forms.wordIndex") }}</h3>
  <FontSelector v-model="value.words" role-prefix="wordIndex" />
  <h3>{{ $t("forms.wordLength") }}</h3>
  <FontSelector v-model="value.size" role-prefix="wordLength" />
  <h3>{{ $t("forms.pagination") }}</h3>
  <PaginationStyle v-model="value.pagination" role-prefix="pagination" />
  <h3>{{ $t("forms.solutionsGrid") }}</h3>
  <n-form-item :label="$t('forms.rows')" path="rows">
    <n-input-number role="rows" v-model:value="value.grids.rows" />
  </n-form-item>
  <n-form-item :label="$t('forms.cols')" path="cols">
    <n-input-number role="cols" v-model:value="value.grids.cols" />
  </n-form-item>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch, toRaw } from "vue";
import FontSelector from "../fonts/FontSelector.vue";
import PaginationStyle from "./PaginationStyle.vue";
import MarginForm from "./MarginForm.vue";
import { useModel } from "../../js/useModel";
import { SolutionStyle } from "grid";
/**
 * Form to modify SolutionStyle.
 */
const props = defineProps<{
  /**
   * The SolutionStyle to edit
   */
  modelValue: SolutionStyle;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new SolutionStyle
   */
  (event: "update:modelValue", value: SolutionStyle): void;
}>();
const value = useModel<SolutionStyle>(props, emit);

</script>

<style scoped>
.n-form {
  flex-direction: column;
}

.n-color-picker {
  width: 150px;
}
</style>