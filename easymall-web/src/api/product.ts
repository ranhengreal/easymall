import request from '@/utils/request'

export interface Product {
    productId: string
    productName: string
    price: number
    stock: number
    mainImage: string
    categoryId: string
    categoryName: string
    brandId: string
    brandName: string
    status: number
    sales: number
    description?: string
}

export interface ProductListParams {
    pageNum?: number
    pageSize?: number
    categoryId?: string
    keyword?: string
    orderBy?: string  // price_asc, price_desc, sales, default
}

export interface ProductListResponse {
    records: Product[]
    total: number
    pageNum: number
    pageSize: number
}

// 获取商品列表（支持分页、分类、搜索、排序）
export const getProductList = (params: ProductListParams): Promise<ProductListResponse> => {
    return request.get('/product/list', { params })
}

// 获取商品详情
export const getProductDetail = (productId: string): Promise<Product> => {
    return request.get(`/product/${productId}`)
}