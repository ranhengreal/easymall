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

// 获取启用的轮播图列表
export const getBannerList = (): Promise<Banner[]> => {
    return request.get('/banner/list')
}