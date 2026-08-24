import { createRouter, createWebHistory } from "vue-router";

const routes = [
  { path: "/", name: "overview", component: () => import("../views/Overview.vue") },
  { path: "/users", name: "users", component: () => import("../views/Users.vue") },
  { path: "/users/:id", name: "user", component: () => import("../views/UserDetail.vue") },
  { path: "/grids/:id", name: "grid", component: () => import("../views/GridDetail.vue") },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
