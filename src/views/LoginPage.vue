<template>
  <div
      class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300">

    <!-- 主内容区 - 登录/注册表单（折中布局） -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex items-center justify-center">
      <div class="w-full max-w-md">
        <!-- 标题区域 -->
        <div class="text-center mb-8">
          <h1 class="text-[clamp(1.7rem,4vw,2.8rem)] font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
            {{ isLoginMode ? '登录账户' : '注册新账户' }}
          </h1>
          <p class="text-slate-600 dark:text-slate-400 text-base">
            {{ isLoginMode ? '欢迎回来，请登录您的账户' : '创建账户，开始使用知题的全部功能' }}
          </p>
        </div>

        <!-- 登录/注册切换导航（折中圆角） -->
        <div class="mb-7 relative">
          <div class="h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex p-1">
            <button
                @click="switchMode(true)"
                class="flex-1 rounded-xl flex items-center justify-center transition-all duration-300 text-sm font-medium"
                :class="isLoginMode
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'"
            >
              登录
            </button>
            <button
                @click="switchMode(false)"
                class="flex-1 rounded-xl flex items-center justify-center transition-all duration-300 text-sm font-medium"
                :class="!isLoginMode
                ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'"
            >
              注册
            </button>
          </div>
        </div>

        <!-- 表单容器（折中圆角和间距） -->
        <div
            class="bg-white dark:bg-slate-700 rounded-2xl shadow-md border border-slate-200 dark:border-slate-600 p-6 transition-all hover:shadow-lg">
          <form @submit.prevent="handleSubmit" class="space-y-5">
            <!-- 用户名输入 -->
            <div>
              <label for="username" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                用户名
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <i class="fa fa-user text-slate-400"></i>
                </div>
                <input
                    v-model="formData.username"
                    type="text"
                    id="username"
                    required
                    placeholder="请输入用户名"
                    class="w-full pl-10 pr-3.5 py-3 rounded-xl border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                >
              </div>
            </div>

            <!-- 密码输入 -->
            <div>
              <label for="password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                密码
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <i class="fa fa-lock text-slate-400"></i>
                </div>
                <input
                    v-model="formData.password"
                    :type="showPassword ? 'text' : 'password'"
                    id="password"
                    required
                    placeholder="请输入密码"
                    class="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                >
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <i class="fa" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
            </div>

            <!-- 注册额外字段 - 确认密码 -->
            <div v-if="!isLoginMode">
              <label for="confirmPassword" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                确认密码
              </label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <i class="fa fa-lock text-slate-400"></i>
                </div>
                <input
                    v-model="formData.confirmPassword"
                    :type="showPassword ? 'text' : 'password'"
                    id="confirmPassword"
                    required
                    placeholder="请再次输入密码"
                    class="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-sm"
                >
                <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <i class="fa" :class="showPassword ? 'fa-eye-slash' : 'fa-eye'"></i>
                </button>
              </div>
              <p v-if="formData.password !== formData.confirmPassword && formData.confirmPassword"
                 class="mt-1.5 text-sm text-red-500 dark:text-red-400">
                两次输入的密码不一致
              </p>
            </div>

            <!-- 记住我选项 (仅登录) -->
            <div v-if="isLoginMode" class="flex items-center justify-between">
              <div class="flex items-center">
                <input
                    v-model="rememberMe"
                    type="checkbox"
                    id="remember"
                    class="h-4.5 w-4.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
                >
                <label for="remember" class="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                  记住我
                </label>
              </div>
              <div class="text-sm">
                <a href="#"
                   class="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors">
                  忘记密码?
                </a>
              </div>
            </div>

            <!-- 提交按钮（折中设计） -->
            <button
                type="submit"
                :disabled="isSubmitting || (!isLoginMode && formData.password !== formData.confirmPassword)"
                class="w-full flex justify-center py-3 px-4 rounded-xl shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.01] active:scale-[0.99]"
            >
              <span v-if="!isSubmitting">{{ isLoginMode ? '登录' : '注册' }}</span>
              <span v-else class="flex items-center">
                <i class="fa fa-spinner fa-spin mr-2"></i>
                {{ isLoginMode ? '登录中...' : '注册中...' }}
              </span>
            </button>
          </form>
        </div>

        <!-- 底部提示文本 -->
        <div class="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <span v-if="isLoginMode">还没有账户? </span>
          <span v-else>已有账户? </span>
          <button
              @click="switchMode(!isLoginMode)"
              class="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium transition-colors"
          >
            {{ isLoginMode ? '立即注册' : '立即登录' }}
          </button>
        </div>
      </div>
    </main>

    <!-- 简化的页脚（保留简洁性） -->
    <footer
        class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-5 border-t border-slate-200 dark:border-slate-700 mt-10">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-slate-500 dark:text-slate-500">
          <p>© 知题 - 让学习更高效</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import axios from 'axios';
import {generateQuestionBank} from "@/api/question.js";
import {login, register} from "@/api/user.js";
import HomePage from "@/views/HomePage.vue";
import QuizHeader from "@/components/QuizHeader.vue";

// 状态管理（逻辑不变）
const isDarkMode = ref(false);
const isLoginMode = ref(true);
const showPassword = ref(false);
const rememberMe = ref(false);
const isSubmitting = ref(false);
const router = useRouter();

// 表单数据
const formData = ref({
  username: '',
  password: '',
  confirmPassword: ''
});

// 检查系统暗色模式偏好
onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});

// 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 切换登录/注册模式
const switchMode = (isLogin) => {
  isLoginMode.value = isLogin;
  formData.value = {
    username: '',
    password: '',
    confirmPassword: ''
  };
  showPassword.value = false;
};

// 处理表单提交（逻辑不变）
const handleSubmit = async () => {
  isSubmitting.value = true;

  try {
    const submitData = {
      username: formData.value.username,
      password: formData.value.password
    };

    const response = isLoginMode.value ? await login(submitData) : await register(submitData);
    console.log(response);

    if (response.code === 200) {
      const token = response.data;
      localStorage.setItem('USER_TOKEN', token);

      alert(isLoginMode.value ? '登录成功' : '注册成功');
      await router.push({name: 'Home'});
    } else {
      alert(response.message || (isLoginMode.value ? '登录失败' : '注册失败'));
    }
  } catch (error) {
    console.error('请求失败:', error);
    alert('网络错误，请稍后重试');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
/* 全局样式保持一致 */
* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}
</style>
