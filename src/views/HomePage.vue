<template>
  <div
      class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300"
  >
    <QuizHeader></QuizHeader>
    <!-- 主内容区 -->
    <main class="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <!-- 标题区域 -->
      <div class="text-center mb-10 max-w-3xl mx-auto">
        <h1 class="text-[clamp(2rem,5vw,3.5rem)] font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
          专属题库生成器
        </h1>
        <p class="text-slate-600 dark:text-slate-400 text-lg">
          输入主题生成定制题库，或从热门分类中选择，覆盖多领域知识提升需求
        </p>
      </div>

      <!-- 题库生成框 -->
      <div class="max-w-2xl mx-auto mb-12 relative">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i class="fa fa-list-alt text-slate-400"></i>
        </div>
        <input
            v-model="generatorQuery"
            @keyup.enter="handleGenerator"
            type="text"
            placeholder="输入题库主题、知识点或题型要求"
            class="w-full pl-10 pr-4 py-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-lg"
        >
        <button
            @click="handleGenerator"
            class="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg transition-colors"
        >
          生成题库
        </button>
      </div>

      <!-- 热门分类区域 -->
      <div class="mb-16">
        <h2 class="text-2xl font-bold mb-6 text-center">热门分类（覆盖多领域）</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <!-- 学科类 -->
          <CategoryCard
              @click="navigateToCategory('chinese')"
              icon="fa-book"
              title="语文"
              count="1,800"
              colorClass="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
          />
          <CategoryCard
              @click="navigateToCategory('english')"
              icon="fa-globe"
              title="英语"
              count="1,650"
              colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          />
          <CategoryCard
              @click="navigateToCategory('physics')"
              icon="fa-flask"
              title="物理"
              count="1,320"
              colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
          />
          <CategoryCard
              @click="navigateToCategory('chemistry')"
              icon="fa-beaker"
              title="化学"
              count="1,280"
              colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
          />
          <CategoryCard
              @click="navigateToCategory('biology')"
              icon="fa-leaf"
              title="生物"
              count="1,150"
              colorClass="bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
          />

          <!-- 社科类 -->
          <CategoryCard
              @click="navigateToCategory('geography')"
              icon="fa-map-marker"
              title="地理"
              count="1,050"
              colorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
          />
          <CategoryCard
              @click="navigateToCategory('politics')"
              icon="fa-balance-scale"
              title="政治"
              count="980"
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          />
          <CategoryCard
              @click="navigateToCategory('history')"
              icon="fa-history"
              title="历史"
              count="1,530"
              colorClass="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
          />
          <CategoryCard
              @click="navigateToCategory('psychology')"
              icon="fa-heart"
              title="心理学"
              count="850"
              colorClass="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
          />

          <!-- 艺术体育类 -->
          <CategoryCard
              @click="navigateToCategory('music')"
              icon="fa-music"
              title="音乐"
              count="720"
              colorClass="bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400"
          />
          <CategoryCard
              @click="navigateToCategory('art')"
              icon="fa-paint-brush"
              title="美术"
              count="680"
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          />
          <CategoryCard
              @click="navigateToCategory('pe')"
              icon="fa-futbol-o"
              title="体育"
              count="580"
              colorClass="bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400"
          />

          <!-- 职业技能类 -->
          <CategoryCard
              @click="navigateToCategory('accounting')"
              icon="fa-calculator"
              title="会计"
              count="1,420"
              colorClass="bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          />
          <CategoryCard
              @click="navigateToCategory('law')"
              icon="fa-gavel"
              title="法律"
              count="1,020"
              colorClass="bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
          />
          <CategoryCard
              @click="navigateToCategory('medical')"
              icon="fa-stethoscope"
              title="医学基础"
              count="920"
              colorClass="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
          />
          <CategoryCard
              @click="navigateToCategory('marketing')"
              icon="fa-line-chart"
              title="市场营销"
              count="880"
              colorClass="bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-900/30 dark:text-fuchsia-400"
          />
          <CategoryCard
              @click="navigateToCategory('management')"
              icon="fa-briefcase"
              title="管理学"
              count="780"
              colorClass="bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
          />

          <!-- 编程技术类 -->
          <CategoryCard
              @click="navigateToCategory('java')"
              icon="fa-java"
              title="Java"
              count="1,250"
              colorClass="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
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
              icon="fa-wifi"
              title="计算机网络"
              count="820"
              colorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
          />
        </div>
      </div>
    </main>
    <!-- 简化的页脚（保留简洁性） -->
    <footer
        class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm py-5 border-t border-slate-200 dark:border-slate-700 mt-10">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center text-sm text-slate-500 dark:text-slate-500">
          <p>© 知题 - 让学习更高效</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useRouter} from 'vue-router';
import CategoryCard from '@/components/CategoryCard.vue';
import QuizHeader from "@/components/QuizHeader.vue";
const generatorQuery = ref('');

const router = useRouter();

// 处理题库生成
const handleGenerator = () => {
  if (generatorQuery.value.trim()) {
    router.push({
      name: 'QuestionBankGenerator',
      params: {category: generatorQuery.value}
    });
  }
};

// 导航到分类专属题库生成页
const navigateToCategory = (category) => {
  router.push({
    name: 'QuestionBankGenerator',
    params: {category}
  });
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
