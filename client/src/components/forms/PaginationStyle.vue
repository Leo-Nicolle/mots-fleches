<template>
  <n-form-item :label="$t('forms.align')" path="align">
    <n-select :role="`${rolePrefix}-align`" v-model:value="value.align" :options="alignOptions" placeholder="center" />
  </n-form-item>
  <n-form-item :label="$t('forms.startIndex')" path="startIdx">
    <n-input-number :role="`${rolePrefix}-startIdx`" v-model:value="value.startIdx" />
  </n-form-item>
  <FontSelector v-model="value" :role-prefix="`${rolePrefix}-font`" />
  <MarginForm v-model="value.margin" margin-label :role-prefix="`${rolePrefix}-margin`" />
</template>
<script setup lang="ts">
import { defineProps, defineEmits, watch, ref } from "vue";
import { useModel } from "../../js/useModel";
import { PaginationStyle } from "grid";
import FontSelector from "../fonts/FontSelector.vue";
import MarginForm from "./MarginForm.vue";
import { useI18n } from "vue-i18n";
/**
 * Form to modify TextStyle.
 */
const props = defineProps<{
  /**
   * The TextStyle to edit
   */
  modelValue: PaginationStyle;
  rolePrefix: string;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   */
  (event: "update:modelValue", value: PaginationStyle): void;
}>();
const i18n = useI18n();

const alignOptions = ref([
  {
    label: i18n.t("forms.left"),
    value: "left",
  },
  {
    label: i18n.t("forms.center"),
    value: "center",
  },
]);

const value = useModel<PaginationStyle>(props, emit);

// watch(value.value, () => {
//   emit("update:modelValue", value.value);
// });
</script>
