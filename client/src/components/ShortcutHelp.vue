<template>
  <n-button quaternary circle @click="visible = true">
    <template #icon>
      <n-icon>
        <HelpCircleOutline />
      </n-icon>
    </template>
  </n-button>
  <n-modal preset="dialog" :title="$t('shortcuts.title')" :showIcon="false" v-model:show="visible">
    <div class="shortcut-list">
      <div v-for="s in shortcuts" :key="s.id" class="shortcut-row">
        <span class="shortcut-label">{{ $t(s.labelKey) }}</span>
        <span class="keys">
          <kbd v-for="k in s.keys" :key="k" class="kbc-button">{{ k }}</kbd>
        </span>
      </div>
    </div>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { HelpCircleOutline } from "@vicons/ionicons5";
import { SHORTCUTS } from "../js/shortcuts";

const props = defineProps<{
  autoOpen?: boolean;
}>();

const visible = ref(false);
const shortcuts = SHORTCUTS;

onMounted(() => {
  if (props.autoOpen && !localStorage.getItem("motsflex-shortcuts-seen")) {
    visible.value = true;
    localStorage.setItem("motsflex-shortcuts-seen", "1");
  }
});
</script>

<style scoped>
.shortcut-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.shortcut-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.keys {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}
</style>
