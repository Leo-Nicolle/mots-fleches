<template>
  <n-form-item v-for="(d, i) in datas" :key="i" :label="d.label" :path="d.path">
    <SizeInput v-if="d.isString" :role="d.role" v-model="value[d.direction]" />
    <n-input-number v-else :role="d.role" v-model:value="value[d.direction]" />
  </n-form-item>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watch, toRaw, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useModel } from "../../js/useModel";
import { Margins } from "grid";
import SizeInput from "./Sizeinput.vue";
const i18n = useI18n();
const directions = ["left", "right", "top", "bottom"];
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
  marginLabel?: boolean;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   */
  (event: "update:modelValue", value: Margins<string | number>): void;
}>();
const datas = computed(() => {
  return directions
    .filter((d) => props.modelValue[d] !== undefined)
    .map((d) => {
      return {
        direction: d,
        value: props.modelValue[d],
        path: `${d}`,
        role: `${props.rolePrefix}-margin-${d}`,
        isString: typeof props.modelValue[d] === "string",
        label: `${props.marginLabel ? i18n.t("forms.margin") : ""} ${i18n.t(
          `forms.${d}`
        )}`,
      };
    });
});

const value = useModel<PartialMargins>(props, emit);
</script>