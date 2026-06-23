<template>
  <div class="product-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品管理</span>
          <el-button type="primary" @click="handleAdd">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="商品名称">
            <el-input v-model="searchForm.productName" placeholder="请输入商品名称" clearable style="width: 180px" />
          </el-form-item>
          <el-form-item label="分类">
            <el-select
                v-model="searchForm.categoryId"
                placeholder="请选择分类"
                clearable
                filterable
                :teleported="false"
                style="width: 150px"
            >
              <el-option
                  v-for="item in categoryOptions"
                  :key="item.categoryId"
                  :label="item.categoryName"
                  :value="item.categoryId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
                :teleported="false"
                style="width: 100px"
            >
              <el-option label="上架" :value="1" />
              <el-option label="下架" :value="0" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 商品表格 -->
      <el-table :data="displayList" border v-loading="loading" stripe>
        <el-table-column label="商品图片" width="80" align="center">
          <template #default="{ row }">
            <img
                :src="getImageUrl(row.mainImage)"
                style="width: 50px; height: 50px; border-radius: 4px; cursor: pointer; object-fit: cover; background: #f5f7fa;"
                @error="handleImageError"
                @click="() => previewImage(row.mainImage)"
            />
          </template>
        </el-table-column>

        <el-table-column prop="productId" label="商品ID" width="100" />
        <el-table-column prop="productName" label="商品名称" min-width="200" />
        <el-table-column label="分类" width="120">
          <template #default="{ row }">
            {{ getCategoryName(row.categoryId) }}
          </template>
        </el-table-column>
        <el-table-column prop="price" label="价格" width="120">
          <template #default="{ row }">¥{{ row.price }}</template>
        </el-table-column>
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="sales" label="销量" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-switch
                v-model="row.status"
                :active-value="1"
                :inactive-value="0"
                @change="(val) => updateStatus(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pageParams.pageNum"
            v-model:page-size="pageParams.pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="750px" destroy-on-close>
      <el-form :model="formData" :rules="rules" ref="formRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="商品名称" prop="productName" required>
              <el-input v-model="formData.productName" placeholder="请输入商品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="分类" prop="categoryId" required>
              <el-select
                  v-model="formData.categoryId"
                  placeholder="请选择分类"
                  clearable
                  filterable
                  :teleported="false"
              >
                <el-option
                    v-for="item in categoryOptions"
                    :key="item.categoryId"
                    :label="item.categoryName"
                    :value="item.categoryId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="品牌" prop="brandId">
              <el-select v-model="formData.brandId" placeholder="请选择品牌" clearable filterable>
                <el-option
                    v-for="item in brandList"
                    :key="item.brandId"
                    :label="item.brandName"
                    :value="item.brandId"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="价格" prop="price" required>
              <el-input-number v-model="formData.price" :min="0" :precision="2" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="库存" prop="stock" required>
              <el-input-number v-model="formData.stock" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="主图">
          <el-upload
              class="image-uploader"
              :action="uploadUrl"
              :headers="uploadHeaders"
              :show-file-list="false"
              :on-success="handleMainImageSuccess"
              :before-upload="beforeUpload"
              accept="image/jpeg,image/png,image/gif,image/webp"
          >
            <img v-if="formData.mainImage" :src="getImageUrl(formData.mainImage)" class="image-preview" />
            <el-icon v-else class="image-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="form-tip">建议尺寸：800x800像素，支持jpg、png格式，大小不超过2MB</div>
        </el-form-item>

        <el-form-item label="商品描述">
          <el-input type="textarea" v-model="formData.description" :rows="4" placeholder="请输入商品描述" maxlength="500" show-word-limit />
        </el-form-item>

        <!-- SKU规格 -->
        <el-form-item label="SKU规格">
          <div class="sku-header">
            <el-button type="primary" size="small" @click="addSku">添加规格</el-button>
            <span class="sku-tip">支持多规格，如：颜色/尺寸/内存等</span>
          </div>

          <div class="sku-list">
            <div v-for="(item, index) in formData.skuList" :key="index" class="sku-item">
              <div class="sku-spec">
                <el-input
                    v-model="item.specValues"
                    placeholder="规格值，如：黑色/8GB/128GB"
                    size="small"
                />
              </div>
              <div class="sku-price">
                <el-input-number
                    v-model="item.price"
                    :min="0"
                    :precision="2"
                    controls-position="right"
                    placeholder="价格"
                    size="small"
                    style="width: 100%"
                />
              </div>
              <div class="sku-stock">
                <el-input-number
                    v-model="item.stock"
                    :min="0"
                    controls-position="right"
                    placeholder="库存"
                    size="small"
                    style="width: 100%"
                />
              </div>
              <div class="sku-action">
                <el-button type="danger" link size="small" @click="removeSku(index)">删除</el-button>
              </div>
            </div>
          </div>

          <div v-if="formData.skuList.length === 0" class="sku-empty-tip">
            暂无规格，点击"添加规格"按钮添加
          </div>
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
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getProductList, addProduct, updateProduct, updateProductStatus, deleteProduct, getProductById } from '@/api/product'
import { getCategoryTree } from '@/api/category'
import { getBrandList } from '@/api/brand'
import { getImageUrl, handleImageError, previewImage } from '@/utils/image'
import type { Product, Sku } from '@/api/product'
import type { Category } from '@/api/category'
import type { Brand } from '@/api/brand'

// 数据
const loading = ref(false)
const submitLoading = ref(false)
const productList = ref<Product[]>([])
const categoryTree = ref<Category[]>([])
const categoryOptions = ref<Category[]>([])
const brandList = ref<Brand[]>([])
const total = ref(0)

// 搜索表单
const searchForm = ref({
  productName: '',
  categoryId: '',
  status: null as number | null
})

// 分页
const pageParams = ref({
  pageNum: 1,
  pageSize: 10
})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('新增商品')
const formRef = ref()
const isEdit = ref(false)

// 上传配置
const token = localStorage.getItem('token')
const uploadUrl = 'http://localhost:6061/api/admin/upload/product'
const uploadHeaders = computed(() => ({
  Authorization: `Bearer ${token}`
}))

// 表单数据
const formData = ref({
  productId: '',
  productName: '',
  categoryId: '',
  brandId: '',
  mainImage: '',
  images: '',
  description: '',
  price: 0,
  stock: 0,
  status: 1,
  skuList: [] as Sku[]
})

// 表单验证规则
const rules = {
  productName: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, max: 100, message: '商品名称长度在 2-100 个字符', trigger: 'blur' }
  ],
  categoryId: [{ required: true, message: '请选择分类', trigger: 'change' }],
  price: [{ required: true, message: '请输入价格', trigger: 'blur' }],
  stock: [{ required: true, message: '请输入库存', trigger: 'blur' }]
}

// 计算分页后的数据
const displayList = computed(() => {
  const start = (pageParams.value.pageNum - 1) * pageParams.value.pageSize
  const end = start + pageParams.value.pageSize
  return productList.value.slice(start, end)
})

// 获取分类名称
const getCategoryName = (categoryId: string) => {
  const category = categoryOptions.value.find(c => c.categoryId === categoryId)
  return category?.categoryName || '-'
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

// 主图上传成功
const handleMainImageSuccess = (response: any) => {
  if (response.code === 200) {
    formData.value.mainImage = response.data
    ElMessage.success('上传成功')
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 添加SKU
const addSku = () => {
  formData.value.skuList.push({
    specValues: '',
    price: 0,
    stock: 0,
    image: ''
  })
}

// 删除SKU
const removeSku = (index: number) => {
  formData.value.skuList.splice(index, 1)
}

// 加载分类树
const loadCategories = async () => {
  try {
    const data = await getCategoryTree()
    categoryTree.value = data || []

    const flatten = (list: Category[], result: Category[] = []) => {
      if (!list || !list.length) return result
      for (const item of list) {
        result.push({
          categoryId: item.categoryId,
          categoryName: item.categoryName,
          pCategoryId: item.pCategoryId,
          sort: item.sort
        })
        if (item.children && item.children.length) {
          flatten(item.children, result)
        }
      }
      return result
    }
    categoryOptions.value = flatten(categoryTree.value)
  } catch (error) {
    console.error('加载分类失败:', error)
    ElMessage.error('加载分类失败')
  }
}

// 加载品牌列表
const loadBrands = async () => {
  try {
    brandList.value = await getBrandList()
  } catch (error) {
    console.error('加载品牌失败:', error)
  }
}

// 递归获取所有子分类ID（包含自身）
const getAllChildCategoryIds = (list: Category[], parentId: string): string[] => {
  const findCategory = (cats: Category[], id: string): Category | null => {
    for (const cat of cats) {
      if (cat.categoryId === id) return cat
      if (cat.children && cat.children.length) {
        const found = findCategory(cat.children, id)
        if (found) return found
      }
    }
    return null
  }

  const collectAllChildIds = (category: Category): string[] => {
    let ids = [category.categoryId]
    if (category.children && category.children.length) {
      for (const child of category.children) {
        ids = ids.concat(collectAllChildIds(child))
      }
    }
    return ids
  }

  const target = findCategory(list, parentId)
  if (!target) return [parentId]

  return collectAllChildIds(target)
}

// 加载商品列表
const loadData = async () => {
  loading.value = true
  try {
    const data = await getProductList()
    let filtered = data || []

    // 商品名称搜索
    if (searchForm.value.productName) {
      filtered = filtered.filter(p => p.productName.includes(searchForm.value.productName))
    }

    // 分类筛选（包含子分类）
    if (searchForm.value.categoryId) {
      const childIds = getAllChildCategoryIds(categoryTree.value, searchForm.value.categoryId)
      filtered = filtered.filter(p => childIds.includes(p.categoryId))
    }

    // 状态筛选
    if (searchForm.value.status !== null) {
      filtered = filtered.filter(p => p.status === searchForm.value.status)
    }

    productList.value = filtered
    total.value = filtered.length
    pageParams.value.pageNum = 1
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    productName: '',
    categoryId: '',
    status: null
  }
  loadData()
}

// 更新状态
const updateStatus = async (row: Product, status: number) => {
  try {
    await updateProductStatus(row.productId, status)
    ElMessage.success(status === 1 ? '商品已上架' : '商品已下架')
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

// 分页处理
const handleSizeChange = () => {
  pageParams.value.pageNum = 1
}

const handleCurrentChange = () => {}

// 新增
const handleAdd = () => {
  isEdit.value = false
  dialogTitle.value = '新增商品'
  formData.value = {
    productId: '',
    productName: '',
    categoryId: '',
    brandId: '',
    mainImage: '',
    images: '',
    description: '',
    price: 0,
    stock: 0,
    status: 1,
    skuList: []
  }
  dialogVisible.value = true
}

// 编辑
const handleEdit = async (row: Product) => {
  isEdit.value = true
  dialogTitle.value = '编辑商品'
  try {
    const data = await getProductById(row.productId)
    formData.value = {
      productId: data.productId,
      productName: data.productName,
      categoryId: data.categoryId,
      brandId: data.brandId,
      mainImage: data.mainImage,
      images: data.images,
      description: data.description,
      price: data.price,
      stock: data.stock,
      status: data.status,
      skuList: data.skuList || []
    }
    dialogVisible.value = true
  } catch (error) {
    console.error('获取商品信息失败:', error)
    ElMessage.error('获取商品信息失败')
  }
}

// 删除
const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(`确定删除商品"${row.productName}"吗？`, '提示', {
      type: 'warning',
      confirmButtonText: '确定删除',
      cancelButtonText: '取消'
    })
    await deleteProduct(row.productId)
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
      await updateProduct(formData.value.productId, {
        productName: formData.value.productName,
        categoryId: formData.value.categoryId,
        brandId: formData.value.brandId,
        mainImage: formData.value.mainImage,
        images: formData.value.images,
        description: formData.value.description,
        price: formData.value.price,
        stock: formData.value.stock,
        status: formData.value.status,
        skuList: formData.value.skuList
      })
      ElMessage.success('更新成功')
    } else {
      await addProduct({
        productName: formData.value.productName,
        categoryId: formData.value.categoryId,
        brandId: formData.value.brandId,
        mainImage: formData.value.mainImage,
        images: formData.value.images,
        description: formData.value.description,
        price: formData.value.price,
        stock: formData.value.stock,
        status: formData.value.status,
        skuList: formData.value.skuList
      })
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('提交失败:', error)
    ElMessage.error('操作失败，请重试')
  } finally {
    submitLoading.value = false
  }
}

onMounted(() => {
  loadCategories()
  loadBrands()
  loadData()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  margin-bottom: 20px;
  overflow: visible;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.image-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.image-uploader:hover {
  border-color: #409eff;
}

.image-preview {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.image-uploader-icon {
  font-size: 28px;
  color: #8c939d;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.sku-header {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.sku-tip {
  font-size: 12px;
  color: #909399;
}

.sku-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
}

.sku-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.sku-item:last-child {
  border-bottom: none;
}

.sku-spec {
  flex: 3;
  min-width: 0;
}

.sku-price {
  flex: 1.5;
  min-width: 0;
}

.sku-stock {
  flex: 1.2;
  min-width: 0;
}

.sku-action {
  width: 60px;
  text-align: center;
  flex-shrink: 0;
}

.sku-list :deep(.el-input-number) {
  width: 100%;
}

.sku-list :deep(.el-input-number .el-input__inner) {
  text-align: left;
}

@media (max-width: 768px) {
  .sku-item {
    flex-wrap: wrap;
  }

  .sku-spec {
    flex: 1 1 100%;
    margin-bottom: 8px;
  }

  .sku-price {
    flex: 1;
  }

  .sku-stock {
    flex: 1;
  }

  .sku-action {
    width: auto;
  }
}

.sku-empty-tip {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  margin-top: 10px;
}

:deep(.el-dialog__body) {
  padding: 20px 30px;
  max-height: 70vh;
  overflow-y: auto;
}
</style>