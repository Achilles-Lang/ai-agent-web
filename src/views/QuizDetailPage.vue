<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300">
    <!-- 导航栏 -->
    <header class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm sticky top-0 z-30 border-b border-slate-200 dark:border-slate-700">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-2">
              <i class="fa fa-book text-2xl text-indigo-600 dark:text-indigo-400"></i>
              <span class="text-xl font-bold">知题</span>
            </router-link>
          </div>

          <div class="flex items-center gap-4">
            <button @click="toggleDarkMode" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i class="fa" :class="isDarkMode ? 'fa-sun-o' : 'fa-moon-o'"></i>
            </button>
            <div class="relative">
              <img src="https://picsum.photos/id/64/40/40" alt="用户头像" class="w-8 h-8 rounded-full object-cover border-2 border-indigo-500 cursor-pointer">
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 标题和控制区 -->
      <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold mb-2" :class="categoryColor">
            {{ categoryTitle }}题库
          </h1>
          <p class="text-slate-600 dark:text-slate-400">
            共 {{ totalQuestions }} 道题 · 已选择 {{ questionCount }} 道题
          </p>
        </div>

        <div class="flex flex-wrap gap-3 items-center">
          <!-- 题目数量选择 -->
          <div class="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
            <label for="questionCount" class="text-sm">题目数量:</label>
            <input
                id="questionCount"
                v-model.number="questionCount"
                type="number"
                min="5"
                max="totalQuestions"
                step="5"
                class="w-20 p-1 border border-slate-300 dark:border-slate-600 rounded dark:bg-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              :class="`${categoryColorClass} hover:opacity-90 text-white rounded-lg transition-colors flex items-center gap-2`"
          >
            <span>开始答题</span>
            <i class="fa fa-play"></i>
          </button>
        </div>
      </div>

      <!-- 题库介绍 -->
      <div class="bg-white dark:bg-slate-800 rounded-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
        <h2 class="text-xl font-semibold mb-3">题库介绍</h2>
        <p class="text-slate-600 dark:text-slate-400 mb-4">
          {{ categoryDescription }}
        </p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">难度分布</p>
            <p class="font-medium">入门30% · 中级50% · 高级20%</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">平均完成时间</p>
            <p class="font-medium">{{ Math.round(questionCount * 1.5) }} 分钟</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">题型分布</p>
            <p class="font-medium">选择60% · 填空20% · 简答20%</p>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
            <p class="text-sm text-slate-500 dark:text-slate-400">正确率</p>
            <p class="font-medium">68%</p>
          </div>
        </div>
      </div>

      <!-- 题目列表预览 -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">题目预览</h2>
        <div class="space-y-4">
          <!-- 题目项 -->
          <div v-for="(question, index) in previewQuestions" :key="index" class="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 transition-all hover:shadow-sm">
            <div class="flex items-start gap-3">
              <div class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium" :class="categoryColorClass">
                {{ index + 1 }}
              </div>
              <div class="flex-grow">
                <h3 class="font-medium mb-2">
                  {{ question.title }}
                </h3>
                <div v-if="question.type === 'single'" class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center">A</div>
                    <span>{{ question.options[0] }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center">B</div>
                    <span>{{ question.options[1] }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center">C</div>
                    <span>{{ question.options[2] }}</span>
                  </div>
                </div>
                <div v-if="question.type === 'boolean'" class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <div class="w-3 h-3 rounded-full"></div>
                    </div>
                    <span>正确</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-5 h-5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center">
                      <div class="w-3 h-3 rounded-full"></div>
                    </div>
                    <span>错误</span>
                  </div>
                </div>
                <div v-if="question.type === 'text'" class="text-sm text-slate-600 dark:text-slate-400">
                  <div class="border border-dashed border-slate-300 dark:border-slate-600 rounded p-3 mt-2">
                    在此处填写答案...
                  </div>
                </div>
                <div class="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-500 gap-3">
                  <span><i class="fa fa-clock-o mr-1"></i> {{ question.time }}分钟</span>
                  <span><i class="fa fa-signal mr-1"></i> {{ question.difficulty }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 显示更多提示 -->
          <div v-if="questionCount > 5" class="text-center py-4 text-slate-500 dark:text-slate-400">
            <p>... 还有 {{ questionCount - 5 }} 道题在答题时显示 ...</p>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="sticky bottom-0 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 py-4 px-6 rounded-t-xl shadow-lg mt-8">
        <div class="container mx-auto flex justify-between items-center">
          <div class="text-slate-600 dark:text-slate-400">
            <span class="font-medium">{{ questionCount }}</span> 道题 · 预计用时 {{ Math.round(questionCount * 1.5) }} 分钟
          </div>
          <button
              @click="startQuiz"
              class="px-6 py-2.5"
              :class="`${categoryColorClass} hover:opacity-90 text-white rounded-lg transition-colors flex items-center gap-2 text-sm md:text-base`"
          >
            <span>开始答题</span>
            <i class="fa fa-arrow-right"></i>
          </button>
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
import { ref, onMounted, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

// 状态管理
const isDarkMode = ref(false);
const questionCount = ref(10); // 题目数量，默认10道
const router = useRouter();
const route = useRoute();

// 从路由参数获取分类信息
const category = ref(route.params.category || 'java');

// 分类配置 - 可扩展更多分类
const categoryConfig = {
  java: {
    title: 'Java',
    description: '包含Java基础语法、面向对象编程、集合框架、多线程、IO流、反射、注解等知识点，适合Java初学者到进阶学习者练习。',
    total: 1250,
    colorClass: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600',
    color: 'text-orange-600 dark:text-orange-400'
  },
  spring: {
    title: 'Spring',
    description: '涵盖Spring Framework、Spring Boot、Spring Cloud等相关知识点，包括依赖注入、AOP、事务管理、自动配置等核心内容。',
    total: 870,
    colorClass: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
    color: 'text-green-600 dark:text-green-400'
  },
  exam: {
    title: '软考',
    description: '软件水平考试（软考）相关题目，包括软件设计师、系统架构师、数据库系统工程师等多个级别的考试内容和历年真题。',
    total: 2100,
    colorClass: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
    color: 'text-purple-600 dark:text-purple-400'
  },
  python: {
    title: 'Python',
    description: 'Python编程语言基础到进阶的练习题，包括语法、函数、面向对象、模块、数据分析、爬虫等相关知识点。',
    total: 980,
    colorClass: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
    color: 'text-blue-600 dark:text-blue-400'
  },
  history: {
    title: '历史',
    description: '涵盖中国历史和世界历史的重要事件、人物、制度等知识点，适合各类历史考试复习和知识拓展。',
    total: 1530,
    colorClass: 'bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600',
    color: 'text-amber-600 dark:text-amber-400'
  }
  // 可添加更多分类...
};

// 计算属性 - 获取当前分类的配置
const currentCategory = computed(() => {
  return categoryConfig[category.value] || categoryConfig.java;
});

// 派生当前分类的属性
const categoryTitle = computed(() => currentCategory.value.title);
const categoryDescription = computed(() => currentCategory.value.description);
const totalQuestions = computed(() => currentCategory.value.total);
const categoryColorClass = computed(() => currentCategory.value.colorClass);
const categoryColor = computed(() => currentCategory.value.color);

// 预览题目数据
const previewQuestions = ref([
  {
    title: '下列关于Java中接口的说法，正确的是？',
    type: 'single',
    options: [
      '接口可以包含非抽象方法',
      '一个类只能实现一个接口',
      '接口可以继承多个类',
      '接口中的方法默认是public abstract'
    ],
    time: 1,
    difficulty: '入门'
  },
  {
    title: 'Java中的String类是不可变的。',
    type: 'boolean',
    time: 0.5,
    difficulty: '入门'
  },
  {
    title: '请简述Java中垃圾回收机制的工作原理。',
    type: 'text',
    time: 3,
    difficulty: '中级'
  },
  {
    title: '下列哪个集合类是线程安全的？',
    type: 'single',
    options: [
      'ArrayList',
      'HashMap',
      'Vector',
      'LinkedList'
    ],
    time: 1,
    difficulty: '中级'
  },
  {
    title: '请写出单例模式的双重检查锁定实现方式。',
    type: 'text',
    time: 5,
    difficulty: '高级'
  }
]);

// 页面初始化
onMounted(() => {
  // 同步暗色模式
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode.value = true;
    document.documentElement.classList.add('dark');
  }

  // 确保题目数量在有效范围
  if (questionCount.value > totalQuestions.value) {
    questionCount.value = totalQuestions.value;
  }

  // 更新页面标题
  document.title = `${categoryTitle.value}题库 - 知题`;
});

// 切换暗色模式
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  document.documentElement.classList.toggle('dark', isDarkMode.value);
};

// 开始答题（跳转到答题页面）
const startQuiz = () => {
  router.push({
    name: 'QuizTaking',
    params: { category: category.value },
    query: { count: questionCount.value }
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
</style>
