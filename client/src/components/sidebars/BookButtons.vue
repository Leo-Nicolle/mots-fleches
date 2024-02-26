<template>
  <h3>{{ book.title }}</h3>
  <BookModal v-model="book" :style="style" :solutionsStyle="solutionsStyle" />
  <h3>{{ $t("nav.styles") }}</h3>
  <n-button round @click="goToStyles">Styles</n-button>
  <n-button round @click="goToSlutions">Solution Styles</n-button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { defineProps } from 'vue';
import BookModal from '../modals/BookModal.vue';
import { GridStyle, SolutionStyle } from 'grid';
import { Book } from 'database';

const book = defineModel({
  type: Object as () => Book,
  default: null
});
const route = useRoute();
const router = useRouter();
const props = defineProps<{
  selected: string[];
  style: GridStyle;
  solutionsStyle: SolutionStyle;
}>();
function goToSlutions() {
  return router.push(`/solutions/${props.solutionsStyle!.id}/${route.params.id}`);
}
function goToStyles() {
  return router.push(`/styles/${props.style.id}`);
}

</script>

