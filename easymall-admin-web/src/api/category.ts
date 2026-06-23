import request from '@/utils/request'

export interface Category {
  categoryId: string
  categoryName: string
  pCategoryId: string
  sort: number
  children?: Category[]
}

// 获取分类树
export const getCategoryTree = () => {
  return request.get<any, Category[]>('/admin/category/tree')
}

// 移动分类（跨层级拖动）
export const moveCategory = (data: { categoryId: string; targetCategoryId: string; moveType: string }) => {
  return request.put('/admin/category/move', data)
}

// 新增分类
export const addCategory = (data: { categoryName: string; pCategoryId?: string; sort?: number }) => {
  return request.post('/admin/category', data)
}

// 更新分类
export const updateCategory = (data: { categoryId: string; categoryName: string; pCategoryId?: string; sort?: number }) => {
  return request.put(`/admin/category/${data.categoryId}`, data)
}

// 删除分类
export const deleteCategory = (categoryId: string) => {
  return request.delete(`/admin/category/${categoryId}`)
}

// 批量更新排序
export const batchUpdateSort = (sortList: { categoryId: string; sort: number }[]) => {
  return request.put('/admin/category/sort/batch', sortList)
}

