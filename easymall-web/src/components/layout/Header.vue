<template>
  <header class="header">
    <div class="container">
      <div class="logo" @click="goHome">
        <h1>EasyMall</h1>
      </div>

      <div class="search-bar">
        <el-input
            v-model="keyword"
            placeholder="搜索商品"
            prefix-icon="Search"
            @keyup.enter="handleSearch"
            clearable
        />
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>

      <div class="nav-icons">
        <el-badge :value="cartCount" :hidden="cartCount === 0">
          <div class="nav-icon" @click="goCart">
            <el-icon><ShoppingCart /></el-icon>
            <span>购物车</span>
          </div>
        </el-badge>

        <!-- 未登录时显示登录按钮 -->
        <div v-if="!isLoggedIn" class="nav-icon" @click="goLogin">
          <el-icon><User /></el-icon>
          <span>登录</span>
        </div>

        <!-- 已登录时显示用户菜单 -->
        <el-dropdown v-else @command="handleUserCommand">
          <div class="nav-icon">
            <el-icon><User /></el-icon>
            <span>个人中心</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人资料</el-dropdown-item>
              <el-dropdown-item command="order">我的订单</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import { logout } from '@/api/auth'

const router = useRouter()
const cartStore = useCartStore()
const keyword = ref('')
const isLoggedIn = ref(false)

const cartCount = computed(() => cartStore.totalCount)

// 检查登录状态
const checkLoginStatus = () => {
  const token = localStorage.getItem('token')
  isLoggedIn.value = !!token
}

const goHome = () => {
  router.push('/')
}

const goCart = () => {
  router.push('/cart')
}

const goLogin = () => {
  router.push('/login')
}

const handleSearch = () => {
  if (keyword.value.trim()) {
    router.push(`/product/list?keyword=${encodeURIComponent(keyword.value)}`)
  }
}

const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/user')
      break
    case 'order':
      router.push('/order/list')
      break
    case 'logout':
      try {
        await logout()
      } catch (error) {
        console.error('退出失败:', error)
      }
      localStorage.removeItem('token')
      isLoggedIn.value = false
      ElMessage.success('已退出登录')
      router.push('/')
      break
  }
}

onMounted(() => {
  cartStore.loadCart()
  checkLoginStatus()
})
</script>

<style scoped>
.header {
  background-color: #ffffff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  position: sticky;
  top: 0;
  z-index: 100;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
}

.logo {
  cursor: pointer;
  flex-shrink: 0;
}

.logo h1 {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 26px;
  margin: 0;
  font-weight: bold;
}

.search-bar {
  flex: 1;
  display: flex;
  gap: 10px;
  max-width: 500px;
}

.search-bar :deep(.el-input__wrapper) {
  border-radius: 25px;
  box-shadow: 0 0 0 1px #e0e0e0 inset;
}

.search-bar :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409eff inset;
}

.search-bar :deep(.el-button) {
  border-radius: 25px;
  background-color: #409eff;
  border-color: #409eff;
}

.search-bar :deep(.el-button:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.nav-icons {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
  align-items: center;
}

.nav-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  color: #666;
  transition: all 0.3s;
}

.nav-icon:hover {
  color: #409eff;
  transform: translateY(-2px);
}

.nav-icon .el-icon {
  font-size: 22px;
}

.nav-icon span {
  font-size: 12px;
}

:deep(.el-badge__content) {
  background-color: #ff6b6b;
  border: none;
}
</style>