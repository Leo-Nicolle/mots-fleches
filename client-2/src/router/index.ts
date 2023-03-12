import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Grids.vue')
  },
  {
    path: '/grids',
    name: 'grids',
    component: () => import('../views/Grids.vue')
  },
  {
    path: '/grid/:id',
    name: 'grid',
    component: () => import('../views/Grid.vue')
  },
  {
    path: '/options',
    name: 'optionsList',
    component: () => import('../views/OptionsList.vue')
  },
  {
    path: '/options/:id',
    name: 'options',
    component: () => import('../views/Options.vue')
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
