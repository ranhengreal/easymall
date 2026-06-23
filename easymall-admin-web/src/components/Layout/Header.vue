<template>
  <div class="header">
    <div class="header-left">
      <el-icon class="collapse-icon" @click="toggleCollapse">
        <Fold v-if="!isCollapsed" />
        <Expand v-else />
      </el-icon>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="header-right">
      <el-dropdown @command="handleCommand">
        <div class="avatar-wrapper">
          <div class="avatar-icon"></div>
          <span class="username">{{ adminAccount }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              个人中心
            </el-dropdown-item>
            <!-- 修改密码功能已隐藏 -->
            <el-dropdown-item divided command="logout">
              <el-icon><SwitchButton /></el-icon>
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Fold, Expand, User, SwitchButton, ArrowDown } from '@element-plus/icons-vue'
import { getAdminInfo, logout } from '@/api/auth'

const route = useRoute()
const router = useRouter()

const isCollapsed = ref(false)
const adminAccount = ref('admin')

const currentTitle = computed(() => {
  return route.meta?.title || route.name || '首页'
})

// 获取管理员信息
const loadAdminInfo = async () => {
  try {
    const data = await getAdminInfo()
    adminAccount.value = data.account
  } catch (error) {
    console.error('获取管理员信息失败:', error)
  }
}

// 下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'logout':
      try {
        await logout()
      } catch (error) {
        console.error('登出失败:', error)
      }
      localStorage.removeItem('token')
      router.push('/login')
      ElMessage.success('已退出登录')
      break
  }
}

// 折叠侧边栏
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
  window.dispatchEvent(new CustomEvent('sidebar-toggle', { detail: { collapsed: isCollapsed.value } }))
}

onMounted(() => {
  loadAdminInfo()
})
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.collapse-icon:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
}

.avatar-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.avatar-wrapper:hover {
  background-color: #f5f7fa;
}

.avatar-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-image: url('/default-avatar.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.username {
  font-size: 14px;
  color: #333;
}
</style>