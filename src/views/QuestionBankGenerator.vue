<template>
  <div
      class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300">
    <!-- 导航栏 -->
    <header
        class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-2">
              <i class="fa fa-book text-2xl text-indigo-600 dark:text-indigo-400"></i>
              <span class="text-xl font-bold">知题</span>
            </router-link>
          </div>
          <div class="flex items-center gap-4">
            <button @click="toggleDarkMode"
                    class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i class="fa" :class="isDarkMode ? 'fa-sun-o' : 'fa-moon-o'"></i>
            </button>
            <div class="relative">
              <img src="https://picsum.photos/id/64/40/40" alt="用户头像"
                   class="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 cursor-pointer">
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="max-w-2xl mx-auto">
        <!-- 页面标题 -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold mb-2">生成{{ categoryTitle }}题库</h1>
          <p class="text-slate-600 dark:text-slate-400">配置参数后，系统将为您生成专属题库</p>
        </div>

        <!-- 1. 生成配置表单（匹配后端QuestionBankRequest） -->
        <div v-if="!isGenerating && !hasError"
             class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-md mb-8">
          <form @submit.prevent="submitGenerateForm" class="space-y-6">
            <!-- 题库名称（可选） -->
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

            <!-- 题目数量（必填） -->
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
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">范围：5-100道，步长5道</p>
            </div>

            <!-- 题库总难度（必填） -->
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

        <!-- 2. 生成状态展示（含进度和错误提示） -->
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
                <span v-if="loadingTime > 30" class="text-amber-500 ml-2">加载时间较长</span>
              </div>
              <div>进度: {{ Math.round(progress) }}%</div>
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
import {ref, onMounted, computed, onUnmounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {generateQuestionBank, queryTaskStatus} from "@/api/question.js";

// 1. 基础状态管理
const isDarkMode = ref(false);
const router = useRouter();
const route = useRoute();

// 2. 表单数据（严格匹配后端QuestionBankRequest）
const form = ref({
  name: '', // 题库名称（可选）
  questionCount: 10, // 题目数量（默认10道）
  difficulty: '' // 总难度（对应后端BankOverallDifficulty枚举：BASIC/INTERMEDIATE/ADVANCED）
});

// 3. 生成过程状态
const isSubmitting = ref(false); // 表单提交中（防止重复点击）
const isGenerating = ref(false); // 题库生成中
const hasError = ref(false); // 是否生成失败
const errorMessage = ref(''); // 错误信息
const loadingTime = ref(0); // 加载时长（秒）
const progress = ref(0); // 生成进度（%）
const taskId = ref(null); // 后端返回的任务ID
const taskStatusText = ref('正在收集和整理相关题目...'); // 状态描述文本
const maxLoadingTime = ref(120); // 最大加载时长（120秒，超时判定为失败）

// 4. 计时器（防止内存泄漏）
const loadingTimer = ref(null); // 加载时长计时器
const pollTimer = ref(null); // 状态轮询计时器

// 5. 计算属性：分类标题首字母大写（如java → Java）
const categoryTitle = computed(() => {
  return form.value.name.charAt(0).toUpperCase() + form.value.name.slice(1);
});

// 6. 页面初始化：同步暗色模式
onMounted(() => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
});

// 7. 核心方法：提交生成表单
const submitGenerateForm = async () => {
  // 防止重复提交
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    // 调用后端POST接口（传JSON体，匹配@RequestBody）
    // const response = await fetch('/api/question-bank/generate', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify(form.value) // 表单数据转JSON
    // });

    const request = JSON.stringify(form.value);
    const response = await generateQuestionBank(request)
    console.log(response)


    if (response.code !== 200) {
      throw new Error(result.message || '提交生成任务失败');
    }

    // 拿到任务ID，开始轮询状态
    taskId.value = response.data;
    startGenerateProcess();
  } catch (error) {
    hasError.value = true;
    errorMessage.value = error.message;
    isSubmitting.value = false;
  }
};

// 8. 开始生成流程：启动计时器+轮询状态
const startGenerateProcess = () => {
  // 重置状态
  isSubmitting.value = false;
  isGenerating.value = true;
  hasError.value = false;
  loadingTime.value = 0;
  progress.value = 0;

  // 8.1 启动加载时长计时器
  loadingTimer.value = setInterval(() => {
    loadingTime.value++;
    // 超时判定：超过最大时长判定为失败
    if (loadingTime.value >= maxLoadingTime.value) {
      handleError('生成超时，请稍后重试');
    }
  }, 1000);

  // 8.2 启动状态轮询（每3秒查一次后端）
  checkTaskStatus(); // 立即查一次
  pollTimer.value = setInterval(checkTaskStatus, 3000);
};

// 9. 轮询后端任务状态（调用/task/status接口）
const checkTaskStatus = async () => {
  if (!taskId.value) return;

  try {
    const response = await queryTaskStatus(taskId.value);

    if (response.code !== 200) {
      throw new Error(result.message || '查询任务状态失败');
    }

    // 处理后端返回的Task状态
    const task = response.data;
    switch (task.status) {
      case 'PROCESSING':
        // 更新进度（若后端返回进度字段，优先用后端值；否则模拟增长）
        if (task.progress !== undefined) {
          progress.value = task.progress;
        } else if (progress.value < 95) {
          progress.value += 1; // 模拟进度增长（实际项目建议用后端返回值）
        }
        // 更新状态描述
        if (progress.value < 30) taskStatusText.value = '正在收集和整理相关题目...';
        else if (progress.value < 70) taskStatusText.value = '正在筛选匹配难度的题目...';
        else taskStatusText.value = '正在校验题目完整性，即将完成...';
        break;

      case 'SUCCESS':
        // 生成成功：更新进度为100%，延迟1秒跳转到详情页（让用户看到完成状态）
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
        // 生成失败：抛出错误信息
        throw new Error(task.errorMsg || '题库生成失败');
    }
  } catch (error) {
    handleError(error.message);
  }
};

// 10. 错误处理：停止计时器+更新错误状态
const handleError = (msg) => {
  hasError.value = true;
  errorMessage.value = msg;
  isGenerating.value = false;
  stopAllTimers();
};

// 11. 重置表单并重试：清空错误+回到配置页面
const resetFormAndRetry = () => {
  hasError.value = false;
  errorMessage.value = '';
  form.value.totalCount = 10; // 重置题目数量为默认值
  form.value.overallDifficulty = ''; // 重置难度选择
};

// 12. 停止所有计时器（防止内存泄漏）
const stopAllTimers = () => {
  if (loadingTimer.value) {
    clearInterval(loadingTimer.value);
    loadingTimer.value = null;
  }
  if (pollTimer.value) {
    clearInterval(pollTimer.value);
    pollTimer.value = null;
  }
};

// 13. 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 14. 组件卸载：清理计时器（关键！防止内存泄漏）
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