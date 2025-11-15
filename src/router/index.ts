import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';
import BasicLayout from '../layouts/Basiclayout.vue';

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
    path: '/',
    component: BasicLayout,
    redirect: '/match',
    children: [ //
      {
        path: 'match',
        name: 'Match',
        component: () => import('../views/PartnerMatchPage.vue')
      },
      {
        // (查看“自己”的资料)
        path: 'profile',
        name: 'Profile',
        component: () => import('../views/UserProfilePage.vue')
      },
      {
        // (查看“他人”的资料)
        path: 'user/:id', // (e.g., /user/1, /user/2)
        name: 'UserProfile',
        component: () => import('../views/UserProfilePage.vue')
      },

      // 【【【 案卷 #17：“施工”开始 】】】
      // (这是我们上一轮 讨论的、
      //  必须添加的两条“新道路”)
      {
        // 1. “创建队伍”页面的“道路”
        path: 'team/create',
        name: 'TeamCreate',
        component: () => import('../views/TeamCreatePage.vue')
      },
      {
        // 2. “创建”成功后“跳转”用的“道路”
        path: 'team/:id', // (e.g., /team/1, /team/2)
        name: 'TeamDetail',
        // (我们“临时复用” UserProfilePage.vue，
        //  未来再为它创建 TeamDetailPage.vue)
        component: () => import('../views/UserProfilePage.vue')
      }
      // 【【【 案卷 #17：“施工”完毕 】】】
    ]
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// (导航守卫保持不变)
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
