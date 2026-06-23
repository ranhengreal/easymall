<template>
  <div class="profile-container">
    <el-card>
      <template #header>
        <span>个人中心</span>
      </template>

      <div class="profile-content">
        <div class="avatar-section">
          <div class="avatar-icon"></div>
          <div class="avatar-info">
            <h3>{{ adminInfo.account }}</h3>
            <p>{{ adminInfo.role }}</p>
          </div>
        </div>

        <el-descriptions :column="1" border>
          <el-descriptions-item label="账号">{{ adminInfo.account }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ adminInfo.role }}</el-descriptions-item>
          <el-descriptions-item label="登录方式">账号密码登录</el-descriptions-item>
        </el-descriptions>

        <!-- 修改密码按钮已隐藏 -->
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminInfo } from '@/api/auth'

const adminInfo = ref({
  account: '',
  role: '',
  avatar: ''
})

onMounted(async () => {
  try {
    adminInfo.value = await getAdminInfo()
  } catch (error) {
    console.error('获取管理员信息失败:', error)
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-content {
  max-width: 500px;
  margin: 0 auto;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.avatar-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-image: url('/default-avatar.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.avatar-info h3 {
  margin: 0 0 5px 0;
  font-size: 18px;
}

.avatar-info p {
  margin: 0;
  color: #909399;
}
</style>