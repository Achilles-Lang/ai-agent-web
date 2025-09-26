import axios from 'axios'

// 创建axios实例
const BASE_API = "http://localhost:8123";

const service = axios.create({
    baseURL: BASE_API, // 从环境变量获取基础URL
    timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
    config => {
        // 可以在这里添加请求头，如Token
        // config.headers['Authorization'] = 'Bearer ' + getToken()
        return config
    },
    error => {
        // 处理请求错误
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

// 响应拦截器
service.interceptors.response.use(
    response => {
        // 处理成功响应
        return response.data
    },
    error => {
        // 处理响应错误
        console.error('响应错误:', error)
        return Promise.reject(error)
    }
)

export default service
