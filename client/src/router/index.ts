import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import {api} from '../api';

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
    component: () => import('../views/auth/Logout.vue')
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/Register.vue')
  },
  {
    path: '/sentemail/:hash',
    name: 'sentemail',
    component: () => import('../views/auth/Sentemail.vue')
  },
  {
    path: '/passwordreset/:access_token(\\d+)?',
    name: 'passwordreset',
    component: () => import('../views/auth/PasswordReset.vue')
  },
  {
    path: '/words',
    name: 'words',
    component: () => import('../views/Words.vue')
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from) => {
  const isSignedin = await api.isSignedIn();
  if (
    !isSignedin &&
    to.name !== 'login'
  ) {
    return { name: 'login' };
  }
});

export default router;
