<template>
  <span>
    <n-button role="modal-options-button" @click="visible = true">
      <n-icon>
        <CogIcon />
      </n-icon>
    </n-button>
    <n-modal
      preset="dialog"
      title="Options"
      :showIcon="false"
      v-model:show="visible"
    >
      <template #header>
        {{ value.title }}
      </template>
      <template #action>
        <n-form :label-width="80" :model="value">
          <n-form-item label="Titre" path="title">
            <n-input
              role="title"
              type="text"
              placeholder="Nouvelle Grille"
              v-model:value="value.title"
            />
          </n-form-item>
          <n-form-item label="Options" path="optionsId" v-if="opts.length">
            <n-select
              role="options"
              :options="opts"
              :default-value="defaultSelectOpt"
              v-model:value="value.optionsId"
              def
            />
          </n-form-item>
          <n-form-item label="Commentaire" path="description">
            <n-input
              role="comment"
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
              <n-input-number
                role="rows"
                v-model:value="value.rows"
                :on-update:value="(v) => onUpdate('rows', v)"
              />
            </n-form-item>
            <n-form-item label="Colones" path="grid.cols">
              <n-input-number
                role="cols"
                v-model:value="value.cols"
                :on-update:value="(v) => onUpdate('cols', v)"
              />
            </n-form-item>
          </span>
        </n-form>
      </template>
    </n-modal>
  </span>
</template>

<script setup lang="ts">
import {
  computed,
  defineEmits,
  defineProps,
  nextTick,
  onMounted,
  ref,
  watch,
} from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { Grid } from "grid";
import { getUrl } from "../../js/utils";
import axios from "axios";
import { useModel } from "../../js/useModel";
const props = defineProps<{
  modelValue: Grid;
}>();
const opts = ref<{ label: string; value: string }[]>([]);
const visible = ref(false);
const emit = defineEmits<{
  (event: "update:modelValue", value: Grid): void;
  (event: "update-size", value: Grid): void;
  (event: "close", value: boolean): void;
  (event: "update"): void;
}>();
const value = useModel(props, emit);
function onUpdate(path: string, newvalue: string | number) {
  value.value[path] = newvalue;
  nextTick(() => {
    emit("update-size", value.value);
  });
}

watch(value.value, () => {
  if (!visible.value) return;
  emit("update:modelValue", value.value);
});
const defaultSelectOpt = computed(() => {
  if (!props.modelValue) return "default";
  return opts.value.find((opt) => opt.value === props.modelValue.optionsId)
    ?.label;
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
    })
    .catch((err) => {
      console.error(err);
    });
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