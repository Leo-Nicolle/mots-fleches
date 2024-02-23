<template>
  <h3>{{ $t("nav.book") }}</h3>
  <BookModal :bookId="bookId" :style="style" :solutionsStyle="solutionsStyle" @update="$emit('update')" />
  <n-button round @click="">Copy</n-button>
  <n-button round @click="">Move</n-button>
  <h3>{{ $t("nav.styles") }}</h3>
  <n-button round @click="goToStyles">Styles</n-button>
  <n-button round @click="goToSlutions">Solution Styles</n-button>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { defineProps, computed, defineEmits } from 'vue';
import BookModal from '../modals/BookModal.vue';
import { GridStyle, SolutionStyle } from 'grid';

const route = useRoute();
const router = useRouter();
const props = defineProps<{
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

