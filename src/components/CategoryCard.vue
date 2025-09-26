<template>
  <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-1 cursor-pointer">
    <div class="w-12 h-12 rounded-full flex items-center justify-center mb-4" :class="colorClass">
      <i :class="'fa ' + icon + ' text-xl'"></i>
    </div>
    <h3 class="font-semibold text-lg mb-1">{{ title }}</h3>
    <p class="text-sm text-gray-500 dark:text-gray-400">{{ count }} 道题目</p>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

// 定义组件属性
const props = defineProps({
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  count: {
    type: String,
    required: true
  },
  colorClass: {
    type: String,
    required: true
  }
});
</script>

<style scoped>
/* 卡片悬停动画 */
div:hover {
  transition: all 0.3s ease;
}
</style>
