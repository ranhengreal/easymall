<template>
  <div class="brand-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>品牌管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增品牌
          </el-button>
        </div>
      </template>

      <el-table
          :data="brandList"
          border
          v-loading="loading"
          row-key="brandId"
          class="sortable-table"
      >
        <el-table-column label="拖拽" width="60" align="center">
          <template #default>
            <el-icon class="drag-handle"><Rank /></el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="brandId" label="品牌ID" width="100" />
        <el-table-column prop="brandName" label="品牌名称" />
        <el-table-column label="品牌Logo" width="100" align="center">
          <template #default="{ row }">
            <img
                v-if="row.brandLogo"
                :src="getImageUrl(row.brandLogo)"
                style="width: 50px; height: 50px; border-radius: 8px; cursor: pointer; object-fit: cover; background: #f5f7fa;"
                @error="handleImageError"
                @click="() => previewImage(row.brandLogo)"
            />
            <span v-else class="no-logo">无</span>
          </template>
        </el-table-column>
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
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="550px" destroy-on-close>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="品牌名称" prop="brandName" required>
          <el-input
              v-model="formData.brandName"
              placeholder="请输入品牌名称，例如：华为、小米、苹果"
              clearable
              show-word-limit
              maxlength="50"
          />
          <div class="form-tip">品牌名称将显示在商品列表和详情页</div>
        </el-form-item>

        <el-form-item label="品牌Logo">
          <div class="upload-container">
            <el-upload
                class="logo-uploader"
                :action="uploadUrl"
                :headers="uploadHeaders"
                :show-file-list="false"
                :on-success="handleUploadSuccess"
                :on-error="handleUploadError"
                :before-upload="beforeUpload"
                accept="image/jpeg,image/png,image/gif,image/webp"
            >
              <img v-if="formData.brandLogo" :src="getImageUrl(formData.brandLogo)" class="logo-preview" />
              <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div class="upload-tip">
              <div class="form-tip">点击上传品牌Logo</div>
              <div class="form-tip">建议尺寸：200x200像素，支持jpg、png格式，大小不超过2MB</div>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="品牌描述" prop="description">
          <el-input
              type="textarea"
              v-model="formData.description"
              placeholder="请输入品牌描述信息"
              :rows="3"
              maxlength="200"
              show-word-limit
          />
          <div class="form-tip">简要描述品牌的特点和优势</div>
        </el-form-item>

        <el-form-item label="排序" prop="sort">
          <el-input-number
              v-model="formData.sort"
              :min="0"
              :max="999"
              controls-position="right"
          />
          <div class="form-tip">数字越小，显示越靠前（可通过拖拽快速调整）</div>
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-switch
              v-model="formData.status"
              :active-value="1"
              :inactive-value="0"
              active-text="启用"
              inactive-text="禁用"
          />
          <div class="form-tip">禁用后品牌将不在前端显示</div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm" :loading="submitLoading">
          {{ isEdit ? '保存修改' : '立即创建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Rank } from '@element-plus/icons-vue'
// @ts-ignore
import Sortable from 'sortablejs'
import { getBrandList, addBrand, updateBrand, deleteBrand, getBrandById, batchUpdateBrandSort } from '@/api/brand'
import type { Brand } from '@/api/brand'
import { getImageUrl, handleImageError, previewImage } from '@/utils/image'


// 数据
const loading = ref(false)
const submitLoading = ref(false)
const brandList = ref<Brand[]>([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增品牌')
const formRef = ref()
const isEdit = ref(false)

// 上传配置
const token = localStorage.getItem('token')
const uploadUrl = 'http://localhost:6061/api/admin/upload/brand'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${token}`
}))

// 表单数据
const formData = ref({
  brandId: '',
  brandName: '',
  brandLogo: '',
  description: '',
  sort: 0,
  status: 1
})

// 表单验证规则
const rules = {
  brandName: [
    { required: true, message: '请输入品牌名称', trigger: 'blur' },
    { min: 2, max: 50, message: '品牌名称长度在 2-50 个字符', trigger: 'blur' }
  ],
  description: [
    { max: 200, message: '品牌描述不能超过200个字符', trigger: 'blur' }
  ],
  sort: [
    { type: 'number', min: 0, max: 999, message: '排序值范围 0-999', trigger: 'blur' }
  ]
}

// 初始化拖拽排序
const initSortable = () => {
  const el = document.querySelector('.sortable-table .el-table__body-wrapper tbody')
  if (!el) return

  Sortable.create(el, {
    handle: '.drag-handle',
    animation: 150,
    onEnd: async () => {
      // 获取拖拽后的新顺序
      const newOrder = getFlattenedOrder(brandList.value)

      // 构建排序数据
      const sortList = newOrder.map((item, index) => ({
        brandId: item.brandId,
        sort: index + 1
      }))

      try {
        await batchUpdateBrandSort(sortList)
        ElMessage.success('排序更新成功')
        await loadData()
      } catch (error) {
        ElMessage.error('排序更新失败')
        await loadData()
      }
    }
  })
}

// 获取扁平化顺序
const getFlattenedOrder = (list: Brand[], result: Brand[] = []) => {
  for (const item of list) {
    result.push(item)
    if (item.children && item.children.length) {
      getFlattenedOrder(item.children as Brand[], result)
    }
  }
  return result
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/webp'
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

// 上传成功
const handleUploadSuccess = (response: any) => {
  if (response.code === 200) {
    formData.value.brandLogo = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败
const handleUploadError = () => {
  ElMessage.error('上传失败，请重试')
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    brandList.value = await getBrandList()
    await nextTick()
    initSortable()
  } catch (error) {
    console.error('加载数据失败', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 更新状态
const updateStatus = async (row: Brand, status: number) => {
  try {
    await updateBrand({ brandId: row.brandId, brandName: row.brandName, status })
    ElMessage.success(status === 1 ? '品牌已启用' : '品牌已禁用')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增品牌'
  formData.value = {
    brandId: '',
    brandName: '',
    brandLogo: '',
    description: '',
    sort: 0,
    status: 1
  }
  formRef.value?.clearValidate()
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: Brand) => {
  isEdit.value = true
  dialogTitle.value = '编辑品牌'
  try {
    const data = await getBrandById(row.brandId)
    formData.value = { ...data }
    formRef.value?.clearValidate()
    dialogVisible.value = true
  } catch (error) {
    ElMessage.error('获取品牌信息失败')
  }
}

// 删除
const handleDelete = async (row: Brand) => {
  try {
    await ElMessageBox.confirm(`确定删除品牌"${row.brandName}"吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    await deleteBrand(row.brandId)
    ElMessage.success('删除成功')
    await loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitLoading.value = true

    if (isEdit.value) {
      await updateBrand(formData.value)
      ElMessage.success('更新成功')
    } else {
      await addBrand({
        brandName: formData.value.brandName,
        brandLogo: formData.value.brandLogo,
        description: formData.value.description,
        sort: formData.value.sort,
        status: formData.value.status
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('提交失败', error)
    ElMessage.error('操作失败，请重试')
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

.form-tip {
  font-size: 12px;
  color: #909399;
  line-height: 1.5;
  margin-top: 4px;
}

.upload-container {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s;
  overflow: hidden;
}

.logo-uploader:hover {
  border-color: #409eff;
}

.logo-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-tip {
  flex: 1;
}

.no-logo {
  color: #909399;
  font-size: 12px;
}

.drag-handle {
  cursor: move;
  color: #909399;
  font-size: 18px;
}

.drag-handle:hover {
  color: #409eff;
}

:deep(.sortable-table .el-table__row) {
  cursor: default;
}

:deep(.sortable-table .drag-handle) {
  cursor: grab;
}

:deep(.sortable-table .drag-handle:active) {
  cursor: grabbing;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-dialog__body) {
  padding: 20px 30px;
}
</style>