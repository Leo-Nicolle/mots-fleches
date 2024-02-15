<template>
  <div class="styles-form">
    <n-form ref="formRef" :label-width="80" :model="value">
      <!-- @slot Slot to add additional inputs  -->
      <slot></slot>
      <div v-if="grid">
        <h3>
          {{ $t("forms.grid") }}
        </h3>
        <n-form-item :label="$t('forms.cellSize')" path="grid.cellSize">
          <n-input-number role="cell-size" v-model:value="value.grid.cellSize" />
        </n-form-item>
        <n-form-item :label="$t('forms.borderSize')" path="grid.borderSize">
          <n-input-number role="border-size" v-model:value="value.grid.borderSize" />
        </n-form-item>
        <n-form-item :label="$t('forms.borderColor')" path="grid.borderColor">
          <n-color-picker role="border-color" v-model:value="value.grid.borderColor" :show-alpha="false" size="small" />
        </n-form-item>
        <n-form-item :label="$t('forms.outBorderSize')" path="grid.outerBorderSize">
          <n-input-number role="outerBorder-size" v-model:value="value.grid.outerBorderSize" />
        </n-form-item>
        <n-form-item :label="$t('forms.outBorderColor')" path="grid.outerBorderColor">
          <n-color-picker role="outerBorder-color" v-model:value="value.grid.outerBorderColor" :show-alpha="false"
            size="small" />
        </n-form-item>
        <n-form-item :label="$t('forms.spaceWidth')" path="grid.spaceSize">
          <n-input-number role="space" v-model:value="value.grid.spaceSize" />
        </n-form-item>
      </div>
      <h3>{{ $t("forms.solutions") }}</h3>
      <FontSelector v-model="value.solutions" role-prefix="solutions" />
      <AlignmentSelect v-model="value.solutions" role-prefix="solutions" />
      <div v-if="definition">
        <h3>{{ $t("forms.definitions") }}</h3>
        <FontSelector v-model="value.definition" rolePrefix="definition" />
        <n-form-item :label="$t('forms.lineSpacing')" path="definition.lineSpacing">
          <LineSpacing v-model="value.definition.lineSpacings" :style="value" />
        </n-form-item>
        <n-form-item :label="$t('forms.backgroundColor')" path="definition.backgroundColor">
          <n-color-picker role="definition-background-color" v-model:value="value.definition.backgroundColor"
            :show-alpha="false" size="small" />
        </n-form-item>
      </div>
      <div v-if="arrows">
        <h3>{{ $t("forms.arrows") }}</h3>
        <n-form-item :label="$t('forms.size')" path="arrow.size">
          <n-input-number role="arrow-size" v-model:value="value.arrow.size" />
        </n-form-item>
        <n-form-item :label="$t('forms.color')" path="arrow.size">
          <n-color-picker role="arrow-color" v-model:value="value.arrow.color" :show-alpha="false" size="small" />
        </n-form-item>
      </div>
      <div v-if="format">
        <format-picker v-model="value.paper"></format-picker>
      </div>
    </n-form>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, watch } from "vue";
import { useModel } from "../../js/useModel";
import { GridStyle } from "grid";
import FormatPicker from "./FormatPicker.vue";
import FontSelector from "../fonts/FontSelector.vue";
import AlignmentSelect from "./AlignmentSelect.vue";
import LineSpacing from "./LineSpacing.vue";
/**
 * Form to modify GridStyle.
 */
const props = defineProps<{
  /**
   * The grid to edit
   */
  modelValue: GridStyle;
  /**
   * Show the grid inputs
   */
  grid?: boolean;
  /**
   * Show the definition inputs
   */
  definition?: boolean;
  /**
   * Show the arrows inputs
   */
  arrows?: boolean;
  /**
   * Show the format inputs
   */
  format?: boolean;
}>();
const emit = defineEmits<{
  /**
   * v-model event
   * @param value The new grid
   */
  (event: "update:modelValue", value: GridStyle): void;
}>();
const value = useModel<GridStyle>(props, emit);
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