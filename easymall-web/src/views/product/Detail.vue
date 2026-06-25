<template>
  <div class="product-detail" v-loading="loading">
    <div class="container">
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/product/list' }">商品列表</el-breadcrumb-item>
        <el-breadcrumb-item>{{ product?.productName || '商品详情' }}</el-breadcrumb-item>
      </el-breadcrumb>

      <!-- 商品主体 -->
      <div class="detail-wrapper" v-if="product">
        <!-- 左侧图片区 -->
        <div class="image-gallery">
          <el-image
            :src="currentImage"
            fit="cover"
            class="main-image"
            :preview-src-list="imageList"
            preview-teleported
          />
          <div class="thumbnail-list" v-if="imageList.length > 1">
            <div
              v-for="(img, index) in imageList"
              :key="index"
              class="thumbnail"
              :class="{ active: currentImage === img }"
              @click="currentImage = img"
            >
              <el-image :src="img" fit="cover" />
            </div>
          </div>
        </div>

        <!-- 右侧信息区 -->
        <div class="product-info">
          <h1 class="product-name">{{ product.productName }}</h1>

          <div class="price-section">
            <span class="current-price">¥{{ displayPrice?.toFixed(2) }}</span>
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice?.toFixed(2) }}
            </span>
          </div>

          <div class="meta-section">
            <span>月销 {{ product.sales || 0 }} 件</span>
            <span>库存 {{ displayStock }} 件</span>
            <span v-if="product.status === 1" style="color:#67c23a;">上架中</span>
            <span v-else style="color:#f56c6c;">已下架</span>
          </div>

          <!-- 规格选择（SKU） -->
          <div class="spec-section" v-if="specOptions.length > 0">
            <div v-for="spec in specOptions" :key="spec.name" class="spec-item">
              <div class="spec-label">{{ spec.name }}：</div>
              <div class="spec-options">
                <el-button
                  v-for="option in spec.options"
                  :key="option"
                  size="small"
                  :type="selectedSpecs[spec.name] === option ? 'primary' : 'default'"
                  @click="selectSpec(spec.name, option)"
                >
                  {{ option }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 数量选择 -->
          <div class="quantity-section">
            <span class="label">数量：</span>
            <el-input-number
              v-model="quantity"
              :min="1"
              :max="displayStock"
              size="large"
            />
            <span class="stock-info">库存 {{ displayStock }} 件</span>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
              size="large"
              @click="addToCart"
              :loading="addLoading"
              :disabled="product.status !== 1 || displayStock <= 0"
            >
              加入购物车
            </el-button>
            <el-button
              type="primary"
              size="large"
              @click="buyNow"
              :loading="buyLoading"
              :disabled="product.status !== 1 || displayStock <= 0"
            >
              立即购买
            </el-button>
          </div>
        </div>
      </div>

      <!-- 商品详情描述 -->
      <div class="detail-tabs" v-if="product">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="商品详情" name="detail">
            <div class="detail-content" v-html="product.description || '暂无描述'"></div>
          </el-tab-pane>
          <el-tab-pane label="规格参数" name="specs">
            <el-descriptions :column="2" border v-if="product.parameters && Object.keys(product.parameters).length">
              <el-descriptions-item
                v-for="(value, key) in product.parameters"
                :key="key"
                :label="key"
              >
                {{ value }}
              </el-descriptions-item>
            </el-descriptions>
            <el-empty v-else description="暂无规格参数" />
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductDetail, type Product, type SkuItem } from '@/api/product'
import { addCart } from '@/api/cart'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const addLoading = ref(false)
const buyLoading = ref(false)
const activeTab = ref('detail')
const product = ref<Product | null>(null)
const quantity = ref(1)

// 当前主图
const currentImage = ref('')

// 图片列表（主图 + 多图 + SKU图）
const imageList = computed(() => {
  const images: string[] = []
  // 当前 SKU 有专属图片则优先加入
  if (currentSku.value?.image) {
    images.push(getImageUrl(currentSku.value.image))
  }
  // 主图
  if (product.value?.mainImage) {
    const main = getImageUrl(product.value.mainImage)
    if (!images.includes(main)) images.push(main)
  }
  // 多图
  if (product.value?.images?.length) {
    product.value.images.forEach(img => {
      const url = getImageUrl(img)
      if (!images.includes(url)) images.push(url)
    })
  }
  return images
})

// SKU 列表
const skuList = computed<SkuItem[]>(() => product.value?.skuList || [])

// 解析规格选项（如 "颜色:黑色,尺寸:M" → [{ name: '颜色', options: ['黑色','白色'] }, ...]）
const specOptions = computed(() => {
  const specMap: Record<string, Set<string>> = {}
  skuList.value.forEach(sku => {
    if (sku.specValues) {
      sku.specValues.split(',').forEach(pair => {
        const [key, value] = pair.split(':')
        if (key?.trim() && value?.trim()) {
          if (!specMap[key.trim()]) specMap[key.trim()] = new Set()
          specMap[key.trim()].add(value.trim())
        }
      })
    }
  })
  return Object.entries(specMap).map(([name, options]) => ({
    name,
    options: Array.from(options)
  }))
})

// 当前选中的规格
const selectedSpecs = ref<Record<string, string>>({})

// 构建当前选中规格的键值（用于匹配 SKU）
const selectedSpecKey = computed(() => {
  const parts = Object.entries(selectedSpecs.value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}:${v}`)
  return parts.join(',')
})

// 匹配当前 SKU
const currentSku = computed<SkuItem | undefined>(() => {
  if (!selectedSpecKey.value) return undefined
  return skuList.value.find(sku => sku.specValues === selectedSpecKey.value)
})

// 显示价格（选中 SKU 则用 SKU 价格，否则用商品默认价格）
const displayPrice = computed(() => {
  if (currentSku.value) return currentSku.value.price
  return product.value?.price || 0
})

// 显示库存（选中 SKU 则用 SKU 库存，否则用商品默认库存）
const displayStock = computed(() => {
  if (currentSku.value) return currentSku.value.stock
  return product.value?.stock || 0
})

// 选择规格
const selectSpec = (name: string, value: string) => {
  selectedSpecs.value = { ...selectedSpecs.value, [name]: value }
  // 重置数量为 1
  quantity.value = 1
  // 如果 SKU 有专属图片，切换主图
  if (currentSku.value?.image) {
    currentImage.value = getImageUrl(currentSku.value.image)
  }
}

// 加入购物车
const addToCart = async () => {
  if (!product.value) return
  addLoading.value = true
  try {
    let specStr = ''
    if (Object.keys(selectedSpecs.value).length) {
      specStr = Object.entries(selectedSpecs.value)
        .map(([k, v]) => `${k}:${v}`)
        .join(',')
    }
    await addCart({
      productId: product.value.productId,
      quantity: quantity.value,
      specValues: specStr
    })
    ElMessage.success('已加入购物车')
  } catch (error) {
    console.error('加入购物车失败:', error)
    ElMessage.error('加入购物车失败，请稍后重试')
  } finally {
    addLoading.value = false
  }
}

// 立即购买
const buyNow = async () => {
  if (!product.value) return
  buyLoading.value = true
  try {
    const params = new URLSearchParams({
      productId: product.value.productId,
      quantity: String(quantity.value),
      specValues: Object.entries(selectedSpecs.value)
        .map(([k, v]) => `${k}:${v}`)
        .join(',')
    })
    router.push(`/order/confirm?${params.toString()}`)
  } catch (error) {
    console.error('跳转失败:', error)
    ElMessage.error('操作失败')
  } finally {
    buyLoading.value = false
  }
}

// 加载商品数据
const loadProduct = async () => {
  const productId = route.params.id as string
  if (!productId) {
    ElMessage.error('商品ID不存在')
    router.push('/product/list')
    return
  }

  loading.value = true
  try {
    const res = await getProductDetail(productId)
    product.value = res

    // 初始化主图
    if (imageList.value.length) {
      currentImage.value = imageList.value[0]
    }

    // 初始化规格选择（默认选第一个选项）
    if (specOptions.value.length) {
      const defaults: Record<string, string> = {}
      specOptions.value.forEach(spec => {
        defaults[spec.name] = spec.options[0]
      })
      selectedSpecs.value = defaults
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProduct()
})
</script>

<style scoped>
.product-detail {
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

.detail-wrapper {
  display: flex;
  gap: 40px;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.image-gallery {
  flex: 1;
  max-width: 500px;
}

.main-image {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  overflow: hidden;
}

.thumbnail-list {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.3s;
}

.thumbnail.active {
  border-color: #409eff;
}

.thumbnail .el-image {
  width: 100%;
  height: 100%;
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 24px;
  margin: 0 0 16px 0;
}

.price-section {
  margin-bottom: 16px;
}

.current-price {
  font-size: 28px;
  color: #ff6b6b;
  font-weight: bold;
}

.original-price {
  font-size: 16px;
  color: #999;
  text-decoration: line-through;
  margin-left: 12px;
}

.meta-section {
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 14px;
  margin-bottom: 20px;
  padding: 12px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.spec-section {
  margin: 20px 0;
}

.spec-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.spec-label {
  width: 60px;
  color: #666;
  flex-shrink: 0;
}

.spec-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 24px 0;
}

.quantity-section .label {
  color: #666;
}

.stock-info {
  color: #999;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 20px;
}

.action-buttons .el-button {
  min-width: 140px;
}

.detail-tabs {
  margin-top: 20px;
  background: white;
  border-radius: 12px;
  padding: 20px 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.detail-content {
  padding: 20px 0;
  line-height: 1.8;
  color: #333;
}

@media (max-width: 768px) {
  .detail-wrapper {
    flex-direction: column;
    gap: 20px;
  }

  .image-gallery {
    max-width: 100%;
  }

  .main-image {
    height: 300px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons .el-button {
    width: 100%;
  }

  .spec-item {
    flex-wrap: wrap;
  }
}
</style>
