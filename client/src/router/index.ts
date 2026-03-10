import {
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteRecordRaw,
} from "vue-router";
import { api } from "../api";
import { trackPageview } from "../js/telemetry";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../views/Home.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/grids",
    name: "grids",
    component: () => import("../views/Book.vue"),
  },
  {
    path: "/books",
    name: "books",
    component: () => import("../views/Books.vue"),
  },
  {
    path: "/grid/:id/:style",
    name: "grid",
    component: () => import("../views/editors/GridEditor.vue"),
  },
  {
    path: "/book/:id",
    name: "book",
    component: () => import("../views/Book.vue"),
  },
  {
    path: "/grid-export/:id",
    name: "grid-export",
    component: () => import("../views/print/Grid.vue"),
  },
  {
    path: "/styles",
    name: "stylesList",
    component: () => import("../views/Styles.vue"),
  },
  {
    path: "/styles/:id",
    name: "style",
    component: () => import("../views/editors/StyleEditor.vue"),
  },
  {
    path: "/solutions/:id/:bookId",
    name: "solutions",
    component: () => import("../views/editors/SolutionsEditor.vue"),
  },
  {
    path: "/solutions-export",
    name: "solutions-export",
    component: () => import("../views/print/Solutions.vue"),
  },
  {
    path: "/index-export",
    name: "index-export",
    component: () => import("../views/print/Index.vue"),
  },
  {
    path: "/book-export",
    name: "book-export",
    component: () => import("../views/print/Book.vue"),
  },
  {
    path: "/logout",
    name: "logout",
    component: () => import("../views/auth/Logout.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/auth/Login.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/auth/Register.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/sentemail/:hash",
    name: "sentemail",
    component: () => import("../views/auth/Sentemail.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/passwordreset/:access_token(\\d+)?",
    name: "passwordreset",
    component: () => import("../views/auth/PasswordReset.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/words",
    name: "words",
    component: () => import("../views/Words.vue"),
  },
  {
    path: "/fonts",
    name: "fonts",
    component: () => import("../views/Fonts.vue"),
  },
  {
    path: "/changelog",
    name: "changelog",
    component: () => import("../views/Changelog.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("../views/Profile.vue"),
  },
  {
    path: "/groups",
    name: "groups",
    component: () => import("../views/Groups.vue"),
  },
  {
    path: "/subscribe",
    name: "subscribe",
    component: () => import("../views/plans/Index.vue"),
    meta: { requiresAuth: false, allowCOEP: true },
  },
];

const router = createRouter({
  history: createWebHistory(""), // Use createWebHistory instead of createWebHashHistory
  routes,
});

router.beforeEach(async (to, from) => {
  try {
    if (to.name) {
      trackPageview({
        url: to.name,
      });
    }
  } catch (e) {
    console.error(e);
  }

  const isSignedin = await api.isSignedIn();
  if (!isSignedin && to.meta.requiresAuth !== false) {
    return { name: "login", query: { redirect: to.name } };
  }

  if (to.meta.allowCOEP) {
    // Clear COEP/COOP cookies
    console.log("ALLOW COEP");
    document.cookie =
      "cross-origin-opener-policy=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie =
      "cross-origin-embedder-policy=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    // Perform a full page reload for allowCOEP routes
    if (to.fullPath !== window.location.pathname) {
      window.location.href = to.fullPath; // Ensure clean navigation
      return false; // Prevent Vue Router from handling the navigation
    }
  } else {
    // Set COEP/COOP headers for other routes
    console.log("Setting COEP/COOP headers");
    document.cookie = "cross-origin-opener-policy=same-origin; path=/";
    document.cookie = "cross-origin-embedder-policy=credentialless; path=/";
  }

  return true;
});

export default router;
