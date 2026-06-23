import request from '@/utils/request'

export interface DashboardData {
    userCount: number        // 总用户数
    orderCount: number       // 总订单数
    pendingShipCount: number // 待发货订单数
    totalSales: number       // 总销售额
    pendingPayCount: number  // 待付款订单数
}

export interface TrendData {
    dates: string[]
    amounts: number[]
    orders: number[]
}

export interface HotProduct {
    productId: string
    productName: string
    mainImage: string
    totalSales: number
}

// 获取看板核心数据
export const getDashboard = (): Promise<DashboardData> => {
    return request.get('/admin/statistics/dashboard')
}

// 获取近7天销售趋势
export const getTrend = (): Promise<TrendData> => {
    return request.get('/admin/statistics/trend')
}

// 获取热销商品排行
export const getHotProducts = (): Promise<{ hotProducts: HotProduct[] }> => {
    return request.get('/admin/statistics/hot-products')
}