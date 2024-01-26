<template>
  <div class="main-layout">
    <div class="header">
      <span class="left">
        <span class="menutitle" @click="router.push('/')">
          <img class="menuicon" src="/icon.svg" />
          <span v-if="screenSize !== 'phone'">Motsflex</span>
        </span>
        <n-menu v-if="showLoginButton" class="burger" :accordion="true" :mode="'horizontal'" :collapsed="collapsed"
          :collapsed-width="64" :collapsed-icon-size="22" :options="menuOptions" />
        <!-- @slot Slot for element in the left of the header  -->
        <slot name="header"> </slot>
      </span>
      <span class="right">
        <n-popselect v-model:value="locale" :options="localeOptions">
          <n-button :type="switchingLocale ? 'warning' : ''">
            <template #icon>
              <n-icon>
                <LoaderIcon v-if="switchingLocale" />
                <LanguageOutline v-else />
              </n-icon>
            </template>
            {{ screenSize === "phone" ? "" : selected?.label }}
          </n-button>
        </n-popselect>
        <n-button v-if="showLoginButton" strong secondary :type="isSignedIn ? 'warning' : 'primary'"
          icon-placement="right" @click="isSignedIn ? router.push('/logout') : router.push('/login')">
          {{ screenSize === "phone" ? '' : $t(isSignedIn ? "buttons.exit" : "buttons.login") }}
          <template #icon>
            <n-icon>
              <LogOutOutline />
            </n-icon>
          </template>
        </n-button>
      </span>
    </div>
    <div class="body">
      <div :class="`left-panel ${leftPanelScroll ? 'scroll' : 'noscroll'}`" v-if="screenSize !== 'phone'">
        <slot name="left-panel">
        </slot>
      </div>
      <n-drawer v-else v-model:show="showLeftDrawer" @click="showLeftDrawer = false" :width="300" placement="left">
        <n-drawer-content>
          <n-scrollbar>
            <slot name="left-panel"> </slot>
          </n-scrollbar>
        </n-drawer-content>
      </n-drawer>
      <n-button v-if="screenSize === 'phone' && leftPanelWidth > 0" class="left-panel-toggle"
        :type="showLeftDrawer ? 'primary' : 'warning'" icon-placement="right" @click="showLeftDrawer = !showLeftDrawer">
        {{ showLeftDrawer ? "<" : ">" }} </n-button>

          <div @scroll="onScroll" class="maincontentscroll scroll">
            <!-- @slot Slot for element in the main panel  -->
            <slot name="body"></slot>
          </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { MenuOutline } from "@vicons/ionicons5";
import LoaderIcon from "../components/LoaderIcon.vue";
import type { MenuOption } from "naive-ui";
import {
  defineProps,
  h,
  ref,
  defineEmits,
  computed,
  watchEffect,
  withDefaults,
  onMounted,
  onBeforeMount,
  watch,
  onBeforeUnmount,
} from "vue";
import { RouterLink, useRouter } from "vue-router";
import { renderIcon } from "../js/utils";
import { LogOutOutline, LanguageOutline } from "@vicons/ionicons5";
import { i18n, setLanguage } from "../i18n";
import { workerController } from "../worker";
import { useResponsive } from "../js/useResponsive";
import "keyboard-css";
import { api } from "../api";
window.api = api;
const locale = ref(i18n.global.locale);
const nav = ref<MenuOption[]>([]);
const router = useRouter();
const showLeftDrawer = ref(false);
const { onResize, cleanupUseResponsive, screenSize } = useResponsive();
const collapsed = ref(true);
const switchingLocale = ref(false);
const props = withDefaults(
  defineProps<{
    showLoginButton?: boolean; leftPanelWidth?: number;
    leftPanelScroll?: boolean;
  }>(),
  {
    showLoginButton: true,
    leftPanelWidth: 235,
    leftPanelScroll: true
  }
);
const isSignedIn = ref(false);
function refreshSignedId() {
  api
    .isSignedIn()
    .then((res) => {
      isSignedIn.value = res;
    })
    .catch(() => {
      isSignedIn.value = false;
    });
}
const interval = setInterval(() => refreshSignedId(), 10_000);
const leftWidth = computed(() => {
  const size = screenSize.value;
  if (props.leftPanelWidth === 0) return `0px`;
  if (size === "phone") {
    return `0`;
  } else if (size === "tablet") {
    return `${Math.max(235, props.leftPanelWidth)}px`;
  }
  return `${props.leftPanelWidth}px`;
});
const emit = defineEmits<{
  /**
   * Scroll within main panel
   */
  (event: "scroll", data: Event): void;
}>();
// use this to try to make sure we dont watch the whole global object
function getNavChildren() {
  return [
    {
      label: () =>
        h(
          RouterLink,
          {
            to: "/grids",
          },
          { default: () => i18n.global.t("nav.grids") }
        ),
      key: "go-back-home",
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: "/styles",
          },
          { default: () => i18n.global.t("nav.styles") }
        ),
      key: "go-to-styles",
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: "/solutions",
          },
          { default: () => i18n.global.t("nav.solutions") }
        ),
      key: "go-to-solutions",
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: "/words",
          },
          { default: () => i18n.global.t("nav.words") }
        ),
      key: "go-to-words",
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: "/fonts",
          },
          { default: () => i18n.global.t("nav.fonts") }
        ),
      key: "go-to-fonts",
    },
    {
      label: () =>
        h(
          RouterLink,
          {
            to: "/about",
          },
          { default: () => i18n.global.t("nav.about") }
        ),
      key: "go-to-about",
    },
  ];
}

const menuOptions = computed<MenuOption[]>(() => [
  {
    label: "",
    key: "",
    icon: renderIcon(MenuOutline),
    children: nav.value,
  },
]);

const localeOptions = ref([
  {
    label: "Français",
    value: "fr-fr",
  },
  {
    label: "English",
    value: "en-en",
  },
  {
    label: "Español",
    value: "es-es",
  },
]);
const selected = computed(() => {
  return localeOptions.value.find((option) => option.value === locale.value);
});
workerController.on("locale-changed", () => {
  switchingLocale.value = false;
});
watchEffect(() => {
  switchingLocale.value = true;
  localStorage.setItem("locale", locale.value);
  setLanguage(locale.value);
  nav.value = getNavChildren();
  workerController.setLocale(locale.value);
});
onMounted(() => {
  nav.value = getNavChildren();
  refreshSignedId();
});
onBeforeUnmount(() => {
  cleanupUseResponsive();
  clearInterval(interval);
});

function onScroll(e: Event) {
  emit("scroll", e);
}
</script>

<style>
.main-layout {
  max-width: 100vw;
  min-width: 100vw;
  max-height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  display: grid;
  grid-template-rows: 42px fit-content(calc(100vh - 42px));
  grid-template-columns: auto;
}

.header {
  grid-column-start: 1;
  grid-column-end: 3;
  display: flex;
  flex-direction: row;
  width: 100%;
  margin-top: 2px;
  margin-bottom: 10px;
  overflow: hidden;
  align-items: center;
  justify-content: space-between;
  height: 42px;
  box-shadow: 0px 1px 3px #888;
  position: fixed;
  top: 0;
  z-index: 1000;
  background: white;
  padding-top: 1px;
}

.header>.left {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
  margin-left: 4px;
}

.header>.right {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  margin-right: 4px;
}

.menutitle {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  cursor: pointer;
  padding: 2px;
}

.menuicon {
  width: 32px;
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

.body {
  /* display: flex; */
  margin-top: 15px;
  grid-row-start: 2;
  display: grid;
  grid-template-columns: v-bind(leftWidth) auto;
  grid-template-rows: calc(100vh - 42px);
  grid-column-gap: 15px;
}

.left-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: v-bind(leftWidth);
  min-width: v-bind(leftWidth);
  overflow: scroll;
  max-height: 100%;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5px;
}

.left-panel .n-scrollbar-content {
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
  align-items: center;
  align-content: space-around;
  gap: 4px;
}

.left-panel-toggle {
  position: fixed;
  top: 50%;
  left: 0;
  padding: 5px;
  z-index: 10;
}

.left-panel.noscroll {
  overflow: hidden;
}

.n-drawer .n-drawer-content .n-drawer-body-content-wrapper {
  padding: 1px;
}

.leftpanel>.n-scrollbar {
  max-height: 100vh;
}

.n-menu.n-menu--horizontal .n-menu-item-content {
  padding: 0px;
}

.maincontentscroll {
  overflow: scroll;
  padding-bottom: 10px;
  padding-right: 10px;
}

#outside {
  position: absolute;
  transform: translate(100vw, 100vh);
}
</style>