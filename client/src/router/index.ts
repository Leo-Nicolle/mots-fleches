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
    component: () => import('../views/Grid-Editor.vue')
  },
  {
    path: '/grid-export/:id',
    name: 'grid-export',
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
  {
    path: '/solutions',
    name: 'solutions',
    component: () => import('../views/SolutionsEditor.vue')
  },
  {
    path: '/solutions-export',
    name: 'solutions-export',
    component: () => import('../views/Solutions.vue')
  },
  {
    path: '/index-export',
    name: 'index-export',
    component: () => import('../views/Index.vue')
  },
  {
    path: '/book-export',
    name: 'book-export',
    component: () => import('../views/Book.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('../views/Logout.vue')
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
