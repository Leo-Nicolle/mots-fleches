<template>
  <div class="options">
    <n-form ref="formRef" :label-width="80" :model="value">
      <slot></slot>
      <div v-if="grid">
        <h3>Options</h3>
        <n-form-item label="Nom" path="name">
          <n-input role="name" v-model:value="value.name" />
        </n-form-item>
        <n-form-item label="Taille cellule" path="grid.cellSize">
          <n-input-number role="cell-size" v-model:value="value.grid.cellSize" />
        </n-form-item>
        <n-form-item label="Taille bordure" path="grid.borderSize">
          <n-input-number role="border-size" v-model:value="value.grid.borderSize" />
        </n-form-item>
        <n-form-item label="Couleur bordure" path="grid.borderColor">
          <n-color-picker
            role="border-color"
            v-model:value="value.grid.borderColor"
            :show-alpha="false"
            size="small"
          />
        </n-form-item>
        <n-form-item label="Taille bordure Ext" path="grid.outerBorderSize">
          <n-input-number role="outerBorder-size" v-model:value="value.grid.outerBorderSize" />
        </n-form-item>
        <n-form-item label="Couleur bordure Ext" path="grid.outerBorderColor">
          <n-color-picker
            role="outerBorder-color"
            v-model:value="value.grid.outerBorderColor"
            :show-alpha="false"
            size="small"
          />
        </n-form-item>
        <n-form-item label="Taille espace" path="grid.spaceSize">
          <n-input-number role="space" v-model:value="value.grid.spaceSize" />
        </n-form-item>
      </div>
      <div v-if="definition">
        <h3>Définitions</h3>
        <TextStyle v-model="value.definition" />
      </div>
      <div v-if="arrows">
        <h3>Flèches</h3>
        <n-form-item label="Taille" path="arrow.size">
          <n-input-number 
          role="arrow-size"          
          v-model:value="value.arrow.size" />
        </n-form-item>
        <n-form-item label="Couleur" path="arrow.size">
          <n-color-picker
            role="arrow-color"          
            v-model:value="value.arrow.color"
            :show-alpha="false"
            size="small"
          />
        </n-form-item>
      </div>
      <div v-if="format">
        <format-picker v-model="value.paper"></format-picker>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watchEffect, watch } from "vue";
import { useModel } from "../../js/useModel";
import { GridOptions } from "grid";
import FormatPicker from "./FormatPicker.vue";
import TextStyle from "./TextStyle.vue";

const props = defineProps<{
  modelValue: GridOptions;
  grid?: boolean;
  definition?: boolean;
  arrows?: boolean;
  format?: boolean;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: GridOptions): void;
}>();
const value = useModel(props, emit);

watch(value.value, () => {
  console.log("WATCH", value.value.name);
  emit("update:modelValue", value.value);
});
</script>

<style scoped>
.n-form {
  flex-direction: column;
  width: 192px;
}
.n-color-picker {
  width: 150px;
}
</style>