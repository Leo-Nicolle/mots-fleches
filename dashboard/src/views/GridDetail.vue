<template>
  <div class="container">
    <router-link to="/users">&larr; Back to users</router-link>
    <h1>{{ detail?.progress.title || detail?.progress.id || "Grid" }}</h1>

    <div v-if="error" class="panel" style="color: var(--bad)">
      {{ error }}
    </div>

    <template v-if="detail">
      <div class="cards">
        <div class="card">
          <div class="label">Size</div>
          <div class="value" style="font-size: 24px">
            {{ detail.progress.rows }}×{{ detail.progress.cols }}
          </div>
        </div>
        <div class="card">
          <div class="label">Completion</div>
          <div class="value">{{ pct(detail.progress.completion) }}%</div>
        </div>
        <div class="card">
          <div class="label">Words placed</div>
          <div class="value">{{ detail.progress.wordsPlaced }}</div>
        </div>
      </div>

      <div class="panel">
        <h2>Progress</h2>
        <table>
          <tbody>
            <tr>
              <td>Letters placed</td>
              <td>{{ detail.progress.lettersPlaced }} / {{ detail.progress.lettersTotal }}</td>
              <td><ProgressBar :value="ratio(detail.progress.lettersPlaced, detail.progress.lettersTotal)" /></td>
            </tr>
            <tr>
              <td>Definitions filled</td>
              <td>{{ detail.progress.definitionsFilled }} / {{ detail.progress.definitionsTotal }}</td>
              <td><ProgressBar :value="ratio(detail.progress.definitionsFilled, detail.progress.definitionsTotal)" /></td>
            </tr>
            <tr>
              <td>Arrows placed</td>
              <td>{{ detail.progress.arrowsPlaced }} / {{ detail.progress.arrowsTotal }}</td>
              <td><ProgressBar :value="ratio(detail.progress.arrowsPlaced, detail.progress.arrowsTotal)" /></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="panel">
        <h2>Grid</h2>
        <GridPreview :grid="detail.content" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getGrid } from "../api";
import type { GridDetail } from "../types";
import GridPreview from "../components/GridPreview.vue";
import ProgressBar from "../components/ProgressBar.vue";

const route = useRoute();
const detail = ref<GridDetail | null>(null);
const error = ref("");

function pct(v: number): number {
  return Math.round(v * 100);
}

function ratio(part: number, total: number): number {
  return total > 0 ? part / total : 0;
}

onMounted(async () => {
  try {
    detail.value = await getGrid(String(route.params.id));
  } catch (e: any) {
    error.value = e?.message || "Failed to load grid";
  }
});
</script>
