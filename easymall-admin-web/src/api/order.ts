// src/api/order.ts
import request from '@/utils/request'

export interface Order {
    orderId: string
    orderSn: string
    userId: string
    userName: string
    totalAmount: number
    orderStatus: number
    createTime: string
}

export interface OrderDetail extends Order {
    payAmount: number
    payStatus: number
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    remark?: string
    logisticsCompany?: string
    trackingNumber?: string
    items: OrderItem[]
}

export interface OrderItem {
    productId: string
    productName: string
    price: number
    quantity: number
    totalAmount: number
}

// ==================== 查询接口 ====================

/**
 * 获取订单列表（支持搜索）
 */
export const getOrderList = (params?: {
    orderSn?: string
    userName?: string
    orderStatus?: number
}): Promise<Order[]> => {
    return request.get('/admin/order/list', { params })
}

/**
 * 获取订单详情
 */
export const getOrderDetail = (orderId: string): Promise<OrderDetail> => {
    return request.get(`/admin/order/${orderId}`)
}

// ==================== 操作接口 ====================

/**
 * 发货
 */
export const shipOrder = (orderId: string, logisticsCompany: string, trackingNumber: string): Promise<void> => {
    return request.put(`/admin/order/${orderId}/ship`, {
        logisticsCompany,
        trackingNumber
    })
}

/**
 * 取消订单（管理员）
 */
export const cancelOrder = (orderId: string, cancelReason: string): Promise<void> => {
    return request.put(`/admin/order/${orderId}/cancel`, { cancelReason })
}

/**
 * 删除订单（管理员）
 */
export const deleteOrder = (orderId: string): Promise<void> => {
    return request.delete(`/admin/order/${orderId}`)
}

/**
 * 更新订单备注
 */
export const updateOrderRemark = (orderId: string, remark: string): Promise<void> => {
    return request.put(`/admin/order/${orderId}/remark`, { remark })
}

// ==================== 通用状态更新（可选） ====================

/**
 * 通用状态更新（根据状态自动调用对应接口）
 */
export const updateOrderStatus = (orderId: string, status: number, data?: any): Promise<void> => {
    if (status === 4) {
        // 取消订单
        return cancelOrder(orderId, data?.cancelReason || '管理员取消')
    } else if (status === 2) {
        // 发货
        return shipOrder(orderId, data?.logisticsCompany, data?.trackingNumber)
    } else {
        // 其他状态更新
        return request.put(`/admin/order/${orderId}/status`, { orderStatus: status, ...data })
    }
}