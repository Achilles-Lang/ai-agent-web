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
      <!-- 错误提示 -->
      <div v-if="hasError"
           class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <div class="flex items-start">
          <i class="fa fa-exclamation-circle text-red-500 mt-0.5 mr-3"></i>
          <div>
            <h3 class="font-medium text-red-800 dark:text-red-400">加载失败</h3>
            <p class="text-sm text-red-700 dark:text-red-300 mt-1">{{ errorMessage }}</p>
            <button
                @click="loadQuestionBank"
                class="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <i class="fa fa-refresh"></i> 重新加载
            </button>
          </div>
        </div>
      </div>

      <!-- 标题和控制区：数据从后端QuestionBankResponse获取 -->
      <div v-if="!isLoading || isDataLoaded"
           class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-2" :class="difficultyColorClass">
            {{ bankData.name || '未知' }}题库
          </h1>
          <p class="text-slate-600 dark:text-slate-400">
            共 {{ bankData.questionCount || 0 }} 道题 · 已选择 {{ selectedQuestionCount }} 道题
          </p>
        </div>

        <div class="flex flex-wrap gap-3 items-center">
          <!-- 题目数量选择：上限为后端返回的questionCount -->
          <div
              class="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <label for="selectedCount" class="text-sm">题目数量:</label>
            <input
                id="selectedCount"
                v-model.number="selectedQuestionCount"
                type="number"
                min="5"
                :max="bankData.questionCount || 5"
                step="5"
                class="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                :disabled="!isDataLoaded"
            >
          </div>

          <!-- 操作按钮 -->
          <router-link
              to="/"
              class="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
          >
            <i class="fa fa-arrow-left"></i>
            <span>退出</span>
          </router-link>

          <button
              @click="startQuiz"
              class="px-4 py-2"
              :class="`${difficultyColorClass} hover:opacity-90 text-white rounded-lg transition-colors flex items-center gap-2`"
              :disabled="!isDataLoaded || (bankData.questionCount || 0) < 5"
          >
            <span>开始答题</span>
            <i class="fa fa-play"></i>
          </button>
        </div>
      </div>

      <!-- 题库介绍：映射后端description字段 -->
      <div v-if="isDataLoaded"
           class="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
        <h2 class="text-xl font-semibold mb-3">题库介绍</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-4">
          {{ bankData.description || '暂无题库介绍' }}
        </p>
        <!-- 统计信息：从后端questions列表计算 -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">难度分布</p>
            <p class="font-medium">{{ calculatedDifficultyDist }}</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">平均完成时间</p>
            <p class="font-medium">{{ Math.round(selectedQuestionCount * 1.5) }} 分钟</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">题型分布</p>
            <p class="font-medium">{{ calculatedTypeDist }}</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">正确率</p>
            <p class="font-medium">{{ bankData.passRate || '暂无数据' }}</p>
          </div>
        </div>
      </div>

      <!-- 题目列表预览：从后端questions列表取前5条 -->
      <div v-if="isDataLoaded" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">题目预览（共{{ bankData.questionCount }}道）</h2>
        <div class="space-y-4">
          <!-- 遍历后端questions列表，取前5条预览 -->
          <div v-for="(question, index) in previewQuestions" :key="question.id || index"
               class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium"
                   :class="difficultyColorClass">
                {{ index + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="font-medium mb-2">
                  {{ question.title || '无题干' }}
                </h3>
                <!-- 单选/多选题选项：映射question.options -->
                <div v-if="['single', 'multiple'].includes(question.type)"
                     class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div v-for="(opt, optIndex) in question.options" :key="optIndex" class="flex items-center gap-2">
                    <div
                        class="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      {{ String.fromCharCode(65 + optIndex) }} <!-- A、B、C... -->
                    </div>
                    <span>{{ opt }}</span>
                  </div>
                </div>
                <!-- 判断题选项 -->
                <div v-if="question.type === 'boolean'" class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <div
                        class="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <div class="w-3 h-3 rounded-full"></div>
                    </div>
                    <span>正确</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div
                        class="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <div class="w-3 h-3 rounded-full"></div>
                    </div>
                    <span>错误</span>
                  </div>
                </div>
                <!-- 简答题占位 -->
                <div v-if="question.type === 'text'" class="text-sm text-slate-600 dark:text-slate-400">
                  <div class="border border-dashed border-slate-300 dark:border-slate-600 rounded p-3 mt-2">
                    简答题：在此处填写答案...
                  </div>
                </div>
                <!-- 题目难度/预计时间：从question字段获取 -->
                <div class="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-500 gap-3">
                  <span><i class="fa fa-clock-o mr-1"></i> {{ question.expectedTime || 2 }}分钟</span>
                  <span><i class="fa fa-signal mr-1"></i> {{ formatDifficulty(question.difficulty) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 显示更多提示：当总题数>5时显示 -->
          <div v-if="bankData.questionCount > 5" class="text-center py-4 text-slate-500 dark:text-slate-400">
            <p>... 还有 {{ bankData.questionCount - 5 }} 道题在答题时显示 ...</p>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div v-if="isDataLoaded"
           class="sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-4 px-6 rounded-t-xl shadow-lg mt-8">
        <div class="container mx-auto flex justify-between items-center">
          <div class="text-slate-600 dark:text-slate-400">
            <span class="font-medium">{{ selectedQuestionCount }}</span> 道题 · 预计用时
            {{ Math.round(selectedQuestionCount * 1.5) }} 分钟
          </div>
          <button
              @click="startQuiz"
              class="px-6 py-2.5"
              :class="`${difficultyColorClass} hover:opacity-90 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base`"
          >
            <span>开始答题</span>
            <i class="fa fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <!-- 加载中占位区域 -->
      <div v-if="isLoading && !hasError" class="space-y-8">
        <div class="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        <div class="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        <div class="space-y-4">
          <div class="h-40 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div class="h-40 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
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
import {ref, onMounted, computed} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {getQuestionBank} from "@/api/question.js";

// 1. 基础状态
const isDarkMode = ref(false);
const router = useRouter();
const route = useRoute();

// 2. 路由参数：从params获取题库ID（后端接口需要的{id}）
const bankId = ref(route.params.businessId || ''); // 假设路由配置为 /question-bank/:id

// 3. 用户选择的答题数量（默认10，上限为后端返回的questionCount）
const selectedQuestionCount = ref(10);

// 4. 后端数据映射：严格对齐QuestionBankResponse
const bankData = ref({
  id: '',          // 后端id
  name: '',        // 后端name（题库名称）
  description: '', // 后端description（题库介绍）
  questionCount: 0,// 后端questionCount（题库总题数）
  difficulty: '',  // 后端BankDifficulty（如BASIC）
  questions: [],   // 后端List<QuestionDTO>（题目列表）
  passRate: '暂无数据' // 可选：若后端有正确率字段可添加
});

// 5. 加载状态
const isLoading = ref(false);
const isDataLoaded = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

// 6. 枚举转义：后端枚举→中文显示
const formatDifficulty = (difficulty) => {
  const map = {
    'BASIC': '简单',
    'INTERMEDIATE': '中等',
    'ADVANCED': '困难'
  };
  return map[difficulty] || difficulty;
};

const formatQuestionType = (type) => {
  const map = {
    'single': '单选题',
    'multiple': '多选题',
    'boolean': '判断题',
    'text': '简答题'
  };
  return map[type] || type;
};

// 7. 计算属性：从后端questions列表统计信息
// 7.1 难度分布（如“简单3道，中等5道，困难2道”）
const calculatedDifficultyDist = computed(() => {
  if (bankData.value.questions.length === 0) return '暂无数据';

  const countMap = {'BASIC': 0, 'INTERMEDIATE': 0, 'ADVANCED': 0};
  bankData.value.questions.forEach(q => {
    countMap[q.difficulty] = (countMap[q.difficulty] || 0) + 1;
  });

  return Object.entries(countMap)
      .filter(([_, count]) => count > 0)
      .map(([diff, count]) => `${formatDifficulty(diff)}${count}道`)
      .join('，');
});

// 7.2 题型分布（如“单选题6道，判断题4道”）
const calculatedTypeDist = computed(() => {
  if (bankData.value.questions.length === 0) return '暂无数据';

  const typeMap = {};
  bankData.value.questions.forEach(q => {
    typeMap[q.type] = (typeMap[q.type] || 0) + 1;
  });

  return Object.entries(typeMap)
      .map(([type, count]) => `${formatQuestionType(type)}${count}道`)
      .join('，');
});

// 7.3 难度对应颜色（简单→绿，中等→蓝，困难→红）
const difficultyColorClass = computed(() => {
  const map = {
    'BASIC': 'bg-green-600 dark:bg-green-500',
    'INTERMEDIATE': 'bg-blue-600 dark:bg-blue-500',
    'ADVANCED': 'bg-red-600 dark:bg-red-500'
  };
  return map[bankData.value.difficulty] || 'bg-indigo-600 dark:bg-indigo-500';
});

// 7.4 预览题目：取后端questions前5条
const previewQuestions = computed(() => {
  return bankData.value.questions.slice(0, 5); // 只预览前5道
});

// 8. 页面初始化
onMounted(() => {
  // 同步暗色模式
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }

  // 验证题库ID是否存在
  if (!bankId.value) {
    hasError.value = true;
    errorMessage.value = '无效的题库ID，请重新选择题库';
    return;
  }

  // 加载题库详情（调用后端正确接口）
  loadQuestionBank();
});

// 9. 加载题库详情：调用后端GET /api/question-bank/{id}
const loadQuestionBank = async () => {
  isLoading.value = true;
  isDataLoaded.value = false;
  hasError.value = false;
  errorMessage.value = '';

  try {
    // 正确接口：GET /api/question-bank/{id}（对齐后端）
    const response = await getQuestionBank(bankId);
    console.log(response);

    if (response.code !== 200) {
      throw new Error(`服务器错误: ${response.status} ${response.statusText}`);
    }

    // 对齐后端Result响应格式（success + data）
    if (response.data) {
      // 直接映射后端QuestionBankResponse到bankData
      bankData.value = {...response.data};

      // 修正用户选择的答题数量（不超过总题数）
      if (selectedQuestionCount.value > bankData.value.questionCount) {
        selectedQuestionCount.value = bankData.value.questionCount;
      }

      // 标记数据加载完成
      isDataLoaded.value = true;
      // 更新页面标题
      document.title = `${bankData.value.name || '未知'}题库 - 知题`;
    } else {
      throw new Error(result.message || '获取题库详情失败');
    }
  } catch (error) {
    console.error('加载题库失败:', error);
    hasError.value = true;
    errorMessage.value = `加载失败: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 10. 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 11. 开始答题：携带题库ID和选择的题数跳转
const startQuiz = () => {
  if (!isDataLoaded.value) return;

  console.log(bankData.value);
  router.push({
    name: 'QuizTaking',
    params: {businessId: bankId.value}
  });
};
</script>

<style scoped>
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

/* 加载动画 */
.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>