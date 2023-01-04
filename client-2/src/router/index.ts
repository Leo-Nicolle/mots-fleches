import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import Exporting from '../views/Exporting.vue';


const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "grid" */ '../views/Grids.vue')
  },
  {
    path: '/grid/:id',
    name: 'grid',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "grid" */ '../views/Grid.vue')
  },
  {
    path: '/grids',
    name: 'grids',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "grid" */ '../views/Grids.vue')
  },
  {
    path: '/export',
    name: 'export',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: Exporting,
    props: (a,b,c) => {
      console.log(a, b,c)
    }
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;
