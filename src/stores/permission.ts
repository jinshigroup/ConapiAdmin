// src/stores/permission.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { RouteRecordRaw } from 'vue-router'
import { privateRoutes } from '@/router'

// src/stores/permission.ts
export const usePermissionStore = defineStore('permission', () => {
  const routes = ref<RouteRecordRaw[]>([])
  const addRoutes = ref<RouteRecordRaw[]>([])

  // 设置路由
  const setRoutes = (newRoutes: RouteRecordRaw[]) => {
    routes.value = newRoutes
    addRoutes.value = newRoutes
  }

  // 初始化路由
  const initRoutes = () => {
    // 过滤出有效的顶级路由
    const accessedRoutes = privateRoutes.filter(route => {
      // 排除登录页面和隐藏页面
      if (route.path === '/login' || route.meta?.hidden) {
        return false
      }

      // 保留顶级路由（以 / 开头且不是 /* 的路由）
      if (route.path === '/' || (route.path.startsWith('/') && !route.path.includes('*'))) {
        // 对于根路径，即使没有明确的meta信息也要保留，因为它可能包含子路由如首页
        if (route.path === '/') {
          return true;
        }
        return route.meta?.title || route.meta?.icon || route.name || route.redirect
      }

      return false
    })

    // 处理嵌套路由结构，确保所有路由都是一级菜单
    const processedRoutes = accessedRoutes.map(route => {
      // 特殊处理根路径（仪表盘）
      if (route.path === '/') {
        // 保留其子路由结构，但确保首页能正确显示在菜单中
        if (route.children && route.children.length > 0) {
          const dashboardChild = route.children.find((child: any) => child.path === 'dashboard');
          if (dashboardChild) {
            // 为根路径添加仪表盘的元信息，以便在菜单中显示
            route.meta = {
              ...route.meta,
              ...dashboardChild.meta,
              title: dashboardChild.meta?.title || 'dashboard.title'
            };
            // 确保路径正确
            route.path = '/dashboard';
          }
        }
        return route;
      }

      // 处理其他路由 - 确保它们可以直接在菜单中显示
      if (route.children && route.children.length > 0) {
        // 对于有子路由的情况，我们需要确保父路由具有正确的元信息
        const validChildren = route.children.filter((child: any) => 
          child.meta?.title || child.meta?.icon || child.name);
        
        if (validChildren.length > 0) {
          // 使用第一个有效子路由的元信息
          const firstChild = validChildren[0];
          route.meta = {
            ...route.meta,
            ...firstChild.meta
          };
        }
      }
      
      // 确保路由路径正确
      if (!route.path.startsWith('/')) {
        route.path = '/' + route.path;
      }

      return route;
    })

    routes.value = processedRoutes
    addRoutes.value = processedRoutes
    return processedRoutes
  }

  // 生成可访问的路由
  const generateRoutes = async (allRoutes: RouteRecordRaw[]): Promise<RouteRecordRaw[]> => {
    // 过滤出有效的顶级路由
    const accessedRoutes = allRoutes.filter(route => {
      // 排除登录页面和隐藏页面
      if (route.path === '/login' || route.meta?.hidden) {
        return false
      }

      // 保留顶级路由（以 / 开头且不是 /* 的路由）
      if (route.path === '/' || (route.path.startsWith('/') && !route.path.includes('*'))) {
        // 对于根路径，即使没有明确的meta信息也要保留，因为它可能包含子路由如首页
        if (route.path === '/') {
          return true;
        }
        return route.meta?.title || route.meta?.icon || route.name || route.redirect
      }

      return false
    })

    // 处理嵌套路由结构，确保所有路由都是一级菜单
    const processedRoutes = accessedRoutes.map(route => {
      // 特殊处理根路径（仪表盘）
      if (route.path === '/') {
        // 保留其子路由结构，但确保首页能正确显示在菜单中
        if (route.children && route.children.length > 0) {
          const dashboardChild = route.children.find((child: any) => child.path === 'dashboard');
          if (dashboardChild) {
            // 为根路径添加仪表盘的元信息，以便在菜单中显示
            route.meta = {
              ...route.meta,
              ...dashboardChild.meta,
              title: dashboardChild.meta?.title || 'dashboard.title'
            };
            // 确保路径正确
            route.path = '/dashboard';
          }
        }
        return route;
      }

      // 处理其他路由 - 确保它们可以直接在菜单中显示
      if (route.children && route.children.length > 0) {
        // 对于有子路由的情况，我们需要确保父路由具有正确的元信息
        const validChildren = route.children.filter((child: any) => 
          child.meta?.title || child.meta?.icon || child.name);
        
        if (validChildren.length > 0) {
          // 使用第一个有效子路由的元信息
          const firstChild = validChildren[0];
          route.meta = {
            ...route.meta,
            ...firstChild.meta
          };
        }
      }
      
      // 确保路由路径正确
      if (!route.path.startsWith('/')) {
        route.path = '/' + route.path;
      }

      return route;
    })

    routes.value = processedRoutes
    addRoutes.value = processedRoutes
    return processedRoutes
  }

  return {
    routes,
    addRoutes,
    setRoutes,
    generateRoutes,
    initRoutes
  }
})