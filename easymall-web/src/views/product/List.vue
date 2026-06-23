<template>
  <div class="product-list-page">
    <div class="container">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        <el-breadcrumb-item v-if="currentCategoryName">{{ currentCategoryName }}</el-breadcrumb-item>
      </el-breadcrumb>

      <div class="list-wrapper">
        <!-- 侧边栏 - 分类筛选 -->
        <div class="sidebar">
          <div class="filter-box">
            <h3>商品分类</h3>
            <div class="category-tree">
              <div v-for="cat in categories" :key="cat.categoryId" class="category-item">
                <div
                    class="category-name"
                    :class="{ active: currentCategoryId === cat.categoryId }"
                    @click="selectCategory(cat.categoryId)"
                >
                  {{ cat.categoryName }}
                </div>
                <div v-if="cat.children && cat.children.length" class="sub-categories">
                  <div
                      v-for="child in cat.children"
                      :key="child.categoryId"
                      class="sub-category-name"
                      :class="{ active: currentCategoryId === child.categoryId }"
                      @click="selectCategory(child.categoryId)"
                  >
                    {{ child.categoryName }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 主内容区 -->
        <div class="main-content">
          <!-- 搜索栏 -->
          <div class="search-bar">
            <el-input
                v-model="searchKeyword"
                placeholder="搜索商品名称"
                prefix-icon="Search"
                size="large"
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
            />
            <el-button type="primary" size="large" @click="handleSearch">搜索</el-button>
          </div>

          <!-- 排序栏 -->
          <div class="sort-bar">
            <div
                class="sort-item"
                :class="{ active: sortType === 'default' }"
                @click="changeSort('default')"
            >
              默认
            </div>
            <div
                class="sort-item"
                :class="{ active: sortType === 'price_asc' }"
                @click="changeSort('price_asc')"
            >
              价格升序
              <el-icon><Top /></el-icon>
            </div>
            <div
                class="sort-item"
                :class="{ active: sortType === 'price_desc' }"
                @click="changeSort('price_desc')"
            >
              价格降序
              <el-icon><Bottom /></el-icon>
            </div>
            <div
                class="sort-item"
                :class="{ active: sortType === 'sales' }"
                @click="changeSort('sales')"
            >
              销量
            </div>
            <div class="sort-right">
              共 {{ totalCount }} 件商品
            </div>
          </div>

          <!-- 商品网格 -->
          <div v-loading="loading" class="product-grid">
            <div
                v-for="product in displayList"
                :key="product.productId"
                class="product-card"
                @click="goDetail(product.productId)"
            >
              <div class="product-image">
                <img
                    :src="getImageUrl(product.mainImage)"
                    :alt="product.productName"
                    @error="handleImageError"
                />
              </div>
              <div class="product-info">
                <h3>{{ product.productName }}</h3>
                <div class="price">¥{{ formatPrice(product.price) }}</div>
                <div class="sales">月销 {{ product.sales || 0 }} 件</div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!loading && displayList.length === 0" description="暂无商品" />

          <!-- 分页 -->
          <div v-if="totalCount > pageSize" class="pagination">
            <el-pagination
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :total="totalCount"
                :page-sizes="[12, 24, 48]"
                layout="total, sizes, prev, pager, next"
                @current-change="handlePageChange"
                @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Top, Bottom } from '@element-plus/icons-vue'
import { getProductList } from '@/api/product'
import { getCategoryTree } from '@/api/category'
import { getImageUrl, handleImageError } from '@/utils/image'

const router = useRouter()

// 数据
const loading = ref(false)
const allProducts = ref<any[]>([])
const categories = ref<any[]>([])
const totalCount = ref(0)

// 筛选参数
const searchKeyword = ref('')
const currentCategoryId = ref('')
const currentCategoryName = ref('')
const sortType = ref('default')

// 分页
const currentPage = ref(1)
const pageSize = ref(12)

// 获取所有子分类ID（包含自身）
const getCategoryWithChildren = (catId: string): string[] => {
  const result = [catId]

  const findChildren = (cats: any[], parentId: string) => {
    for (const cat of cats) {
      if (cat.pCategoryId === parentId || cat.pcategoryId === parentId) {
        result.push(cat.categoryId)
        if (cat.children && cat.children.length) {
          findChildren(cat.children, cat.categoryId)
        }
      } else if (cat.children && cat.children.length) {
        findChildren(cat.children, parentId)
      }
    }
  }

  findChildren(categories.value, catId)
  return result
}

// 筛选后的商品
const filteredProducts = computed(() => {
  let result = [...allProducts.value]

  // 分类筛选
  if (currentCategoryId.value) {
    const categoryIds = getCategoryWithChildren(currentCategoryId.value)
    result = result.filter(p => categoryIds.includes(p.categoryId))
  }

  // 关键词搜索
  if (searchKeyword.value.trim()) {
    const kw = searchKeyword.value.toLowerCase()
    result = result.filter(p => p.productName.toLowerCase().includes(kw))
  }

  // 排序
  if (sortType.value === 'price_asc') {
    result.sort((a, b) => (a.price || 0) - (b.price || 0))
  } else if (sortType.value === 'price_desc') {
    result.sort((a, b) => (b.price || 0) - (a.price || 0))
  } else if (sortType.value === 'sales') {
    result.sort((a, b) => (b.sales || 0) - (a.sales || 0))
  } else {
    // 默认按创建时间倒序
    result.sort((a, b) => {
      const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
      const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
      return timeB - timeA
    })
  }

  totalCount.value = result.length
  return result
})

// 分页显示
const displayList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredProducts.value.slice(start, end)
})

// 格式化价格
const formatPrice = (price: number) => {
  return price?.toFixed(2) || '0.00'
}

// 加载分类
const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    categories.value = res?.data || res || []
    console.log('分类加载成功:', categories.value.length)
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载商品
const loadProducts = async () => {
  loading.value = true
  try {
    const res = await getProductList({ pageNum: 1, pageSize: 999 })
    // 根据实际返回结构取值
    allProducts.value = res?.records || res?.data?.records || []
    console.log('商品加载成功:', allProducts.value.length)
  } catch (error) {
    console.error('加载商品失败:', error)
    ElMessage.error('加载商品失败')
    allProducts.value = []
  } finally {
    loading.value = false
  }
}

// 选择分类
const selectCategory = (categoryId: string) => {
  if (currentCategoryId.value === categoryId) {
    currentCategoryId.value = ''
    currentCategoryName.value = ''
  } else {
    currentCategoryId.value = categoryId
    // 查找分类名称
    const findName = (cats: any[], id: string): string => {
      for (const cat of cats) {
        if (cat.categoryId === id) return cat.categoryName
        if (cat.children) {
          const found = findName(cat.children, id)
          if (found) return found
        }
      }
      return ''
    }
    currentCategoryName.value = findName(categories.value, categoryId)
  }
  currentPage.value = 1
}

// 改变排序
const changeSort = (type: string) => {
  sortType.value = type
  currentPage.value = 1
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
}

// 分页
const handlePageChange = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleSizeChange = () => {
  currentPage.value = 1
}

// 跳转详情
const goDetail = (productId: string) => {
  router.push(`/product/${productId}`)
}

// 初始化
onMounted(async () => {
  await loadCategories()
  await loadProducts()
})
</script>

<style scoped>
.product-list-page {
  background-color: #f8f9fa;
  min-height: calc(100vh - 130px);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.list-wrapper {
  display: flex;
  gap: 30px;
}

/* 侧边栏 */
.sidebar {
  width: 220px;
  flex-shrink: 0;
}

.filter-box {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 20px;
}

.filter-box h3 {
  font-size: 16px;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.category-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.category-item {
  cursor: pointer;
}

.category-name {
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s;
}

.category-name:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.category-name.active {
  background-color: #ecf5ff;
  color: #409eff;
}

.sub-categories {
  margin-left: 20px;
  margin-top: 4px;
}

.sub-category-name {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.sub-category-name:hover {
  background-color: #f5f7fa;
  color: #409eff;
}

.sub-category-name.active {
  background-color: #ecf5ff;
  color: #409eff;
}

/* 主内容区 */
.main-content {
  flex: 1;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-bar .el-input {
  flex: 1;
}

/* 排序栏 */
.sort-bar {
  display: flex;
  gap: 24px;
  background: white;
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
}

.sort-item {
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-item:hover,
.sort-item.active {
  color: #409eff;
}

.sort-right {
  position: absolute;
  right: 20px;
  top: 12px;
  color: #999;
  font-size: 14px;
}

/* 商品网格 */
.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.product-image {
  height: 220px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-info {
  padding: 15px;
}

.product-info h3 {
  font-size: 16px;
  margin-bottom: 8px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-info .price {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 4px;
}

.product-info .sales {
  font-size: 12px;
  color: #999;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 响应式 */
@media (max-width: 768px) {
  .list-wrapper {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }

  .product-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }

  .product-image {
    height: 160px;
  }

  .sort-right {
    position: static;
    margin-left: auto;
  }
}
</style>