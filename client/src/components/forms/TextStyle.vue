<template>
  <n-form-item :label="$t('forms.font')" path="font">
    <FontSelector />
  </n-form-item>

  <n-form-item :label="$t('forms.font')" path="font">
    <n-input
      :role="`${rolePrefix}-font`"
      v-model:value="value.font"
      placeholder="sans-serif"
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
</template>
<script setup lang="ts">
import { defineProps, defineEmits, watch } from "vue";
import { useModel } from "../../js/useModel";
import { TextSyle } from "grid";
import Sizeinput from "./Sizeinput.vue";
import FontSelector from "../fonts/font-selector.vue";
/**
 * Form to modify TextStyle.
 */
const props = defineProps<{
  /**
   * The TextStyle to edit
   */
  modelValue: TextSyle;
  rolePrefix: string;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   */
  (event: "update:modelValue", value: TextSyle): void;
}>();
const value = useModel(props, emit);

watch(value.value, () => {
  emit("update:modelValue", value.value);
});
</script>
