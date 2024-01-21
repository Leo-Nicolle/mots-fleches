<template>
  <n-button round @click="show">
    {{ $t("buttons.bookModal") }}
  </n-button>
  <n-modal v-if="book && style && solutionsStyle" class="bookmodal" v-model:show="visible" preset="dialog" title="Book">
    <template #header>
      <div>{{ $t("modals.bookTitle") }}</div>
    </template>
    <div class="modalbody">
      <n-form label-placement="top">
        <n-form-item :label="$t('forms.title')" path="book.title">
          <n-input v-model:value="book.title" />
        </n-form-item>
        <n-form-item :label="$t('forms.styles')" path="book.styles">
          <n-select v-model:value="book.style" />
        </n-form-item>
        <n-form-item :label="$t('forms.solutionStyle')" path="book.solutionStyle">
          <n-select v-model:value="book.solutionStyle" />
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
      <n-button>{{ $t("buttons.cancel") }}</n-button>
      <n-button type="primary" @click="save()">Ok</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { Book } from 'database';
import { api } from '../api';
import { GridStyle, SolutionStyle } from "grid";
import { ref, defineProps, toRaw, unref, nextTick } from "vue";

const book = ref<Book>();
const props = defineProps<{
  bookId: string;
  style: GridStyle;
  solutionsStyle: SolutionStyle;
}>();
const visible = ref(false);

function show() {
  api.db.getBook(props.bookId).then((b) => {
    book.value = b;
    visible.value = true;
  });
}

function save() {
  if (!book.value) return;

  api.db.updateBook(toRaw(book.value)).then(() => {
    visible.value = false;
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