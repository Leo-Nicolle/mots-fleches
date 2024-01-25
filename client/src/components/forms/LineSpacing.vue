<template>
  <n-button role="modal-options-button" @click="visible = true">
    {{ $t("forms.lineSpacing") }}
  </n-button>
  <n-modal class="modal-options" preset="dialog" :title="`${$t('forms.lineSpacing')}: ${row + 1}/10`" :showIcon="false"
    v-model:show="visible">
    <template #action>
      <div class="body">
        <n-button circle @click="row = (row + 9) % 10">
          <template #icon>
            <n-icon>
              <ChevronBack />
            </n-icon>
          </template>
        </n-button>
        <div class="form">
          <SVGGrid :grid="grid" :style="style" :export-options="exportOptions" :focus="nullCell" :zoom="zoom" />
          <n-form :label-width="80">
            <n-form-item v-for="(col, i) in  value[row]" :key="`${row};${i}`" :label="`${$t('forms.line')} ${i + 1}`"
              path="offset">
              <n-input-number v-model:value="value[row][i]" step="1" />
            </n-form-item>
            <n-form-item :label="$t('forms.texts')" path="texts">
              <n-input type="text" v-model:value="text" />
            </n-form-item>
          </n-form>

          <span class="zoom">
            zoom
            <n-button circle @click="zoom *= 0.9">
              <template #icon>
                <AddCircleOutline />
              </template>
            </n-button>
            <n-button circle @click="zoom *= 1.1">
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
import { Grid, GridStyle, LineSpacings, lineCases, nullCell } from "grid";
import SVGGrid from "../svg-renderer/Grid.vue";
import { ExportOptions } from "../../types";
import { useModel } from '../../js/useModel';

const text = ref('test');
const texts = computed(() => {
  const t = text.value;
  return lineCases.map(e => e.replaceAll('-', t));
});
const row = ref(0);
const zoom = ref(0.2);
const grid = ref<Grid>(new Grid(1, 1));
const cell = grid.value.cells[0][0];
cell.text = texts.value[0];
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
const visible = ref(false);
/**
 * Form to edit grid metadata: rows, cols. title, comment and options
 */
const props = defineProps<{
  modelValue: LineSpacings;
  style: GridStyle;
}>();
const emit = defineEmits<{
  (event: "update:modelValue", value: LineSpacings): void;
}>();
const value = useModel<LineSpacings>(props, emit);
const cols = computed(() => {
  const res = value.value[row.value].length;
  console.log('res', res);
  return res;
});
watch([row, text], () => {
  cell.text = texts.value[row.value];
});
</script>

<style scoped>
.n-form {
  width: 100%;
}

.modal-options .n-dialog.n-modal {
  width: fit-content;
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

.body>.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.zoom {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}
</style>