<template>
  <div class="options">
    <n-form ref="formRef" inline :label-width="80" :model="value">
      <div v-if="grid">
        <h3>Grille</h3>
        <n-form-item label="Taille cellule" path="grid.cellSize">
          <Sizeinput
            @update:modelValue="onUpdate"
            v-model="value.grid.cellSize"
          />
        </n-form-item>
        <n-form-item label="Taille bordure" path="grid.borderSize">
          <Sizeinput
            @update:modelValue="onUpdate"
            v-model="value.grid.borderSize"
          />
        </n-form-item>
        <n-form-item label="Couleur bordure" path="grid.borderColor">
          <n-color-picker
            v-model:value="value.grid.borderColor"
            :show-alpha="false"
            size="small"
          />
        </n-form-item>
      </div>
      <div v-if="definition">
        <h3>Définitions</h3>
        <n-form-item label="Font" path="definition.font">
          <n-input
            @update:modelValue="onUpdate"
            v-model:value="value.definition.font"
            placeholder="sans-serif"
          />
        </n-form-item>
        <n-form-item label="Taille" path="definition.size">
          <Sizeinput
            @update:modelValue="onUpdate"
            v-model="value.definition.size"
          />
        </n-form-item>
        <n-form-item label="Couleur" path="definition.color">
          <n-color-picker
            v-model:value="value.definition.color"
            :show-alpha="false"
            size="small"
          />
        </n-form-item>
      </div>
      <div v-if="arrows">
        <h3>Flèches</h3>
        <n-form-item label="Taille" path="arrow.size">
          <Sizeinput @update:modelValue="onUpdate" v-model="value.arrow.size" />
        </n-form-item>
        <n-form-item label="Couleur" path="arrow.size">
          <n-color-picker
            v-model:value="value.arrow.color"
            :show-alpha="false"
            size="small"
          />
        </n-form-item>
      </div>
      <div v-if="format">
        <format-picker
          @update:modelValue="onUpdate"
          v-model="value.paper"
        ></format-picker>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watchEffect } from "vue";
import { useModel } from "../../js/useModel";
import { GridOptions } from "grid";
import Sizeinput from "./Sizeinput";
import FormatPicker from "./FormatPicker";

const props = defineProps<{
  modelValue: GridOptions;
  grid: boolean;
  definition: boolean;
  arrows: boolean;
  format: boolean;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: GridOptions): void;
}>();
const value = useModel(props, emit);

watchEffect(() => {
  props.modelValue.arrow.color +
  props.modelValue.definition.color +
  props.modelValue.grid.borderColor +
  props.modelValue.grid.outerBorderColor
    ? value && emit("update:modelValue", value.value)
    : null;
});
function onUpdate() {
  emit("update:modelValue", value.value);
}
</script>

<style scoped>
.n-form {
  flex-direction: column;
}
.n-color-picker {
  width: 150px;
}
</style>