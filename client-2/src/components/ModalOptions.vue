<template>
  <n-modal
    preset="dialog"
    title="Options"
    :showIcon="false"
    v-model:show="value.visible.visible"
  >
    <template #header>
      {{ value.title }}
    </template>
    <template #action>
      <n-form :label-width="80" :model="value">
        <n-form-item label="Titre" path="grid.title">
          <n-input
            placeholder="Nouvelle Grille"
            v-model:value="value.grid.title"
          />
        </n-form-item>

        <n-form-item label="Commentaire" path="grid.description">
          <n-input
            type="textarea"
            placeholder="Commentaire..."
            v-model:value="value.grid.comment"
            :autosize="{
              minRows: 3,
            }"
          />
        </n-form-item>
        <span class="rowcols">
          <n-form-item label="Lignes" path="grid.rows">
            <n-input-number
              v-model:value="value.grid.rows"
              @update="onRowChange"
            />
          </n-form-item>
          <n-form-item label="Colones" path="grid.cols">
            <n-input-number
              v-model:value="value.grid.cols"
              @update="onColChange"
            />
          </n-form-item>
        </span>
      </n-form>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";
import { Grid } from "../grid";
import { useModel } from "../js/useModel";
const props = defineProps<{
  modelValue: { grid: Grid; visible: {visible: boolean} };
}>();

const show = ref(true);
const emit = defineEmits<{
  (event: "update:modelValue", value: Grid): void;
}>();
const value = useModel(props, emit);
console.log(value.value);

function onRowChange(evt) {
  props.modelValue.grid.resize(evt, props.modelValue.grid.cols);
}
function onColChange(evt) {
  props.modelValue.grid.resize(props.modelValue.grid.rows, evt);
}

</script>

<style scoped>
.n-form {
  width: 100%;
}
.rowcols{
  display: flex;
  justify-content: space-between;
}
.rowcols > .n-form-item{
  max-width: 100px;
}
</style>