<template>
  <n-form-item
    v-if="value.left !== undefined"
    :label="$t('forms.left')"
    path="value.left"
  >
    <SizeInput
      v-if="typeof value.left === 'string'"
      :role="`${rolePrefix}-margin-left`"
      v-model="value.left"
    />
    <n-input-number
      v-else
      :role="`${rolePrefix}-margin-left`"
      v-model:value="value.left"
    />
  </n-form-item>
  <n-form-item
    v-if="value.right !== undefined"
    :label="$t('forms.right')"
    path="value.right"
  >
    <SizeInput
      v-if="typeof value.right === 'string'"
      :role="`${rolePrefix}-margin-right`"
      v-model="value.right"
    />
    <n-input-number
      v-else
      :role="`${rolePrefix}-margin-right`"
      v-model:value="value.right"
    />
  </n-form-item>
  <n-form-item
    v-if="value.top !== undefined"
    :label="$t('forms.top')"
    path="value.top"
  >
    <SizeInput
      v-if="typeof value.top === 'string'"
      :role="`${rolePrefix}-margin-top`"
      v-model="value.top"
    />
    <n-input-number
      v-else
      :role="`${rolePrefix}-margin-top`"
      v-model:value="value.top"
    />
  </n-form-item>
  <n-form-item
    v-if="value.bottom !== undefined"
    :label="$t('forms.bottom')"
    path="value.bottom"
  >
    <SizeInput
      v-if="typeof value.bottom === 'string'"
      :role="`${rolePrefix}-margin-bottom`"
      v-model="value.bottom"
    />
    <n-input-number
      v-else
      :role="`${rolePrefix}-margin-bottom`"
      v-model:value="value.bottom"
    />
  </n-form-item>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, toRaw } from "vue";
import { useModel } from "../../js/useModel";
import { Margins } from "grid";
import SizeInput from "./Sizeinput.vue";

type PartialMargins = Partial<Margins<string | number>>;
/**
 * Form to modify TextStyle.
 */
const props = defineProps<{
  /**
   * The TextStyle to edit
   */
  modelValue: PartialMargins;
  rolePrefix: string;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   */
  (event: "update:modelValue", value: Margins<string | number>): void;
}>();
const value = useModel<PartialMargins>(props, emit);
</script>