<template>
  <div class="cart-page">
    <div class="container">
      <h2 class="page-title">购物车</h2>

      <div v-loading="loading" class="cart-wrapper">
        <!-- 空状态 -->
        <el-empty v-if="!loading && cartList.length === 0" description="购物车是空的，快去逛逛吧~">
          <el-button type="primary" @click="goProductList">去购物</el-button>
        </el-empty>

        <!-- 购物车列表 -->
        <template v-else>
          <div class="cart-header">
            <el-checkbox v-model="allChecked" @change="toggleAll">全选</el-checkbox>
            <span class="header-right">单价</span>
            <span class="header-right">数量</span>
            <span class="header-right">小计</span>
            <span class="header-right">操作</span>
          </div>

          <div class="cart-list">
            <div v-for="item in cartList" :key="item.cartId" class="cart-item">
              <el-checkbox v-model="item.selected" @change="updateCartSelected(item)" />

              <div class="item-image" @click="goDetail(item.productId)">
                <img :src="getImageUrl(item.productImage)" :alt="item.productName" />
              </div>

              <div class="item-info">
                <div class="item-name" @click="goDetail(item.productId)">{{ item.productName }}</div>
                <div class="item-spec" v-if="item.specValues">规格：{{ item.specValues }}</div>
              </div>

              <div class="item-price">¥{{ item.price?.toFixed(2) }}</div>

              <div class="item-quantity">
                <el-input-number
                    v-model="item.quantity"
                    :min="1"
                    :max="item.stock || 999"
                    size="small"
                    @change="(val) => updateCartQuantity(item, val)"
                />
              </div>

              <div class="item-total">¥{{ (item.price * item.quantity)?.toFixed(2) }}</div>

              <div class="item-action">
                <el-button type="danger" link @click="deleteItem(item)">删除</el-button>
              </div>
            </div>
          </div>

          <!-- 底部结算栏 -->
          <div class="cart-footer">
            <el-checkbox v-model="allChecked" @change="toggleAll">全选</el-checkbox>
            <div class="footer-info">
              <span>已选 {{ selectedCount }} 件商品</span>
              <span class="total-price">合计：¥{{ totalPrice?.toFixed(2) }}</span>
            </div>
            <div class="footer-actions">
              <el-button @click="deleteSelected">删除选中</el-button>
              <el-button type="danger" plain @click="handleClearCart">清空购物车</el-button>
              <el-button type="primary" @click="checkout" :disabled="selectedCount === 0">
                去结算
              </el-button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getCartList,
  updateQuantity as updateCartApi,
  updateSelected as updateSelectedApi,
  batchUpdateSelected,
  deleteCartItem,
  batchDeleteCart,
  clearCart as clearCartApi,  // ← 起别名
  type CartItem
} from '@/api/cart'
import { getImageUrl } from '@/utils/image'

const router = useRouter()

const loading = ref(false)
const cartList = ref<CartItem[]>([])

// 全选计算
const allChecked = computed({
  get: () => {
    if (cartList.value.length === 0) return false
    return cartList.value.every(item => item.selected)
  },
  set: (val) => {
    toggleAll(val)
  }
})

// 选中数量
const selectedCount = computed(() => {
  return cartList.value.filter(item => item.selected).length
})

// 总价
const totalPrice = computed(() => {
  return cartList.value
      .filter(item => item.selected)
      .reduce((sum, item) => sum + item.price * item.quantity, 0)
})

// 加载购物车
const loadCart = async () => {
  loading.value = true
  try {
    const res = await getCartList()
    cartList.value = res || []
  } catch (error) {
    console.error('加载购物车失败:', error)
    ElMessage.error('加载购物车失败')
  } finally {
    loading.value = false
  }
}

// 更新数量
const updateCartQuantity = async (item: CartItem, val: number) => {
  if (!item || !item.cartId) {
    console.warn('updateCartQuantity: item 或 cartId 缺失', item)
    return
  }
  try {
    await updateCartApi(item.cartId, val)
  } catch (error) {
    console.error('更新数量失败:', error)
    ElMessage.error('更新数量失败')
    loadCart()
  }
}

// 更新选中状态（单个）
const updateCartSelected = async (item: CartItem) => {
  if (!item || !item.cartId) {
    console.warn('updateCartSelected: item 或 cartId 缺失', item)
    return
  }
  try {
    await updateSelectedApi(item.cartId, item.selected)
  } catch (error) {
    console.error('更新选中失败:', error)
    ElMessage.error('操作失败')
    item.selected = !item.selected
  }
}

// 全选/取消全选
const toggleAll = async (val: boolean) => {
  const cartIds = cartList.value.map(item => item.cartId)
  if (cartIds.length === 0) return
  try {
    await batchUpdateSelected(cartIds, val)
    cartList.value.forEach(item => item.selected = val)
  } catch (error) {
    console.error('全选操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 删除单个
const deleteItem = async (item: CartItem) => {
  try {
    await ElMessageBox.confirm(`确定删除"${item.productName}"吗？`, '提示', { type: 'warning' })
    await deleteCartItem(item.cartId)
    ElMessage.success('删除成功')
    loadCart()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 删除选中
const deleteSelected = async () => {
  const selectedIds = cartList.value
      .filter(item => item.selected)
      .map(item => item.cartId)

  if (selectedIds.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }

  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.length} 件商品吗？`, '提示', { type: 'warning' })
    await batchDeleteCart(selectedIds)
    ElMessage.success('删除成功')
    loadCart()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 清空购物车
const handleClearCart = async () => {
  if (cartList.value.length === 0) {
    ElMessage.warning('购物车已经是空的')
    return
  }
  try {
    await ElMessageBox.confirm('确定要清空购物车吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确定清空',
      cancelButtonText: '取消'
    })
    await clearCartApi()  // ← 调用 API
    ElMessage.success('购物车已清空')
    loadCart()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('清空失败')
    }
  }
}

// 去结算
const checkout = () => {
  const selectedItems = cartList.value.filter(item => item.selected)
  if (selectedItems.length === 0) {
    ElMessage.warning('请先选择商品')
    return
  }
  const ids = selectedItems.map(item => item.cartId).join(',')
  router.push(`/order/confirm?cartIds=${ids}`)
}

// 跳转商品列表
const goProductList = () => {
  router.push('/product/list')
}

// 跳转商品详情
const goDetail = (productId: string) => {
  router.push(`/product/${productId}`)
}

onMounted(() => {
  loadCart()
})
</script>

<style scoped>
.cart-page {
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

.cart-wrapper {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.cart-header {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  color: #999;
  font-size: 14px;
}

.cart-header .header-right {
  width: 100px;
  text-align: center;
}

.cart-header .header-right:last-child {
  width: 80px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child {
  border-bottom: none;
}

.cart-item .el-checkbox {
  margin-right: 16px;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
  padding: 0 16px;
}

.item-name {
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 4px;
}

.item-name:hover {
  color: #409eff;
}

.item-spec {
  font-size: 13px;
  color: #999;
}

.item-price,
.item-total {
  width: 100px;
  text-align: center;
  color: #333;
}

.item-quantity {
  width: 100px;
  display: flex;
  justify-content: center;
}

.item-action {
  width: 80px;
  text-align: center;
}

.cart-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 20px;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.footer-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.total-price {
  font-size: 20px;
  color: #ff6b6b;
  font-weight: bold;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

@media (max-width: 768px) {
  .cart-item {
    flex-wrap: wrap;
    gap: 12px;
  }

  .item-price,
  .item-total,
  .item-quantity,
  .item-action {
    width: auto;
    flex: 1;
    text-align: left;
  }

  .cart-header {
    display: none;
  }

  .cart-footer {
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>