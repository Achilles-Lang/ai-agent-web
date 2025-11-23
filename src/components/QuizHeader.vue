<template>
  <!-- 导航栏 -->
  <header
      class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700"
  >
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <div class="flex items-center">
          <router-link to="/" class="flex items-center gap-2">
            <i class="fa fa-book text-2xl text-indigo-600 dark:text-indigo-400"></i>
            <span class="text-xl font-bold">roles-chat-ai</span>
          </router-link>
        </div>

        <div class="flex items-center gap-4">
          <button
              @click="toggleDarkMode"
              class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <i class="fa" :class="isDarkMode ? 'fa-sun-o' : 'fa-moon-o'"></i>
          </button>

          <!-- 用户信息区域 -->
          <div class="relative group" v-if="user">
            <!-- 显示头像和昵称 -->
            <div class="flex items-center gap-2 cursor-pointer">
              <img
                  :src="user.avatar"
                  alt="用户头像"
                  class="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 transition-transform hover:scale-110"
              >
              <span class="hidden sm:inline text-sm font-medium">{{ user.nickname }}</span>
            </div>

            <!-- 下拉菜单 -->
            <div
                class="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-3 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2">
              <div class="px-4 mb-3 border-b border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <img
                      :src="user.avatar"
                      alt="用户头像"
                      class="w-14 h-14 rounded-full object-cover"
                  >
                  <div>
                    <p class="font-medium">{{ user.nickname }}</p>
                  </div>
                </div>
              </div>
              <button
                  @click="handleLogout"
                  class="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <i class="fa fa-sign-out"></i>
                <span>登出</span>
              </button>
            </div>
          </div>

          <!-- 未登录状态 -->
          <router-link
              to="/login"
              class="text-indigo-600 dark:text-indigo-400 hover:underline"
              v-else
          >
            登录
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import {onMounted, ref} from "vue";
import router from "@/router/index.js";
import {getUser, logout} from "@/api/user.js";
import Router from "@/router/index.js";

const isDarkMode = ref(false);
const user = ref(null); // 用户信息

// 检查系统暗色模式偏好并初始化用户信息
onMounted(() => {
  // 检查暗色模式
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }

  // 初始化用户信息
  const userInfo = localStorage.getItem("USER_INFO");
  if (userInfo) {
    user.value = JSON.parse(userInfo);
  } else {
    initUserInfo();
  }
});

// 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

const toRecord = () => {
  router.push({name: 'QuizList'})
}

// 初始化用户信息
const initUserInfo = async () => {
  try {
    // 从localStorage获取用户信息
    const userId = localStorage.getItem('USER_ID');

    if (!userId) {
      user.value = null;
      return;
    }

    const response = await getUser(userId);
    if (response.code === 200 && response.data) {
      user.value = response.data;
      localStorage.setItem("USER_INFO", JSON.stringify(user.value));
    } else {
      user.value = null;
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    user.value = null;
  }
};

// 处理登出
const handleLogout = async () => {
  const userId = localStorage.getItem('USER_ID');
  await logout(userId)
  // 清除localStorage中的用户信息
  localStorage.removeItem('USER_ID');
  localStorage.removeItem('USER_TOKEN');
  localStorage.removeItem('USER_INFO');
  // 重置用户状态
  user.value = null;
  // 跳转到登录页
  await router.push('/login');
};

</script>

<style scoped>
/* 全局样式补充 */
* {
  box-sizing: border-box;
}

/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 滚动条样式优化 */
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
