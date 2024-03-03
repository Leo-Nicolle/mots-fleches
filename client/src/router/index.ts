import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from 'vue-router';
import { api } from '../api';
import { trackPageview } from '../js/telemetry';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/about',
    name: 'about',
    component: () => import('../views/Home.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/grids',
    name: 'grids',
    component: () => import('../views/Book.vue')
  },
  {
    path: '/books',
    name: 'books',
    component: () => import('../views/Books.vue')
  },
  {
    path: '/grid/:id',
    name: 'grid',
    component: () => import('../views/editors/GridEditor.vue')
  },
  {
    path: '/book/:id',
    name: 'book',
    component: () => import('../views/Book.vue')
  },
  {
    path: '/grid-export/:id',
    name: 'grid-export',
    component: () => import('../views/print/Grid.vue')
  },
  {
    path: '/styles',
    name: 'stylesList',
    component: () => import('../views/Styles.vue')
  },
  {
    path: '/styles/:id',
    name: 'style',
    component: () => import('../views/editors/StyleEditor.vue')
  },
  {
    path: '/solutions/:id/:bookId',
    name: 'solutions',
    component: () => import('../views/editors/SolutionsEditor.vue')
  },
  {
    path: '/solutions-export',
    name: 'solutions-export',
    component: () => import('../views/print/Solutions.vue')
  },
  {
    path: '/index-export',
    name: 'index-export',
    component: () => import('../views/print/Index.vue')
  },
  {
    path: '/book-export',
    name: 'book-export',
    component: () => import('../views/print/Book.vue')
  },
  {
    path: '/logout',
    name: 'logout',
    component: () => import('../views/auth/Logout.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/auth/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/auth/Register.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/sentemail/:hash',
    name: 'sentemail',
    component: () => import('../views/auth/Sentemail.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/passwordreset/:access_token(\\d+)?',
    name: 'passwordreset',
    component: () => import('../views/auth/PasswordReset.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/words',
    name: 'words',
    component: () => import('../views/Words.vue')
  },
  {
    path: '/fonts',
    name: 'fonts',
    component: () => import('../views/Fonts.vue')
  },
];

const router = createRouter({
  history: createWebHashHistory(''),
  routes
});

router.beforeEach(async (to, from) => {

  try {
    if (to.name) {
      trackPageview({
        url: to.name
      });
    }
  } catch (e) {
    console.error(e);
  }

  const isSignedin = await api.isSignedIn();
  if (
    !isSignedin &&
    to.meta.requiresAuth !== false
  ) {
    return { name: 'login', query: { redirect: to.name } };
  }
});

export default router;
