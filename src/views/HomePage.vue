<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-50 transition-colors duration-300">
    <QuizHeader></QuizHeader>

    <main class="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="text-center max-w-3xl mx-auto">
        <h1 class="text-[clamp(2.5rem,6vw,4rem)] font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 leading-tight">
          AI 智能聊天室
        </h1>

        <p class="text-slate-600 dark:text-slate-400 text-xl mb-12">
          在这里，你可以创建属于自己的话题房间，与朋友畅聊，更有 AI 助手随时待命。
        </p>

        <button
            @click="enterChatRoom"
            class="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white transition-all duration-200 bg-indigo-600 rounded-full hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-lg hover:shadow-xl hover:-translate-y-1"
        >
          <span class="mr-2">立即开始聊天</span>
          <i class="fa fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
        </button>
      </div>
    </main>

    <footer class="py-6 text-center text-slate-500 dark:text-slate-500 text-sm">
      <p>© AI ChatRoom - 连接你我与未来</p>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import QuizHeader from "@/components/QuizHeader.vue";

const router = useRouter();

const enterChatRoom = () => {
  router.push({ name: 'ChatRoom' });
};
</script>
