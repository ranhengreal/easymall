import request from '@/utils/request'

export interface User {
    userId: string
    username: string
    nickname: string
    phone: string
    email: string
    gender: number
    status: number
    isDeleted?: number  // 新增：逻辑删除标记
    avatar: string
    lastLoginTime: string
    createTime: string
}

// 获取用户列表
export const getUserList = (params?: {
    keyword?: string
    status?: number
}): Promise<User[]> => {
    return request.get('/admin/user/list', { params })
}

// 获取用户详情
export const getUserDetail = (userId: string): Promise<User> => {
    return request.get(`/admin/user/${userId}`)
}

// 更新用户状态
export const updateUserStatus = (userId: string, status: number): Promise<void> => {
    return request.put(`/admin/user/${userId}/status`, { status })
}

// 重置密码
export const resetPassword = (userId: string): Promise<void> => {
    return request.put(`/admin/user/${userId}/reset-password`)
}

// 逻辑删除用户
export const deleteUser = (userId: string): Promise<void> => {
    return request.delete(`/admin/user/${userId}`)
}

// 恢复用户
export const restoreUser = (userId: string): Promise<void> => {
    return request.put(`/admin/user/${userId}/restore`)
}

// 获取已删除用户列表
export const getDeletedUserList = (keyword?: string): Promise<User[]> => {
    return request.get('/admin/user/deleted', { params: { keyword } })
}