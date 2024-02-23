<template>
  <n-button round @click="show">
    {{ buttonText }}
  </n-button>
  <n-modal class="gridCopyModal" v-model:show="visible" preset="dialog" title="Book" :show-icon="false">
    <template #header>
      <div>{{ title }}</div>
    </template>
    <div class="modalbody">
      <n-form label-placement="top">
        <n-form-item :label="$t('forms.target')" path="copy.target">
          <n-select v-model:value="targetBook" :options="options" :loading="loading" filterable />
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <n-button @click="visible = false">{{ $t("buttons.cancel") }}</n-button>
      <n-button type="primary" @click="save()">Ok</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { api } from '../../api';
import { ref, defineProps, defineEmits } from "vue";
import { useRoute } from 'vue-router';
const props = defineProps<{
  buttonText: string;
  title: string;
  gridIds: string[];
  mode: 'copy' | 'move';
}>();
const route = useRoute();
const emit = defineEmits(['update']);
const visible = ref(false);
const loading = ref(false);
const options = ref<any[]>([]);
const targetBook = ref<string>('');

function fetch() {
  loading.value = true;
  const currentBook = route.params.id;
  return api.db.getBooks()
    .then(books => {
      options.value = books
        .map(({ id: value, title: label }) => ({
          label, value, disabled: value === currentBook
        }));
      console.log(options.value);
      loading.value = false;
    });
}

function show() {
  return fetch()
    .then(() => {
      visible.value = true;
    });
}

function save() {
  if (!targetBook.value) {
    visible.value = false;
    return;
  }
  if (props.mode === 'copy') {
    return api.duplicateGrids(props.gridIds, targetBook.value)
      .finally(() => {
        visible.value = false;
      });
  }
  const currentBook = route.params.id;
  return api.moveGrids(props.gridIds, currentBook as string, targetBook.value)
    .finally(() => {
      visible.value = false;
    });
}
</script>

<style>
.n-dialog.n-modal.gridCopyModal {
  width: unset;
}

.modalbody {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

/* make modalbody min width 400px on small screens */
@media (max-width: 400px) {
  .modalbody {
    min-width: 400px;
  }
}

/* make modalbody min width 600px on big screens */
@media (min-width: 600px) {
  .modalbody {
    min-width: 600px;
  }
}

.modalbody>form {
  min-width: 100%;
}

.exporter {
  max-width: 400px;
  max-height: 400px;
  overflow: hidden;
}


.rightpanel>.scroll {
  max-height: 400px;
}
</style>