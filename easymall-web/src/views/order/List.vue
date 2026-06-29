<template>
  <div class="order-page">
    <div class="container">
      <h2 class="page-title">我的订单</h2>

      <!-- 状态筛选 -->
      <div class="order-tabs">
        <el-tabs v-model="activeStatus" @tab-change="onStatusChange">
          <el-tab-pane
            v-for="tab in statusOptions"
            :key="tab.value"
            :label="tab.label"
            :name="String(tab.value)"
          />
        </el-tabs>
      </div>

      <div v-loading="loading" class="order-wrapper">
        <!-- 空状态 -->
        <el-empty v-if="!loading && orderList.length === 0" description="暂无订单记录">
          <el-button type="primary" @click="goProductList">去购物</el-button>
        </el-empty>

        <!-- 订单列表 -->
        <template v-else>
          <div
            v-for="order in orderList"
            :key="order.orderId"
            class="order-card"
            @click="goDetail(order.orderId)"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单号：{{ order.orderSn }}</span>
                <span class="order-time">{{ order.createTime }}</span>
              </div>
              <el-tag
                :type="getStatusTagType(order.orderStatus)"
                size="small"
                effect="dark"
              >
                {{ order.orderStatusName }}
              </el-tag>
            </div>

            <div class="order-body">
              <div class="product-thumbs">
                <div
                  v-for="(item, index) in (order.items || []).slice(0, 3)"
                  :key="index"
                  class="thumb-item"
                >
                  <img
                    :src="getImageUrl(item.productImage)"
                    :alt="item.productName"
                    @error="handleImageError"
                  />
                </div>
                <div v-if="(order.items || []).length > 3" class="thumb-more">
                  +{{ (order.items || []).length - 3 }}
                </div>
              </div>
              <div class="order-summary">
                <span class="product-count">共 {{ (order.items || []).length }} 件商品</span>
                <span class="order-amount">
                  合计：<em>¥{{ order.totalAmount?.toFixed(2) }}</em>
                </span>
              </div>
            </div>
          </div>

          <!-- 分页 -->
          <div class="pagination-wrapper" v-if="total > 0">
            <el-pagination
              v-model:current-page="pageNum"
              :page-size="pageSize"
              :total="total"
              layout="prev, pager, next"
              background
              @current-change="onPageChange"
            />
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderList, type OrderItem } from '@/api/order'
import { getImageUrl, handleImageError } from '@/utils/image'

const router = useRouter()

const loading = ref(false)
const orderList = ref<OrderItem[]>([])
const pageNum = ref(1)
const pageSize = ref(5)
const total = ref(0)
const activeStatus = ref('')

// 状态选项
const statusOptions = [
  { label: '全部', value: '' },
  { label: '待付款', value: 0 },
  { label: '待发货', value: 1 },
  { label: '待收货', value: 2 },
  { label: '已完成', value: 3 },
  { label: '已取消', value: 4 }
]

// 获取状态对应的 Tag 类型
const getStatusTagType = (status: number): 'warning' | 'primary' | 'info' | 'success' | 'danger' => {
  const map: Record<number, 'warning' | 'primary' | 'info' | 'success' | 'danger'> = {
    0: 'warning',  // 待付款
    1: 'primary',  // 待发货
    2: 'info',     // 待收货
    3: 'success',  // 已完成
    4: 'danger'    // 已取消
  }
  return map[status] || 'info'
}

// 加载订单列表
const loadOrders = async () => {
  loading.value = true
  try {
    const params: any = {
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    if (activeStatus.value !== '') {
      params.status = Number(activeStatus.value)
    }
    const res = await getOrderList(params)
    orderList.value = res.list || []
    total.value = res.total || 0
  } catch (error) {
    console.error('加载订单列表失败:', error)
    ElMessage.error('加载订单列表失败')
  } finally {
    loading.value = false
  }
}

// 状态切换
const onStatusChange = () => {
  pageNum.value = 1
  loadOrders()
}

// 页码切换
const onPageChange = (page: number) => {
  pageNum.value = page
  loadOrders()
}

// 跳转订单详情
const goDetail = (orderId: string) => {
  router.push(`/order/detail/${orderId}`)
}

// 跳转商品列表
const goProductList = () => {
  router.push('/product/list')
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.order-page {
  background-color: #f8f9fa;
  min-height: calc(100vh - 130px);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 24px;
  margin-bottom: 20px;
}

.order-tabs {
  margin-bottom: 16px;
}

.order-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.order-card {
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.order-card:hover {
  background-color: #fafbfc;
}

.order-card:last-child {
  border-bottom: none;
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: #666;
}

.order-no {
  color: #333;
  font-weight: 500;
}

.order-time {
  color: #999;
}

.order-body {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.product-thumbs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.thumb-item {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.thumb-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-more {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  color: #999;
  font-size: 14px;
  flex-shrink: 0;
}

.order-summary {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}

.product-count {
  font-size: 13px;
  color: #999;
}

.order-amount {
  font-size: 14px;
  color: #333;
}

.order-amount em {
  font-style: normal;
  font-size: 18px;
  color: #ff6b6b;
  font-weight: bold;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 20px;
  margin-top: 10px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .order-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .order-summary {
    align-items: flex-start;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>
