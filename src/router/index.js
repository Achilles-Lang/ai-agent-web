// src/router/index.js
import {createRouter, createWebHistory} from 'vue-router'

// 导入页面组件
import HomePage from '../views/HomePage.vue'  // 假设这是你的"第一个Vue页面"
import Practice from '../views/QuestionPractice.vue'  // 刷题平台主界面
import QuizDetailPage from '../views/QuizDetailPage.vue';
import QuestionBankGenerator from "@/views/QuestionBankGenerator.vue";
import LoginPage from "@/views/LoginPage.vue";
import QuizListPage from "@/views/QuizListPage.vue";

// 路由规则
const routes = [
    {
        path: '/',  // 首页路由（第一个页面）
        name: 'Home',
        component: HomePage,
        meta: {requiresAuth: true}
    },
    {
        path: '/questions/:businessId',
        name: 'QuizTaking',
        component: Practice,
        meta: {requiresAuth: true}
    },
    {
        path: '/categories/:businessId',
        name: 'QuizDetail',
        component: QuizDetailPage,
        props: true,
        meta: {requiresAuth: true}
    },
    {
        path: '/question-bank/generate/:category',
        name: 'QuestionBankGenerator',
        component: QuestionBankGenerator,
        meta: {requiresAuth: true}
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginPage,
        meta: {requiresAuth: true}
    },
    {
        path: '/quizList',
        name: 'QuizList',
        component: QuizListPage,
        meta: {requiresAuth: true}
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
