import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'
import Layout from '@/layouts/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import NotFound from '@/views/NotFound.vue'
import Schema from '@/views/Schema.vue'
import Asset from '@/views/Asset.vue'
import User from '@/views/User.vue'
import ApiManager from '@/views/ApiManager.vue'

/**
 * 公开路由
 * 无需登录即可访问的路由
 */
export const publicRoutes: RouteRecordRaw[] = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { title: 'login.login' }
    },
    {
        path: '/404',
        name: 'NotFound',
        component: NotFound,
        meta: { title: 'menu.404' }
    }
]

/**
 * 私有路由
 * 需要登录后才能访问的路由
 */
export const privateRoutes: RouteRecordRaw[] = [
    {
        path: '/dashboard',
        component: Layout,
        name: 'Dashboard',
        children: [
            {
                path: '',
                name: 'DashboardPage',
                component: Dashboard,
                meta: {
                    title: 'dashboard.title',
                    icon: 'Odometer',
                    affix: true
                }
            }
        ]
    },
    {
        path: '/asset',
        name: 'Asset',
        component: Layout,
        children: [
            {
                path: '',
                name: 'AssetList',
                component: Asset,
                meta: {
                    title: 'media.title',
                    icon: 'Picture'
                }
            }
        ]
    },
    {
        path: '/schema',
        name: 'Schema',
        component: Layout,
        children: [
            {
                path: '',
                name: 'SchemaList',
                component: Schema,
                meta: {
                    title: 'menu.schema',
                    icon: 'Collection'
                }
            }
        ]
    },
    {
        path: '/api',
        name: 'ApiManager',
        component: Layout,
        children: [
            {
                path: '',
                name: 'ApiManagerPage',
                component: ApiManager,
                meta: {
                    title: 'API 管理',
                    icon: 'Link'
                }
            }
        ]
    },
    {
        path: '/user',
        name: 'User',
        component: Layout,
        children: [
            {
                path: '',
                name: 'UserList',
                component: User,
                meta: {
                    title: 'user.title',
                    icon: 'User'
                }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...publicRoutes,
        ...privateRoutes,
        { path: '/', redirect: '/dashboard' },
        { path: '/:pathMatch(.*)*', redirect: '/404' }
    ]
})

// 全局前置守卫
router.beforeEach(async (to, _from, next) => {
  const userStore = useUserStore()

  // 如果访问的是公开路由，直接放行
  if (publicRoutes.some(route => route.path === to.path)) {
      next()
      return
  }

  // 检查是否有token
  const token = userStore.token
  if (!token) {
      // 无token且访问非公开路由，跳转到登录页
      next('/login')
      return
  }

  // 检查用户信息是否存在
  if (!userStore.currentUser) {
      try {
          // 获取用户信息
          await userStore.fetchCurrentUser()
      } catch (error) {
          // 获取用户信息失败，清除token并跳转到登录页
          userStore.logout()
          next('/login')
          return
      }
  }

  // 放行
  next()
})

export default router