<template>
  <div class="home">
    <!-- 轮播图 -->
    <div class="banner">
      <el-carousel height="400px" indicator-position="outside">
        <el-carousel-item v-for="item in banners" :key="item.id">
          <div class="banner-item" :style="{ backgroundImage: `url(${getImageUrl(item.imageUrl)})` }">
            <div class="banner-content">
              <h2>{{ item.title }}</h2>
              <p>{{ item.subtitle || '限时优惠，不容错过' }}</p>
              <el-button type="primary" @click="goToLink(item.linkUrl)">立即抢购</el-button>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 分类导航 -->
    <div class="categories">
      <div class="container">
        <h2 class="section-title">商品分类</h2>
        <div class="category-grid">
          <div
              v-for="cat in categories"
              :key="cat.categoryId"
              class="category-item"
              @click="goCategory(cat.categoryId)"
          >
            <div class="category-icon">
              <el-icon><Folder /></el-icon>
            </div>
            <span>{{ cat.categoryName }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 热门推荐 -->
    <div class="hot-products">
      <div class="container">
        <h2 class="section-title">热门推荐</h2>
        <div class="product-grid">
          <div
              v-for="product in hotProducts"
              :key="product.productId"
              class="product-card"
              @click="goDetail(product.productId)"
          >
            <div class="product-image">
              <img :src="getImageUrl(product.mainImage)" :alt="product.productName">
            </div>
            <div class="product-info">
              <h3>{{ product.productName }}</h3>
              <p class="price">¥{{ product.price?.toFixed(2) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getProductList } from '@/api/product'
import { getCategoryTree } from '@/api/category'
import { getBannerList } from '@/api/banner'
import { getImageUrl } from '@/utils/image'
import type { Product, Category } from '@/api/product'
import type { Banner } from '@/api/banner'

const router = useRouter()

const banners = ref<Banner[]>([])
const categories = ref<Category[]>([])
const hotProducts = ref<Product[]>([])

// 加载轮播图（从后端获取）
const loadBanners = async () => {
  try {
    const res = await getBannerList()
    banners.value = res || []
  } catch (error) {
    console.error('加载轮播图失败:', error)
  }
}

// 加载分类
const loadCategories = async () => {
  try {
    const res = await getCategoryTree()
    categories.value = res || []
    if (categories.value.length > 6) {
      categories.value = categories.value.slice(0, 6)
    }
  } catch (error) {
    console.error('加载分类失败:', error)
  }
}

// 加载热门商品
const loadHotProducts = async () => {
  try {
    const res = await getProductList({ pageNum: 1, pageSize: 8 })
    hotProducts.value = res.records || res || []
  } catch (error) {
    console.error('加载热门商品失败:', error)
  }
}

// 跳转链接
const goToLink = (linkUrl: string) => {
  if (linkUrl) {
    router.push(linkUrl)
  }
}

// 跳转分类
const goCategory = (categoryId: string) => {
  router.push(`/product/list?categoryId=${categoryId}`)
}

// 跳转商品详情
const goDetail = (productId: string) => {
  router.push(`/product/${productId}`)
}

// 跳转商品列表
const goProductList = () => {
  router.push('/product/list')
}

onMounted(() => {
  loadBanners()
  loadCategories()
  loadHotProducts()
})
</script>

<style scoped>
.home {
  background-color: #f8f9fa;
}

.banner {
  margin-bottom: 40px;
}

.banner-item {
  height: 100%;
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  position: relative;
}

.banner-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
}

.banner-content {
  position: relative;
  z-index: 1;
}

.banner-content h2 {
  font-size: 48px;
  margin-bottom: 16px;
}

.banner-content p {
  font-size: 20px;
  margin-bottom: 24px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 28px;
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  position: relative;
  padding-bottom: 15px;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: #409eff;
}

.categories {
  margin-bottom: 60px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
}

.category-item {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.category-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  color: #409eff;
}

.category-icon {
  font-size: 40px;
  margin-bottom: 10px;
  color: #409eff;
}

.category-item span {
  font-size: 14px;
}

.hot-products {
  margin-bottom: 60px;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 25px;
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
  display: flex;
  align-items: center;
  justify-content: center;
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
  margin-bottom: 10px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  color: #ff6b6b;
  font-size: 20px;
  font-weight: bold;
}
</style>