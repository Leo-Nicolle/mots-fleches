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
import {renderIcon} from "./js/utils";

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
body{
  overflow: hidden;
}
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


.scroll::-webkit-scrollbar {
  width: 5px;
}
 
.scroll::-webkit-scrollbar-thumb {
  background: #666;
  border-radius: 20px;
}

.scroll::-webkit-scrollbar-track {
  background: #ddd;
  border-radius: 20px;
}


.hidden-input {
  position: absolute;
  bottom: 0px;
  left: 0px;
  pointer-events: none;
  visibility: hidden;
  display: block;
}
</style>
