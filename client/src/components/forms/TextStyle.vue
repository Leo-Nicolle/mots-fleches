<template>
        <n-form-item label="Font" path="font">
          <n-input
            role="font"
            v-model:value="value.font"
            placeholder="sans-serif"
          />
        </n-form-item>
        <n-form-item label="Taille" path="size">
          <Sizeinput v-if="typeof value.size==='string'"
          role="size"          
          v-model="value.size" />
          <n-input-number v-else
          role="size"
          v-model:value="value.size" />
        </n-form-item>
        <n-form-item label="Couleur" path="color">
          <n-color-picker
            role="color"          
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

const props = defineProps<{
  modelValue: TextSyle;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: TextSyle): void;
}>();
const value = useModel(props, emit);

watch(value.value, () => {
  emit("update:modelValue", value.value);
});
</script>
