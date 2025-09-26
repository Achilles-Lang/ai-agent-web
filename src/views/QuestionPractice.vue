<template>
  <div
      class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-40 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center py-4">
          <!-- 左侧标题和进度 -->
          <div class="flex items-center gap-6">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <h1 class="text-lg font-semibold">前端开发 - 框架专题</h1>
                <span
                    class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">Vue 基础</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-sm text-gray-500 dark:text-gray-400">进度：</span>
                <div class="w-64 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-blue-600 dark:bg-blue-500 rounded-full" :style="{ width: progress + '%' }"></div>
                </div>
                <span class="text-sm font-medium">{{ currentQuestionIndex + 1 }}/{{ totalQuestions }}题</span>
              </div>
            </div>

            <!-- 计时器 -->
            <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg text-sm">
              <i class="fa fa-clock-o text-blue-600 dark:text-blue-400"></i>
              <span>{{ timer }}</span>
            </div>
          </div>

          <!-- 右侧控制区 -->
          <div class="flex items-center gap-4">
            <!-- 暗色模式切换 -->
            <button @click="toggleDarkMode"
                    class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <i class="fa" :class="isDarkMode ? 'fa-sun-o' : 'fa-moon-o'"></i>
            </button>

            <!-- 帮助按钮 -->
            <button class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" title="帮助">
              <i class="fa fa-question-circle"></i>
            </button>

            <!-- 用户信息 -->
            <div class="flex items-center gap-3">
              <img src="https://picsum.photos/id/64/40/40" alt="用户头像"
                   class="w-8 h-8 rounded-full object-cover border-2 border-blue-500">
              <span class="font-medium">张小明</span>
              <div
                  class="hidden md:block bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">
                已学习2小时
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 - 左右分栏布局 -->
    <main class="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
      <!-- 错误提示 -->
      <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-lg mb-6">
        <i class="fa fa-exclamation-circle mr-2"></i>
        {{ error }}
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧：答题区 (占2/3宽度) -->
        <div class="lg:w-2/3 space-y-6">
          <!-- 题目卡片 -->
          <div
              class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 md:p-8 transform transition-all duration-300 hover:shadow-lg border border-gray-200 dark:border-gray-700">

            <!-- 加载骨架屏 -->
            <div v-if="loading" class="space-y-6">
              <div class="flex justify-between items-start">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
                <div class="flex gap-3">
                  <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
              </div>

              <div class="space-y-4">
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 animate-pulse"></div>
                <div class="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" style="animation-delay: 0.2s"></div>
              </div>

              <div class="space-y-4 pt-4">
                <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style="animation-delay: 0.2s"></div>
                <div class="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" style="animation-delay: 0.4s"></div>
              </div>

              <div class="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/3 animate-pulse"></div>
              </div>

              <div class="flex justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div class="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 animate-pulse"></div>
                <div class="flex gap-3">
                  <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                  <div class="h-10 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>

            <!-- 题目内容（加载完成后显示） -->
            <div v-else>
              <!-- 题目编号和操作 -->
              <div class="flex justify-between items-start mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                <h2 class="text-xl font-bold">第{{ currentQuestionIndex + 1 }}题：{{ currentQuestion.title }}</h2>
                <div class="flex gap-3">
                  <button
                      @click="toggleFavorite"
                      class="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    <i class="fa" :class="currentQuestion.isFavorite ? 'fa-bookmark' : 'fa-bookmark-o'"></i>
                    <span>{{ currentQuestion.isFavorite ? '取消收藏' : '收藏' }}</span>
                  </button>
                  <button
                      @click="toggleMarked"
                      class="flex items-center gap-1 px-3 py-1.5"
                      :class="currentQuestion.isMarked
                      ? 'bg-yellow-200 dark:bg-yellow-800/40 text-yellow-700 dark:text-yellow-300'
                      : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    "
                  >
                    <i class="fa" :class="currentQuestion.isMarked ? 'fa-flag' : 'fa-flag-o'"></i>
                    <span>{{ currentQuestion.isMarked ? '取消标记' : '标记' }}</span>
                  </button>
                </div>
              </div>

              <!-- 选择题选项区域 -->
              <div class="mb-8 space-y-3">
                <div
                    v-for="(answer, index) in currentQuestion.answers"
                    :key="index"
                    @click="selectedOption = index"
                    class="p-4 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    :class="{
                  'border-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedOption === index,
                  'border-gray-200 dark:border-gray-700': selectedOption !== index,
                  'border-green-500 bg-green-50 dark:bg-green-900/20': showAnswer && isCorrectAnswer(index),
                  'border-red-500 bg-red-50 dark:bg-red-900/20': showAnswer && selectedOption === index && !isCorrectAnswer(index)
                }"
                >
                  <div class="flex items-start gap-3">
                    <div class="flex-shrink-0 w-6 h-6 rounded-full border flex items-center justify-center mt-0.5"
                         :class="{
                        'border-blue-500 bg-blue-500 text-white': selectedOption === index && !showAnswer,
                        'border-gray-300 dark:border-gray-600': selectedOption !== index && !showAnswer,
                        'border-green-500 bg-green-500 text-white': showAnswer && isCorrectAnswer(index),
                        'border-red-500 bg-red-500 text-white': showAnswer && selectedOption === index && !isCorrectAnswer(index),
                        'border-gray-300 dark:border-gray-600 bg-transparent': showAnswer && selectedOption !== index && !isCorrectAnswer(index)
                      }">
                      <i v-if="showAnswer && isCorrectAnswer(index)" class="fa fa-check text-xs"></i>
                      <i v-if="showAnswer && selectedOption === index && !isCorrectAnswer(index)" class="fa fa-times text-xs"></i>
                      <span v-if="!showAnswer" class="text-xs">{{ String.fromCharCode(65 + index) }}</span>
                    </div>
                    <div>
                      <p class="font-medium">{{ answer }}</p>
                      <p v-if="showAnswer && isCorrectAnswer(index)" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        正确答案
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 答案解析 (提交后显示) -->
              <div v-if="showAnswer && currentQuestion.explanation" class="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-6">
                <h3 class="font-medium mb-2 flex items-center">
                  <i class="fa fa-info-circle text-blue-600 dark:text-blue-400 mr-2"></i>
                  答案解析
                </h3>
                <p class="text-sm">
                  {{ currentQuestion.explanation }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <div class="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <button v-if="!showAnswer"
                        class="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                  <i class="fa fa-lightbulb-o"></i>
                  <span>提示：Vue3中已移除某些通信方式</span>
                </button>

                <div class="flex gap-3">
                  <button
                      @click="goToPreviousQuestion"
                      class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      :disabled="currentQuestionIndex === 0"
                  >
                    上一题
                  </button>
                  <button v-if="!showAnswer"
                          @click="goToNextQuestion"
                          class="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    跳过
                  </button>
                  <button
                      @click="submitAnswer"
                      class="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                      :disabled="selectedOption === null && !showAnswer"
                  >
                    {{ showAnswer ? '下一题' : '提交答案' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- 相关题目推荐 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4">相关推荐题目</h3>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span
                    class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-1 rounded-full mt-0.5">中等</span>
                <div>
                  <a href="#" class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Vue3中的Composition
                    API与Vue2的Options API有什么区别？</a>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">10分钟 · 组件化 · 进阶</p>
                </div>
              </li>
              <li class="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <span
                    class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-1 rounded-full mt-0.5">简单</span>
                <div>
                  <a href="#"
                     class="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">如何在Vue中使用插槽(slot)？</a>
                  <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">8分钟 · 组件化 · 基础</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <!-- 右侧：目录和解析区 (占1/3宽度) -->
        <div class="lg:w-1/3 space-y-6">
          <!-- 题目目录 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold">题目目录</h3>
              <span class="text-sm text-gray-500 dark:text-gray-400">共{{ totalQuestions }}题</span>
            </div>

            <div class="grid grid-cols-5 gap-2 mb-4">
              <button
                  v-for="(q, index) in totalQuestions"
                  :key="index"
                  @click="goToQuestion(index)"
                  class="h-10 flex items-center justify-center rounded-lg font-medium transition-all"
                  :class="{
                  'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400': qStatus[index] === 'completed',
                  'bg-blue-600 text-white': qStatus[index] === 'current',
                  'border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700': qStatus[index] === 'uncompleted',
                  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400': qStatus[index] === 'marked'
                }"
                  :disabled="loading"
              >
                {{ index + 1 }}
                <i v-if="questions[index]?.isMarked" class="fa fa-flag text-xs absolute"></i>
              </button>
            </div>

            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span>已完成</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="w-3 h-3 rounded-full bg-blue-600"></span>
                <span>当前题</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"></span>
                <span>未完成</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <span class="w-3 h-3 rounded-full bg-yellow-500"></span>
                <span>已标记</span>
              </div>
            </div>
          </div>

          <!-- 知识点卡片 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4">相关知识点</h3>
            <div class="space-y-3">
              <a href="#"
                 class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <i class="fa fa-link text-blue-600 dark:text-blue-400"></i>
                <span>Vue官方文档 - 组件基础</span>
              </a>
              <a href="#"
                 class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <i class="fa fa-link text-blue-600 dark:text-blue-400"></i>
                <span>Vue组件通信全解析</span>
              </a>
              <a href="#"
                 class="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <i class="fa fa-link text-blue-600 dark:text-blue-400"></i>
                <span>Pinia状态管理最佳实践</span>
              </a>
            </div>
          </div>

          <!-- 难度与统计 -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border border-gray-200 dark:border-gray-700">
            <h3 class="text-lg font-semibold mb-4">题目统计</h3>
            <div class="space-y-4">
              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>难度</span>
                  <span class="font-medium">{{ currentQuestion.difficulty || '中等' }}</span>
                </div>
                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-yellow-500 rounded-full" :style="{ width: difficultyPercentage }"></div>
                </div>
              </div>

              <div>
                <div class="flex justify-between text-sm mb-1">
                  <span>正确率</span>
                  <span class="font-medium">{{ currentQuestion.correctRate || '68%' }}</span>
                </div>
                <div class="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" :style="{ width: currentQuestion.correctRate || '68%' }"></div>
                </div>
              </div>

              <div class="pt-2 border-t border-gray-200 dark:border-gray-700">
                <div class="flex justify-between items-center">
                  <span class="text-sm">平均用时</span>
                  <span class="text-sm font-medium">{{ currentQuestion.averageTime || '2分钟' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2023 前端刷题系统 - 专注于提升前端开发技能</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { createQuestion } from "@/api/question.js";

// 配置
const totalQuestions = 10; // 总题目数量

// 状态管理
const isDarkMode = ref(false);
const selectedOption = ref(null);
const showAnswer = ref(false);
const timer = ref('02:00');
const timerInterval = ref(null);
const loading = ref(true);
const error = ref(null);
const currentQuestionIndex = ref(0);
const questions = ref([]); // 存储所有题目

const router = useRouter();

// 计算属性 - 当前题目
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {
    title: '',
    answers: [],
    explanation: '',
    rightAnswer: '',
    difficulty: '中等',
    correctRate: '68%',
    averageTime: '2分钟',
    isFavorite: false,
    isMarked: false,
    status: 'uncompleted'
  };
});

// 计算属性 - 进度百分比
const progress = computed(() => {
  // 计算已完成题目数量
  const completedCount = questions.value.filter(q => q.status === 'completed').length;
  return Math.round((completedCount / totalQuestions) * 100);
});

// 计算属性 - 题目状态数组（用于目录显示）
const qStatus = computed(() => {
  return Array.from({ length: totalQuestions }, (_, i) => {
    if (i === currentQuestionIndex.value) return 'current';
    const question = questions.value[i];
    if (!question) return 'uncompleted';
    if (question.isMarked) return 'marked';
    return question.status || 'uncompleted';
  });
});

// 计算属性 - 难度百分比
const difficultyPercentage = computed(() => {
  const difficultyMap = {
    '简单': '30%',
    '中等': '50%',
    '困难': '80%'
  };
  return difficultyMap[currentQuestion.value.difficulty] || '50%';
});

onMounted(() => {
  // 检查系统暗色模式偏好
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }

  // 初始化题目数组
  initializeQuestionsArray();

  // 加载第一题
  loadQuestion(currentQuestionIndex.value);
});

// 清理计时器
onUnmounted(() => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
});

// 初始化题目数组
const initializeQuestionsArray = () => {
  questions.value = Array.from({ length: totalQuestions }, () => ({
    title: '',
    answers: [],
    explanation: '',
    rightAnswer: '',
    difficulty: '中等',
    correctRate: '68%',
    averageTime: '2分钟',
    isFavorite: false,
    isMarked: false,
    status: 'uncompleted'
  }));
};

// 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 提交答案
const submitAnswer = () => {
  if (!showAnswer.value) {
    // 第一次点击：提交答案
    if (selectedOption.value === null) return;

    showAnswer.value = true;

    // 更新当前题目状态为已完成
    if (questions.value[currentQuestionIndex.value]) {
      questions.value[currentQuestionIndex.value].status = 'completed';
    }

    // 暂停计时器
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
    }
  } else {
    // 第二次点击：前往下一题
    goToNextQuestion();
  }
};

// 切换收藏状态
const toggleFavorite = () => {
  if (questions.value[currentQuestionIndex.value]) {
    questions.value[currentQuestionIndex.value].isFavorite =
        !questions.value[currentQuestionIndex.value].isFavorite;
  }
};

// 切换标记状态
const toggleMarked = () => {
  if (questions.value[currentQuestionIndex.value]) {
    questions.value[currentQuestionIndex.value].isMarked =
        !questions.value[currentQuestionIndex.value].isMarked;
  }
};

// 前往上一题
const goToPreviousQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    loadQuestion(currentQuestionIndex.value);
  }
};

// 前往下一题
const goToNextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions - 1) {
    currentQuestionIndex.value++;
    loadQuestion(currentQuestionIndex.value);
  } else {
    // 所有题目完成，跳转到结果页
    router.push('/results');
  }
};

// 跳转到指定题目
const goToQuestion = (index) => {
  if (index !== currentQuestionIndex.value && index < totalQuestions) {
    currentQuestionIndex.value = index;
    loadQuestion(index);
  }
};

// 计时器功能
const startTimer = () => {
  // 清除现有计时器
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }

  // 解析初始时间
  const [minutes, seconds] = timer.value.split(':').map(Number);
  let totalSeconds = minutes * 60 + seconds;

  timerInterval.value = setInterval(() => {
    totalSeconds--;
    if (totalSeconds <= 0) {
      clearInterval(timerInterval.value);
      timer.value = '00:00';
      // 时间到自动提交
      selectedOption.value = 0; // 随机选择一个选项
      showAnswer.value = true;
      return;
    }

    // 格式化时间
    const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const secs = (totalSeconds % 60).toString().padStart(2, '0');
    timer.value = `${mins}:${secs}`;
  }, 1000);
};

// 判断是否为正确答案
const isCorrectAnswer = (index) => {
  // 假设rightAnswer存储的是正确答案的文本
  return currentQuestion.value.answers[index] === currentQuestion.value.rightAnswer;
};

// 加载题目
const loadQuestion = async (index) => {
  // 重置答题状态
  selectedOption.value = null;
  showAnswer.value = true; // 默认隐藏答案，仅在提交后显示
  showAnswer.value = false;
  timer.value = '02:00'; // 重置计时器

  // 如果题目已加载，直接使用
  if (questions.value[index] && questions.value[index].title) {
    startTimer();
    return;
  }

  // 否则从接口加载
  try {
    loading.value = true;
    error.value = null;

    // 根据题目索引生成不同的提示
    const prompts = [
      "生成一个关于Spring IoC容器的问题",
      "生成一个关于Spring AOP的问题",
      "生成一个关于Spring事务管理的问题",
      "生成一个关于Spring Boot自动配置的问题",
      "生成一个关于Spring MVC的问题",
      "生成一个关于Spring Security的问题",
      "生成一个关于Spring Data JPA的问题",
      "生成一个关于Spring Cloud的问题",
      "生成一个关于Spring与MyBatis集成的问题",
      "生成一个关于Spring测试的问题"
    ];

    // 异步请求数据
    const response = await createQuestion(prompts[index] || "生成一个关于Spring框架的问题");

    // 存储题目数据，保留用户操作状态（收藏、标记等）
    const existingData = questions.value[index] || {};
    questions.value[index] = {
      ...existingData,
      ...response,
      // 确保状态属性存在
      isFavorite: existingData.isFavorite || false,
      isMarked: existingData.isMarked || false,
      status: existingData.status || 'uncompleted'
    };

    // 启动计时器
    startTimer();
  } catch (err) {
    error.value = err.message || '获取数据失败，请刷新页面重试';
    console.error(error.value);
  } finally {
    loading.value = false;
  }
};
</script>
