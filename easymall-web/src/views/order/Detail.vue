<template>
  <div class="order-detail-page">
    <div class="container">
      <h2 class="page-title">订单详情</h2>

      <div v-loading="loading" class="detail-wrapper">
        <template v-if="order">
          <!-- 订单状态 -->
          <div class="status-section">
            <el-tag :type="statusTagType" size="large" effect="dark">
              {{ order.orderStatusName }}
            </el-tag>
            <span class="order-no-label">订单号：{{ order.orderSn }}</span>
          </div>

          <!-- 收货信息 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <span class="card-title">收货信息</span>
            </template>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="收货人">{{ order.receiverName }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ order.receiverPhone }}</el-descriptions-item>
              <el-descriptions-item label="收货地址">{{ order.receiverAddress }}</el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 商品清单 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <span class="card-title">商品清单</span>
            </template>
            <el-table :data="order.orderItems" style="width: 100%" stripe>
              <el-table-column label="商品名称" min-width="220">
                <template #default="{ row }">
                  <div class="product-cell">
                    <img
                      :src="getImageUrl(row.productImage)"
                      :alt="row.productName"
                      class="product-thumb"
                      @error="handleImageError"
                    />
                    <span>{{ row.productName }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="specValues" label="规格" width="120" />
              <el-table-column label="单价" width="100">
                <template #default="{ row }">
                  ¥{{ row.price?.toFixed(2) }}
                </template>
              </el-table-column>
              <el-table-column prop="quantity" label="数量" width="80" />
              <el-table-column label="小计" width="120">
                <template #default="{ row }">
                  <span class="subtotal">¥{{ (row.price * row.quantity)?.toFixed(2) }}</span>
                </template>
              </el-table-column>
            </el-table>
          </el-card>

          <!-- 金额汇总 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <span class="card-title">金额汇总</span>
            </template>
            <div class="amount-summary">
              <div class="amount-row">
                <span>商品总额</span>
                <span>¥{{ order.productTotal?.toFixed(2) }}</span>
              </div>
              <div class="amount-row">
                <span>运费</span>
                <span>¥{{ order.freightAmount?.toFixed(2) }}</span>
              </div>
              <el-divider />
              <div class="amount-row total">
                <span>实付金额</span>
                <span class="pay-amount">¥{{ order.payAmount?.toFixed(2) }}</span>
              </div>
            </div>
          </el-card>

          <!-- 时间线 -->
          <el-card class="info-card" shadow="never">
            <template #header>
              <span class="card-title">订单时间线</span>
            </template>
            <el-timeline>
              <el-timeline-item
                timestamp="下单时间"
                placement="top"
                type="primary"
              >
                {{ order.createTime }}
              </el-timeline-item>
              <el-timeline-item
                v-if="order.payTime"
                timestamp="支付时间"
                placement="top"
                type="success"
              >
                {{ order.payTime }}
              </el-timeline-item>
              <el-timeline-item
                v-if="order.shipTime"
                timestamp="发货时间"
                placement="top"
                type="info"
              >
                {{ order.shipTime }}
              </el-timeline-item>
              <el-timeline-item
                v-if="order.receiveTime"
                timestamp="确认时间"
                placement="top"
                type="warning"
              >
                {{ order.receiveTime }}
              </el-timeline-item>
            </el-timeline>
          </el-card>

          <!-- 操作按钮 -->
          <div class="action-bar">
            <el-button @click="goBack">返回订单列表</el-button>
            <el-button
              v-if="order.orderStatus === 0"
              type="primary"
              :loading="submitting"
              @click="handlePay"
            >
              去支付
            </el-button>
            <el-button
              v-else-if="order.orderStatus === 1"
              type="info"
              disabled
            >
              待发货
            </el-button>
            <el-button
              v-else-if="order.orderStatus === 2"
              type="success"
              :loading="submitting"
              @click="handleConfirm"
            >
              确认收货
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrderDetail, payOrder, confirmOrder, type OrderDetail } from '@/api/order'
import { getImageUrl, handleImageError } from '@/utils/image'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const order = ref<OrderDetail | null>(null)

// 状态标签类型
const statusTagType = computed(() => {
  if (!order.value) return 'info'
  const map: Record<number, 'warning' | 'primary' | 'info' | 'success' | 'danger'> = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger'
  }
  return map[order.value.orderStatus] || 'info'
})

// 加载订单详情
const loadDetail = async () => {
  const orderId = route.params.id as string
  if (!orderId) {
    ElMessage.error('订单ID不存在')
    router.push('/order/list')
    return
  }
  loading.value = true
  try {
    const res = await getOrderDetail(orderId)
    order.value = res
  } catch (error) {
    console.error('加载订单详情失败:', error)
    ElMessage.error('加载订单详情失败')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 去支付
const handlePay = async () => {
  if (!order.value) return
  submitting.value = true
  try {
    await payOrder(order.value.orderId)
    ElMessage.success('支付成功')
    loadDetail()
  } catch (error) {
    console.error('支付失败:', error)
    ElMessage.error('支付失败')
  } finally {
    submitting.value = false
  }
}

// 确认收货
const handleConfirm = async () => {
  if (!order.value) return
  submitting.value = true
  try {
    await confirmOrder(order.value.orderId)
    ElMessage.success('已确认收货')
    loadDetail()
  } catch (error) {
    console.error('确认收货失败:', error)
    ElMessage.error('确认收货失败')
  } finally {
    submitting.value = false
  }
}

// 返回列表
const goBack = () => {
  router.push('/order/list')
}

onMounted(() => {
  loadDetail()
})
</script>

<style scoped>
.order-detail-page {
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

.detail-wrapper {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  min-height: 300px;
}

/* 状态区域 */
.status-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 20px;
}

.order-no-label {
  font-size: 14px;
  color: #666;
}

/* 信息卡片 */
.info-card {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.info-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* 商品表格 */
.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.product-thumb {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.subtotal {
  color: #ff6b6b;
  font-weight: 500;
}

/* 金额汇总 */
.amount-summary {
  max-width: 360px;
  margin-left: auto;
}

.amount-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  font-size: 14px;
  color: #666;
}

.amount-row.total {
  font-size: 16px;
  color: #333;
}

.pay-amount {
  font-size: 22px;
  color: #ff6b6b;
  font-weight: bold;
}

/* 操作按钮 */
.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .status-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .amount-summary {
    max-width: 100%;
  }

  .action-bar {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>
