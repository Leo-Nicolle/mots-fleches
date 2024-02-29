<template>
  <Layout :eltList="books" :onCreate="createBook" :onDelete="onDelete" :getLink="(book) => `/book/${book.id}`"
    @select="(s) => (selected = s)" :has-create-button="true" :has-delete-button="true">
    <template v-slot:left-panel>
      <h3>{{ $t("nav.books") }}</h3>
    </template>
    <template #card-title="{ elt }">
      <BookModal v-model="(elt as Book)" mode="icon" />
      <span>
        {{ elt.title ? elt.title : $t("buttons.newBook") }}
      </span>
    </template>
    <template #card-body="{ elt, i }">
      <BookOutline />
      {{ elt.comment ? elt.comment : $t("buttons.newBook") }}
    </template>
    <template v-slot:outside>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import Layout from "../layouts/GridLayout.vue";
import BookModal from "../components/modals/BookModal.vue";
import {
  BookOutline
} from "@vicons/ionicons5";
import { v4 as uuid } from "uuid";
import { api } from "../api";
import { Book } from "database";
/**
 * View to display all grids in a grid layout
 */
const router = useRouter();
const books = ref<Book[]>([]);
const selected = ref<Book[]>([]);
function fetch() {
  return api
    .db.getBooks()
    .then((bs) => {
      books.value = bs.sort((a, b) => b.created - a.created);
    })
    .catch((e) => {
      console.error("E", e);
    });
}

function onDelete() {
  return Promise.all(
    selected.value.map((grid) => api.db.deleteBook(grid.id))
  ).then(() => fetch());
}
function createBook() {
  const newBook: Book = {
    id: uuid(),
    created: Date.now(),
    updated: Date.now(),
    grids: [],
    solutionStyle: 'solution',
    style: 'default',
    title: 'Nouveau Livre',
    comment: ''
  };
  api.db.pushBook(newBook)
    .then(() => fetch());
}

onMounted(() => {
  fetch();
});
</script>

<style scoped>
.preview {
  width: 170px;
  height: 170px;
  max-width: 170px;
  max-height: 170px;
  overflow: hidden;
  color: var(--n-title-text-color);
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-body>svg {
  max-width: 340px;
  max-height: 340px;
}
</style>