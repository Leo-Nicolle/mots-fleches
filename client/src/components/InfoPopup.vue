<template>
  <n-popover trigger="hover">
    <template #trigger>
      <n-button circle><n-icon>
          <Help />
        </n-icon> </n-button>
    </template>
    <span v-if="info">{info}</span>
    <slot></slot>
  </n-popover>
</template>
<script setup lang="ts">
import { Help } from '@vicons/ionicons5';
import { defineProps } from 'vue';
const props = defineProps<{
  info?: string;
}>();
</script>