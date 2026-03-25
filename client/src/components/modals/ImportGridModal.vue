<template>
  <n-button @click="showModal = true" round>{{ $t("buttons.importGrid") }}</n-button>
  <n-modal v-model:show="showModal" preset="dialog" :title="$t('buttons.importGrid')" :showIcon="false" style="width: 800px">
    <template #action>
      <n-form>
        <n-form-item :label="$t('forms.jsonContent')" :feedback="errorMessage" :validation-status="errorMessage ? 'error' : undefined">
          <n-input
            v-model:value="jsonText"
            type="textarea"
            :placeholder="$t('forms.jsonPlaceholder')"
            :autosize="{ minRows: 20, maxRows: 40 }"
            @input="errorMessage = ''"
          />
        </n-form-item>
      </n-form>
      <span class="actions">
        <n-button @click="onCancel">{{ $t("buttons.cancel") }}</n-button>
        <n-button type="primary" :loading="loading" @click="onImport">{{ $t("buttons.ok") }}</n-button>
      </span>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import type { GridState } from "grid";
import { api } from "../../api";

const emit = defineEmits<{
  (event: "imported"): void;
}>();

const { t } = useI18n();
const showModal = ref(false);
const jsonText = ref("");
const errorMessage = ref("");
const loading = ref(false);

async function onImport() {
  errorMessage.value = "";
  let parsed: GridState | GridState[];
  try {
    parsed = JSON.parse(jsonText.value);
  } catch {
    errorMessage.value = t("errors.invalidJson");
    return;
  }

  const grids = Array.isArray(parsed) ? parsed : [parsed];
  if (grids.length === 0) {
    errorMessage.value = t("errors.invalidJson");
    return;
  }

  loading.value = true;
  try {
    await Promise.all(grids.map((grid) => api.db.pushGrid(grid)));
    jsonText.value = "";
    showModal.value = false;
    emit("imported");
  } catch {
    errorMessage.value = t("errors.importFailed");
  } finally {
    loading.value = false;
  }
}

function onCancel() {
  jsonText.value = "";
  errorMessage.value = "";
  showModal.value = false;
}
</script>

<style scoped>
.actions {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}

:deep(.n-dialog__action) {
  display: flex;
  flex-direction: column;
}
</style>
