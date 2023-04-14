<template>
  <Layout>
    <template v-slot:left-panel>
      <slot name="left-panel"></slot>
      <n-button @click="deleteVisible = true" type="warning"
        >Supprimer</n-button
      >
    </template>
    <template v-slot:body>
      <div class="wrapper">
        <n-card v-for="(elt, i) in eltList" :key="i" :hoverable="true">
          <template #header>
            <span class="card-title">
              <slot name="card-title" :elt="elt" :i="i"> </slot>
              <n-checkbox
                @click="
                  (evt) => {
                    evt.preventDefault();
                    evt.stopPropagation();
                  }
                "
                v-model:checked="selected[i]"
              >
              </n-checkbox>
            </span>
          </template>

          <template #default>
            <div class="card-body" @click="() => onClick(elt)">
              <slot name="card-body" :elt="elt" :i="i"> </slot>
            </div>
          </template>
        </n-card>
        <n-card @click="onCreate" title="Créer">
          <template #default>
            <div class="card-body">
              <n-button class="add preview">
                <n-icon>
                  <AddIcon />
                </n-icon>
              </n-button>
            </div>
          </template>
        </n-card>

        <n-modal
          preset="dialog"
          title="Supprimer ?"
          :showIcon="false"
          v-model:show="deleteVisible"
        >
          <template #action>
            <n-button @click="deleteVisible = false">Non</n-button>
            <n-button @click="onDelete(selectedElements)" type="warning"
              >Oui</n-button
            >
          </template>
        </n-modal>
      </div>
    </template>
  </Layout>
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  watchEffect,
  defineEmits,
  watch,
  computed,
} from "vue";
import { AddCircleOutline as AddIcon } from "@vicons/ionicons5";
import Layout from "./Main.vue";
const props = defineProps<{
  eltList: any[];
  onCreate: () => void;
  onDelete: (selected: any[]) => void;
  onClick: (elt: any) => void;
}>();
const selected = ref<boolean[]>([]);
const selectedElements = computed(() =>
  props.eltList.filter((_, i) => selected.value[i])
);
const deleteVisible = ref<boolean>(false);
const emit = defineEmits<{
  (event: "select", value: any[]): void;
}>();

watchEffect(() => {
  selected.value = props.eltList.map(() => false);
});
watch(selectedElements, () => {
  console.log(selectedElements.value);
  emit("select", selectedElements.value);
});
</script>

<style scoped>
.n-grid {
  margin: 0 10px;
}
.card-title {
  display: flex;
}
.card-title > div {
  margin-left: auto;
}
.options > div {
  /* width: 100vw; */
  /* height: calc(100vh - 55px); */
  display: grid;
  grid-template-columns: 300px auto;
}
.wrapper {
  justify-content: center;
  gap: 8px 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 300px));
  width: 100%;
}

.n-card {
  box-shadow: 4px 4px 7px #ddd;
  height: 350px;
}
.card-body {
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  align-items: center;
  align-content: space-around;
  justify-content: space-around;
}
.card-body > pre {
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: 275px;
  max-width: 295px;
}
.n-card__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.n-card-cover {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
}
.n-dialog .n-dialog__action {
  display: flex;
  flex-direction: row;
  padding-top: 50px;
  justify-content: space-between;
  width: 100%;
}
.preview {
  width: 170px;
  height: 170px;
  max-width: 170px;
  max-height: 170px;
  overflow: hidden;
}
.add svg {
  transform: scale(5);
}
</style>

