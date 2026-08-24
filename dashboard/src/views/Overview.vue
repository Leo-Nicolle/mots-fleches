<template>
  <div class="container">
    <h1>Overview</h1>

    <div class="cards">
      <div class="card">
        <div class="label">Users</div>
        <div class="value">{{ summary?.totalUsers ?? "—" }}</div>
      </div>
      <div class="card">
        <div class="label">Grids</div>
        <div class="value">{{ summary?.totalGrids ?? "—" }}</div>
      </div>
      <div class="card">
        <div class="label">Styles</div>
        <div class="value">{{ summary?.totalStyles ?? "—" }}</div>
      </div>
      <div class="card">
        <div class="label">Grids / user (avg)</div>
        <div class="value">{{ avgGrids }}</div>
      </div>
    </div>

    <div v-if="error" class="panel" style="color: var(--bad)">
      {{ error }}
    </div>

    <div class="panel">
      <h2>Signups over time</h2>
      <VChart :option="signupsOption" style="height: 300px" autoresize />
    </div>

    <div class="panel">
      <h2>Grids per user (top 15)</h2>
      <VChart :option="gridsOption" style="height: 300px" autoresize />
    </div>

    <div class="panel">
      <h2>Styles per user (top 15)</h2>
      <VChart :option="stylesOption" style="height: 300px" autoresize />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { EChartsOption } from "echarts";
import { VChart } from "../echarts";
import { getSummary, getUsers } from "../api";
import type { Summary } from "../types";

const summary = ref<Summary | null>(null);
const emailById = ref<Record<number, string>>({});
const error = ref("");

onMounted(async () => {
  try {
    const [sum, users] = await Promise.all([getSummary(), getUsers()]);
    summary.value = sum;
    users.forEach((u) => (emailById.value[u.id] = u.pseudo || u.email));
  } catch (e: any) {
    error.value = e?.message || "Failed to load summary";
  }
});

const avgGrids = computed(() => {
  const s = summary.value;
  if (!s || s.totalUsers === 0) return "0";
  return (s.totalGrids / s.totalUsers).toFixed(1);
});

const signupsOption = computed<EChartsOption>(() => {
  const s = summary.value;
  if (!s) return {};
  const dates = Object.keys(s.signupsOverTime).sort();
  return {
    tooltip: { trigger: "axis" },
    grid: { left: 40, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "category", data: dates },
    yAxis: { type: "value", minInterval: 1 },
    series: [
      {
        name: "Signups",
        type: "line",
        areaStyle: { opacity: 0.2 },
        smooth: true,
        data: dates.map((d) => s.signupsOverTime[d]),
      },
    ],
  };
});

function topUsers(list: { userId: number; count: number }[], n = 15) {
  return [...list]
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map((e) => ({ name: emailById.value[e.userId] || `#${e.userId}`, count: e.count }));
}

const gridsOption = computed<EChartsOption>(() => {
  const s = summary.value;
  if (!s) return {};
  const top = topUsers(s.gridsPerUser);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 120, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "value", minInterval: 1 },
    yAxis: { type: "category", data: top.map((t) => t.name) },
    series: [
      { name: "Grids", type: "bar", data: top.map((t) => t.count) },
    ],
  };
});

const stylesOption = computed<EChartsOption>(() => {
  const s = summary.value;
  if (!s) return {};
  const top = topUsers(s.stylesPerUser);
  return {
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    grid: { left: 120, right: 20, top: 20, bottom: 40 },
    xAxis: { type: "value", minInterval: 1 },
    yAxis: { type: "category", data: top.map((t) => t.name) },
    series: [
      { name: "Styles", type: "bar", data: top.map((t) => t.count) },
    ],
  };
});
</script>
