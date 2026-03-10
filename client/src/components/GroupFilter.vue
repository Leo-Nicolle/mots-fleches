<template>
  <n-select
    :value="modelValue"
    :options="options"
    @update:value="$emit('update:modelValue', $event)"
    style="width: 100%"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NSelect } from "naive-ui";
import { useI18n } from "vue-i18n";
import type { GroupSummary } from "database";

const props = defineProps<{
  modelValue: number | null;
  groups: GroupSummary[];
  resourceLabel: string;
}>();

defineEmits<{ (e: "update:modelValue", v: number | null): void }>();

const { t } = useI18n();

const options = computed(() => [
  { label: t("groups.filterMine", { resource: props.resourceLabel }), value: null },
  ...props.groups.map((g) => ({ label: g.name, value: g.id })),
]);
</script>
