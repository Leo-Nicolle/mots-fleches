<template>
  <Layout :breadcrumbs="[{ text: $t('nav.books') }]" :eltList="displayedBooks"
    :onCreate="activeGroupId === null ? createBook : undefined"
    :onDelete="onDelete"
    :getLink="(book) => `/book/${book.id}`" @select="(s) => (selected = s)"
    :has-create-button="activeGroupId === null"
    :has-delete-button="activeGroupId === null">
    <template v-slot:left-panel>
      <h3>{{ $t("nav.books") }}</h3>
      <GroupFilter
        v-if="api.mode === 'remote' && myGroups.length > 0"
        v-model="activeGroupId"
        :groups="myGroups"
        :resource-label="$t('nav.books')"
      />
    </template>
    <template #card-title="{ elt }">
      <BookModal v-model="(elt as Book)" mode="icon" />
      <span>
        {{ elt.title ? elt.title : $t("buttons.newBook") }}
      </span>
    </template>
    <template #card-body="{ elt, i }">
      <BookOutline class="preview" />
    </template>
    <template v-slot:outside>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Layout from "../layouts/GridLayout.vue";
import BookModal from "../components/modals/BookModal.vue";
import GroupFilter from "../components/GroupFilter.vue";
import { BookOutline } from "@vicons/ionicons5";
import { v4 as uuid } from "uuid";
import { api } from "../api";
import { Book } from "database";
import type { GroupSummary } from "database";
import { postEvent } from "../js/telemetry";

const books = ref<Book[]>([]);
const groupBooks = ref<Book[]>([]);
const myGroups = ref<GroupSummary[]>([]);
const activeGroupId = ref<number | null>(null);
const selected = ref<Book[]>([]);

const displayedBooks = computed(() =>
  activeGroupId.value === null ? books.value : groupBooks.value
);

async function fetchMyGroups() {
  if (api.mode !== "remote") return;
  try {
    const { data } = await api.remote.fetcher.get("/groups");
    myGroups.value = data;
  } catch (e) {
    console.error(e);
  }
}

function fetchMyBooks() {
  return api.db
    .getBooks()
    .then((bs) => {
      books.value = bs.sort((a, b) => b.created - a.created);
    })
    .catch((e) => console.error("E", e));
}

async function fetchGroupBooks(groupId: number) {
  try {
    groupBooks.value = await api.remote.getGroupBooks(groupId);
  } catch (e) {
    console.error(e);
  }
}

watch(activeGroupId, (id) => {
  if (id !== null) fetchGroupBooks(id);
  else groupBooks.value = [];
});

function onDelete() {
  postEvent("delete-book");
  return Promise.all(selected.value.map((book) => api.db.deleteBook(book.id))).then(
    () => fetchMyBooks()
  );
}

function createBook() {
  postEvent("create-book");
  const newBook: Book = {
    id: uuid(),
    created: Date.now(),
    updated: Date.now(),
    grids: [],
    solutionStyle: "solution",
    style: "default",
    title: "Nouveau Livre",
    comment: "",
  };
  api.db.pushBook(newBook).then(() => fetchMyBooks());
}

onMounted(async () => {
  await fetchMyGroups();
  fetchMyBooks();
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
  width: 340px;
  height: 340px;
}
</style>
