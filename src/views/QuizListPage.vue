<template>
  <div
      class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300"
  >
    <QuizHeader/>

    <!-- 主内容区 -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- 页面标题 -->
      <div class="mb-8 text-center">
        <h1 class="text-[clamp(1.8rem,4vw,2.5rem)] font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          {{ pageTitle }}
        </h1>
        <p class="text-slate-600 dark:text-slate-400">
          {{ pageDescription }}
        </p>
      </div>

      <!-- 用户信息卡片 -->
      <div
          class="bg-white dark:bg-slate-700 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-600 p-6 mb-10">
        <div class="flex flex-col md:flex-row items-center md:items-start gap-6">
          <!-- 头像区域 -->
          <div
              class="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold">
            <img
                :src="userInfo.avatar"
                alt="用户头像"
                class="rounded-full"
            >
          </div>

          <!-- 用户信息和统计 -->
          <div class="flex-1 text-center md:text-left">
            <h2 class="text-xl font-bold mb-1">{{ userInfo.nickname }}</h2>
            <p class="text-slate-500 dark:text-slate-400 text-sm mb-4">
              加入时间: {{ userInfo.joinDate }}
            </p>

            <!-- 统计数据 -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div class="bg-slate-50 dark:bg-slate-600 p-3 rounded-xl">
                <p class="text-sm text-slate-500 dark:text-slate-400">总数量</p>
                <p class="text-xl font-bold">{{ stats.total }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-600 p-3 rounded-xl">
                <p class="text-sm text-slate-500 dark:text-slate-400">总题目</p>
                <p class="text-xl font-bold">{{ stats.totalQuestions }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-600 p-3 rounded-xl">
                <p class="text-sm text-slate-500 dark:text-slate-400">本月新增</p>
                <p class="text-xl font-bold">{{ stats.monthlyNew }}</p>
              </div>
              <div class="bg-slate-50 dark:bg-slate-600 p-3 rounded-xl">
                <p class="text-sm text-slate-500 dark:text-slate-400">已练习</p>
                <p class="text-xl font-bold">{{ stats.practiced }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 筛选工具栏 -->
      <div class="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
        <div class="relative w-full sm:w-auto">
          <input
              v-model="searchQuery"
              @keyup.enter="handleSearch"
              type="text"
              placeholder="搜索题库..."
              class="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
          <i class="fa fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
        </div>

        <div class="flex flex-wrap gap-2">
          <select
              v-model="sortBy"
              class="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="latest">最新创建</option>
            <option value="name">名称排序</option>
            <option value="questions">题目数量</option>
          </select>

          <button
              @click="handleClearFilter"
              class="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            清除筛选
          </button>
        </div>
      </div>

      <!-- 题库列表 -->
      <div v-if="items.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <template v-for="(item, index) in items" :key="index">
          <!-- 题库卡片 -->
          <div
              class="bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 overflow-hidden hover:shadow-md transition-all duration-300">
            <!-- 顶部标签 -->
            <div
                class="px-4 py-2 bg-slate-50 dark:bg-slate-600 border-b border-slate-200 dark:border-slate-600 flex justify-between items-center">
              <span class="text-xs font-medium px-2 py-1 rounded-full" :class="getDifficultyClass(item.difficulty)">
                {{ item.difficulty }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ formatDate(item.createdAt) }}
              </span>
            </div>

            <!-- 卡片内容 -->
            <div class="p-5">
              <h3 class="text-lg font-bold mb-2 line-clamp-1">{{ item.name }}</h3>

              <div class="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div class="flex items-center text-slate-600 dark:text-slate-300">
                  <i class="fa fa-list-alt mr-2 text-indigo-500"></i>
                  <span>{{ item.questionCount }} 题</span>
                </div>
                <div class="flex items-center text-slate-600 dark:text-slate-300">
                  <i class="fa fa-clock-o mr-2 text-indigo-500"></i>
                  <span>{{ item.estimatedTime }} 分钟</span>
                </div>
                <div class="flex items-center text-slate-600 dark:text-slate-300">
                  <i class="fa fa-eye mr-2 text-indigo-500"></i>
                  <span>{{ item.views }} 次查看</span>
                </div>
                <div class="flex items-center text-slate-600 dark:text-slate-300">
                  <i class="fa fa-check-circle mr-2 text-indigo-500"></i>
                  <span>{{ item.practiceCount }} 次练习</span>
                </div>
              </div>

              <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                {{ item.description || '无描述信息' }}
              </p>

              <!-- 操作按钮 -->
              <div class="flex justify-between items-center">
                <button
                    @click="handlePractice(item.id)"
                    class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
                >
                  <i class="fa fa-play mr-1"></i> 开始练习
                </button>

                <div class="flex gap-1">
                  <button
                      @click="handleEdit(item.id)"
                      class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                      title="编辑"
                  >
                    <i class="fa fa-edit"></i>
                  </button>
                  <button
                      @click="handleDuplicate(item.id)"
                      class="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                      title="复制"
                  >
                    <i class="fa fa-copy"></i>
                  </button>
                  <button
                      @click="handleDelete(item.id, index)"
                      class="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                      title="删除"
                  >
                    <i class="fa fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 空状态 -->
      <div v-else
           class="text-center py-16 bg-white dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
        <div
            class="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center">
          <i class="fa fa-folder-open text-3xl text-slate-400"></i>
        </div>
        <h3 class="text-xl font-bold mb-2">暂无内容</h3>
        <p class="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
          {{ emptyStateMessage }}
        </p>
        <button
            @click="handleCreateNew"
            class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          <i class="fa fa-plus mr-2"></i>创建新题库
        </button>
      </div>

      <!-- 分页 -->
      <div v-if="items.length > 0" class="mt-10 flex justify-center">
        <nav class="flex items-center gap-1">
          <button
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentPage === 1"
              @click="currentPage--"
          >
            <i class="fa fa-chevron-left text-sm"></i>
          </button>

          <button
              v-for="page in totalPages"
              :key="page"
              class="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
              :class="currentPage === page
              ? 'bg-indigo-600 text-white'
              : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'"
              @click="currentPage = page"
          >
            {{ page }}
          </button>

          <button
              class="w-9 h-9 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentPage === totalPages"
              @click="currentPage++"
          >
            <i class="fa fa-chevron-right text-sm"></i>
          </button>
        </nav>
      </div>
    </main>

    <footer
        class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-5 border-t border-slate-200 dark:border-slate-700 mt-10"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-slate-500 dark:text-slate-500">
          <p>© 知题 - 让学习更高效</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {useRouter, useRoute} from 'vue-router';
import QuizHeader from "@/components/QuizHeader.vue";
import {getQuestionBanksByUserId} from "@/api/question.js";

// 路由和参数
const router = useRouter();
const route = useRoute();
const pageType = route.params.type || 'records'; // 'records' 或 'collections'

// 状态管理
const searchQuery = ref('');
const sortBy = ref('latest');
const currentPage = ref(1);
const itemsPerPage = 6;

// 模拟数据 - 实际项目中从API获取
const userInfo = ref({
  nickname: "",
  joinDate: "",
  avatar: ""
});

// 根据页面类型生成不同数据
const items = ref(pageType === 'records'
    ? [
      {
        id: 1,
        name: "Python基础语法题库",
        description: "包含变量、数据类型、运算符等基础知识点",
        questionCount: 30,
        difficulty: "简单",
        estimatedTime: 45,
        createdAt: "2023-11-15T09:30:00",
        views: 12,
        practiceCount: 5
      },
      {
        id: 2,
        name: "高考数学压轴题精选",
        description: "历年高考数学压轴题汇总及解析",
        questionCount: 20,
        difficulty: "困难",
        estimatedTime: 60,
        createdAt: "2023-11-10T14:20:00",
        views: 35,
        practiceCount: 12
      },
      {
        id: 3,
        name: "英语四级词汇测试",
        description: "针对四级考试核心词汇的测试题",
        questionCount: 50,
        difficulty: "中等",
        estimatedTime: 30,
        createdAt: "2023-11-05T16:45:00",
        views: 28,
        practiceCount: 8
      }
    ]
    : [
      {
        id: 101,
        name: "计算机网络基础",
        description: "OSI七层模型及TCP/IP协议相关题目",
        questionCount: 40,
        difficulty: "中等",
        estimatedTime: 50,
        createdAt: "2023-11-14T10:15:00",
        views: 42,
        practiceCount: 15
      },
      {
        id: 102,
        name: "会计从业资格考试题库",
        description: "会计基础与实务相关练习题",
        questionCount: 60,
        difficulty: "中等",
        estimatedTime: 75,
        createdAt: "2023-11-08T08:30:00",
        views: 29,
        practiceCount: 7
      }
    ]
);

onMounted(async () => {
  const userId = localStorage.getItem('USER_ID');
  const userJson = localStorage.getItem('USER_INFO');
  userInfo.value = JSON.parse(userJson);
  const response = await getQuestionBanksByUserId(userId);
  if (response.code === 200) {
    items.value = response.data;
  }
})
// 计算属性
const pageTitle = computed(() =>
    pageType === 'records' ? '我的生成记录' : '我的收藏'
);

const pageDescription = computed(() =>
    pageType === 'records'
        ? '查看和管理你所有生成过的题库'
        : '查看和管理你收藏的优质题库'
);

const emptyStateMessage = computed(() =>
    pageType === 'records'
        ? '你还没有生成过任何题库，点击下方按钮开始创建第一个专属题库吧'
        : '你还没有收藏任何题库，浏览题库时点击收藏按钮将内容保存到这里'
);

const filteredItems = computed(() => {
  return items.value
      .filter(item => item.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
      .sort((a, b) => {
        if (sortBy.value === 'latest') {
          return new Date(b.createdAt) - new Date(a.createdAt);
        }
        if (sortBy.value === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy.value === 'questions') {
          return b.questionCount - a.questionCount;
        }
        return 0;
      });
});

const totalPages = computed(() =>
    Math.ceil(filteredItems.value.length / itemsPerPage)
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredItems.value.slice(start, start + itemsPerPage);
});

const stats = computed(() => {
  const total = filteredItems.value.length;
  const totalQuestions = filteredItems.value.reduce((sum, item) => sum + item.questionCount, 0);
  const monthlyNew = filteredItems.value.filter(item => {
    const itemDate = new Date(item.createdAt);
    const now = new Date();
    return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
  }).length;
  const practiced = filteredItems.value.filter(item => item.practiceCount > 0).length;

  return {total, totalQuestions, monthlyNew, practiced};
});

// 工具函数
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getDifficultyClass = (difficulty) => {
  switch (difficulty) {
    case 'EASY':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'MEDIUM':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'HARD':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-600 dark:text-slate-300';
  }
};

// 事件处理
const handleSearch = () => {
  currentPage.value = 1; // 重置到第一页
};

const handleClearFilter = () => {
  searchQuery.value = '';
  sortBy.value = 'latest';
  currentPage.value = 1;
};

const handlePractice = (id) => {
  router.push({
    name: 'QuizDetail',
    params: {businessId: id}
  });
};

const handleEdit = (id) => {
  router.push({name: 'QuestionBankGenerator', params: {editId: id}});
};

const handleDuplicate = (id) => {
  // 复制题库逻辑
  alert(`复制题库 #${id}`);
};

const handleDelete = (id, index) => {
  if (confirm('确定要删除这个题库吗？此操作不可恢复。')) {
    items.value = items.value.filter(item => item.id !== id);
  }
};

const handleCreateNew = () => {
  router.push({name: 'Home'});
};
</script>

<style scoped>
/* 保持与首页一致的滚动条样式 */
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
