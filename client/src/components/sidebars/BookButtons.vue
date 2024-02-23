<template>
  <h3>{{ $t("nav.book") }}</h3>
  <BookModal :bookId="bookId" :style="style" :solutionsStyle="solutionsStyle" @update="$emit('update')" />
  <GridCopyModal mode="copy" buttonText="copy..." title="copy Grids to annother book" :gridIds="selected" />
  <GridCopyModal mode="move" buttonText="move..." title="move Grids to annother book" :gridIds="selected" />
  <h3>{{ $t("nav.styles") }}</h3>
  <n-button round @click="goToStyles">Styles</n-button>
  <n-button round @click="goToSlutions">Solution Styles</n-button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { defineProps, computed, defineEmits } from 'vue';
import BookModal from '../modals/BookModal.vue';
import { GridStyle, SolutionStyle } from 'grid';
import GridCopyModal from '../modals/GridCopyModal.vue';

const route = useRoute();
const router = useRouter();
const props = defineProps<{
  selected: string[];
  style: GridStyle;
  solutionsStyle: SolutionStyle;
}>();
const emits = defineEmits<{
  (event: "update"): void;
}>();
const bookId = computed(() => route.params.id as string);

function goToSlutions() {
  return router.push(`/solutions/${props.solutionsStyle!.id}/${route.params.id}`);
}
function goToStyles() {
  return router.push(`/styles/${props.style.id}`);
}

</script>

