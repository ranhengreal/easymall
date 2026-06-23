import request from '@/utils/request'

// 购物车商品项
export interface CartItem {
    cartId: string
    productId: string
    productName: string
    price: number
    productImage: string
    quantity: number
    specValues: string
    selected: boolean
    stock: number
}

// 添加购物车参数
export interface AddCartParams {
    productId: string
    quantity: number
    specValues?: string
}

// 获取购物车列表
export const getCartList = (): Promise<CartItem[]> => {
    return request.get('/cart')
}

// 添加购物车
export const addCart = (data: AddCartParams): Promise<string> => {
    return request.post('/cart/add', data)
}

// 更新数量
export const updateQuantity = (cartId: string, quantity: number): Promise<string> => {
    return request.put(`/cart/${cartId}/quantity?quantity=${quantity}`)
}

// 更新选中状态
export const updateSelected = (cartId: string, selected: boolean): Promise<string> => {
    return request.put(`/cart/${cartId}/selected?selected=${selected ? 1 : 0}`)
}

// 批量更新选中状态（请求体直接传数组）
export const batchUpdateSelected = (cartIds: string[], selected: boolean): Promise<string> => {
    // 注意：selected 作为查询参数，cartIds 直接作为请求体数组
    return request.put(`/cart/selected/batch?selected=${selected ? 1 : 0}`, cartIds)
}

// 删除购物车项
export const deleteCartItem = (cartId: string): Promise<string> => {
    return request.delete(`/cart/${cartId}`)
}

// 批量删除（请求体直接传数组）
export const batchDeleteCart = (cartIds: string[]): Promise<string> => {
    return request.delete('/cart/batch', { data: cartIds })
}

// 清空购物车
export const clearCart = (): Promise<string> => {
    return request.delete('/cart/clear')
}