<template>
  <Layout>
    <template v-slot:left-panel>
      <div class="left-panel">
        <!-- @slot Slot to add elements within left panel  -->
        <slot name="left-panel"></slot>
        <n-button v-if="hasDeleteButton" @click="deleteVisible = true" type="warning" round>
          {{ $t("buttons.delete") }}</n-button>
      </div>
    </template>
    <template v-slot:body>
      <div class="wrapper">
        <n-card v-if="hasCreateButton" @click="onCreate" :title="$t('buttons.create')">
          <template #default>
            <div class="card-body">
              <n-button class="add preview" round>
                <n-icon>
                  <AddIcon />
                </n-icon>
              </n-button>
            </div>
          </template>
        </n-card>
        <n-card v-for="(elt, i) in eltList" :key="i" :hoverable="true">
          <template #header>
            <span class="card-title">
              <!-- @slot Slot for element title  -->
              <slot name="card-title" :elt="elt" :i="i"> </slot>
              <n-checkbox class="checkbox" @click="(evt) => {
                evt.preventDefault();
                evt.stopPropagation();
              }
                " v-model:checked="selected[i]">
              </n-checkbox>
            </span>
          </template>

          <template #default>
            <div class="card-body">
              <slot v-if="!getLink" name="card-body" :elt="elt" :i="i"> </slot>
              <router-link v-else :to="getLink(elt)">
                <slot name="card-body" :elt="elt" :i="i"> </slot>
              </router-link>
            </div>
          </template>
        </n-card>
        <n-modal preset="dialog" :title="`${$t('buttons.delete')} ?`" :showIcon="false" v-model:show="deleteVisible">
          <template #action>
            <n-button @click="deleteVisible = false">{{
              $t("buttons.no")
            }}</n-button>
            <n-button @click="onDel" type="warning">{{
              $t("buttons.yes")
            }}</n-button>
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

/**
 * Component used to display a list of elements in a grid layout.
 * And to create, delete and select elements.
 */
const props = defineProps<{
  /**
   * List of elements to display
   */
  eltList: any[];
  /**
   * Whether to display a create button
   */
  hasCreateButton: boolean;
  /**
   * Whether to display a delete button
   */
  hasDeleteButton: boolean;
  /**
   * Callback to create a new element
   */
  onCreate?: () => void;
  /**
   * Callback to delete selected elements
   */
  onDelete: (selected: any[]) => Promise<unknown>;
  /**
   * link to open when element is clicked
   */
  getLink?: (elt: any) => string;
}>();
const selected = ref<boolean[]>([]);
const selectedElements = computed(() =>
  props.eltList.filter((_, i) => selected.value[i])
);
const deleteVisible = ref<boolean>(false);
const emit = defineEmits<{
  (event: "select", value: any[]): void;
}>();
function onDel() {
  props.onDelete(selectedElements.value).then(() => {
    deleteVisible.value = false;
  });
}
watchEffect(() => {
  selected.value = props.eltList.map(() => false);
});
watch(selectedElements, () => {
  emit("select", selectedElements.value);
});
</script>

<style>
.left-panel {
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 10px;
  justify-content: flex-start;
  align-items: center;
  align-content: space-around;
}

.n-scrollbar-container:has(> .n-scrollbar-content > .wrapper) {
  border-left: 1px solid black;
}

.n-grid {
  margin: 0 10px;
}

.card-title {
  display: grid;
  grid-template-columns: 40px auto 40px;
  justify-items: center;
}

.card-title>div {
  grid-column-start: 3;
}

.card-title>div {
  margin-left: auto;
}

.wrapper {
  justify-content: center;
  gap: 8px 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 300px));
  padding-bottom: 12px;
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

.card-body>pre {
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

