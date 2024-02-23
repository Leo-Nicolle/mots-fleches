<template>
  <n-button round @click="show">
    {{ $t("forms.options") }}
  </n-button>
  <n-modal v-if="book && style && solutionsStyle" class="bookmodal" v-model:show="visible" preset="dialog" title="Book"
    :show-icon="false">
    <template #header>
      <div>{{ $t("modals.bookTitle") }}</div>
    </template>
    <div class="modalbody">
      <n-form label-placement="top">
        <n-form-item :label="$t('forms.title')" path="book.title">
          <n-input v-model:value="book.title" />
        </n-form-item>
        <n-form-item :label="$t('forms.styles')" path="book.styles">
          <n-select v-model:value="book.style" :options="styles" :loading="loading" :defaultValue="style.id" filterable />
        </n-form-item>
        <n-form-item :label="$t('forms.solutionStyles')" path="book.solutionStyle">
          <n-select v-model:value="book.solutionStyle" :options="solutionStyles" :loading="loading"
            :defaultValue="solutionsStyle.id" filterable />
          />
        </n-form-item>
        <n-form-item :label="$t('forms.comment')" path="book.comment">
          <n-input type="textarea" v-model:value="book.comment" placeholder="comment" :autosize="{
            minRows: 3,
            maxRows: 10
          }" />
        </n-form-item>
      </n-form>
    </div>
    <template #action>
      <n-button type="primary" @click="save()">Ok</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { Book } from 'database';
import { api } from '../../api';
import { GridStyle, SolutionStyle, isSolutionStyle } from "grid";
import { ref, defineProps, toRaw, defineEmits } from "vue";
import { SelectOption } from 'naive-ui';
const styles = ref<any[]>([]);
const solutionStyles = ref<any[]>([]);
const book = ref<Book>();
const props = defineProps<{
  bookId: string;
  style: GridStyle;
  solutionsStyle: SolutionStyle;
}>();
const emit = defineEmits(['update']);
const visible = ref(false);
const loading = ref(false);

function fetch() {
  loading.value = true;
  const styleOptions: SelectOption[] = [];
  const solutionOptions: SelectOption[] = [];
  return api.db.getStyles().then((data) => {
    data.forEach(style => {
      const { id: value, name: label } = style;
      if (isSolutionStyle(style)) {
        solutionOptions.push({ value, label });
      } else {
        styleOptions.push({ value, label });
      }
    });
    styles.value = styleOptions;
    solutionStyles.value = solutionOptions;
    return api.db.getBook(props.bookId);
  })
    .then((b) => {
      loading.value = false;
      book.value = b;
    });
}

function show() {
  return fetch()
    .then(() => {
      visible.value = true;
    });
}

function save() {
  if (!book.value) return;
  api.db.pushBook(toRaw(book.value)).then(() => {
    visible.value = false;
    emit('update');
  });
}
</script>

<style>
.n-dialog.n-modal.bookmodal {
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