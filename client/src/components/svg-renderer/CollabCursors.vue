<template>
  <div class="collab-cursors">
    <template v-for="user in remoteUsers" :key="user.clientId">
      <span
        v-if="user.focus"
        class="collab-cursor"
        :style="cursorStyle(user)"
        :title="user.name"
      >
        <span class="collab-cursor-label" :style="{ background: user.color }">
          {{ user.name }}
        </span>
      </span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { GridStyle } from "grid";
import { cellAndBorderWidth, outerBorderWidth } from "grid";
import type { RemoteUser } from "../../js/useCollab";

const props = defineProps<{
  style: GridStyle;
  zoom: number;
  remoteUsers: RemoteUser[];
}>();

function cellPx(x: number, y: number) {
  const step = cellAndBorderWidth(props.style) * props.zoom;
  const outer = outerBorderWidth(props.style) * props.zoom;
  return { left: x * step + outer, top: y * step + outer };
}

function cursorStyle(user: RemoteUser) {
  if (!user.focus) return {};
  const { left, top } = cellPx(user.focus.x, user.focus.y);
  const size = `${cellAndBorderWidth(props.style) * props.zoom}px`;
  return {
    transform: `translate(${left}px, ${top}px)`,
    width: size,
    height: size,
    outline: `2px solid ${user.color}`,
  };
}
</script>

<style scoped>
.collab-cursors {
  pointer-events: none;
}

.collab-cursor {
  position: absolute;
  box-sizing: border-box;
  border-radius: 2px;
}

.collab-cursor-label {
  position: absolute;
  top: 0;
  left: 100%;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  padding: 1px 4px;
  border-radius: 0 3px 3px 0;
  line-height: 1.4;
  pointer-events: none;
}
</style>
