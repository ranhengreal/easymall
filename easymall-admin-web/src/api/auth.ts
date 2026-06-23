import request from '@/utils/request'

export interface LoginParams {
  account: string
  password: string
  checkCode: string
  checkCodeKey: string
}

export interface CheckCodeResponse {
  checkCodeKey: string
  checkCode: string
}

export interface AdminInfo {
  account: string
  role: string
  avatar: string
}

// 获取验证码
export const getCheckCode = () => {
  return request.get<any, CheckCodeResponse>('/admin/account/checkCode')
}

// 登录
export const login = (params: LoginParams) => {
  return request.post('/admin/account/login', null, { params })
}

// 登出
export const logout = () => {
  return request.post('/admin/account/logout')
}

// 获取管理员信息
export const getAdminInfo = (): Promise<AdminInfo> => {
  return request.get('/admin/account/info')
}

// 修改密码（返回成功消息）
export const changePassword = (oldPassword: string, newPassword: string): Promise<string> => {
  return request.put('/admin/account/password', { oldPassword, newPassword })
}