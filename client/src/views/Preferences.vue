<template>
  <Layout :left-panel-width="0">
    <template #left-panel>
    </template>
    <template #body>
      <div class="preferences">

        <h1>{{ t("nav.preferences") }}</h1>
        <h3>{{ t("preferences.shortcuts") }}</h3>
        <n-table :bordered="false" :single-line="false" striped>
          <thead>
            <tr>
              <th class="name">Name</th>
              <th class="key">Key</th>
              <th class="description">Description</th>
            </tr>
          </thead>
          <tbody>
            <tr class="shortcutrow" v-for="shortcut in shortcuts" :key="shortcut.name"
              @click="editingShortcut = { ...shortcut }">
              <td>{{ t(shortcut.name) }}</td>
              <td class="key">
                <Shortcut :text="shortcut.keys" />
              </td>
              <td>{{ t(help(shortcut.name)) }}</td>
            </tr>
          </tbody>
        </n-table>
      </div>

    </template>
  </Layout>
  <n-modal v-if="editingShortcut" preset="dialog" :showIcon="false" v-model:show="editingShortcut" @keydown="onKeyDown">
    <template #header>
      <div>{{ $t(editingShortcut.name) }}</div>
    </template>
    <p>Press the desired combination and then click ok</p>
    <p class="combination">
      <Shortcut :text="editingShortcut.keys" />
    </p>

    <template #action>
      <span class="action">
        <n-button type="warning" @click="cancel()">cancel</n-button>
        <n-button type="primary" @click="save()">Ok</n-button>
      </span>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import Layout from "../layouts/Main.vue";
import Shortcut from '../components/Shortcut.vue';
import { ref } from "vue";
import { onMounted } from "vue";
import { onBeforeMount } from "vue";

const { t } = useI18n();
const editingShortcut = ref();
const shortcuts = ref([
  {
    name: "preferences.shortcuts.toggleDefinition",
    keys: "Esc",
  },
  {
    name: "preferences.shortcuts.exitDefinition",
    keys: "Ctrl + Enter",
  },
  {
    name: "preferences.shortcuts.horizontalSplit",
    keys: "_",
  },
  {
    name: "preferences.shortcuts.verticalSplit",
    keys: "|",
  },
  {
    name: "preferences.shortcuts.changeMode",
    keys: "Space",
  }

]);
function getKeys(str: string) {
  return str.split(' + ').map((key) => {
    return key === 'Ctrl' ? '⌃' : key;
  });

}
function help(name: string) {
  return name.replace('preferences', 'help');
}
function save() {
  if (!editingShortcut.value) return;
  shortcuts.value.find(e => e.name === editingShortcut.value.name).keys = editingShortcut.value.keys;
  editingShortcut.value = null;
}
function cancel() {
  editingShortcut.value = null;
}
const modifiers = ['Control', 'Alt', 'Meta', "OS", 'Fn', 'AltGraph', 'Super'];
const keyNames = new Map([
  [' ', 'Space']
]);
function onKeyDown(e: KeyboardEvent) {
  if (!editingShortcut.value) return;
  const keys = modifiers.map((m) => e.getModifierState(m) ? m : '').filter((m) => m);
  if (!keys.includes(e.key)) {
    keys.push(e.key);
  }
  editingShortcut.value.keys = keys.map(k => keyNames.get(k) || (k.length === 1 ? k.toLocaleUpperCase() : k)).join(' + ');
  e.stopPropagation();
  e.preventDefault();
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown);
});
onBeforeMount(() => {
  window.removeEventListener('keydown', onKeyDown);
});
</script>

<style scoped lang="scss">
.preferences {
  width: 100%;
  padding: 10px 50px;
  max-width: 1100px;
}

.shortcutrow {
  cursor: pointer;
}

table {
  width: 1000px;
}

th.name {
  width: 200px;
}

th.key {
  width: 250px;
}

th.description {
  width: 650px;
}

td.key {
  display: flex;
  justify-content: center;
}

.action {
  padding-top: 20px;
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.combination {
  padding: 10px 0;
  display: flex;
  justify-content: center;
  width: 100%;
}
</style>

