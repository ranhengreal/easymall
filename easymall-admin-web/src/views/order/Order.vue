<template>
  <div class="order-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单管理</span>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-form :inline="true" :model="searchForm">
          <el-form-item label="订单号">
            <el-input
                v-model="searchForm.orderSn"
                placeholder="请输入订单号"
                clearable
                style="width: 200px"
            />
          </el-form-item>
          <el-form-item label="用户名">
            <el-input
                v-model="searchForm.userName"
                placeholder="请输入用户名"
                clearable
                style="width: 150px"
            />
          </el-form-item>
          <el-form-item label="订单状态">
            <el-select
                v-model="searchForm.orderStatus"
                clearable
                placeholder="全部"
                style="width: 120px"
            >
              <el-option :value="0" label="待付款" />
              <el-option :value="1" label="待发货" />
              <el-option :value="2" label="待收货" />
              <el-option :value="3" label="已完成" />
              <el-option :value="4" label="已取消" />
              <el-option :value="5" label="售后中" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 批量操作栏 -->
      <div class="batch-actions" v-if="selectedRows.length > 0">
        <el-space>
          <span>已选择 {{ selectedRows.length }} 条订单</span>
          <el-button type="danger" link @click="batchDelete">批量删除</el-button>
          <el-button @click="clearSelection">清空</el-button>
        </el-space>
      </div>

      <!-- 订单表格 -->
      <el-table
          :data="paginatedData"
          border
          v-loading="loading"
          @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <!-- 订单ID列已隐藏，只显示订单号 -->
        <el-table-column prop="orderSn" label="订单号" width="220" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column prop="totalAmount" label="金额" width="120">
          <template #default="{ row }">
            <span style="color: #f56c6c; font-weight: bold">¥{{ row.totalAmount }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.orderStatus)">
              {{ getStatusText(row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
            <el-button
                v-if="row.orderStatus === 1"
                type="success"
                link
                @click="handleShip(row)"
            >
              发货
            </el-button>
            <el-button
                v-if="row.orderStatus === 0"
                type="warning"
                link
                @click="handleCancel(row)"
            >
              取消
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @current-change="handlePageChange"
            @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
        :title="`订单详情 - ${detailData.orderSn}`"
        v-model="detailVisible"
        width="800px"
        destroy-on-close
    >
      <div class="order-detail">
        <!-- 基本信息（订单ID放在详情中，但不突出显示） -->
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="订单号">{{ detailData.orderSn }}</el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="getStatusType(detailData.orderStatus)">
              {{ getStatusText(detailData.orderStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间">{{ detailData.createTime }}</el-descriptions-item>
          <el-descriptions-item label="支付状态">
            <el-tag :type="detailData.payStatus === 1 ? 'success' : 'danger'">
              {{ detailData.payStatus === 1 ? '已支付' : '未支付' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="订单金额">¥{{ detailData.totalAmount }}</el-descriptions-item>
          <el-descriptions-item label="实付金额">
            <span style="color: #f56c6c; font-weight: bold">¥{{ detailData.payAmount }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 收货信息 -->
        <el-descriptions title="收货信息" :column="1" border style="margin-top: 20px">
          <el-descriptions-item label="收货人">{{ detailData.receiverName }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detailData.receiverPhone }}</el-descriptions-item>
          <el-descriptions-item label="收货地址">{{ detailData.receiverAddress }}</el-descriptions-item>
        </el-descriptions>

        <!-- 物流信息（如果已发货） -->
        <el-descriptions
            v-if="detailData.logisticsCompany"
            title="物流信息"
            :column="2"
            border
            style="margin-top: 20px"
        >
          <el-descriptions-item label="物流公司">{{ detailData.logisticsCompany }}</el-descriptions-item>
          <el-descriptions-item label="物流单号">{{ detailData.trackingNumber }}</el-descriptions-item>
        </el-descriptions>

        <!-- 商品列表 -->
        <div style="margin-top: 20px">
          <div class="section-title">商品清单</div>
          <el-table :data="detailData.items" border>
            <el-table-column prop="productName" label="商品名称" />
            <el-table-column prop="price" label="单价" width="120">
              <template #default="{ row }">¥{{ row.price }}</template>
            </el-table-column>
            <el-table-column prop="quantity" label="数量" width="80" />
            <el-table-column prop="totalAmount" label="小计" width="120">
              <template #default="{ row }">
                <span style="color: #f56c6c">¥{{ row.totalAmount }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 备注信息 -->
        <div style="margin-top: 20px">
          <div class="section-title">
            <span>卖家备注</span>
            <el-button
                v-if="!editRemark"
                type="primary"
                link
                size="small"
                @click="startEditRemark"
                style="margin-left: 10px"
            >
              编辑
            </el-button>
          </div>
          <div class="remark-box">
            <div v-if="!editRemark" class="remark-text">
              {{ detailData.remark || '暂无备注' }}
            </div>
            <div v-else>
              <el-input
                  v-model="remarkText"
                  type="textarea"
                  rows="3"
                  placeholder="请输入备注信息"
              />
              <div class="remark-actions" style="margin-top: 10px">
                <el-button type="primary" size="small" @click="saveRemark">保存</el-button>
                <el-button size="small" @click="cancelEditRemark">取消</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button
            v-if="detailData.orderStatus === 1"
            type="success"
            @click="handleShipFromDetail"
        >
          发货
        </el-button>
      </template>
    </el-dialog>

    <!-- 发货对话框 -->
    <el-dialog title="订单发货" v-model="shipVisible" width="500px" destroy-on-close>
      <el-form :model="shipForm" label-width="100px">
        <el-form-item label="物流公司" required>
          <el-select v-model="shipForm.logisticsCompany" placeholder="请选择物流公司" style="width: 100%">
            <el-option label="顺丰速运" value="顺丰速运" />
            <el-option label="圆通速递" value="圆通速递" />
            <el-option label="中通快递" value="中通快递" />
            <el-option label="韵达快递" value="韵达快递" />
            <el-option label="邮政EMS" value="邮政EMS" />
            <el-option label="京东物流" value="京东物流" />
            <el-option label="极兔快递" value="极兔快递" />
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号" required>
          <el-input v-model="shipForm.trackingNumber" placeholder="请输入物流单号" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="shipForm.remark" type="textarea" rows="2" placeholder="选填" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="shipVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmShip" :loading="shipLoading">确认发货</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {getOrderList, getOrderDetail, updateOrderStatus, deleteOrder, updateOrderRemark, cancelOrder} from '@/api/order'
import type { Order, OrderDetail } from '@/api/order'
import { shipOrder } from '@/api/order'

const route = useRoute()

// 列表数据
const loading = ref(false)
const orderList = ref<Order[]>([])
const selectedRows = ref<Order[]>([])

// 搜索参数
const searchForm = ref({
  orderSn: '',
  userName: '',
  orderStatus: undefined as number | undefined
})

// 分页
const pageNum = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 前端分页计算
const paginatedData = computed(() => {
  const start = (pageNum.value - 1) * pageSize.value
  const end = start + pageSize.value
  return orderList.value.slice(start, end)
})

// 详情对话框
const detailVisible = ref(false)
const detailData = ref<OrderDetail>({
  orderId: '',
  orderSn: '',
  userId: '',
  userName: '',
  totalAmount: 0,
  payAmount: 0,
  orderStatus: 0,
  payStatus: 0,
  receiverName: '',
  receiverPhone: '',
  receiverAddress: '',
  createTime: '',
  items: [],
  remark: '',
  logisticsCompany: '',
  trackingNumber: ''
})

// 备注编辑
const editRemark = ref(false)
const remarkText = ref('')

// 发货对话框
const shipVisible = ref(false)
const shipLoading = ref(false)
const currentOrder = ref<Order | null>(null)
const shipForm = ref({
  logisticsCompany: '',
  trackingNumber: '',
  remark: ''
})

// 状态映射
const getStatusText = (status: number) => {
  const map: Record<number, string> = {
    0: '待付款',
    1: '待发货',
    2: '待收货',
    3: '已完成',
    4: '已取消',
    5: '售后中'
  }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success',
    4: 'danger',
    5: 'danger'
  }
  return map[status] || 'info'
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const data = await getOrderList({
      orderSn: searchForm.value.orderSn || undefined,
      userName: searchForm.value.userName || undefined,
      orderStatus: searchForm.value.orderStatus
    })
    orderList.value = data || []
    total.value = orderList.value.length
    pageNum.value = 1
  } catch (error) {
    console.error('加载订单失败:', error)
    ElMessage.error('加载订单失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pageNum.value = 1
  loadData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    orderSn: '',
    userName: '',
    orderStatus: undefined
  }
  pageNum.value = 1
  loadData()
}

// 分页事件
const handlePageChange = (page: number) => {
  pageNum.value = page
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
}

// 多选
const handleSelectionChange = (rows: Order[]) => {
  selectedRows.value = rows
}

const clearSelection = () => {
  selectedRows.value = []
}

// 批量删除
const batchDelete = async () => {
  const deletableOrders = selectedRows.value.filter(
      row => row.orderStatus === 3 || row.orderStatus === 4
  )

  if (deletableOrders.length === 0) {
    ElMessage.warning('只有已完成或已取消的订单才能删除')
    return
  }

  await ElMessageBox.confirm(
      `确定删除选中的 ${deletableOrders.length} 条订单吗？`,
      '批量删除',
      { type: 'warning' }
  )

  for (const order of deletableOrders) {
    await deleteOrder(order.orderId)
  }

  ElMessage.success('删除成功')
  clearSelection()
  loadData()
}

// 发货
const handleShip = (row: Order) => {
  currentOrder.value = row
  shipForm.value = {
    logisticsCompany: '',
    trackingNumber: '',
    remark: ''
  }
  shipVisible.value = true
}

const confirmShip = async () => {
  if (!shipForm.value.logisticsCompany || !shipForm.value.trackingNumber) {
    ElMessage.warning('请填写完整的物流信息')
    return
  }

  if (currentOrder.value?.orderStatus !== 1) {
    const statusText = getStatusText(currentOrder.value?.orderStatus ?? 0)
    ElMessage.warning(`只有待发货的订单才能发货，当前状态：${statusText}`)
    shipVisible.value = false
    return
  }

  shipLoading.value = true
  try {
    await shipOrder(
        currentOrder.value!.orderId,
        shipForm.value.logisticsCompany,
        shipForm.value.trackingNumber
    )
    ElMessage.success('发货成功')
    shipVisible.value = false
    await loadData()
  } catch (error: any) {
    // 错误提示已经在 request.ts 中统一处理了
    // 这里只需要记录日志，不需要再显示 ElMessage.error
    console.error('发货失败:', error)
    // 可选：关闭发货对话框
    shipVisible.value = false
  } finally {
    shipLoading.value = false
  }
}
// 取消订单
const handleCancel = async (row: Order) => {
  await ElMessageBox.confirm(`确定取消订单"${row.orderSn}"吗？`, '提示', { type: 'warning' })
  await updateOrderStatus(row.orderId, 4, { cancelReason: '管理员取消' })
  ElMessage.success('取消成功')
  await loadData()
}

// 详情
const handleDetail = async (row: Order) => {
  const detail = await getOrderDetail(row.orderId)
  detailData.value = detail
  detailVisible.value = true
  editRemark.value = false
  remarkText.value = ''
}

// 从详情发货
const handleShipFromDetail = () => {
  detailVisible.value = false
  handleShip({
    orderId: detailData.value.orderId,
    orderSn: detailData.value.orderSn,
    userName: detailData.value.userName,
    totalAmount: detailData.value.totalAmount,
    orderStatus: detailData.value.orderStatus,
    createTime: detailData.value.createTime
  } as Order)
}

// 备注编辑
const startEditRemark = () => {
  remarkText.value = detailData.value.remark || ''
  editRemark.value = true
}

const saveRemark = async () => {
  await updateOrderRemark(detailData.value.orderId, remarkText.value)
  detailData.value.remark = remarkText.value
  editRemark.value = false
  ElMessage.success('备注保存成功')
}

const cancelEditRemark = () => {
  editRemark.value = false
  remarkText.value = ''
}

// 删除订单
const handleDelete = async (row: Order) => {
  if (row.orderStatus !== 3 && row.orderStatus !== 4) {
    ElMessage.warning('只有已完成或已取消的订单才能删除')
    return
  }

  await ElMessageBox.confirm(`确定删除订单"${row.orderSn}"吗？`, '提示', { type: 'warning' })
  await deleteOrder(row.orderId)
  ElMessage.success('删除成功')
  await loadData()
}

// 初始化
onMounted(() => {
  const status = route.query.status
  if (status) {
    searchForm.value.orderStatus = Number(status)
  }
  loadData()
})
</script>

<style scoped>
.order-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.search-bar {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.batch-actions {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #ecf5ff;
  border-radius: 4px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.order-detail {
  max-height: 600px;
  overflow-y: auto;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 3px solid #409eff;
}

.remark-box {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.remark-text {
  color: #606266;
  line-height: 1.5;
}

.remark-actions {
  display: flex;
  justify-content: flex-end;
}
</style>