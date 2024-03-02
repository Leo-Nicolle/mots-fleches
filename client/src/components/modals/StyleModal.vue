<template>
  <n-button role="modal-options-button" circle @click="visible = true">
    <n-icon>
      <CogIcon />
    </n-icon>
  </n-button>
  <n-modal preset="dialog" :title="$t('modals.style')" :showIcon="false" v-model:show="visible">
    <template #header>
      {{ $t('modals.style') }}
    </template>
    <template #action>
      <n-form :label-width="80">
        <n-form-item :label="$t('forms.name')" path="name">
          <n-input role="name" type="text" placeholder="name" v-model:value="style.name" />
        </n-form-item>
      </n-form>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import {
  ref,
  watchEffect,
  defineModel,
  watch,
  toRaw
} from "vue";
import { CogOutline as CogIcon } from "@vicons/ionicons5";
import { GridStyle, SolutionStyle } from "grid";
import { api } from "../../api";
const style = defineModel<GridStyle | SolutionStyle>({ required: true });
const visible = ref(false);
watchEffect(() => {
  if (!visible.value) return;
});

watch(style, (n) => {
  api.saveStyle(toRaw(n));
}, { deep: true });
</script>

<style scoped>
.n-form {
  width: 100%;
}

.rowcols {
  display: flex;
  justify-content: space-between;
}

.rowcols>.n-form-item {
  max-width: 100px;
}
</style>../../worker