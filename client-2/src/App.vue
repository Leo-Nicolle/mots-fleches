<template>
  <nav>
    <n-menu
      class="burger"
      :accordion="true"
      :mode="'horizontal'"
      :collapsed="collapsed"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
    />
  </nav>
  <router-view collapsed="true" />
</template>

<script setup lang="ts">
import { MenuOutline } from "@vicons/ionicons5";
import type { MenuOption } from "naive-ui";
import { NIcon } from "naive-ui";

import { h, ref, Component } from "vue";
import { RouterLink } from "vue-router";

const collapsed = ref(true);
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}
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
              to: "/grids"
            },
            { default: () => "Grilles" }
          ),
        key: "go-back-home",
      },
    ],
  },
]);
</script>

<style>
#app{
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
</style>
