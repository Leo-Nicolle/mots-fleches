<template>
  <div class="container">
    <router-link to="/users">&larr; Back to users</router-link>
    <h1>User #{{ userId }}</h1>

    <div v-if="error" class="panel" style="color: var(--bad)">
      {{ error }}
    </div>

    <div class="cards">
      <div class="card">
        <div class="label">Grids</div>
        <div class="value">{{ grids.length }}</div>
      </div>
      <div class="card">
        <div class="label">Avg completion</div>
        <div class="value">{{ avgCompletion }}%</div>
      </div>
      <div class="card">
        <div class="label">Total words placed</div>
        <div class="value">{{ totalWords }}</div>
      </div>
    </div>

    <div class="panel">
      <h2>Grids</h2>
      <div class="grid-list">
        <div
          v-for="g in grids"
          :key="g.id"
          class="grid-item"
          style="cursor: pointer"
          @click="router.push({ name: 'grid', params: { id: g.id } })"
        >
          <div class="grid-meta">
            <div class="title">{{ g.title || g.id }}</div>
            <div class="muted">{{ g.rows }}×{{ g.cols }} · {{ formatDate(g.updatedAt) }}</div>
            <ProgressBar :value="g.completion" />
          </div>
        </div>
      </div>
      <p v-if="!loading && grids.length === 0" class="muted">No grids yet.</p>
    </div>

     <div class="panel">
      <h2>Grids</h2>
      <div class="grid-list">
        <div
          v-for="g in gridDetails"
          :key="g.content.id"
          class="grid-item"
          style="cursor: pointer"
          @click="router.push({ name: 'grid', params: { id: g.content.id } })"
        >
          <GridPreview :grid="g.content" />
        </div>
      </div>
      <p v-if="!loading && grids.length === 0" class="muted">No grids yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getGrid, getUserGrids } from "../api";
import { GridDetail, type GridProgress } from "../types";
import GridPreview from "../components/GridPreview.vue";
import ProgressBar from "../components/ProgressBar.vue";

const route = useRoute();
const router = useRouter();
const userId = computed(() => Number(route.params.id));

const grids = ref<GridProgress[]>([]);

const gridDetails = ref<GridDetail[]>([]);
const loading = ref(false);
const error = ref("");

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

const avgCompletion = computed(() => {
  if (grids.value.length === 0) return 0;
  const sum = grids.value.reduce((acc, g) => acc + g.completion, 0);
  return Math.round((sum / grids.value.length) * 100);
});

const totalWords = computed(() =>
  grids.value.reduce((acc, g) => acc + g.wordsPlaced, 0)
);

onMounted(async () => {
  loading.value = true;
  try {
    grids.value = await getUserGrids(userId.value);

debugger;
    for (const g of grids.value ){

      const detail = await getGrid(g.id);
      gridDetails.value.push(detail)
    }

  } catch (e: any) {
    error.value = e?.message || "Failed to load grids";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.grid-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.grid-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: box-shadow 0.15s ease;
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.grid-meta {
  margin-top: 10px;
  text-align: center;
}

.grid-meta .title {
  font-weight: 600;
  margin-bottom: 4px;
  word-break: break-all;
}
</style>
