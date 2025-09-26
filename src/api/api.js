import axios from 'axios';

const api = axios.create({
    baseURL: 'http://your-backend-api.com', // 后端API地址
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 请求拦截器添加token
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 题目相关API
export const questionAPI = {
    // 获取题目列表
    getQuestions: (params) => api.get('/questions', { params }),
    // 获取题目详情
    getQuestionDetail: (id) => api.get(`/questions/${id}`),
    // 提交答案
    submitAnswer: (id, data) => api.post(`/questions/${id}/submit`, data)
};

// 用户相关API
export const userAPI = {
    // 用户登录
    login: (data) => api.post('/auth/login', data),
    // 获取用户信息
    getUserInfo: () => api.get('/users/me'),
    // 获取用户答题记录
    getRecords: () => api.get('/users/records')
};

export default api;