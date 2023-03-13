<template>
  <n-modal
    preset="dialog"
    title="Options"
    :showIcon="false"
    v-model:show="_visible"
  >
    <template #header>
      {{ value.title }}
    </template>
    <template #action>
      <n-form :label-width="80" :model="value">
        <n-form-item label="Titre" path="title">
          <n-input placeholder="Nouvelle Grille" v-model:value="value.title" />
        </n-form-item>
        <n-form-item label="Options" path="optionsId" v-if="opts.length">
          <n-select
            :options="opts"
            :default-value="defaultSelectOpt"
            v-model:value="value.optionsId"
            def
          />
        </n-form-item>
        <n-form-item label="Commentaire" path="description">
          <n-input
            type="textarea"
            placeholder="Commentaire..."
            v-model:value="value.comment"
            :autosize="{
              minRows: 3,
            }"
          />
        </n-form-item>
        <span class="rowcols">
          <n-form-item label="Lignes" path="rows">
            <n-input-number v-model:value="value.rows" />
          </n-form-item>
          <n-form-item label="Colones" path="grid.cols">
            <n-input-number v-model:value="value.cols" />
          </n-form-item>
        </span>
      </n-form>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  onMounted,
  ref,
  watch,
  watchEffect,
} from "vue";
import { Grid } from "grid";
import { getUrl } from "../../js/utils";
import axios from "axios";
const props = defineProps<{
  grid: Grid;
  visible: boolean;
}>();
const opts = ref<{ label: string; value: string }[]>([]);
const emit = defineEmits<{
  (event: "update:modelValue", value: Grid): void;
  (event: "close", value: boolean): void;
  (event: "update"): void;
}>();
const value = computed({
  get: () => props.grid,
  set: (value) => {
    return emit("update:modelValue", value);
  },
});
const _visible = ref(props.visible);
const defaultSelectOpt = computed(() => {
  if (!props.grid) return "default";
  return opts.value.find((opt) => opt.value === props.grid.optionsId)?.label;
});
onMounted(() => {
  axios
    .get(getUrl("options"))
    .then((res) => {
      return res.data.map((opt) => {
        return { label: opt.name, value: opt.id };
      });
    })
    .then((res) => {
      opts.value = res;
    });
});
watch(props.grid, () => {
  if (
    value.value.rows !== props.grid.rows ||
    value.value.cols !== props.grid.cols
  ) {
    props.grid.resize(value.value.rows, value.value.cols);
    emit("update");
  }
});
watchEffect(() => {
  console.log("visible", props.visible, _visible.value);
  if (_visible.value === props.visible) return;
  if (!props.visible) return;
  let before = _visible.value;
  _visible.value = props.visible;
  if (!before) return emit("close", false);
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
.rowcols > .n-form-item {
  max-width: 100px;
}
</style>