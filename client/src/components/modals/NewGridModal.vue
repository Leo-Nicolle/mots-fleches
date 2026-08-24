<template>
  <n-modal v-model:show="show" preset="dialog" :show-icon="false" :title="$t('buttons.newGrid')">
    <n-form label-placement="top">
      <n-form-item :label="$t('forms.rows')" path="rows">
        <n-input-number v-model:value="rows" :min="3" :max="50" />
      </n-form-item>
      <n-form-item :label="$t('forms.cols')" path="cols">
        <n-input-number v-model:value="cols" :min="3" :max="50" />
      </n-form-item>
      <n-form-item :label="$t('forms.title')" path="title">
        <n-input v-model:value="title" :placeholder="$t('buttons.newGrid')" />
      </n-form-item>
    </n-form>
    <template #action>
      <n-button @click="show = false">{{ $t("buttons.cancel") }}</n-button>
      <n-button type="primary" @click="create">{{ $t("buttons.create") }}</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";

const show = defineModel<boolean>("show", { required: true });
const emit = defineEmits<{
  (event: "create", value: { rows: number; cols: number; title: string }): void;
}>();

const rows = ref(10);
const cols = ref(10);
const title = ref("");

function create() {
  emit("create", { rows: rows.value, cols: cols.value, title: title.value });
  show.value = false;
}
</script>
