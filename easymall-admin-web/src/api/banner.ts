import request from '@/utils/request'

export interface Banner {
    id: number
    title: string
    imageUrl: string
    linkUrl: string
    sort: number
    status: number
    createTime: string
    updateTime: string
}

// 获取轮播图列表
export const getBannerList = (): Promise<Banner[]> => {
    return request.get('/admin/banner/list')
}

// 添加轮播图
export const addBanner = (data: any): Promise<string> => {
    return request.post('/admin/banner/add', data)
}

// 更新轮播图
export const updateBanner = (data: any): Promise<string> => {
    return request.put('/admin/banner/update', data)
}

// 删除轮播图
export const deleteBanner = (id: number): Promise<string> => {
    return request.delete(`/admin/banner/delete/${id}`)
}

// 更新状态
export const updateBannerStatus = (id: number, status: number): Promise<string> => {
    return request.put(`/admin/banner/status/${id}?status=${status}`)
}