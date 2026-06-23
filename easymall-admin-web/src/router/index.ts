import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/login/Login.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      component: () => import('@/components/Layout/Index.vue'),
      redirect: '/dashboard',
      meta: { requiresAuth: true },
      children: [
        {
          path: '/dashboard',
          name: 'Dashboard',
          component: () => import('@/views/dashboard/Dashboard.vue'),
          meta: { title: '数据看板' }
        },
        {
          path: '/category',
          name: 'Category',
          component: () => import('@/views/category/Category.vue'),
          meta: { title: '分类管理' }
        },
        {
          path: '/brand',
          name: 'Brand',
          component: () => import('@/views/brand/Brand.vue'),
          meta: { title: '品牌管理' }
        },
        {
          path: '/product',
          name: 'Product',
          component: () => import('@/views/product/Product.vue'),
          meta: { title: '商品管理' }
        },
        {
          path: '/order',
          name: 'Order',
          component: () => import('@/views/order/Order.vue'),
          meta: { title: '订单管理' }
        },
        {
          path: '/user',
          name: 'User',
          component: () => import('@/views/user/User.vue'),
          meta: { title: '用户管理' }
        },
        {
          path: '/banner',
          name: 'Banner',
          component: () => import('@/views/banner/Banner.vue'),
          meta: { title: '轮播图管理', icon: 'Picture' }
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('@/views/profile/Profile.vue'),
          meta: { title: '个人中心' }
        },
        {
          path: '/banner',
          name: 'Banner',
          component: () => import('@/views/banner/Banner.vue'),
          meta: { title: '轮播图管理' }
        }
      ]
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/')
  } else {
    next()
  }
})

export default router