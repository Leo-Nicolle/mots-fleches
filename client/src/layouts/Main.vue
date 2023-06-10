<template>
  <div class="main-layout">
    <div class="header">
      <span class="left">
        <n-menu
          v-if="isLoggedIn"
          class="burger"
          :accordion="true"
          :mode="'horizontal'"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="menuOptions"
        />
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
            {{ selected?.label }}
          </n-button>
        </n-popselect>
        <n-button
          v-if="isLoggedIn"
          strong
          secondary
          type="warning"
          class="exit-button"
          icon-placement="right"
          @click="exit"
        >
          {{ $t("buttons.exit") }}
          <template #icon>
            <n-icon>
              <LogOutOutline />
            </n-icon>
          </template>
        </n-button>
      </span>
    </div>

    <div class="body">
      <div class="left-panel">
        <n-scrollbar x-scrollable>
          <!-- @slot Slot for element in the left panel  -->
          <slot name="left-panel"> </slot>
        </n-scrollbar>
      </div>
      <n-scrollbar x-scrollable :on-scroll="onScroll" class="scroll">
        <!-- @slot Slot for element in the main panel  -->
        <slot name="body"></slot>
      </n-scrollbar>
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
} from "vue";
import { RouterLink, useRouter } from "vue-router";
import { renderIcon } from "../js/utils";
import { LogOutOutline, LanguageOutline } from "@vicons/ionicons5";
import { i18n, setLanguage } from "../i18n";
import { workerController } from "../search-worker";

const locale = ref(i18n.global.locale);
const nav = ref<MenuOption[]>([]);
const router = useRouter();
const collapsed = ref(true);
const switchingLocale = ref(false);
const props = withDefaults(defineProps<{ isLoggedIn: boolean }>(), {
  isLoggedIn: true,
});
const emit = defineEmits<{
  /**
   * Scroll within main panel
   */
  (event: "scroll"): void;
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
            to: "/options",
          },
          { default: () => i18n.global.t("nav.options") }
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
});

function onScroll(e: Event) {
  emit("scroll", e);
}
function exit() {
  router.push("/logout");
}
</script>

<style>
.main-layout {
  width: 100vw;
  max-height: 100vh;
  min-height: 100vh;
  overflow: hidden;
}

.header {
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
}
.header > .left {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-start;
}
.header > .right {
  display: flex;
  flex-direction: row;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  margin-right: 4px;
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
.exit-button {
  margin-right: 5px;
}

.body {
  display: flex;
  max-height: calc(100vh - 42px);
  height: calc(100vh - 42px);
  max-width: 100vw;
  width: 100vw;
  overflow: hidden;
}
.left-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 235px;
  min-width: 235px;
  overflow: hidden;
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
.scroll {
  max-height: 100%;
  max-width: calc(100vw - 235px);
  width: calc(100vw - 235px);
}
.leftpanel > .n-scrollbar {
  max-height: 100vh;
}
</style>