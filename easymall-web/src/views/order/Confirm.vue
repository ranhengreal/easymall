<template>
  <div class="order-confirm-page">
    <div class="container">
      <h2 class="page-title">确认订单</h2>

      <div v-loading="loading" class="confirm-wrapper">
        <!-- 空状态 -->
        <el-empty v-if="!loading && items.length === 0" description="未获取到商品信息">
          <el-button type="primary" @click="goCart">返回购物车</el-button>
        </el-empty>

        <template v-else>
          <!-- 收货地址 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <span class="section-title">收货地址</span>
            </template>
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="90px"
              class="address-form"
            >
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="收货人" prop="receiverName">
                    <el-input v-model="form.receiverName" placeholder="请输入收货人姓名" maxlength="50" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="手机号码" prop="receiverPhone">
                    <el-input v-model="form.receiverPhone" placeholder="请输入手机号码" maxlength="11" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="省份" prop="receiverProvince">
                    <el-input v-model="form.receiverProvince" placeholder="省份" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="城市" prop="receiverCity">
                    <el-input v-model="form.receiverCity" placeholder="城市" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="区/县" prop="receiverDistrict">
                    <el-input v-model="form.receiverDistrict" placeholder="区/县" />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-form-item label="详细地址" prop="receiverAddress">
                <el-input v-model="form.receiverAddress" placeholder="请输入详细地址" type="textarea" :rows="2" maxlength="200" />
              </el-form-item>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="邮编" prop="receiverZip">
                    <el-input v-model="form.receiverZip" placeholder="邮政编码（选填）" maxlength="6" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="备注" prop="userNote">
                    <el-input v-model="form.userNote" placeholder="订单备注（选填）" maxlength="200" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>

          <!-- 商品清单 -->
          <el-card class="section-card" shadow="never">
            <template #header>
              <span class="section-title">商品清单</span>
            </template>
            <div class="item-header">
              <span class="col-product">商品</span>
              <span class="col-spec">规格</span>
              <span class="col-price">单价</span>
              <span class="col-qty">数量</span>
              <span class="col-total">小计</span>
            </div>
            <div v-for="(item, index) in items" :key="index" class="item-row">
              <div class="col-product">
                <img :src="getImageUrl(item.productImage)" :alt="item.productName" class="item-thumb" />
                <span class="item-name">{{ item.productName }}</span>
              </div>
              <span class="col-spec">{{ item.specValues || '-' }}</span>
              <span class="col-price">¥{{ item.price?.toFixed(2) }}</span>
              <span class="col-qty">{{ item.quantity }}</span>
              <span class="col-total">¥{{ (item.price * item.quantity)?.toFixed(2) }}</span>
            </div>
          </el-card>

          <!-- 金额汇总 + 操作 -->
          <el-card class="section-card" shadow="never">
            <div class="summary-bar">
              <div class="total-info">
                <span>共 {{ items.length }} 件商品，</span>
                <span class="total-label">合计：</span>
                <span class="total-amount">¥{{ totalPrice.toFixed(2) }}</span>
              </div>
              <div class="action-buttons">
                <el-button @click="goCart">返回购物车</el-button>
                <el-button
                  type="primary"
                  size="large"
                  :loading="submitting"
                  @click="submitOrder"
                >
                  提交订单
                </el-button>
              </div>
            </div>
          </el-card>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { createOrder } from '@/api/order'
import { getCartList, type CartItem } from '@/api/cart'
import { getProductDetail } from '@/api/product'
import { getImageUrl } from '@/utils/image'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const items = ref<CartItem[]>([])

// 地址表单
const form = ref({
  receiverName: '',
  receiverPhone: '',
  receiverProvince: '',
  receiverCity: '',
  receiverDistrict: '',
  receiverAddress: '',
  receiverZip: '',
  userNote: ''
})

// 表单校验规则
const rules: FormRules = {
  receiverName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' },
    { min: 2, max: 50, message: '姓名长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, message: '请输入手机号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '手机号码格式不正确', trigger: 'blur' }
  ],
  receiverAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' },
    { max: 200, message: '地址不能超过200个字符', trigger: 'blur' }
  ],
  receiverZip: [
    { pattern: /^\d{6}$/, message: '邮编格式不正确（6位数字）', trigger: 'blur' }
  ]
}

// 总价
const totalPrice = computed(() => {
  return items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 加载商品数据
const loadItems = async () => {
  loading.value = true
  try {
    const cartIds = route.query.cartIds as string
    const productId = route.query.productId as string

    if (cartIds) {
      // 从购物车结算
      const idList = cartIds.split(',').filter(Boolean)
      const cartList = await getCartList()
      items.value = cartList.filter(item => idList.includes(item.cartId))
      if (items.value.length === 0) {
        ElMessage.warning('未找到选中的购物车商品')
      }
    } else if (productId) {
      // 立即购买：从商品详情获取完整信息
      const quantity = parseInt(route.query.quantity as string) || 1
      const specValues = route.query.specValues as string || ''
      try {
        const product = await getProductDetail(productId)
        items.value = [{
          cartId: '',
          productId,
          productName: product.productName,
          price: product.price,
          productImage: product.mainImage,
          quantity,
          specValues,
          selected: true,
          stock: product.stock
        }]
      } catch {
        ElMessage.error('获取商品信息失败')
      }
    } else {
      ElMessage.warning('参数错误，缺少商品信息')
    }
  } catch (error) {
    console.error('加载商品信息失败:', error)
    ElMessage.error('加载商品信息失败')
  } finally {
    loading.value = false
  }
}

// 提交订单
const submitOrder = async () => {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    const orderItems = items.value.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }))

    await createOrder({
      receiverName: form.value.receiverName,
      receiverPhone: form.value.receiverPhone,
      receiverProvince: form.value.receiverProvince || undefined,
      receiverCity: form.value.receiverCity || undefined,
      receiverDistrict: form.value.receiverDistrict || undefined,
      receiverAddress: form.value.receiverAddress,
      receiverZip: form.value.receiverZip || undefined,
      userNote: form.value.userNote || undefined,
      items: orderItems,
      payType: 1
    })

    ElMessage.success('订单提交成功')
    router.push('/order/list')
  } catch (error) {
    console.error('提交订单失败:', error)
    // 错误已在 request 拦截器中提示
  } finally {
    submitting.value = false
  }
}

// 返回购物车
const goCart = () => {
  router.push('/cart')
}

onMounted(() => {
  loadItems()
})
</script>

<style scoped>
.order-confirm-page {
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

.confirm-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.section-card {
  margin-bottom: 16px;
  border: 1px solid #f0f0f0;
}

.section-card :deep(.el-card__header) {
  padding: 12px 16px;
  background: #fafbfc;
  border-bottom: 1px solid #f0f0f0;
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

/* 地址表单 */
.address-form {
  max-width: 800px;
}

/* 商品清单表头 */
.item-header {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
  color: #999;
  font-size: 13px;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-row:last-child {
  border-bottom: none;
}

.col-product {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.item-thumb {
  width: 60px;
  height: 60px;
  border-radius: 6px;
  object-fit: cover;
  border: 1px solid #f0f0f0;
  flex-shrink: 0;
}

.item-name {
  font-size: 14px;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-spec {
  width: 120px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.col-price,
.col-total {
  width: 100px;
  text-align: center;
  color: #333;
  font-size: 14px;
}

.col-qty {
  width: 80px;
  text-align: center;
  color: #333;
  font-size: 14px;
}

.col-total {
  color: #ff6b6b;
  font-weight: 500;
}

/* 底部汇总 */
.summary-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-info {
  font-size: 14px;
  color: #666;
}

.total-label {
  font-size: 16px;
}

.total-amount {
  font-size: 24px;
  color: #ff6b6b;
  font-weight: bold;
}

.action-buttons {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .item-header {
    display: none;
  }

  .item-row {
    flex-wrap: wrap;
    gap: 8px;
  }

  .col-product {
    width: 100%;
  }

  .col-spec,
  .col-price,
  .col-qty,
  .col-total {
    width: auto;
    flex: 1;
    text-align: left;
  }

  .summary-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .address-form :deep(.el-row) {
    flex-direction: column;
  }

  .address-form :deep(.el-col) {
    width: 100%;
    max-width: 100%;
    flex: none;
  }
}
</style>
