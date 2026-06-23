import request from '@/utils/request'

export interface Brand {
    brandId: string
    brandName: string
    brandLogo: string
    description: string
    sort: number
    status: number
    createTime: string
    updateTime: string
}

// 获取品牌列表
export const getBrandList = () => {
    return request.get<any, Brand[]>('/admin/brand')
}

// 获取品牌详情
export const getBrandById = (brandId: string) => {
    return request.get<any, Brand>(`/admin/brand/${brandId}`)
}

// 新增品牌
export const addBrand = (data: { brandName: string; brandLogo?: string; description?: string; sort?: number; status?: number }) => {
    return request.post('/admin/brand', data)
}

// 更新品牌
export const updateBrand = (data: { brandId: string; brandName: string; brandLogo?: string; description?: string; sort?: number; status?: number }) => {
    return request.put(`/admin/brand/${data.brandId}`, data)
}

// 删除品牌
export const deleteBrand = (brandId: string) => {
    return request.delete(`/admin/brand/${brandId}`)
}

// 批量更新排序
export const batchUpdateBrandSort = (sortList: { brandId: string; sort: number }[]) => {
    return request.put('/admin/brand/sort/batch', sortList)
}