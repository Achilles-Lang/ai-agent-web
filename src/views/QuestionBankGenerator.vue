<template>
  <div
      class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300">
    <quiz-header></quiz-header>

    <!-- 主内容区 -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- 页面标题 -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">生成{{ categoryTitle }}题库</h1>
          <p class="text-slate-600 dark:text-slate-400">配置参数后，系统将为您生成专属题库</p>
        </div>

        <!-- 生成配置表单 -->
        <div v-if="!isGenerating && !hasError"
             class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md mb-8">
          <form @submit.prevent="submitGenerateForm" class="space-y-6">
            <!-- 题库名称 -->
            <div>
              <label for="bankName"
                     class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">题库名称（可选）</label>
              <input
                  id="bankName"
                  v-model="form.name"
                  type="text"
                  placeholder="例如：Java基础入门题库"
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">不填写将自动生成（格式：分类_难度_题数_日期）</p>
            </div>

            <!-- 题目数量 -->
            <div>
              <label for="totalCount"
                     class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">题目数量（必填）</label>
              <input
                  id="totalCount"
                  v-model.number="form.questionCount"
                  type="number"
                  min="5"
                  max="100"
                  step="5"
                  required
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  :disabled="isSubmitting"
              >
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                范围：5-100道，步长5道
                <span class="text-indigo-600 dark:text-indigo-400">
                  预计生成时间：{{ estimatedTime }}秒
                </span>
              </p>
            </div>

            <!-- 题库总难度 -->
            <div>
              <label for="overallDifficulty" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">题库总难度（必填）</label>
              <select
                  id="overallDifficulty"
                  v-model="form.difficulty"
                  required
                  class="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  :disabled="isSubmitting"
              >
                <option value="">请选择难度</option>
                <option value="BASIC">基础 - 简单题80%、中等题20%（适合入门）</option>
                <option value="INTERMEDIATE">进阶 - 简单题30%、中等题50%、困难题20%（适合提升）</option>
                <option value="ADVANCED">高阶 - 简单题10%、中等题30%、困难题60%（适合挑战）</option>
              </select>
            </div>

            <!-- 提交按钮 -->
            <button
                type="submit"
                class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                :disabled="isSubmitting"
            >
              <i class="fa fa-spinner fa-spin" v-if="isSubmitting"></i>
              <i class="fa fa-cogs" v-else></i>
              <span>{{ isSubmitting ? '提交中...' : '开始生成题库' }}</span>
            </button>
          </form>
        </div>

        <!-- 生成状态展示 -->
        <div v-if="isGenerating || hasError" class="text-center">
          <!-- 生成中状态 -->
          <div v-if="!hasError"
               class="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 shadow-md">
            <div
                class="w-20 h-20 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin mx-auto mb-6"></div>

            <div class="mb-6">
              <h2 class="text-xl font-semibold mb-2">生成中</h2>
              <p class="text-slate-600 dark:text-slate-400">{{ taskStatusText }}</p>
            </div>

            <!-- 进度条 -->
            <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-6">
              <div
                  class="bg-indigo-600 dark:bg-indigo-400 h-2.5 rounded-full transition-all duration-500"
                  :style="{ width: progress + '%' }"
              ></div>
            </div>

            <!-- 时间和进度统计 -->
            <div class="flex justify-between text-sm text-slate-500 dark:text-slate-500">
              <div>
                已用时: {{ loadingTime }}秒
                <span v-if="loadingTime > estimatedTime" class="text-amber-500 ml-2">
                  超出预计时间{{ Math.round(loadingTime - estimatedTime) }}秒
                </span>
              </div>
              <div>
                预计剩余: {{ Math.max(0, estimatedTime - loadingTime) }}秒
              </div>
            </div>
          </div>

          <!-- 生成错误提示 -->
          <div v-if="hasError"
               class="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div class="flex items-start">
              <i class="fa fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
              <div>
                <h3 class="font-medium text-red-800 dark:text-red-400">生成失败</h3>
                <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ errorMessage }}</p>
                <button @click="resetFormAndRetry"
                        class="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
                  <i class="fa fa-refresh"></i> 重新配置生成
                </button>
              </div>
            </div>
          </div>

          <!-- 返回按钮 -->
          <div class="mt-8 flex justify-center gap-4">
            <router-link
                to="/"
                class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
            >
              <i class="fa fa-arrow-left"></i>
              <span>返回首页</span>
            </router-link>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-500">
        <p>© 2023 知题 - 让学习更高效</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {computed, onMounted, onUnmounted, ref} from 'vue';
import {useRoute, useRouter} from 'vue-router';
import {generateQuestionBank, queryTaskStatus} from "@/api/question.js";
import QuizHeader from "@/components/QuizHeader.vue";

// 基础状态管理
const isDarkMode = ref(false);
const router = useRouter();
const route = useRoute();

// 表单数据
const form = ref({
  userId: 0,
  name: '',
  questionCount: 10,
  difficulty: 'BASIC'
});

// 生成过程状态
const isSubmitting = ref(false);
const isGenerating = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const loadingTime = ref(0);
const progress = ref(0);
const taskId = ref(null);
const taskStatusText = ref('正在收集和整理相关题目...');
const estimatedTime = computed(() => form.value.questionCount * 3); // 每道题预计3秒
const pollStartTime = computed(() => Math.max(0, estimatedTime.value - 10)); // 开始轮询的时间点

// 计时器
const loadingTimer = ref(null);
const pollTimer = ref(null);
const prePollTimer = ref(null); // 轮询前的计时器

// 计算属性
const categoryTitle = computed(() => {
  const rawCategory = route.params.category || (route.query.theme ? route.query.theme.replace('题库', '') : '');
  if (!rawCategory) return '自定义';
  return rawCategory.charAt(0).toUpperCase() + rawCategory.slice(1);
});

// 页面初始化
onMounted(() => {
  // 处理暗色模式
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }

  // 从路径参数预填题库名称
  const rawCategory = route.params.category || (route.query.theme ? route.query.theme.replace('题库', '') : '');
  if (rawCategory) {
    const formattedName = `${categoryTitle.value}题库`;
    form.value.name = formattedName;
  } else {
    form.value.name = '自定义题库';
  }
});

// 提交生成表单
const submitGenerateForm = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    form.value.userId = localStorage.getItem('USER_ID');
    console.log(form.value);
    const request = JSON.stringify(form.value);
    const response = await generateQuestionBank(request);

    if (response.code !== 200) {
      throw new Error(response.message || '提交生成任务失败');
    }

    taskId.value = response.data;
    startGenerateProcess();
  } catch (error) {
    hasError.value = true;
    errorMessage.value = error.message;
    isSubmitting.value = false;
  }
};

// 开始生成流程
const startGenerateProcess = () => {
  isSubmitting.value = false;
  isGenerating.value = true;
  hasError.value = false;
  loadingTime.value = 0;
  progress.value = 0;

  // 加载时长计时器
  loadingTimer.value = setInterval(() => {
    loadingTime.value++;
    // 基于时间估算进度（直到开始轮询）
    if (!pollTimer.value && loadingTime.value < pollStartTime.value) {
      const estimatedProgress = (loadingTime.value / estimatedTime.value) * 100;
      progress.value = Math.min(90, Math.max(progress.value, estimatedProgress));

      // 更新状态文本
      if (progress.value < 30) taskStatusText.value = '正在收集和整理相关题目...';
      else if (progress.value < 70) taskStatusText.value = '正在筛选匹配难度的题目...';
      else taskStatusText.value = '正在校验题目完整性...';
    }

    // 设置最大超时时间为预计时间的2倍
    if (loadingTime.value >= estimatedTime.value * 2) {
      handleError('生成超时，请稍后重试');
    }
  }, 1000);

  // 预轮询计时器 - 等待到指定时间后开始轮询
  prePollTimer.value = setInterval(() => {
    if (loadingTime.value >= pollStartTime.value) {
      clearInterval(prePollTimer.value);
      prePollTimer.value = null;
      // 开始轮询
      checkTaskStatus();
      pollTimer.value = setInterval(checkTaskStatus, 3000); // 3秒轮询一次
    }
  }, 1000);
};

// 轮询后端任务状态
const checkTaskStatus = async () => {
  if (!taskId.value) return;

  try {
    const response = await queryTaskStatus(taskId.value);

    if (response.code !== 200) {
      throw new Error(response.message || '查询任务状态失败');
    }

    const task = response.data;
    switch (task.status) {
      case 'PROCESSING':
        // 使用后端返回的进度，如果没有则基于时间估算
        progress.value = task.progress !== undefined ?
            Math.min(95, task.progress) :
            Math.min(95, (loadingTime.value / estimatedTime.value) * 100);

        // 更新状态文本
        if (progress.value < 30) taskStatusText.value = '正在收集和整理相关题目...';
        else if (progress.value < 70) taskStatusText.value = '正在筛选匹配难度的题目...';
        else taskStatusText.value = '正在校验题目完整性，即将完成...';
        break;

      case 'SUCCESS':
        progress.value = 100;
        taskStatusText.value = '题库生成完成，即将跳转到详情页...';
        stopAllTimers();
        setTimeout(() => {
          router.push({
            name: 'QuizDetail',
            params: {businessId: task.businessId}
          });
        }, 1000);
        break;

      case 'FAILED':
        throw new Error(task.errorMsg || '题库生成失败');
    }
  } catch (error) {
    handleError(error.message);
  }
};

// 错误处理
const handleError = (msg) => {
  hasError.value = true;
  errorMessage.value = msg;
  isGenerating.value = false;
  stopAllTimers();
};

// 重置表单并重试
const resetFormAndRetry = () => {
  hasError.value = false;
  errorMessage.value = '';
  // 保留用户设置的题目数量和难度
};

// 停止所有计时器
const stopAllTimers = () => {
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
  if (prePollTimer.value) {
    clearInterval(prePollTimer.value);
    prePollTimer.value = null;
  }
};

// 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 组件卸载
onUnmounted(() => {
  stopAllTimers();
});
</script>

<style scoped>
/* 平滑滚动 */
html {
  scroll-behavior: smooth;
}

/* 加载动画 */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 禁用状态样式优化 */
button:disabled, input:disabled, select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
