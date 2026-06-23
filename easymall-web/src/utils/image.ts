// 图片工具函数（用户端）

// 用户端后端地址
const API_BASE_URL = 'http://localhost:6050'

// 灰色背景占位符 SVG（Base64 格式）
const PLACEHOLDER_IMAGE = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f5f7fa"/%3E%3Ctext x="50" y="55" font-size="12" text-anchor="middle" fill="%23909399"%3E暂无图片%3C/text%3E%3C/svg%3E'

/**
 * 获取图片完整URL
 * @param url 图片路径
 * @returns 完整图片URL
 */
export const getImageUrl = (url: string | undefined | null): string => {
    if (!url) return PLACEHOLDER_IMAGE
    if (url.startsWith('http')) return url
    if (url.startsWith('data:')) return url

    // 确保路径以 / 开头
    const cleanUrl = url.startsWith('/') ? url : '/' + url
    return `${API_BASE_URL}/api${cleanUrl}`
}

/**
 * 处理图片加载错误
 * @param event 错误事件
 */
export const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    // 防止无限循环
    if (img.src === PLACEHOLDER_IMAGE) {
        return
    }
    // 移除错误监听
    img.onerror = null
    // 设置占位符
    img.src = PLACEHOLDER_IMAGE
}

/**
 * 预览图片
 * @param url 图片路径
 */
export const previewImage = (url: string | undefined | null) => {
    if (url) {
        const imageUrl = getImageUrl(url)
        window.open(imageUrl, '_blank')
    }
}

/**
 * 获取默认商品图片
 */
export const getDefaultProductImage = (): string => {
    return PLACEHOLDER_IMAGE
}