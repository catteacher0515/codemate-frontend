// file: src/router/index.ts
// (V3.9 最终修复版)

import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import BasicLayout from '../layouts/Basiclayout.vue';

// (这些是你已有的页面，保持不变)
const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    // (你的“基础布局”路由)
    path: '/',
    component: BasicLayout,
    redirect: '/match',
    children: [ // (所有需要布局的页面都在这里)
      {
        path: 'match',
        name: 'Match',
        component: () => import('../views/PartnerMatchPage.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/UserProfilePage.vue')
      },
      {
        path: 'user/:id',
        name: 'UserProfile',
        component: () => import('../views/UserProfilePage.vue')
      },
      {
        // (“战区 2”页面，已完成)
        path: 'team/create',
        name: 'TeamCreate',
        component: () => import('../views/TeamCreatePage.vue')
      },
      {
        // 【【【 V3.9 修复：路由指向“正确战区” 】】】
        path: 'team/:id',
        name: 'TeamDetail',
        // (旧: ../views/UserProfilePage.vue)
        // (新: 我们在 V3.8 骨架中创建的新页面)
        component: () => import('../views/TeamDetailPage.vue')
      }
    ]
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// (你强大的“导航守卫”，保持不变)
router.beforeEach((to, from, next) => {
  const publicPages = ['/login', '/register'];
  const authRequired = !publicPages.includes(to.path);
  const isAuthenticated = !!localStorage.getItem('user_login_state');

  if (authRequired && !isAuthenticated) {
    return next('/login');
  }
  if (!authRequired && isAuthenticated) {
    if (from.path === '/') {
      return next('/match');
    }
    return next(from.path);
  }
  next();
});

export default router;
