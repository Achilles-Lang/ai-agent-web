// src/utils/authInterceptor.js
import router from '@/router';
import axios from 'axios';
import {verify} from "@/api/user.js";

// 从Cookie中获取指定key的值
const getCookie = (key) => {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === key) {
            return decodeURIComponent(value);
        }
    }
    return null;
};

// 标记是否正在进行鉴权请求，防止重复请求
let isAuthenticating = false;

// 路由前置守卫 - 实现全局鉴权拦截
router.beforeEach(async (to, from, next) => {
    // 1. 不需要鉴权的页面直接放行（如登录页）
    if (!to.meta.requiresAuth) {
        return next();
    }

    // 2. 检查是否有token
    const userToken = localStorage.getItem('USER_TOKEN');
    if (!userToken) {
        return next('/login'); // 无token直接跳登录页
    }

    // 3. 有token则进行服务端鉴权
    if (!isAuthenticating) {
        isAuthenticating = true;
        try {
            // 发送鉴权请求到服务端
            const response = await verify()

            // 鉴权成功 - 放行
            if (response.code === 200) {
                isAuthenticating = false;
                const userId = response.data;
                localStorage.setItem('USER_ID', userId);
                return next();
            }
            // 鉴权失败 - 清除无效token并跳登录页
            localStorage.removeItem('USER_TOKEN');
            isAuthenticating = false;
            return next('/login');
        } catch (error) {
            // 网络错误或服务器异常也视为鉴权失败
            console.error('鉴权请求失败:', error);
            localStorage.removeItem('USER_TOKEN');
            isAuthenticating = false;
            return next('/login');
        }
    } else {
        // 正在鉴权中 - 等待上一次请求完成
        const checkAuth = setInterval(() => {
            if (!isAuthenticating) {
                clearInterval(checkAuth);
                // 重新执行一次路由守卫逻辑
                router.beforeEach(to, from, next);
            }
        }, 100);
    }
});

// 给需要鉴权的请求添加默认token（可选）
axios.interceptors.request.use(config => {
    const userToken = getCookie('USER_TOKEN');
    if (userToken) {
        config.headers.Authorization = `Bearer ${userToken}`;
    }
    return config;
});

export default router;
