// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
import HomePage from '../views/HomePage.vue'  // 假设这是你的"第一个Vue页面"
import Practice from '../views/QuestionPractice.vue'  // 刷题平台主界面
import QuizDetailPage from '../views/QuizDetailPage.vue';

// 路由规则
const routes = [
    {
        path: '/',  // 首页路由（第一个页面）
        name: 'Page',
        component: HomePage
    },
    {
        path: '/questions',
        name: 'Questions',
        component: Practice
    },
    {
        path: '/categories/:category',
        name: 'QuizDetail',
        component: QuizDetailPage,
        props: true // 允许将路由参数作为组件props传递
    }
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),  // 使用HTML5 history模式（无#号）
    routes
})

// 全局前置守卫：设置页面标题
router.beforeEach((to, from, next) => {
    if (to.meta.title) {
        document.title = to.meta.title
    }
    next()
})

export default router