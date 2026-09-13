<template>
  <span class="buttons">
    <n-tooltip v-if="buttons.has('ordering')" trigger="hover">
      <template #trigger>
        <n-button size="small" circle @click="emit('update:ordering', nextOrdering())">
          <template #icon>
            <n-icon>
              <component :is="orderingIcon()" />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ `${$t("tooltips.ordering")}: ${orderingText()}` }}
    </n-tooltip>
    <n-tooltip v-if="buttons.has('method')" trigger="hover">
      <template #trigger>
        <n-button size="small" circle @click="emit('update:method', nextMethod())">
          <template #icon>
            <n-icon>
              <Hammer v-if="method === 'accurate'" />
              <Flash v-else />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ $t("tooltips.method") }}
    </n-tooltip>
    <n-tooltip v-if="buttons.has('dir')" trigger="hover">
      <template #trigger>
        <n-button size="small" circle
          @click="emit('update:dir', dir === 'horizontal' ? 'vertical' : 'horizontal')">
          <template #icon>
            <n-icon>
              <ArrowForward v-if="dir === 'horizontal'" />
              <ArrowDown v-else />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ $t("tooltips.direction") }}
    </n-tooltip>
    <n-tooltip v-if="buttons.has('autolayout')" trigger="hover">
      <template #trigger>
        <n-button size="small" circle class="autolayout-btn" :class="{ suggested: showAutoLayoutTip }"
          :type="autoLayoutEnabled ? 'primary' : 'default'" @click="toggleAutoLayout">
          <template #icon>
            <n-icon>
              <ReorderFourOutline />
            </n-icon>
          </template>
        </n-button>
      </template>
      {{ showAutoLayoutTip ? $t("tooltips.autoLayoutNew") : $t("tooltips.autoLayout") }}
    </n-tooltip>
  </span>
</template>
<script setup lang="ts">
import { watch, ref, onMounted } from "vue";
import {
  ArrowDown,
  ArrowForward,
  Hammer,
  Flash,
  ArrowUp,
  Shuffle,
  Trophy,
  ReorderFourOutline,
} from "@vicons/ionicons5";
import { Direction } from "grid";
import { Method, Mode, Ordering } from "../../types";
import preferences from "../../js/preferences";

const buttons = ref<Set<string>>(new Set());
const orderings = ref<Ordering[]>(['best', 'alpha', 'inverse-alpha', 'random']);
const methods: Method[] = ["accurate", "simple"];

const props = defineProps<{
  /**
 * input direction
 */
  dir: Direction;
  /**
   * search method
   */
  method: Method;
  /**
   * ordering
   */
  ordering: Ordering;

  mode: Mode;
  /**
   * Whether the focused cell is a definition cell — ordering/method only
   * apply to word suggestions, so they're swapped out for the auto-layout
   * toggle when editing a definition.
   */
  isDefinition: boolean;
}>();

const emit = defineEmits<{
  /**
   * Change direction
   */
  (event: "update:dir", value: Direction): void;
  /**
   * Change method
   */
  (event: "update:method", value: Method): void;
  /**
   * Change ordering
   */
  (event: "update:ordering", value: Ordering): void;
}>();

watch(() => props.method, (curr) => {
  const ordering = props.ordering;
  if (curr === "accurate") {
    if (ordering !== "best") {
      emit('update:ordering', "best");
    }
    orderings.value = ["best", "alpha", "inverse-alpha", "random"];
    // return throttledRefresCellProba();
  }
  if (ordering === "best") {
    emit('update:ordering', "alpha");
  }
  orderings.value = ["alpha", "inverse-alpha", "random"];
  // throttledRefresSimpleSearch();
});

watch(() => props.mode, (curr) => {
  getButtons(curr);
});
watch(() => props.isDefinition, () => {
  getButtons(props.mode);
});

/**
 * Global, per-browser auto-layout preference (see client/src/js/preferences.ts).
 * `preferences` is a plain (non-reactive) singleton, so its value is mirrored
 * into this ref rather than read directly from it — otherwise Vue has no
 * reactive dependency to know the switch's bound value ever changed.
 */
const autoLayoutEnabled = ref<boolean>(!!preferences.get("editing.autoLayoutDefinitions"));
watch(autoLayoutEnabled, (value) => {
  preferences.set("editing.autoLayoutDefinitions", value);
});

/**
 * One-time coachmark: pulse the auto-layout button the first time ever a
 * definition cell is focused, so the new feature gets noticed. Dismissed
 * (and persisted) either by clicking the button (see toggleAutoLayout) or by
 * leaving the definition cell having seen it.
 */
const showAutoLayoutTip = ref(false);
watch(() => props.isDefinition, (isDef) => {
  if (isDef) {
    if (!preferences.get("tips.hasSeenAutoLayoutTip")) {
      showAutoLayoutTip.value = true;
    }
  } else if (showAutoLayoutTip.value) {
    showAutoLayoutTip.value = false;
    preferences.set("tips.hasSeenAutoLayoutTip", true);
  }
}, { immediate: true });

function toggleAutoLayout() {
  autoLayoutEnabled.value = !autoLayoutEnabled.value;
  if (showAutoLayoutTip.value) {
    showAutoLayoutTip.value = false;
    preferences.set("tips.hasSeenAutoLayoutTip", true);
  }
}

function orderingText() {
  switch (props.ordering) {
    case "alpha":
      return "A-Z";
    case "inverse-alpha":
      return "Z-A";
    case "best":
      return "Score";
    case "random":
      return "Random";
  }
}

function orderingIcon() {
  switch (props.ordering) {
    case "alpha":
      return ArrowUp;
    case "inverse-alpha":
      return ArrowDown;
    case "best":
      return Trophy;
    case "random":
      return Shuffle;
  }
}

function nextOrdering() {
  const current = props.ordering;
  const ords = orderings.value;
  return ords[
    (ords.findIndex((o) => o === current) + 1)
    % ords.length
  ];
}

function nextMethod() {
  const current = props.method;
  return methods[
    (methods.findIndex((o) => o === current) + 1) % methods.length
  ];
}
function getButtons(mode: Mode) {
  // Ordering/method only make sense for word suggestions in regular cells;
  // a definition cell gets the direction toggle plus auto-layout instead,
  // regardless of mode.
  const bts = props.isDefinition ? ['dir', 'autolayout']
    : mode === 'autofill' ? []
      : mode === 'check' ? ['dir']
        : mode === 'heatmap' ? ['dir', 'method', 'ordering']
          : mode === 'normal' ? ['dir', 'method', 'ordering']
            : ['dir'];
  buttons.value.clear();
  bts.forEach(bt => buttons.value.add(bt));
}
onMounted(() => {
  getButtons(props.mode);
});

</script>
<style scoped>
.autolayout-btn {
  position: relative;
}

.autolayout-btn .badge {
  position: absolute;
  top: -3px;
  right: -3px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f0a020;
  box-shadow: 0 0 0 2px #fff;
}

.autolayout-btn.suggested {
  animation: pulse-animation 2s ease-in-out infinite;
}



@keyframes pulse-animation {
  0% {
    box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.2);
    scale: 100%;
  }
  10% {
    scale: 90%;
  }
  30% {
    scale: 110%;
  }
  50% {
    /* box-shadow: 0 0 0 0px rgba(0, 0, 0, 0.2); */
    scale: 100%;
  }

  100% {
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
}

</style>