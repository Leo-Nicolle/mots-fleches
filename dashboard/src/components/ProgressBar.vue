<template>
  <div class="progress-bar">
    <div class="track">
      <div class="fill" :style="{ width: pct + '%', background: color }"></div>
    </div>
    <span class="pct">{{ pct }}%</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ value: number }>();

const pct = computed(() => Math.round(props.value * 100));
const color = computed(() => {
  if (props.value >= 0.9) return "var(--good)";
  if (props.value >= 0.5) return "var(--warn)";
  return "var(--bad)";
});
</script>

<style scoped>
.progress-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}
.track {
  flex: 1;
  height: 8px;
  background: var(--border);
  border-radius: 999px;
  overflow: hidden;
}
.fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.2s ease;
}
.pct {
  font-size: 12px;
  color: var(--muted);
  width: 38px;
  text-align: right;
}
</style>
