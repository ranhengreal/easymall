import request from '@/utils/request'

// 登录参数
export interface LoginParams {
    username: string
    password: string
    checkCode: string
    checkCodeKey: string
}

// 注册参数
export interface RegisterParams {
    username: string
    password: string
    confirmPassword: string
    phone?: string
    email?: string
}

// 验证码响应
export interface CheckCodeResponse {
    checkCodeKey: string
    checkCode: string
}

// 用户信息
export interface UserInfo {
    userId: string
    username: string
    nickname?: string
    phone?: string
    email?: string
    avatar?: string
}

// 获取验证码
export const getCheckCode = () => {
    return request.get<any, CheckCodeResponse>('/user/checkCode')
}

// 注册
export const register = (params: RegisterParams) => {
    return request.post('/user/register', params)
}

// 登录
export const login = (params: LoginParams) => {
    return request.post('/user/login', null, { params })
}

// 获取当前用户信息
export const getUserInfo = (): Promise<UserInfo> => {
    return request.get('/user/info')
}

// 退出登录
export const logout = () => {
    return request.post('/user/logout')
}