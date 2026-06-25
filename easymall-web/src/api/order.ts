import request from '@/utils/request'

// 订单商品项
export interface OrderProductItem {
    productId: string
    productName: string
    productImage: string
    price: number
    quantity: number
    specValues?: string
}

// 订单列表项
export interface OrderItem {
    orderId: string
    orderNo: string
    createTime: string
    totalAmount: number
    status: number
    statusText: string
    orderItems: OrderProductItem[]
}

// 订单详情
export interface OrderDetail {
    orderId: string
    orderNo: string
    createTime: string
    totalAmount: number
    status: number
    statusText: string
    receiverName: string
    receiverPhone: string
    receiverAddress: string
    productTotal: number
    freight: number
    payAmount: number
    payTime?: string
    shipTime?: string
    confirmTime?: string
    orderItems: OrderProductItem[]
}

// 订单列表查询参数
export interface OrderListParams {
    pageNum: number
    pageSize: number
    status?: number
}

// 分页结果
export interface PageResult<T> {
    list: T[]
    total: number
    pageNum: number
    pageSize: number
}

// 状态映射
export const ORDER_STATUS_MAP: Record<number, string> = {
    0: '\u5F85\u4ED8\u6B3E',
    1: '\u5F85\u53D1\u8D27',
    2: '\u5F85\u6536\u8D27',
    3: '\u5DF2\u5B8C\u6210',
    4: '\u5DF2\u53D6\u6D88'
}

// 获取订单列表
export const getOrderList = (params: OrderListParams): Promise<PageResult<OrderItem>> => {
    return request.get('/order/my', { params })
}

// 获取订单详情
export const getOrderDetail = (orderId: string): Promise<OrderDetail> => {
    return request.get(`/order/${orderId}`)
}

// 支付订单
export const payOrder = (orderId: string): Promise<string> => {
    return request.put(`/order/${orderId}/pay`)
}

// 确认收货
export const confirmOrder = (orderId: string): Promise<string> => {
    return request.put(`/order/${orderId}/confirm`)
}

// 创建订单参数
export interface CreateOrderItem {
    productId: string
    skuId?: string
    quantity: number
}

export interface CreateOrderParams {
    receiverName: string
    receiverPhone: string
    receiverProvince?: string
    receiverCity?: string
    receiverDistrict?: string
    receiverAddress: string
    receiverZip?: string
    userNote?: string
    items: CreateOrderItem[]
    payType?: number
}

// 创建订单
export const createOrder = (data: CreateOrderParams): Promise<any> => {
    return request.post('/order', data)
}