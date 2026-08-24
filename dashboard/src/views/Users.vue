<template>
  <div class="container">
    <h1>Users</h1>

    <div v-if="error" class="panel" style="color: var(--bad)">
      {{ error }}
    </div>

    <div class="panel">
      <table>
        <thead>
          <tr>
            <th @click="toggleSort('id')" class="sortable">ID {{ sortArrow('id') }}</th>
            <th @click="toggleSort('email')" class="sortable">Email {{ sortArrow('email') }}</th>
            <th @click="toggleSort('pseudo')" class="sortable">Pseudo {{ sortArrow('pseudo') }}</th>
            <th @click="toggleSort('createdAt')" class="sortable">Created {{ sortArrow('createdAt') }}</th>
            <th @click="toggleSort('lastConnection')" class="sortable">Last connection {{ sortArrow('lastConnection') }}</th>
            <th @click="toggleSort('status')" class="sortable">Status {{ sortArrow('status') }}</th>
            <th @click="toggleSort('gridCount')" class="sortable">Grids {{ sortArrow('gridCount') }}</th>
            <th @click="toggleSort('styleCount')" class="sortable">Styles {{ sortArrow('styleCount') }}</th>
            <th @click="toggleSort('bookCount')" class="sortable">Books {{ sortArrow('bookCount') }}</th>
            <th @click="toggleSort('fontCount')" class="sortable">Fonts {{ sortArrow('fontCount') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="u in sortedUsers"
            :key="u.id"
            style="cursor: pointer"
            @click="router.push({ name: 'user', params: { id: u.id } })"
          >
            <td>{{ u.id }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.pseudo || "—" }}</td>
            <td class="muted">{{ formatDate(u.createdAt) }}</td>
            <td class="muted">{{ formatDate(u.lastConnection) }}</td>
            <td>
              <span :class="['pill', u.status === 'active' ? 'good' : 'bad']">
                {{ u.status || "—" }}
              </span>
            </td>
            <td>{{ u.gridCount }}</td>
            <td>{{ u.styleCount }}</td>
            <td>{{ u.bookCount }}</td>
            <td>{{ u.fontCount }}</td>
          </tr>
        </tbody>
      </table>
      <p v-if="!loading && users.length === 0" class="muted">No users found.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getUsers } from "../api";
import type { AdminUser } from "../types";

type SortKey = keyof AdminUser;

const router = useRouter();
const users = ref<AdminUser[]>([]);
const loading = ref(false);
const error = ref("");
const sortKey = ref<SortKey>("createdAt");
const sortDir = ref<"asc" | "desc">("desc");

function formatDate(ts: number | null): string {
  if (!ts) return "—";
  return new Date(ts).toLocaleString();
}

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortDir.value = "desc";
  }
}

function sortArrow(key: SortKey): string {
  if (sortKey.value !== key) return "";
  return sortDir.value === "asc" ? "▲" : "▼";
}

const sortedUsers = computed(() => {
  const dir = sortDir.value === "asc" ? 1 : -1;
  return [...users.value].sort((a, b) => {
    const av = a[sortKey.value];
    const bv = b[sortKey.value];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    return ((av as number) - (bv as number)) * dir;
  });
});

onMounted(async () => {
  loading.value = true;
  try {
    users.value = await getUsers();
  } catch (e: any) {
    error.value = e?.message || "Failed to load users";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
th.sortable {
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}

th.sortable:hover {
  color: var(--accent);
}
</style>
