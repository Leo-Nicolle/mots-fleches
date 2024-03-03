<template>
  <n-button round @click="visible = true">
    {{ $t("buttons.exportsvg") }}
  </n-button>
  <n-modal v-if="grids && style && solutionsStyle && grids.length" class="exportmodal" v-model:show="visible"
    preset="dialog" title="Export SVG">
    <template #header>
      <div>{{ $t("modals.exportTitle") }}</div>
    </template>
    <div class="modalbody">
      <div class="exporter">
        <SVGGrid :grid="grids[selectedIndex]" dir="horizontal" :export-options="exportOptions" :focus="nullCell"
          :style="selectedStyle === 'default' ? style : solutionsStyle" />
      </div>
      <div class="rightpanel">
        <h3>{{ $t("forms.options") }}</h3>
        <n-scrollbar class="scroll">
          <n-radio-group v-model:value="selectedStyle" name="radiogroup">
            <n-space>
              <n-radio key="style.default" value="default" :label="$t('forms.default')" />
              <n-radio key="style.solutions" value="solutions" :label="$t('forms.solutions')" />
            </n-space>
          </n-radio-group>
          <ExportOptionsForm class="export-form" v-model="exportOptions" />
        </n-scrollbar>
      </div>
    </div>
    <template #action>
      <n-button @click="visible = false">{{ $t("buttons.cancel") }}</n-button>
      <n-button type="primary" @click="print()">Ok</n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import SVGGrid from "../svg-renderer/Grid.vue";
import ExportOptionsForm from "../forms/ExportOptions.vue";
import { Grid, GridStyle, SolutionStyle, nullCell } from "grid";
import { ref, defineProps, watch, nextTick } from "vue";
import { ExportOptions, defaultExportOptions } from "../../types";
import { postEvent } from "../../js/telemetry";

const props = defineProps<{
  grids: Grid[];
  style: GridStyle;
  solutionsStyle: SolutionStyle;
}>();
const exportOptions = ref<ExportOptions>({
  ...defaultExportOptions,
  texts: false,
});
const selectedIndex = ref(0);
const selectedStyle = ref<"default" | "solutions">("default");
const visible = ref(false);
function print() {
  const svgGrid = document.querySelector(".exporter svg");
  if (!svgGrid) return;
  postEvent('export-svg-grid');
  let promise = Promise.resolve();
  for (let i = 0; i < props.grids.length; i++) {
    promise = promise
      .then(() => {
        selectedIndex.value = i;
        return nextTick();
      })
      .then(() => new Promise((resolve) => setTimeout(resolve, 100)))
      .then(() => {
        const svg = (svgGrid.cloneNode(true) as SVGSVGElement).outerHTML;
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `grille-${props.grids[i].title}.svg`;
        document.body.appendChild(a);
        a.click();
      });
  }
}

watch([selectedStyle], () => {
  if (selectedStyle.value === "default") {
    exportOptions.value = {
      ...defaultExportOptions,
      texts: false,
    };
  } else {
    exportOptions.value = {
      ...defaultExportOptions,
      arrows: false,
      highlight: false,
      splits: false,
      spaces: false,
    };
  }
});
</script>

<style>
.n-dialog.n-modal.exportmodal {
  width: unset;
}

.modalbody {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
}

.exporter {
  max-width: 400px;
  max-height: 400px;
  overflow: hidden;
}

.rightpanel {
  width: 200px;
  margin-left: 20px;
}

.rightpanel>.scroll {
  max-height: 400px;
}
</style>