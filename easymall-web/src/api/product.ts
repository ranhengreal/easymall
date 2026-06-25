import request from '@/utils/request'

// 商品基础类型
export interface Product {
    productId: string
    productName: string
    price: number
    originalPrice?: number
    stock: number
    mainImage: string
    images?: string[]
    categoryId: string
    categoryName: string
    brandId: string
    brandName: string
    status: number
    sales: number
    description?: string
    parameters?: Record<string, string>
    skuList?: SkuItem[]
}

// SKU 规格项
export interface SkuItem {
    specValues: string
    price: number
    stock: number
    image?: string
}

// 商品列表查询参数
export interface ProductListParams {
    pageNum?: number
    pageSize?: number
    categoryId?: string
    keyword?: string
    orderBy?: string
}

// 商品列表响应
export interface ProductListResponse {
    list: Product[]
    total: number
    pageNum: number
    pageSize: number
}

// 获取商品列表
export const getProductList = (params: ProductListParams): Promise<ProductListResponse> => {
    return request.get('/product/list', { params })
}

// 获取商品详情
export const getProductDetail = (productId: string): Promise<Product> => {
    return request.get(`/product/${productId}`)
}
