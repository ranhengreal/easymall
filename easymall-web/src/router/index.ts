import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/components/layout/Layout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '',
          redirect: '/home'
        },
        {
          path: 'home',
          name: 'Home',
          component: () => import('@/views/home/Index.vue'),
          meta: { title: '首页' }
        },
        {
          path: 'product/list',
          name: 'ProductList',
          component: () => import('@/views/product/List.vue'),
          meta: { title: '商品列表' }
        },
        {
          path: 'product/:id',
          name: 'ProductDetail',
          component: () => import('@/views/product/Detail.vue'),
          meta: { title: '商品详情' }
        },
        {
          path: 'cart',
          name: 'Cart',
          component: () => import('@/views/cart/Index.vue'),
          meta: { title: '购物车', requiresAuth: true }
        },
        {
          path: 'order/confirm',
          name: 'OrderConfirm',
          component: () => import('@/views/order/Confirm.vue'),
          meta: { title: '确认订单', requiresAuth: true }
        },
        {
          path: 'order/list',
          name: 'OrderList',
          component: () => import('@/views/order/List.vue'),
          meta: { title: '我的订单', requiresAuth: true }
        },
        {
          path: 'order/detail/:id',
          name: 'OrderDetail',
          component: () => import('@/views/order/Detail.vue'),
          meta: { title: '订单详情', requiresAuth: true }
        },
        {
          path: 'user',
          name: 'User',
          component: () => import('@/views/user/Index.vue'),
          meta: { title: '个人中心', requiresAuth: true }
        }
      ]
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/Index.vue'),
      meta: { title: '登录' }
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/login/Register.vue'),
      meta: { title: '注册' }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.meta.requiresAuth === true

  if (requiresAuth && !token) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next('/')
  } else {
    next()
  }
})

export default router