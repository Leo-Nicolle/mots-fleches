<template>
  <section class="fonts">
    
  </section>
</template>

<script setup lang="ts">
import { computed, defineProps, onMounted, ref, toRaw, watch } from "vue";
import { api } from "../../api";
import { Font } from "database";

/**
 * Component to add and delete words
 * Also has a list of all the words
 */
const value = ref<string>("");
const fonts = ref<Font[]>([]);
const props = defineProps<{
  version?: number;
}>();
onMounted(() => {
  getFonts();
});
watch(
  () => props.version,
  () => {
    getFonts();
  }
);
function getFonts() {
  api.db.getFonts().then((ws) => {
    fonts.value = ws.sort((a, b) => a.localeCompare(b));
  });
}
function onAddKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  api.db.pushWord(toRaw(value.value)).then(() => {
    getFonts();
  });
}
function onDeleteKeyup(evt: KeyboardEvent) {
  if (evt.code !== "Enter") return;
  api.db.deleteWord(toRaw(value.value)).then(() => {
    getFonts();
  });
}

</script>

<style>
.input {
  text-transform: uppercase;
}
.fonts {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  align-items: flex-start;
  gap: 10px;
  text-transform: uppercase;
  font-size: 1em;
}
.font1{
  font-family: "test-2";
}
.font2{
  font-family: "mydummyfont";
}
.font3{
  font-family: "VeganStyle";
}

</style>
