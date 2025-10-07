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
            <button class="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i class="fa fa-history"></i>
              <span>刷题记录</span>
            </button>
            <button class="hidden md:flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <i class="fa fa-bookmark-o"></i>
              <span>我的收藏</span>
            </button>
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
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题区域 -->
      <div class="text-center mb-10 max-w-3xl mx-auto">
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
          今天想刷什么题目？
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">
          从海量题库中选择你想练习的内容，提升知识储备和应试能力
        </p>
      </div>

      <!-- 搜索栏 -->
      <div class="max-w-2xl mx-auto mb-12 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fa fa-search text-slate-400"></i>
        </div>
        <input
            v-model="searchQuery"
            @keyup.enter="handleSearch"
            type="text"
            placeholder="搜索题目、知识点或分类..."
            class="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
        >
        <button
            @click="handleSearch"
            class="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors"
        >
          搜索
        </button>
      </div>

      <!-- 分类选项区域 -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-6 text-center">热门分类</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <!-- 分类卡片（带跳转功能） -->
          <CategoryCard
              @click="navigateToCategory('java')"
              icon="fa-java"
              title="Java"
              count="1,250"
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <CategoryCard
              @click="navigateToCategory('spring')"
              icon="fa-leaf"
              title="Spring"
              count="870"
              colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <CategoryCard
              @click="navigateToCategory('exam')"
              icon="fa-file-text-o"
              title="软考"
              count="2,100"
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
          <CategoryCard
              @click="navigateToCategory('history')"
              icon="fa-history"
              title="历史"
              count="1,530"
              colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <CategoryCard
              @click="navigateToCategory('python')"
              icon="fa-code"
              title="Python"
              count="980"
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <CategoryCard
              @click="navigateToCategory('mysql')"
              icon="fa-database"
              title="MySQL"
              count="750"
              colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          />
          <CategoryCard
              @click="navigateToCategory('network')"
              icon="fa-globe"
              title="网络"
              count="620"
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          />
          <CategoryCard
              @click="navigateToCategory('design')"
              icon="fa-paint-brush"
              title="设计"
              count="480"
              colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
          />
          <CategoryCard
              @click="navigateToCategory('math')"
              icon="fa-calculator"
              title="数学"
              count="1,120"
              colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          />
          <CategoryCard
              @click="navigateToCategory('law')"
              icon="fa-balance-scale"
              title="法律"
              count="530"
              colorClass="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          />
        </div>
      </div>

      <!-- 推荐练习区域 -->
      <div>
        <h2 class="text-2xl font-bold mb-6 text-center">推荐练习</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- 推荐题目集卡片（带跳转） -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-slate-200 dark:border-slate-700 h-full flex flex-col cursor-pointer" @click="startPractice('java-basic')">
            <div class="h-36 bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <i class="fa fa-code text-white text-5xl"></i>
            </div>
            <div class="p-5 flex-grow">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-0.5 rounded-full">入门</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">Java基础</span>
              </div>
              <h3 class="text-lg font-semibold mb-2">Java语法基础50题</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                包含变量、数据类型、运算符、控制流等基础知识点练习
              </p>
              <div class="flex justify-between items-center mt-auto">
                <span class="text-sm font-medium">50题 · 30分钟</span>
                <button class="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm transition-colors">
                  开始练习
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-slate-200 dark:border-slate-700 h-full flex flex-col cursor-pointer" @click="startPractice('soft-exam')">
            <div class="h-36 bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center">
              <i class="fa fa-file-text-o text-white text-5xl"></i>
            </div>
            <div class="p-5 flex-grow">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs px-2 py-0.5 rounded-full">中级</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">软考</span>
              </div>
              <h3 class="text-lg font-semibold mb-2">软件设计师模拟卷</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                包含上午题和下午题，完全模拟真实考试环境
              </p>
              <div class="flex justify-between items-center mt-auto">
                <span class="text-sm font-medium">75题 · 150分钟</span>
                <button class="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white rounded-lg text-sm transition-colors">
                  开始练习
                </button>
              </div>
            </div>
          </div>

          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border border-slate-200 dark:border-slate-700 h-full flex flex-col cursor-pointer" @click="startPractice('spring-boot')">
            <div class="h-36 bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center">
              <i class="fa fa-leaf text-white text-5xl"></i>
            </div>
            <div class="p-5 flex-grow">
              <div class="flex items-center gap-2 mb-2">
                <span class="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs px-2 py-0.5 rounded-full">高级</span>
                <span class="text-sm text-slate-500 dark:text-slate-400">Spring框架</span>
              </div>
              <h3 class="text-lg font-semibold mb-2">Spring Boot实战20题</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                包含自动配置、依赖注入、AOP等核心知识点
              </p>
              <div class="flex justify-between items-center mt-auto">
                <span class="text-sm font-medium">20题 · 45分钟</span>
                <button class="px-3 py-1.5 bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white rounded-lg text-sm transition-colors">
                  开始练习
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 查看更多按钮 -->
        <div class="text-center mt-8">
          <button @click="viewMorePractices" class="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg transition-colors inline-flex items-center gap-2">
            <span>查看更多题目集</span>
            <i class="fa fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-16">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center gap-2 mb-4">
              <i class="fa fa-book text-xl text-indigo-600 dark:text-indigo-400"></i>
              <span class="text-lg font-bold">知题</span>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              提供海量题库资源，助力学习成长，提升应试能力
            </p>
          </div>

          <div>
            <h3 class="font-semibold mb-4">分类</h3>
            <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" @click.prevent="navigateToCategory('java')" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">编程语言</a></li>
              <li><a href="#" @click.prevent="navigateToCategory('exam')" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">职业资格</a></li>
              <li><a href="#" @click.prevent="navigateToCategory('math')" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">学科知识</a></li>
              <li><a href="#" @click.prevent="navigateToCategory('design')" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">技能认证</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">功能</h3>
            <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">每日一练</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">模拟考试</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">错题集</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">学习计划</a></li>
            </ul>
          </div>

          <div>
            <h3 class="font-semibold mb-4">关于</h3>
            <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">关于我们</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">联系我们</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">用户反馈</a></li>
              <li><a href="#" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">隐私政策</a></li>
            </ul>
          </div>
        </div>

        <div class="border-t border-slate-200 dark:border-slate-700 mt-8 pt-6 text-center text-sm text-slate-500 dark:text-slate-500">
          <p>© 2023 知题 - 让学习更高效</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import CategoryCard from '@/components/CategoryCard.vue';

// 状态管理
const isDarkMode = ref(false);
const searchQuery = ref('');
const router = useRouter();

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

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    });
  }
};

// 导航到分类详情页
const navigateToCategory = (category) => {
  router.push({ name: 'QuestionBankGenerator', params: { category } });
};

// 开始练习（跳转到答题页）
const startPractice = (practiceId) => {
  // 实际应用中可根据practiceId解析出对应分类
  const categoryMap = {
    'java-basic': 'java',
    'soft-exam': 'exam',
    'spring-boot': 'spring'
  };
  const category = categoryMap[practiceId] || 'java';
  router.push({
    name: 'QuizTaking',
    params: { category },
    query: { practiceId }
  });
};

// 查看更多题目集
const viewMorePractices = () => {
  router.push('/practices');
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
