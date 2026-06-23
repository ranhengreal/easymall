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
            <span class="current-price">¥{{ product.price?.toFixed(2) }}</span>
            <span v-if="product.originalPrice" class="original-price">
              ¥{{ product.originalPrice?.toFixed(2) }}
            </span>
          </div>

          <div class="meta-section">
            <span>月销 {{ product.sales || 0 }} 件</span>
            <span>库存 {{ product.stock || 0 }} 件</span>
            <span v-if="product.status === 1">上架中</span>
            <span v-else style="color:#f56c6c;">已下架</span>
          </div>

          <!-- 规格选择（SKU） -->
          <div class="spec-section" v-if="skuList.length > 0">
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
                :max="product.stock || 999"
                size="large"
            />
            <span class="stock-info">库存 {{ product.stock || 0 }} 件</span>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button
                size="large"
                @click="addToCart"
                :loading="addLoading"
                :disabled="product.status !== 1 || product.stock <= 0"
            >
              加入购物车
            </el-button>
            <el-button
                type="primary"
                size="large"
                @click="buyNow"
                :loading="buyLoading"
                :disabled="product.status !== 1 || product.stock <= 0"
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
import { getProductDetail } from '@/api/product'
import { addCart } from '@/api/cart'
import { getImageUrl } from '@/utils/image'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const product = ref<any>(null)
const skuList = ref<any[]>([])
const quantity = ref(1)
const currentImage = ref('')
const activeTab = ref('detail')
const addLoading = ref(false)
const buyLoading = ref(false)

// 选中的规格
const selectedSpecs = ref<Record<string, string>>({})

// 图片列表
const imageList = computed(() => {
  if (!product.value) return []
  // 如果 product.images 是字符串数组
  const images = product.value.images || []
  if (Array.isArray(images) && images.length > 0) {
    return images.map((img: string) => getImageUrl(img))
  }
  // 如果只有主图
  if (product.value.mainImage) {
    return [getImageUrl(product.value.mainImage)]
  }
  return []
})

// 规格选项解析
const specOptions = computed(() => {
  if (!skuList.value.length) return []
  // 假设 skuList 格式: [{ specValues: '颜色:黑色,尺寸:M', price, stock }]
  const specMap: Record<string, Set<string>> = {}
  skuList.value.forEach(sku => {
    const pairs = sku.specValues.split(',').filter(Boolean)
    pairs.forEach((pair: string) => {
      const [key, value] = pair.split(':').map(s => s.trim())
      if (key && value) {
        if (!specMap[key]) specMap[key] = new Set()
        specMap[key].add(value)
      }
    })
  })
  return Object.keys(specMap).map(key => ({
    name: key,
    options: Array.from(specMap[key])
  }))
})

// 选择规格
const selectSpec = (name: string, value: string) => {
  selectedSpecs.value[name] = value
  // 根据选中的规格更新价格、库存等信息（可扩展）
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
    // 如果返回的 product 中有 skuList，直接使用
    skuList.value = product.value.skuList || []
    // 设置默认图片
    if (imageList.value.length) {
      currentImage.value = imageList.value[0]
    }
    // 初始化规格选择（默认选第一个）
    if (specOptions.value.length) {
      specOptions.value.forEach(spec => {
        if (!selectedSpecs.value[spec.name]) {
          selectedSpecs.value[spec.name] = spec.options[0]
        }
      })
    }
  } catch (error) {
    console.error('加载商品详情失败:', error)
    ElMessage.error('加载商品详情失败')
  } finally {
    loading.value = false
  }
}

// 加入购物车
const addToCart = async () => {
  if (!product.value) return
  addLoading.value = true
  try {
    // 构建规格字符串
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
    // 跳转到订单确认页，携带商品信息
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
</style>