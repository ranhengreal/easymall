<template>
  <div class="dashboard-container">
    <!-- 核心指标卡片 -->
    <div class="cards-row">
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-icon icon-users">
            <el-icon><User /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-title">总用户数</div>
            <div class="card-value">{{ dashboardData.userCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-icon icon-orders">
            <el-icon><ShoppingCart /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-title">总订单数</div>
            <div class="card-value">{{ dashboardData.orderCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-icon icon-pending">
            <el-icon><Van /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-title">待发货订单</div>
            <div class="card-value">{{ dashboardData.pendingShipCount }}</div>
          </div>
        </div>
      </el-card>

      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-icon icon-sales">
            <el-icon><Money /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-title">总销售额</div>
            <div class="card-value">¥{{ formatMoney(dashboardData.totalSales) }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 第二行指标 -->
    <div class="cards-row">
      <el-card class="card-item" shadow="hover">
        <div class="card-content">
          <div class="card-icon icon-pay">
            <el-icon><Wallet /></el-icon>
          </div>
          <div class="card-info">
            <div class="card-title">待付款订单</div>
            <div class="card-value">{{ dashboardData.pendingPayCount }}</div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <el-card class="chart-card" shadow="hover">
        <template #header>
          <span>近7天销售趋势</span>
        </template>
        <div ref="trendChartRef" class="chart-container"></div>
      </el-card>
    </div>

    <!-- 热销商品排行 -->
    <div class="charts-row">
      <el-card class="hot-products-card" shadow="hover">
        <template #header>
          <span>热销商品排行榜</span>
        </template>
        <el-table :data="hotProducts" border stripe>
          <el-table-column type="index" label="排名" width="60" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', getRankClass($index)]">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="productName" label="商品名称" min-width="200" />
          <el-table-column prop="totalSales" label="销量" width="100" align="center">
            <template #default="{ row }">
              <span class="sales-number">{{ row.totalSales }}</span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import { getDashboard, getTrend, getHotProducts } from '@/api/statistics'
import type { DashboardData, TrendData, HotProduct } from '@/api/statistics'
import { User, ShoppingCart, Van, Money, Wallet } from '@element-plus/icons-vue'

const dashboardData = ref<DashboardData>({
  userCount: 0,
  orderCount: 0,
  pendingShipCount: 0,
  totalSales: 0,
  pendingPayCount: 0
})

const hotProducts = ref<HotProduct[]>([])
const trendChartRef = ref<HTMLElement>()

const formatMoney = (value: number) => {
  return value.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const getRankClass = (index: number) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

const initTrendChart = (data: TrendData) => {
  if (!trendChartRef.value) return

  const chart = echarts.init(trendChartRef.value)
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['销售额', '订单量']
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLabel: { rotate: 45 }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额 (元)',
        nameLocation: 'middle',
        nameGap: 50
      },
      {
        type: 'value',
        name: '订单量 (单)',
        nameLocation: 'middle',
        nameGap: 50
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: data.amounts,
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: { color: '#409eff', width: 3 },
        areaStyle: { opacity: 0.1, color: '#409eff' }
      },
      {
        name: '订单量',
        type: 'bar',
        data: data.orders,
        barWidth: '30%',
        itemStyle: { color: '#67c23a', borderRadius: [4, 4, 0, 0] }
      }
    ]
  })

  window.addEventListener('resize', () => chart.resize())
}

const loadData = async () => {
  try {
    const [dashboard, trend, hot] = await Promise.all([
      getDashboard(),
      getTrend(),
      getHotProducts()
    ])
    dashboardData.value = dashboard
    hotProducts.value = hot.hotProducts
    initTrendChart(trend)
  } catch (error) {
    console.error('加载看板数据失败:', error)
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.cards-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.card-item {
  flex: 1;
  min-width: 180px;
}

.card-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: white;
}

.icon-users { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.icon-orders { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.icon-pending { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.icon-sales { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.icon-pay { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.card-info {
  flex: 1;
}

.card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.charts-row {
  margin-bottom: 20px;
}

.chart-card {
  width: 100%;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.hot-products-card {
  width: 100%;
}

.rank-badge {
  display: inline-block;
  width: 24px;
  height: 24px;
  line-height: 24px;
  text-align: center;
  border-radius: 4px;
  font-weight: bold;
}

.rank-1 { background: #ffd700; color: #333; }
.rank-2 { background: #c0c0c0; color: #333; }
.rank-3 { background: #cd7f32; color: white; }

.sales-number {
  font-weight: bold;
  color: #f56c6c;
  font-size: 16px;
}
</style>