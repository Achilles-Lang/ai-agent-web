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

          <div class="flex items-center gap-6">
            <!-- 计时器 -->
            <div class="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
              <i class="fa fa-clock-o text-indigo-600 dark:text-indigo-400"></i>
              <span class="font-medium">{{ formattedTime }}</span>
            </div>

            <!-- 题目进度 -->
            <div class="hidden md:flex items-center gap-2">
              <span class="text-sm">
                {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}
              </span>
            </div>

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
                @click="loadQuestions"
                class="mt-3 text-sm text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
            >
              <i class="fa fa-refresh"></i> 重新加载
            </button>
          </div>
        </div>
      </div>

      <!-- 答题完成统计 -->
      <div v-if="isAllAnswered"
           class="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center max-w-2xl mx-auto">
        <div
            class="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-6">
          <i class="fa fa-check-circle text-3xl text-indigo-500"></i>
        </div>
        <h2 class="text-2xl font-bold mb-2">答题完成！</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-6">恭喜您完成了所有题目</p>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">总题数</p>
            <p class="text-2xl font-bold">{{ totalQuestions }}</p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">正确</p>
            <p class="text-2xl font-bold text-green-500">{{ correctCount }}</p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">错误</p>
            <p class="text-2xl font-bold text-red-500">{{ totalQuestions - correctCount }}</p>
          </div>
          <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">正确率</p>
            <p class="text-2xl font-bold text-indigo-500">{{ Math.round((correctCount / totalQuestions) * 100) }}%</p>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
              to="/"
              class="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <i class="fa fa-home"></i>
            <span>返回首页</span>
          </router-link>
          <button
              @click="restartQuiz"
              class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <i class="fa fa-refresh"></i>
            <span>重新答题</span>
          </button>
        </div>
      </div>

      <!-- 答题区域 -->
      <div v-if="isDataLoaded && !hasError && !isAllAnswered" class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- 左侧：题目导航 -->
        <div class="lg:col-span-1">
          <div
              class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 sticky top-20">
            <h3 class="font-semibold mb-4 flex items-center gap-2">
              <i class="fa fa-list-ul text-indigo-500"></i>
              题目导航
            </h3>
            <div class="grid grid-cols-5 gap-2">
              <button
                  v-for="(q, index) in questions"
                  :key="q.id || index"
                  @click="goToQuestion(index)"
                  class="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all"
                  :class="[
                  currentQuestionIndex === index ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' : '',
                  q.answered ? q.isCorrect ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400' : 'bg-slate-100 dark:bg-slate-700',
                  index === currentQuestionIndex ? 'scale-110' : 'hover:scale-105'
                ]"
              >
                {{ index + 1 }}
              </button>
            </div>

            <div class="mt-6 space-y-3">
              <div class="flex items-center gap-2 text-sm">
                <div class="w-4 h-4 rounded bg-slate-100 dark:bg-slate-700"></div>
                <span>未答题</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-4 h-4 rounded bg-green-50 dark:bg-green-900/20"></div>
                <span>回答正确</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div class="w-4 h-4 rounded bg-red-50 dark:bg-red-900/20"></div>
                <span>回答错误</span>
              </div>
              <div class="flex items-center gap-2 text-sm">
                <div
                    class="w-4 h-4 rounded ring-2 ring-indigo-500 dark:ring-indigo-400 bg-indigo-50 dark:bg-indigo-900/30"></div>
                <span>当前题</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧：题目内容 -->
        <div class="lg:col-span-3">
          <div class="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 mb-6">
            <div class="flex items-start gap-3 mb-6">
              <div class="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                   :class="difficultyColorClass">
                {{ currentQuestionIndex + 1 }}
              </div>
              <div>
                <h2 class="text-xl font-semibold mb-1">
                  {{ currentQuestion.title || '无题干' }}
                </h2>
                <div class="flex items-center text-xs text-slate-500 dark:text-slate-500 gap-3">
                  <span><i class="fa fa-signal mr-1"></i> {{ formatDifficulty(currentQuestion.difficulty) }}</span>
                  <span><i class="fa fa-clock-o mr-1"></i> 预计 {{ currentQuestion.expectedTime || 2 }} 分钟</span>
                  <span><i class="fa fa-list-alt mr-1"></i> {{ formatQuestionType(currentQuestion) }}</span>
                </div>
              </div>
            </div>

            <!-- 题目内容区域 -->
            <div class="pl-11">
              <!-- 单选题 -->
              <div v-if="isSingleChoice(currentQuestion)" class="space-y-3">
                <div
                    v-for="(opt, optIndex) in currentQuestion.answers"
                    :key="optIndex"
                    @click="!currentQuestion.answered && selectOption(optIndex)"
                    class="p-3 rounded-lg border flex items-center gap-3 transition-all"
                    :class="[
                      currentQuestion.answered ?
                        (optIndex === getCorrectAnswerIndex() ?
                          'border-green-500 bg-green-50 dark:bg-green-900/20' :
                          (optIndex === currentQuestion.selected ?
                            'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            'border-slate-200 dark:border-slate-700')) :
                        (currentQuestion.selected === optIndex ?
                          'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' :
                          'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'),
                      currentQuestion.answered ? 'cursor-default' : ''
                    ]"
                >
                  <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      :class="[
                        currentQuestion.answered ?
                          (optIndex === getCorrectAnswerIndex() ?
                            'border-green-500 bg-green-500' :
                            (optIndex === currentQuestion.selected ?
                              'border-red-500 bg-red-500' :
                              'border-slate-300 dark:border-slate-600')) :
                          (currentQuestion.selected === optIndex ?
                            'border-indigo-500 bg-indigo-500' :
                            'border-slate-300 dark:border-slate-600')
                      ]"
                  >
                    <template v-if="currentQuestion.answered">
                      <i v-if="optIndex === getCorrectAnswerIndex()" class="fa fa-check text-white text-xs"></i>
                      <i v-else-if="optIndex === currentQuestion.selected" class="fa fa-times text-white text-xs"></i>
                    </template>
                    <div v-else-if="currentQuestion.selected === optIndex" class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span class="flex items-center gap-2">
                    <span class="font-medium">{{ String.fromCharCode(65 + optIndex) }}.</span>
                    <span>{{ opt }}</span>
                  </span>
                </div>
              </div>

              <!-- 判断题 -->
              <div v-if="isTrueFalse(currentQuestion)" class="space-y-3">
                <div
                    @click="!currentQuestion.answered && selectBooleanOption(true)"
                    class="p-3 rounded-lg border flex items-center gap-3 transition-all"
                    :class="[
                      currentQuestion.answered ?
                        (true === getCorrectBooleanAnswer() ?
                          'border-green-500 bg-green-50 dark:bg-green-900/20' :
                          (true === currentQuestion.selected ?
                            'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            'border-slate-200 dark:border-slate-700')) :
                        (currentQuestion.selected === true ?
                          'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' :
                          'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'),
                      currentQuestion.answered ? 'cursor-default' : ''
                    ]"
                >
                  <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      :class="[
                        currentQuestion.answered ?
                          (true === getCorrectBooleanAnswer() ?
                            'border-green-500 bg-green-500' :
                            (true === currentQuestion.selected ?
                              'border-red-500 bg-red-500' :
                              'border-slate-300 dark:border-slate-600')) :
                          (currentQuestion.selected === true ?
                            'border-indigo-500 bg-indigo-500' :
                            'border-slate-300 dark:border-slate-600')
                      ]"
                  >
                    <template v-if="currentQuestion.answered">
                      <i v-if="true === getCorrectBooleanAnswer()" class="fa fa-check text-white text-xs"></i>
                      <i v-else-if="true === currentQuestion.selected" class="fa fa-times text-white text-xs"></i>
                    </template>
                    <div v-else-if="currentQuestion.selected === true" class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>正确</span>
                </div>
                <div
                    @click="!currentQuestion.answered && selectBooleanOption(false)"
                    class="p-3 rounded-lg border flex items-center gap-3 transition-all"
                    :class="[
                      currentQuestion.answered ?
                        (false === getCorrectBooleanAnswer() ?
                          'border-green-500 bg-green-50 dark:bg-green-900/20' :
                          (false === currentQuestion.selected ?
                            'border-red-500 bg-red-50 dark:bg-red-900/20' :
                            'border-slate-200 dark:border-slate-700')) :
                        (currentQuestion.selected === false ?
                          'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' :
                          'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer'),
                      currentQuestion.answered ? 'cursor-default' : ''
                    ]"
                >
                  <div
                      class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      :class="[
                        currentQuestion.answered ?
                          (false === getCorrectBooleanAnswer() ?
                            'border-green-500 bg-green-500' :
                            (false === currentQuestion.selected ?
                              'border-red-500 bg-red-500' :
                              'border-slate-300 dark:border-slate-600')) :
                          (currentQuestion.selected === false ?
                            'border-indigo-500 bg-indigo-500' :
                            'border-slate-300 dark:border-slate-600')
                      ]"
                  >
                    <template v-if="currentQuestion.answered">
                      <i v-if="false === getCorrectBooleanAnswer()" class="fa fa-check text-white text-xs"></i>
                      <i v-else-if="false === currentQuestion.selected" class="fa fa-times text-white text-xs"></i>
                    </template>
                    <div v-else-if="currentQuestion.selected === false" class="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <span>错误</span>
                </div>
              </div>

              <!-- 简答题 -->
              <div v-if="isEssayQuestion(currentQuestion)">
                <textarea
                    v-model="currentQuestion.answerText"
                    @input="markAsAnswered"
                    :disabled="currentQuestion.answered"
                    rows="5"
                    class="w-full p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-all"
                    placeholder="请在此输入答案..."
                ></textarea>

                <!-- 简答题答案反馈 -->
                <div v-if="currentQuestion.answered" class="mt-4 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  <p class="text-sm font-medium mb-1">参考答案：</p>
                  <p class="text-slate-600 dark:text-slate-400 text-sm">{{ currentQuestion.rightAnswer }}</p>
                </div>
              </div>

              <!-- 答案反馈区域 -->
              <div v-if="currentQuestion.answered" class="mt-6">
                <div
                    :class="currentQuestion.isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'"
                    class="p-4 rounded-lg border">
                  <div class="flex items-center gap-2 mb-2">
                    <i :class="currentQuestion.isCorrect ? 'fa-check-circle text-green-500' : 'fa-times-circle text-red-500'"></i>
                    <h3 :class="currentQuestion.isCorrect ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'"
                        class="font-medium">
                      {{ currentQuestion.isCorrect ? '回答正确' : '回答错误' }}
                    </h3>
                  </div>

                  <div v-if="currentQuestion.explanation" class="mt-3">
                    <p class="text-sm font-medium mb-1">解析：</p>
                    <p class="text-slate-600 dark:text-slate-400 text-sm">{{ currentQuestion.explanation }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 底部操作按钮 -->
          <div
              class="sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-4 px-6 rounded-t-xl shadow-lg">
            <div class="container mx-auto flex justify-between items-center">
              <button
                  @click="prevQuestion"
                  class="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2"
                  :disabled="currentQuestionIndex === 0"
              >
                <i class="fa fa-arrow-left"></i>
                <span>上一题</span>
              </button>

              <div class="text-sm md:hidden flex items-center gap-2">
                <i class="fa fa-clock-o text-indigo-600 dark:text-indigo-400"></i>
                <span class="font-medium">{{ formattedTime }}</span>
              </div>

              <div v-if="!currentQuestion.answered" class="flex gap-3">
                <button
                    @click="submitCurrentQuestion"
                    class="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <i class="fa fa-check"></i>
                  <span>提交答案</span>
                </button>
              </div>

              <div v-if="currentQuestion.answered" class="flex gap-3">
                <button
                    @click="nextQuestion"
                    class="px-6 py-2.5"
                    :class="`${difficultyColorClass} hover:opacity-90 text-white rounded-lg transition-colors flex items-center justify-center gap-2`"
                    :disabled="currentQuestionIndex === totalQuestions - 1"
                >
                  <span>下一题</span>
                  <i class="fa fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载中占位区域 -->
      <div v-if="isLoading && !hasError" class="space-y-8">
        <div class="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div class="lg:col-span-1 h-96 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div class="lg:col-span-3 space-y-6">
            <div class="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div class="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer v-if="!isAllAnswered"
            class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-500">
        <p>© 2023 知题 - 让学习更高效</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import {getQuestionBank} from "@/api/question.js";

// 1. 基础状态
const isDarkMode = ref(false);
const router = useRouter();
const route = useRoute();

// 2. 路由参数：从params获取题库ID
const bankId = ref(route.params.businessId || '');

// 3. 答题数据
const questions = ref([]);
const currentQuestionIndex = ref(0);
const totalQuestions = computed(() => questions.value.length);
const timeSpent = ref(0); // 单位：秒
const timerInterval = ref(null);
const correctCount = ref(0); // 正确题数统计

// 4. 加载状态
const isLoading = ref(false);
const isDataLoaded = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const isAllAnswered = computed(() => {
  return questions.value.every(q => q.answered);
});

// 5. 当前题目计算属性
const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || {};
});

// 6. 格式化时间显示
const formattedTime = computed(() => {
  const minutes = Math.floor(timeSpent.value / 60);
  const seconds = timeSpent.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 7. 枚举转义：后端枚举→中文显示
const formatDifficulty = (difficulty) => {
  const map = {
    'BASIC': '简单',
    'INTERMEDIATE': '中等',
    'ADVANCED': '困难'
  };
  return map[difficulty] || difficulty;
};

// 8. 判断题目类型的方法
const isSingleChoice = (question) => {
  // 单选题有多个选项，不是判断题
  return question.answers && question.answers.length > 0
      && !isTrueFalse(question);
};

const isTrueFalse = (question) => {
  // 判断题正确答案是"T"或"F"或"true"或"false"
  const rightAnswer = (question.rightAnswer || '').toLowerCase();
  return rightAnswer === 't' || rightAnswer === 'f'
      || rightAnswer === 'true' || rightAnswer === 'false';
};

const isEssayQuestion = (question) => {
  // 简答题没有选项
  return !question.answers || question.answers.length === 0;
};

// 格式化题目类型显示文本
const formatQuestionType = (question) => {
  if (isSingleChoice(question)) return '单选题';
  if (isTrueFalse(question)) return '判断题';
  if (isEssayQuestion(question)) return '简答题';
  return '未知题型';
};

// 9. 难度对应颜色
const difficultyColorClass = computed(() => {
  const map = {
    'BASIC': 'bg-green-600 dark:bg-green-500',
    'INTERMEDIATE': 'bg-blue-600 dark:bg-blue-500',
    'ADVANCED': 'bg-red-600 dark:bg-red-500'
  };
  return map[currentQuestion.value.difficulty] || 'bg-indigo-600 dark:bg-indigo-500';
});

// 10. 获取单选题正确答案的索引
const getCorrectAnswerIndex = () => {
  if (!currentQuestion.value || !isSingleChoice(currentQuestion.value)) return -1;

  return currentQuestion.value.answers.findIndex(answer =>
      answer.trim() === currentQuestion.value.rightAnswer.trim()
  );
};

// 11. 获取判断题正确答案的布尔值
const getCorrectBooleanAnswer = () => {
  if (!currentQuestion.value || !isTrueFalse(currentQuestion.value)) return true;
  const rightAnswer = currentQuestion.value.rightAnswer.toLowerCase();
  return rightAnswer === 't' || rightAnswer === 'true';
};

// 12. 页面初始化
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

  // 加载题目数据
  loadQuestions();
});

// 13. 监听组件卸载，清除计时器
const cleanup = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }
};

// 14. 加载题目数据
const loadQuestions = async () => {
  isLoading.value = true;
  isDataLoaded.value = false;
  hasError.value = false;
  errorMessage.value = '';
  correctCount.value = 0;

  try {
    // 获取题库数据
    const response = await getQuestionBank(bankId);

    if (response.code !== 200) {
      throw new Error(`服务器错误: ${response.status} ${response.statusText}`);
    }

    if (response.data && response.data.questions) {
      // 处理QuestionDTO数据，添加答题状态
      questions.value = response.data.questions.map(q => ({
        ...q,
        selected: null,      // 用于选择题
        answerText: '',      // 用于简答题
        answered: false,     // 是否已答题
        isCorrect: false,    // 答案是否正确
        expectedTime: q.expectedTime || 2
      }));

      // 开始计时
      startTimer();

      // 标记数据加载完成
      isDataLoaded.value = true;
      // 更新页面标题
      document.title = `答题 - ${response.data.name || '未知'}题库 - 知题`;
    } else {
      throw new Error('获取题目数据失败');
    }
  } catch (error) {
    console.error('加载题目失败:', error);
    hasError.value = true;
    errorMessage.value = `加载失败: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 15. 开始计时器
const startTimer = () => {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
  }

  timerInterval.value = setInterval(() => {
    timeSpent.value++;
  }, 1000);
};

// 16. 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 17. 答题操作 - 单选题选择
const selectOption = (index) => {
  currentQuestion.value.selected = index;
};

// 18. 答题操作 - 判断题选择
const selectBooleanOption = (value) => {
  currentQuestion.value.selected = value;
};

// 19. 答题操作 - 标记为已答（用于简答题）
const markAsAnswered = () => {
  // 简答题只要有输入就可以提交
};

// 20. 提交当前题目答案
const submitCurrentQuestion = () => {
  if (currentQuestion.value.answered) return;

  let isCorrect = false;

  // 判断答案是否正确
  if (isSingleChoice(currentQuestion.value)) {
    // 单选题：比较选中的索引与正确答案
    isCorrect = currentQuestion.value.selected === getCorrectAnswerIndex();
  } else if (isTrueFalse(currentQuestion.value)) {
    // 判断题：比较选中的布尔值与正确答案
    isCorrect = currentQuestion.value.selected === getCorrectBooleanAnswer();
  } else if (isEssayQuestion(currentQuestion.value)) {
    // 简答题：这里简化处理，实际应用中可能需要更复杂的比较逻辑
    isCorrect = currentQuestion.value.answerText.trim().toLowerCase() ===
        currentQuestion.value.rightAnswer.trim().toLowerCase();
  }

  // 更新题目状态
  currentQuestion.value.answered = true;
  currentQuestion.value.isCorrect = isCorrect;

  // 更新正确题数统计
  if (isCorrect) {
    correctCount.value++;
  }
};

// 21. 题目导航 - 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--;
    scrollToTop();
  }
};

// 22. 题目导航 - 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++;
    scrollToTop();
  }
};

// 23. 题目导航 - 跳转到指定题目（任何题目都可以跳转）
const goToQuestion = (index) => {
  currentQuestionIndex.value = index;
  scrollToTop();
};

// 24. 滚动到顶部
const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

// 25. 重新开始答题
const restartQuiz = () => {
  loadQuestions();
  currentQuestionIndex.value = 0;
  timeSpent.value = 0;
  startTimer();
};

// 组件卸载时清除计时器
watch(
    () => route,
    (newRoute) => {
      if (newRoute.name !== 'QuizTaking') {
        cleanup();
      }
    }
);
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

/* 按钮禁用状态 */
button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
