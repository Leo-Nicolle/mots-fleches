<template>
  <n-button round @click="show" :disabled="!gridIds.length">
    {{ $t('forms.copy') }}...
  </n-button>
  <n-modal class="gridCopyModal" v-model:show="visible" preset="dialog" title="Book" :show-icon="false">
    <template #header>
      <div>{{ $t(`modals.copyTitle`) }}</div>
    </template>
    <div class="modalbody">
      <n-form label-placement="top">
        <n-form-item :label="$t('forms.mode')" path="copy.mode">
          <n-select v-model:value="mode" :options="modeOptions" :loading="loading" filterable />
          <InfoPopup>
            <div class="gridcopyinfo">
              <span v-for="action in actions" :key="action"><b>{{ $t(`forms.${action}`) }}</b>: {{
                $t(`help.${action}grid`)
              }}<br /></span>
            </div>
          </InfoPopup>
        </n-form-item>
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
import { useI18n } from "vue-i18n";
import { ref, defineProps, defineEmits, computed } from "vue";
import { useRoute } from 'vue-router';
import InfoPopup from '../InfoPopup.vue';
const props = defineProps<{
  isBook: boolean;
  gridIds: string[];
}>();
const route = useRoute();
const i18n = useI18n();
const emit = defineEmits(['update']);
const visible = ref(false);
const loading = ref(false);
const mode = ref<'copy' | 'reuse' | 'move'>('copy');
const options = ref<any[]>([]);
const targetBook = ref<string>('');

const actions = computed(() => props.isBook ? ['copy', 'move', 'reuse'] : ['copy', 'reuse']);
const modeOptions = computed(() => actions.value.map(a => ({
  label: i18n.t(`forms.${a}`),
  value: a
})));

function fetch() {
  loading.value = true;
  const currentBook = route.params.id || '';
  return api.db.getBooks()
    .then(books => {
      options.value = books
        .map(({ id: value, title: label }) => ({
          label, value, disabled: value === currentBook
        }));
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
    return Promise.resolve();
  }

  Vue.$plausible.trackEvent('download', { props: { method: 'HTTP' } });

  return Promise.resolve()
    .then(() => {
      if (mode.value === 'copy') {
        return api.duplicateGrids(props.gridIds, targetBook.value);
      }
      if (mode.value === 'reuse') {
        return api.reuseGrids(props.gridIds, targetBook.value);
      }
      const currentBook = route.params.id;
      return api.moveGrids(props.gridIds, currentBook as string, targetBook.value);
    })
    .then(() => emit('update'))
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

.modalbody .n-form-item-blank {
  gap: 5px;
}

.gridcopyinfo {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  flex-direction: column;
}

.gridcopyinfo span {
  max-width: 350px;
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