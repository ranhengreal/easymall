<template>
  <div class="user-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <div>
            <el-button type="info" link @click="showDeletedList = !showDeletedList">
              {{ showDeletedList ? '返回正常列表' : '查看回收站' }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="关键词">
            <el-input
                v-model="searchForm.keyword"
                placeholder="请输入用户名/手机号"
                clearable
                style="width: 200px"
            />
          </el-form-item>
          <el-form-item v-if="!showDeletedList" label="状态">
            <el-select
                v-model="searchForm.status"
                clearable
                placeholder="全部"
                style="width: 100px"
            >
              <el-option :value="1" label="启用" />
              <el-option :value="0" label="禁用" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 用户表格 -->
      <div class="table-wrapper">
        <el-table
            :data="paginatedData"
            border
            v-loading="loading"
            stripe
            style="width: 100%"
        >
          <el-table-column prop="username" label="用户名" min-width="100" />
          <el-table-column prop="nickname" label="昵称" min-width="100">
            <template #default="{ row }">
              {{ row.nickname || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="phone" label="手机号" min-width="120" />
          <el-table-column prop="email" label="邮箱" min-width="180">
            <template #default="{ row }">
              {{ row.email || '-' }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" min-width="80" align="center">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'">
                {{ row.status === 1 ? '启用' : '禁用' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" label="注册时间" min-width="160">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="300" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link @click="handleDetail(row)">详情</el-button>

              <template v-if="!showDeletedList">
                <!-- 状态切换按钮 -->
                <el-button
                    v-if="row.status === 1"
                    type="warning"
                    link
                    @click="handleDisable(row)"
                >
                  禁用
                </el-button>
                <el-button
                    v-if="row.status === 0"
                    type="success"
                    link
                    @click="handleEnable(row)"
                >
                  启用
                </el-button>
                <!-- 重置密码和删除按钮 -->
                <el-button type="danger" link @click="handleResetPassword(row)">重置密码</el-button>
                <el-button type="info" link @click="handleDelete(row)">删除</el-button>
              </template>

              <template v-else>
                <el-button type="success" link @click="handleRestore(row)">恢复</el-button>
                <el-button type="danger" link @click="handleResetPassword(row)">重置密码</el-button>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 用户详情对话框 -->
    <el-dialog
        :title="`用户详情 - ${detailData.username}`"
        v-model="detailVisible"
        width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户名">{{ detailData.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ detailData.nickname || '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detailData.phone || '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ detailData.email || '-' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.status === 1 ? 'success' : 'danger'">
            {{ detailData.status === 1 ? '启用' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ formatDate(detailData.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUserList, getDeletedUserList, updateUserStatus, resetPassword, deleteUser, restoreUser } from '@/api/user'
import type { User } from '@/api/user'

const loading = ref(false)
const userList = ref<User[]>([])
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)
const showDeletedList = ref(false)

const searchForm = ref({
  keyword: '',
  status: undefined as number | undefined
})

// 格式化时间
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`
}

// 前端分页
const paginatedData = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return userList.value.slice(start, end)
})

// 详情对话框
const detailVisible = ref(false)
const detailData = ref<User>({
  userId: '',
  username: '',
  nickname: '',
  phone: '',
  email: '',
  gender: 0,
  status: 1,
  avatar: '',
  lastLoginTime: '',
  createTime: ''
})

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    let data
    if (showDeletedList.value) {
      data = await getDeletedUserList(searchForm.value.keyword || undefined)
    } else {
      data = await getUserList({
        keyword: searchForm.value.keyword || undefined,
        status: searchForm.value.status
      })
    }
    userList.value = data || []
    total.value = userList.value.length
    pageNum.value = 1
  } catch (error) {
    console.error('加载用户失败:', error)
    ElMessage.error('加载用户失败')
  } finally {
    loading.value = false
  }
}

// 监听显示回收站状态变化
watch(showDeletedList, () => {
  loadData()
})

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    status: undefined
  }
  loadData()
}

// 分页
const handlePageChange = (page: number) => {
  pageNum.value = page
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
}

// 详情
const handleDetail = (row: User) => {
  detailData.value = row
  detailVisible.value = true
}

// 禁用用户
const handleDisable = async (row: User) => {
  await ElMessageBox.confirm(`确定禁用用户"${row.username}"吗？`, '提示', { type: 'warning' })
  await updateUserStatus(row.userId, 0)
  ElMessage.success('禁用成功')
  await loadData()
}

// 启用用户
const handleEnable = async (row: User) => {
  await ElMessageBox.confirm(`确定启用用户"${row.username}"吗？`, '提示', { type: 'info' })
  await updateUserStatus(row.userId, 1)
  ElMessage.success('启用成功')
  await loadData()
}

// 重置密码
const handleResetPassword = async (row: User) => {
  await ElMessageBox.confirm(
      `确定重置用户"${row.username}"的密码吗？重置后密码为 123456`,
      '提示',
      { type: 'warning' }
  )
  await resetPassword(row.userId)
  ElMessage.success('密码已重置为 123456')
}

// 删除用户（逻辑删除）
const handleDelete = async (row: User) => {
  await ElMessageBox.confirm(
      `确定删除用户"${row.username}"吗？删除后可到回收站恢复`,
      '提示',
      { type: 'warning' }
  )
  await deleteUser(row.userId)
  ElMessage.success('删除成功')
  await loadData()
}

// 恢复用户
const handleRestore = async (row: User) => {
  await ElMessageBox.confirm(
      `确定恢复用户"${row.username}"吗？`,
      '提示',
      { type: 'info' }
  )
  await restoreUser(row.userId)
  ElMessage.success('恢复成功')
  await loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.search-bar {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-table) {
  width: 100% !important;
}
</style>