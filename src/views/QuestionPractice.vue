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
            <div class="hidden md:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg">
              <i class="fa fa-clock-o text-indigo-600 dark:text-indigo-400"></i>
              <span class="font-medium">{{ formattedTime }}</span>
            </div>
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

    <!-- 主内容区：5列布局（1导航+3题目+1AI） -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-10 py-8">
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

      <!-- 加载中占位 -->
      <div v-if="isLoading && !hasError" class="space-y-8">
        <div class="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div class="lg:col-span-1 h-96 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div class="lg:col-span-3 space-y-6">
            <div class="h-64 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
            <div class="h-16 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          </div>
          <div class="lg:col-span-1 h-96 bg-slate-100 dark:bg-slate-700 rounded-lg animate-pulse"></div>
        </div>
      </div>

      <!-- 答题区域 -->
      <div v-if="isDataLoaded && !hasError" class="grid grid-cols-1 lg:grid-cols-10 gap-8">
        <!-- 左侧：题目导航 -->
        <div class="lg:col-span-2">
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

        <!-- 中间：题目内容 -->
        <div class="lg:col-span-5">
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

            <!-- 题目选项/输入区 -->
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
                <div v-if="currentQuestion.answered"
                     class="mt-4 p-3 bg-white dark:bg-slate-700 rounded border border-slate-200 dark:border-slate-600">
                  <p class="text-sm font-medium mb-1">参考答案：</p>
                  <p class="text-slate-600 dark:text-slate-400 text-sm">{{ currentQuestion.rightAnswer }}</p>
                </div>
              </div>

              <!-- 答案反馈 -->
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

        <!-- 右侧：强化版AI答疑区域（核心优化） -->
        <div class="lg:col-span-3">
          <div
              class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 sticky top-20 h-[calc(80vh-10rem)] flex flex-col shadow-sm">
            <!-- AI标题栏 -->
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold flex items-center gap-2 text-lg">
                <i class="fa fa-robot text-indigo-500 text-xl"></i>
                <span>AI答疑</span>
              </h3>
              <span v-if="!currentQuestion.answered" class="text-xs text-amber-500 dark:text-amber-400">
          <i class="fa fa-info-circle"></i> 答完当前题可提问
        </span>
            </div>

            <!-- AI对话内容区（核心优化：滚动+格式+打字机） -->
            <div
                ref="chatContainer"
                class="flex-grow overflow-y-auto p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg mb-4 space-y-4 border border-slate-100 dark:border-slate-600">
              <!-- 未答题提示和无对话提示（不变） -->
              <div v-if="!currentQuestion.answered"
                   class="text-center text-slate-500 dark:text-slate-400 text-sm py-10">
                <i class="fa fa-comment-o text-2xl mb-2 block"></i>
                请先完成当前题目的作答
              </div>

              <div v-else-if="currentQuestion.answered && !aiMessages.length"
                   class="text-center text-slate-500 dark:text-slate-400 text-sm py-10">
                <i class="fa fa-lightbulb-o text-2xl mb-2 block text-indigo-400"></i>
                可以继续向我提问哦！
              </div>

              <!-- 对话历史（优化后） -->
              <div v-else class="space-y-4">
                <div v-for="(msg, idx) in aiMessages" :key="idx" class="flex flex-col gap-1.5">
                  <div class="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <i :class="msg.role === 'user' ? 'fa fa-user' : 'fa fa-robot'"></i>
                    {{ msg.role === 'user' ? '我' : 'AI助手' }}
                  </div>
                  <div
                      :class="msg.role === 'user' ? 'bg-indigo-100 dark:bg-indigo-900/30 rounded-tr-none' : 'bg-white dark:bg-slate-800 rounded-tl-none'"
                      class="p-3 rounded-lg text-sm border border-slate-100 dark:border-slate-600"
                  >
                    <!-- 用户消息 -->
                    <template v-if="msg.role === 'user'">
                      {{ msg.content }}
                    </template>

                    <!-- AI消息：优化格式+实时滚动 -->
                    <template v-else>
                      <div v-html="formatContent(msg.content.slice(0, msg.displayLength))"></div>
                      <span v-if="msg.displayLength < msg.content.length"
                            class="animate-pulse inline-block w-1.5">|</span>
                    </template>
                  </div>
                </div>
              </div>
            </div>

            <!-- AI输入区（添加回车快捷键） -->
            <div class="flex gap-2">
              <input
                  v-model="aiInput"
                  :disabled="!currentQuestion.answered"
                  placeholder="可以继续向我提问哦！"
                  class="flex-grow px-4 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  @keydown.enter="handleAISend">
              <button
                  @click="handleAISend"
                  :disabled="!currentQuestion.answered"
                  class="w-10 h-10 rounded-lg bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i class="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 答题完成总结弹窗 -->
    <div v-if="showSummaryModal"
         class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
          class="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button
            @click="showSummaryModal = false"
            class="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-xl"
        >
          <i class="fa fa-times"></i>
        </button>

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
            <span>再次答题</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer
        class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-6 mt-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-500 dark:text-slate-500">
        <p>© 知题 - 让学习更高效</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {ref, onMounted, computed, watch, nextTick} from 'vue'; // 新增nextTick引入
import {useRouter, useRoute} from 'vue-router';
import {getQuestionBank} from "@/api/question.js";
import {chat} from "@/api/chat.js";

// 基础状态
const isDarkMode = ref(false);
const router = useRouter();
const route = useRoute();
const bankId = ref(route.params.businessId || '');

const request = ref({
  chatId: 1,
  question: null,
  userQuestion: ''
});


// 答题数据
const questions = ref([]);
const currentQuestionIndex = ref(0);
const totalQuestions = computed(() => questions.value.length);
const timeSpent = ref(0);
const timerInterval = ref(null);
const correctCount = ref(0);

// 加载状态
const isLoading = ref(false);
const isDataLoaded = ref(false);
const hasError = ref(false);
const errorMessage = ref('');
const isAllAnswered = computed(() => questions.value.length !== 0 && questions.value.every(q => q.answered));

// AI相关状态（优化后）
const showSummaryModal = ref(false);
const aiInput = ref('');
const aiMessages = ref([]); // 新增displayLength和timer字段
const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || {});
const chatContainer = ref(null); // 新增：聊天容器DOM引用

// 格式化时间
const formattedTime = computed(() => {
  const minutes = Math.floor(timeSpent.value / 60);
  const seconds = timeSpent.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// 题目类型/难度处理
const formatDifficulty = (difficulty) => {
  const map = {'BASIC': '简单', 'INTERMEDIATE': '中等', 'ADVANCED': '困难'};
  return map[difficulty] || difficulty;
};
const isSingleChoice = (question) => question.answers?.length > 0 && !isTrueFalse(question);
const isTrueFalse = (question) => {
  const rightAnswer = (question.rightAnswer || '').toLowerCase();
  return ['t', 'f', 'true', 'false'].includes(rightAnswer);
};
const isEssayQuestion = (question) => !question.answers || question.answers.length === 0;
const formatQuestionType = (question) => {
  if (isSingleChoice(question)) return '单选题';
  if (isTrueFalse(question)) return '判断题';
  if (isEssayQuestion(question)) return '简答题';
  return '未知题型';
};

// 难度颜色
const difficultyColorClass = computed(() => {
  const map = {
    'BASIC': 'bg-green-600 dark:bg-green-500',
    'INTERMEDIATE': 'bg-blue-600 dark:bg-blue-500',
    'ADVANCED': 'bg-red-600 dark:bg-red-500'
  };
  return map[currentQuestion.value.difficulty] || 'bg-indigo-600 dark:bg-indigo-500';
});

// 答案校验
const getCorrectAnswerIndex = () => {
  if (!currentQuestion.value || !isSingleChoice(currentQuestion.value)) return -1;
  return currentQuestion.value.answers.findIndex(answer => answer.trim() === currentQuestion.value.rightAnswer.trim());
};
const getCorrectBooleanAnswer = () => {
  if (!currentQuestion.value || !isTrueFalse(currentQuestion.value)) return true;
  const rightAnswer = currentQuestion.value.rightAnswer.toLowerCase();
  return rightAnswer === 't' || rightAnswer === 'true';
};

// 核心优化1：增强Markdown格式解析（支持多种标题格式）
const formatContent = (text) => {
  if (!text) return '';
  let formatted = text
      // 1. 处理块引用（> 开头的内容）
      .replace(/>(.*?)(\n|$)/g, (match, content) => {
        // 移除空行的块引用标记
        if (!content.trim()) return '';
        return `<blockquote class="border-l-4 border-indigo-400 pl-3 my-2 italic text-slate-700 dark:text-slate-300">${content}</blockquote>`;
      })
      // 2. 处理数字标题（1. 2. 3. 带中文描述）
      // 核心优化：精准匹配### 数字. 标题格式（包含空格和中文）
      .replace(/###\s+(\d+)\.\s+([^\n]+)(\n|$)/g, '<h3 class="text-base font-semibold mt-3 mb-2 pl-1 border-l-2 border-indigo-500 dark:border-indigo-400">$1. $2</h3>')
      // 兼容普通### 标题格式
      .replace(/###\s+([^\n]+)(\n|$)/g, '<h3 class="text-base font-semibold mt-3 mb-2">$1</h3>')
      .replace(/(\d+.\s+[\u4e00-\u9fa5]+)(\n|$)/g, '<h3 class="text-base font-semibold mt-3 mb-1">$1</h3>')
      // 3. 处理加粗
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // 4. 处理无序列表（- 开头）
      .replace(/-(.*?)(\n|$)/g, '<li class="ml-4 list-disc">$1</li>')
      // 5. 处理分隔线（支持--、---、____）
      .replace(/---+|--+|____+/g, '<hr class="my-3 border-slate-200 dark:border-slate-700">')
      // 6. 处理总结标记（✅ 开头）
      .replace(/✅\s+(.*?)(\n|$)/g, '<p class="font-semibold text-indigo-600 dark:text-indigo-400 mt-2">$1</p>')
      // 7. 处理换行（保留块级元素后的空行）
      .replace(/\n/g, '<br>');

  // 8. 包裹列表项（区分有序/无序）
  // 无序列表
  if (formatted.includes('<li class="ml-4 list-disc">')) {
    formatted = formatted.replace(/(<li class="ml-4 list-disc">.*?<\/li>)+/g, '<ul class="my-2">$&</ul>');
  }
  // 有序列表（如果存在）
  if (formatted.includes('<li class="ml-4 list-decimal">')) {
    formatted = formatted.replace(/(<li class="ml-4 list-decimal">.*?<\/li>)+/g, '<ol class="my-2">$&</ol>');
  }

  // 9. 清理多余的空标签
  formatted = formatted.replace(/<br><\/blockquote>/g, '</blockquote>')
      .replace(/<blockquote><br>/g, '<blockquote>');

  return formatted;
};

// 核心优化2：打字机过程中实时滚动
const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

// 核心优化3：AI发送消息（支持回车快捷键+空消息校验）
const handleAISend = async () => {
  // 空消息校验
  const content = aiInput.value.trim();
  if (!currentQuestion.value.answered || !content) return;

  // 添加用户消息
  aiMessages.value.push({role: 'user', content});
  aiInput.value = '';
  scrollToBottom(); // 立即滚动

  // 添加AI消息占位
  const aiMsgIndex = aiMessages.value.length;
  aiMessages.value.push({
    role: 'assistant',
    content: '',
    displayLength: 0,
    timer: null
  });

  try {
    request.value.question = currentQuestion.value;
    request.value.userQuestion = content;
    const value = JSON.stringify(request.value);
    const response = await chat(value);
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    const currentAiMsg = aiMessages.value[aiMsgIndex];

    // 读取流式数据
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, {stream: true});
      const assistantMessage = JSON.parse(chunk);
      currentAiMsg.content += assistantMessage.textContent || "";
    }

    // 启动打字机（每步更新后滚动）
    currentAiMsg.timer = setInterval(() => {
      if (currentAiMsg.displayLength < currentAiMsg.content.length) {
        currentAiMsg.displayLength += 1;
        //scrollToBottom(); // 打字过程中实时滚动
      } else {
        clearInterval(currentAiMsg.timer);
        currentAiMsg.timer = null;
      }
    }, 50);

  } catch (error) {
    console.error("AI请求错误:", error);
    const currentAiMsg = aiMessages.value[aiMsgIndex];
    currentAiMsg.content = "抱歉，获取回答失败，请重试~";
    currentAiMsg.displayLength = currentAiMsg.content.length;
    scrollToBottom();
  }
};


// 页面初始化
onMounted(() => {
  // 暗色模式同步
  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }
  // 验证题库ID
  if (!bankId.value) {
    hasError.value = true;
    errorMessage.value = '无效的题库ID，请重新选择题库';
    return;
  }
  // 加载题目
  loadQuestions();
  // 答题完成自动弹窗
  watch(isAllAnswered, (val) => val && (showSummaryModal.value = true), {immediate: true});
  // 切换题目清空AI输入
  watch(currentQuestionIndex, () => {
    aiInput.value = '';
  });
});

// 加载题目
const loadQuestions = async () => {
  isLoading.value = true;
  isDataLoaded.value = false;
  hasError.value = false;
  correctCount.value = 0;
  aiMessages.value = []; // 清空对话
  showSummaryModal.value = false;

  try {
    const response = await getQuestionBank(bankId);
    if (response.code !== 200) throw new Error(`服务器错误: ${response.status}`);

    if (response.data?.questions) {
      questions.value = response.data.questions.map(q => ({
        ...q, selected: null, answerText: '', answered: false, isCorrect: false, expectedTime: q.expectedTime || 2
      }));
      startTimer();
      isDataLoaded.value = true;
      document.title = `答题 - ${response.data.name || '未知'}题库 - 知题`;
    } else throw new Error('获取题目失败');
  } catch (error) {
    console.error('加载失败:', error);
    hasError.value = true;
    errorMessage.value = `加载失败: ${error.message}`;
  } finally {
    isLoading.value = false;
  }
};

// 计时器
const startTimer = () => {
  timerInterval.value && clearInterval(timerInterval.value);
  timerInterval.value = setInterval(() => timeSpent.value++, 1000);
};

// 基础交互
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};
const selectOption = (index) => currentQuestion.value.selected = index;
const selectBooleanOption = (value) => currentQuestion.value.selected = value;
const markAsAnswered = () => {
}; // 简答题标记
const submitCurrentQuestion = () => {
  if (currentQuestion.value.answered) return;
  let isCorrect = false;

  if (isSingleChoice(currentQuestion.value)) {
    isCorrect = currentQuestion.value.selected === getCorrectAnswerIndex();
  } else if (isTrueFalse(currentQuestion.value)) {
    isCorrect = currentQuestion.value.selected === getCorrectBooleanAnswer();
  } else if (isEssayQuestion(currentQuestion.value)) {
    isCorrect = currentQuestion.value.answerText.trim().toLowerCase() === currentQuestion.value.rightAnswer.trim().toLowerCase();
  }

  currentQuestion.value.answered = true;
  currentQuestion.value.isCorrect = isCorrect;
  isCorrect && correctCount.value++;
};

// 题目导航
const prevQuestion = () => {
  currentQuestionIndex.value > 0 && (currentQuestionIndex.value--);
  scrollToTop();
};
const nextQuestion = () => {
  currentQuestionIndex.value < totalQuestions.value - 1 && (currentQuestionIndex.value++);
  scrollToTop();
};
const goToQuestion = (index) => {
  currentQuestionIndex.value = index;
  scrollToTop();
};
const scrollToTop = () => window.scrollTo({top: 0, behavior: 'smooth'});

// 重新答题
const restartQuiz = () => {
  loadQuestions();
  currentQuestionIndex.value = 0;
  timeSpent.value = 0;
  startTimer();
  showSummaryModal.value = false;
};

// 组件卸载清理（新增AI定时器清除）
watch(route, (newRoute) => {
  if (newRoute.name !== 'QuizTaking') {
    // 清除答题计时器
    timerInterval.value && clearInterval(timerInterval.value);
    // 清除所有AI打字定时器
    aiMessages.value.forEach(msg => {
      msg.timer && clearInterval(msg.timer);
    });
  }
});
</script>

<style scoped>
/* 基础样式 */
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

button:disabled, input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* AI对话区样式强化 */
.ai-message-user {
  border-left: 3px solid #6366f1;
}

.ai-message-ai {
  border-left: 3px solid #10b981;
}

/* 弹窗关闭按钮hover效果优化 */
.modal-close-btn:hover {
  transform: scale(1.1);
}

/* 核心优化：格式化内容样式补充 */
h3 {
  margin: 0.5rem 0 !important;
  color: inherit !important;
  font-size: 1em !important;
}

ul {
  padding-left: 1.5rem !important;
}

li {
  margin: 0.3rem 0 !important;
}

h3 {
  margin-top: 0.75rem !important;
  margin-bottom: 0.5rem !important;
  line-height: 1.5 !important;
}

hr {
  margin: 0.75rem 0 !important;
}

/* 光标样式优化 */
.animate-pulse {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  from, to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}
</style>
