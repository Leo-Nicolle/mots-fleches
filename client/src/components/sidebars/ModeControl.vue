<template>
  <n-button-group class="mode-control" size="small">
    <n-tooltip v-for="m in modes" :key="m" trigger="hover">
      <template #trigger>
        <n-button
          :round="m===modes[0] || m===modes[modes.length-1]"
          :type="mode === m ? 'primary' : 'default'"
          :class="{ suggested: suggested === m }"
          @click="emit('update:mode', m)"
        >
          <template #icon>
            <n-icon>
              <component :is="icons[m]" />
            </n-icon>
          </template>
          <span v-if="suggested === m" class="badge"></span>
        </n-button>
      </template>
      {{ suggested === m ? $t("modes.suggestedCheck") : `${$t(`modes.${m}`)} — ${$t(`modes.${m}Desc`)}` }}
    </n-tooltip>
  </n-button-group>
</template>

<script setup lang="ts">
import {
  CreateOutline,
  CheckmarkCircleOutline,
  FlameOutline,
} from "@vicons/ionicons5";
import type { Component } from "vue";
import type { Mode } from "../../types";

const modes: Mode[] = ["normal", "check", "heatmap"];
const icons: Record<Mode, Component> = {
  normal: CreateOutline,
  check: CheckmarkCircleOutline,
  heatmap: FlameOutline,
  autofill: CreateOutline,
};

const props = defineProps<{
  mode: Mode;
  suggested?: Mode;
}>();

const emit = defineEmits<{
  (event: "update:mode", value: Mode): void;
}>();
</script>

<style scoped>
.mode-control {
  width: 100%;
  display: flex;
  overflow: hidden;
  flex-shrink: 0;
}

.mode-control :deep(.n-button) {
  flex: 1;
  position: relative;
  min-width: 0;
  padding: 0 4px;
}

.mode-control .badge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f0a020;
  box-shadow: 0 0 0 2px #fff;
}

.mode-control .suggested {
  animation: mode-pulse 1.2s ease-in-out infinite;
}

@keyframes mode-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(240, 160, 32, 0.55);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(240, 160, 32, 0);
  }
}
</style>
