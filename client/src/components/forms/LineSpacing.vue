<template>
  <span v-if="modelValue">
    <n-button role="modal-options-button" @click="visible = true">
      {{ $t("forms.lineSpacing") }}
    </n-button>
    <n-modal preset="dialog" :title="`${$t('forms.lineSpacing')}: ${row}/10`" :showIcon="false" v-model:show="visible">
      <template #action>
        <div class="body">
          <n-button circle @click="row = (row + 9) % 10">
            <template #icon>
              <n-icon>
                <ChevronBack />
              </n-icon>
            </template>
          </n-button>
          <div>
            <SVGGrid :grid="grid" :style="modelValue" :export-options="exportOptions" :focus="nullCell" :zoom="zoom" />
            <n-form :label-width="80">
              <n-form-item v-for="col  in  props.modelValue.definition.lineSpacings[row]" :key="col"
                :label="`${$t('forms.line')} ${col}`" path="offset">
                <n-input-number v-model="props.modelValue.definition.lineSpacings[row][col]" />
              </n-form-item>
            </n-form>
            <span>
              zoom
              <n-button circle @click="zoom -= 0.1">
                <template #icon>
                  <AddCircleOutline />
                </template>
              </n-button>
              <n-button circle @click="zoom += 0.1">
                <template #icon>
                  <RemoveCircleOutline />
                </template>
              </n-button>
            </span>
          </div>

          <n-button circle @click="row = (row + 1) % 10">
            <template #icon>
              <n-icon>
                <ChevronForward />
              </n-icon>
            </template>
          </n-button>
        </div>
      </template>
    </n-modal>
  </span>
</template>

<script setup lang="ts">
import {
  computed,
  defineProps,
  ref,
  watch,
} from "vue";
import {
  ChevronBack,
  ChevronForward,
  AddCircleOutline,
  RemoveCircleOutline,
} from "@vicons/ionicons5";
import { Grid, GridStyle, nullCell } from "grid";
import SVGGrid from "../svg-renderer/Grid.vue";
import { ExportOptions } from "../../types";


const texts = [
  'test',
  'test\ntest',
  'test\ntest\ntest',
  'test\ntest\ntest\ntest',
  'test\n\ntest',
  'test\n\ntest\ntest',
  'test\ntest\n\ntest',
  'test\n\ntest\ntest\ntest',
  'test\ntest\n\ntest\ntest',
  'test\ntest\ntest\n\ntest',
];
const row = ref(0);
const zoom = ref(1);
const grid = ref<Grid>(new Grid(1, 1));
const cell = grid.value.cells[0][0];
cell.text = texts[0];
cell.definition = true;
const exportOptions = ref<ExportOptions>({
  arrows: true,
  definitions: true,
  outerBorders: true,
  borders: true,
  texts: true,
  highlight: true,
  splits: true,
  margins: true,
  spaces: true,
  fills: true,
  pagination: true,
});
const visible = ref(true);
/**
 * Form to edit grid metadata: rows, cols. title, comment and options
 */
const props = defineProps<{
  modelValue: GridStyle;
}>();
watch(row, () => {
  cell.text = texts[row.value];
});
</script>

<style scoped>
.n-form {
  width: 100%;
}

.rowcols {
  display: flex;
  justify-content: space-between;
}

.rowcols>.n-form-item {
  max-width: 100px;
}

.body {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: flex-start;
  align-items: center;
  min-width: 400px;
  width: max-content;
  min-height: 300px;
  height: max-content;
}
</style>../../worker