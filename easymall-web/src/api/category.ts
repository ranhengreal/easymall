import request from '@/utils/request'

export interface Category {
    categoryId: string
    categoryName: string
    pCategoryId: string
    level: number
    sort: number
    children?: Category[]
}

// 获取分类树
export const getCategoryTree = (): Promise<Category[]> => {
    return request.get('/category/tree')
}