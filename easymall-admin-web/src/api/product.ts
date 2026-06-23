import request from '@/utils/request'

export interface Sku {
    skuId?: string
    specValues: string
    price: number
    stock: number
    image?: string
}

export interface Product {
    productId: string
    productName: string
    categoryId: string
    categoryName?: string
    brandId: string
    brandName?: string
    mainImage: string
    images: string
    description: string
    price: number
    stock: number
    sales: number
    status: number
    sort: number
    createTime: string
    updateTime: string
    skuList?: Sku[]
}

// 获取商品列表
export const getProductList = (): Promise<Product[]> => {
    return request.get('/admin/product')
}

// 获取商品详情
export const getProductById = (productId: string): Promise<Product> => {
    return request.get(`/admin/product/${productId}`)
}

// 新增商品
export const addProduct = (data: any): Promise<void> => {
    return request.post('/admin/product', data)
}

// 更新商品（完整更新）
export const updateProduct = (productId: string, data: any): Promise<void> => {
    return request.put(`/admin/product/${productId}`, data)
}

// 更新商品状态（单独更新状态）
export const updateProductStatus = (productId: string, status: number): Promise<void> => {
    return request.put(`/admin/product/${productId}/status`, { status })
}

// 删除商品
export const deleteProduct = (productId: string): Promise<void> => {
    return request.delete(`/admin/product/${productId}`)
}