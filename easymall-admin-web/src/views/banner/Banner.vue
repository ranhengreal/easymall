<template>
  <div class="banner-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>轮播图管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增轮播图
          </el-button>
        </div>
      </template>

      <!-- 轮播图列表 -->
      <el-table :data="bannerList" border v-loading="loading">
        <el-table-column label="图片" width="120" align="center">
          <template #default="{ row }">
            <img :src="getImageUrl(row.imageUrl)" class="banner-image" @error="handleImageError" />
          </template>
        </el-table-column>
        <el-table-column prop="title" label="标题" min-width="150" />
        <el-table-column prop="linkUrl" label="跳转链接" min-width="200" />
        <el-table-column prop="sort" label="排序" width="80" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="(val) => updateStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入标题" />
        </el-form-item>
        <el-form-item label="图片" prop="imageUrl" required>
          <el-upload
              class="image-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeUpload"
              accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <img v-if="formData.imageUrl" :src="getImageUrl(formData.imageUrl)" class="upload-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="跳转链接" prop="linkUrl">
          <el-input v-model="formData.linkUrl" placeholder="例如：/products" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" :max="999" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="formData.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getBannerList, addBanner, updateBanner, deleteBanner, updateBannerStatus, type Banner } from '@/api/banner'
import { getImageUrl, handleImageError } from '@/utils/image'

const loading = ref(false)
const submitLoading = ref(false)
const bannerList = ref<Banner[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('新增轮播图')
const isEdit = ref(false)
const formRef = ref()

const token = localStorage.getItem('token')
const uploadUrl = '/api/admin/upload/banner'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${token}`
}))

const formData = ref({
  id: 0,
  title: '',
  imageUrl: '',
  linkUrl: '',
  sort: 0,
  status: 1
})

const rules = {
  imageUrl: [{ required: true, message: '请上传图片', trigger: 'change' }]
}

const loadData = async () => {
  loading.value = true
  try {
    const res = await getBannerList()
    bannerList.value = res || []
  } catch (error) {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    formData.value.imageUrl = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增轮播图'
  formData.value = { id: 0, title: '', imageUrl: '', linkUrl: '', sort: 0, status: 1 }
  dialogVisible.value = true
}

const handleEdit = (row: Banner) => {
  isEdit.value = true
  dialogTitle.value = '编辑轮播图'
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDelete = async (row: Banner) => {
  try {
    await ElMessageBox.confirm(`确定删除轮播图"${row.title}"吗？`, '提示', { type: 'warning' })
    await deleteBanner(row.id)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const updateStatus = async (row: Banner, status: number) => {
  try {
    await updateBannerStatus(row.id, status)
    ElMessage.success(status === 1 ? '已启用' : '已禁用')
  } catch (error) {
    row.status = row.status === 1 ? 0 : 1
    ElMessage.error('操作失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    submitLoading.value = true
    if (isEdit.value) {
      await updateBanner(formData.value)
      ElMessage.success('更新成功')
    } else {
      await addBanner(formData.value)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner-image {
  width: 80px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 120px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-uploader:hover {
  border-color: #409eff;
}

.upload-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>