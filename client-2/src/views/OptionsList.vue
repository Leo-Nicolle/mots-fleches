<template>
  <div class="options">
    <div>
      <div class="leftpanel">
        <h3>Options</h3>
        <n-button @click="deleteVisible = true" type="warning"
          >Supprimer</n-button
        >
      </div>
      <div class="wrapper scroll">
        <div>
          <n-card v-for="(options, i) in optionsList" :key="i" :hoverable="true">
            <template #header>
              <span class="card-title">
                <span>
                  {{ options.name ? options.name : `Nouveau Style` }}
                </span>
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
              <div class="card-body" @click="$router.push(`/options/${options.id}`)">
                  <pre v-highlightjs="sourcecode">
                    <code class="JSON">{{JSON.stringify(options, 0, 2)}}</code>
                  </pre>
              </div>
            </template>
          </n-card>
          <n-card @click="createGrid" title="Créer">
            <template #default>
              <n-button class="preview add">
                <n-icon>
                  <AddIcon />
                </n-icon>
              </n-button>
            </template>
          </n-card>
        </div>

        <n-modal
          preset="dialog"
          title="Supprimer ?"
          :showIcon="false"
          v-model:show="deleteVisible"
        >
          <template #action>
            <n-button @click="deleteVisible = false">Non</n-button>
            <n-button @click="onDelete" type="warning">Oui</n-button>
          </template>
        </n-modal>
      </div>
    </div>
    <!-- <Exporting v-else :optionsList="selectedOptions" :options="options" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { AddCircleOutline as AddIcon } from "@vicons/ionicons5";
import VueHighlightJS from 'vue3-highlightjs';
import 'highlight.js/styles/monokai.css';
 
import { getUrl } from "../js/utils";
import { Grid, GridOptions } from "grid";
const router = useRouter();
const optionsList = ref<GridOptions[]>([]);
const selected = ref<boolean[]>([]);
const deleteVisible = ref<boolean>(false);
const active = ref<GridOptions>();

const selectedOptions = computed(
  () =>
    selected.value
      .map((s, i) => (s ? optionsList.value[i] : null))
      .filter((e) => e) as GridOptions[]
);

function fetch() {
  return axios
    .get(getUrl("options"))
    .then(({ data }) => {
      optionsList.value = data;
      selected.value = new Array(optionsList.value.length).fill(false);
    })
    .catch((e) => {
      console.error("E", e);
    });
}
function onDelete() {
  Promise.all(
    selectedOptions.value.map((shouldDelete, i) =>
      axios.delete(getUrl(`options/${optionsList.value[i].id}`))
    )
  )
    .then(() => fetch())
    .then(() => (deleteVisible.value = false));
}

function createGrid() {
  const newGrid = new Grid(10, 10);
  newGrid.title = "Nouvelle Grille";
  return axios
    .post(getUrl("options"), { options: newGrid.serialize() })
    .then(() => fetch());
}

onMounted(() => {
  fetch().then(() => {
    const lastRoute = router.options.history.state.back as string;
    if (!lastRoute) return;
    const match = lastRoute.match(/\/options\/(.*)/);
    if (!match || !match.length) return;
    active.value = optionsList.value.find((options) => options.id === match[1]);
  });
});
</script>

<style>
.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.leftpanel > button {
  margin-bottom: 5px;
  width: 95px;
}
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
  width: 100vw;
  height: calc(100vh - 55px);
  display: grid;
  grid-template-columns: 300px auto;
}
.wrapper > div {
  justify-content: center;
  gap: 8px 12px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 300px));
  width: calc(100vw - 210px);
}

.wrapper {
  max-height: calc(100vh - 55px);
  padding-bottom: 10px;
  overflow-x: hidden;
}
.n-card {
  box-shadow: 4px 4px 7px #ddd;
  height: 350px;
}
.card-body > pre{
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

