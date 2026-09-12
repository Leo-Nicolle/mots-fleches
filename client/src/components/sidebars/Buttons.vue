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
} from "@vicons/ionicons5";
import { Direction } from "grid";
import { Method, Mode, Ordering } from "../../types";

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
  const bts = mode === 'autofill' ? []
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