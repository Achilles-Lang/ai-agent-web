import { createRouter, createWebHistory } from 'vue-router'

// 1. 导入我们仅存的三个页面
import HomePage from '../views/HomePage.vue'
import LoginPage from '../views/LoginPage.vue'
import ChatRoom from '../views/ChatRoom.vue'

// 2. 定义路由规则
const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomePage,
        meta: { requiresAuth: true, title: '首页' }
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        meta: { requiresAuth: false, title: '登录' }
    },
    {
        path: '/chat',
        name: 'ChatRoom',
        component: ChatRoom,
        meta: { requiresAuth: true, title: 'AI 聊天室' }
    }
]

// 3. 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes
})

// 4. 设置页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

export default router
