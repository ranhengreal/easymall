<template>
  <div class="user-page">
    <div class="container">
      <h2 class="page-title">个人中心</h2>

      <div v-loading="loading" class="user-wrapper">
        <!-- 用户信息卡片 -->
        <el-card class="user-profile" shadow="never">
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="80" :src="getImageUrl(userInfo.avatar)" class="user-avatar">
                {{ userInfo.nickname?.charAt(0) || userInfo.username?.charAt(0) }}
              </el-avatar>
              <div class="user-meta">
                <h3>{{ userInfo.nickname || userInfo.username }}</h3>
                <p class="username-tag">@{{ userInfo.username }}</p>
              </div>
            </div>
            <div class="profile-stats">
              <div class="stat-item">
                <span class="stat-value">{{ orderStats.total }}</span>
                <span class="stat-label">全部订单</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ orderStats.waitPay }}</span>
                <span class="stat-label">待付款</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ orderStats.waitShip }}</span>
                <span class="stat-label">待发货</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ orderStats.waitReceive }}</span>
                <span class="stat-label">待收货</span>
              </div>
            </div>
          </div>

          <el-divider />

          <el-descriptions :column="2" border>
            <el-descriptions-item label="手机号">{{ userInfo.phone || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="邮箱">{{ userInfo.email || '未设置' }}</el-descriptions-item>
            <el-descriptions-item label="注册时间">{{ userInfo.createTime }}</el-descriptions-item>
            <el-descriptions-item label="上次登录">{{ userInfo.lastLoginTime || '首次登录' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 快捷入口 -->
        <el-card class="quick-links" shadow="never">
          <template #header>
            <span class="card-title">快捷入口</span>
          </template>
          <div class="links-grid">
            <div class="link-item" @click="goOrderList(0)">
              <el-icon size="28" color="#e6a23c"><WarningFilled /></el-icon>
              <span>待付款</span>
            </div>
            <div class="link-item" @click="goOrderList(1)">
              <el-icon size="28" color="#409eff"><Van /></el-icon>
              <span>待发货</span>
            </div>
            <div class="link-item" @click="goOrderList(2)">
              <el-icon size="28" color="#909399"><Box /></el-icon>
              <span>待收货</span>
            </div>
            <div class="link-item" @click="goOrderList()">
              <el-icon size="28" color="#67c23a"><List /></el-icon>
              <span>全部订单</span>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getUserInfo } from '@/api/auth'
import { getOrderList, ORDER_STATUS_MAP } from '@/api/order'
import { getImageUrl } from '@/utils/image'
import { WarningFilled, Van, Box, List } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

interface UserInfo {
  userId: string
  username: string
  nickname?: string
  avatar?: string
  phone?: string
  email?: string
  createTime?: string
  lastLoginTime?: string
}

const userInfo = ref<UserInfo>({
  userId: '',
  username: '',
  nickname: '',
  avatar: ''
})

const orderStats = reactive({
  total: 0,
  waitPay: 0,
  waitShip: 0,
  waitReceive: 0
})

// 加载用户信息
const loadUserInfo = async () => {
  try {
    const res = await getUserInfo()
    userInfo.value = res
  } catch (error) {
    console.error('加载用户信息失败:', error)
    ElMessage.error('加载用户信息失败')
  }
}

// 加载订单统计数据
const loadOrderStats = async () => {
  try {
    const res = await getOrderList({ pageNum: 1, pageSize: 1 })
    orderStats.total = res.total || 0

    const statuses = [0, 1, 2]
    const promises = statuses.map(status =>
      getOrderList({ pageNum: 1, pageSize: 1, status })
        .then(r => r.total || 0)
        .catch(() => 0)
    )
    const counts = await Promise.all(promises)
    orderStats.waitPay = counts[0]
    orderStats.waitShip = counts[1]
    orderStats.waitReceive = counts[2]
  } catch (error) {
    console.error('加载订单统计失败:', error)
  }
}

// 跳转订单列表
const goOrderList = (status?: number) => {
  const query = status !== undefined ? { status } : {}
  router.push({ path: '/order/list', query })
}

onMounted(async () => {
  loading.value = true
  await Promise.all([loadUserInfo(), loadOrderStats()])
  loading.value = false
})
</script>

<style scoped>
.user-page {
  background-color: #f8f9fa;
  min-height: calc(100vh - 130px);
  padding: 20px 0;
}

.container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.user-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 个人信息卡片 */
.user-profile {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
}

.profile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-avatar {
  border: 2px solid #e8e8e8;
  flex-shrink: 0;
}

.user-meta h3 {
  margin: 0;
  font-size: 20px;
  color: #333;
}

.username-tag {
  margin: 4px 0 0;
  font-size: 14px;
  color: #999;
}

.profile-stats {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 13px;
  color: #999;
}

/* 快捷入口 */
.quick-links {
  border: 1px solid #f0f0f0;
  border-radius: 12px;
}

.quick-links :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.links-grid {
  display: flex;
  gap: 24px;
  justify-content: center;
  padding: 12px 0;
}

.link-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 16px 24px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.link-item:hover {
  background-color: #f5f7fa;
}

.link-item span {
  font-size: 14px;
  color: #666;
}

@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .profile-stats {
    width: 100%;
    justify-content: space-around;
  }

  .links-grid {
    flex-wrap: wrap;
  }
}
</style>