import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
    baseURL: '/api',
    timeout: 15000
})

// 请求拦截器
request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// 响应拦截器
request.interceptors.response.use(
    (response) => {
        const res = response.data
        if (res.code === 200) {
            return res.data
        } else if (res.code === 401) {
            ElMessage.error(res.message || '登录已过期')
            localStorage.removeItem('token')
            window.location.href = '/login'
            return Promise.reject(res)
        } else {
            ElMessage.error(res.message || '请求失败')
            return Promise.reject(res)
        }
    },
    (error) => {
        console.error('请求错误:', error)
        ElMessage.error(error.message || '网络错误')
        return Promise.reject(error)
    }
)

export default request