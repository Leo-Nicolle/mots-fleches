<template>
  <div class="main-layout">
    <div class="header">
      <slot name="header"> </slot>
      <n-menu
        class="burger"
        :accordion="true"
        :mode="'horizontal'"
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
      />
    </div>

    <div class="body">
      <div class="left-panel">
        <slot name="left-panel"> </slot>
      </div>
      <n-scrollbar
        x-scrollable
        :on-scroll="onScroll"
        style="max-height: calc(100vh - 100px); max-width: calc(100vw - 100px)"
      >
        <slot name="body"></slot>
      </n-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MenuOutline } from "@vicons/ionicons5";
import type { MenuOption } from "naive-ui";
import { defineProps, h, ref, defineEmits, computed } from "vue";
import { RouterLink, useRoute } from "vue-router";
import { renderIcon } from "../js/utils";

const route = useRoute();
const props = defineProps<{}>();
const emit = defineEmits<{ (event: "scroll"): void }>();
const collapsed = ref(true);

const menuOptions = ref<MenuOption[]>([
  {
    label: "",
    key: "",
    icon: renderIcon(MenuOutline),
    children: [
      {
        label: () =>
          h(
            RouterLink,
            {
              to: "/grids",
            },
            { default: () => "Grilles" }
          ),
        key: "go-back-home",
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: "/options",
            },
            { default: () => "Options" }
          ),
        key: "go-to-options",
      },
      {
        label: () =>
          h(
            RouterLink,
            {
              to: "/solutions",
            },
            { default: () => "Solutions" }
          ),
        key: "go-to-solutions",
      },
    ],
  },
]);

function onScroll(e: Event) {
  emit("scroll", e);
}
</script>

<style scoped>
.main-layout {
  width: 100vw;
  max-height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

nav {
  width: 100%;
  display: flex;
  padding: 5px;
  right: 10px;
}

.burger {
  margin-left: auto;
  margin-right: 25px;
}
.body{
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.leftpanel {
  width: 210px;
  min-width: 210px;
  overflow: hidden;
}
.leftpanel > .n-scrollbar {
  max-height: 100vh;
}
</style>