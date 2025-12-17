<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 flex flex-col">
    <header class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <h1 class="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          <i class="fa fa-book mr-2 text-indigo-500"></i>知识库管理
        </h1>
        <button @click="$router.push('/')" class="text-slate-500 hover:text-indigo-600 font-medium text-sm transition-colors">
          <i class="fa fa-arrow-left mr-1"></i> 返回大厅
        </button>
      </div>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8 max-w-3xl">

      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
        <div class="mb-6">
          <h2 class="text-lg font-bold flex items-center gap-2">
            <i class="fa fa-cloud-upload text-indigo-500"></i> 上传文档
          </h2>
          <p class="text-slate-500 text-sm mt-1">上传 PDF、TXT 或 Markdown 文件，AI 将学习其中的内容。</p>
        </div>

        <div
            class="border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group"
            :class="selectedFile ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'"
            @click="triggerFileInput"
        >
          <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" accept=".txt,.pdf,.md,.docx">

          <div v-if="!selectedFile">
            <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <i class="fa fa-folder-open text-2xl"></i>
            </div>
            <p class="font-medium text-slate-700 dark:text-slate-200">点击选择文件</p>
            <p class="text-xs text-slate-400 mt-2">支持 .txt, .pdf, .md, .docx (最大 10MB)</p>
          </div>

          <div v-else>
            <div class="w-16 h-16 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fa fa-check text-2xl"></i>
            </div>
            <p class="font-bold text-slate-800 dark:text-white">{{ selectedFile.name }}</p>
            <p class="text-xs text-slate-500 mt-1">{{ (selectedFile.size / 1024).toFixed(2) }} KB</p>
            <button @click.stop="selectedFile = null" class="text-xs text-red-500 hover:underline mt-3">移除文件</button>
          </div>
        </div>

        <div class="mt-6">
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">文档描述 (可选)</label>
          <input
              v-model="description"
              type="text"
              placeholder="例如：2025年员工手册 v1.0"
              class="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          >
        </div>

        <div class="mt-8">
          <button
              @click="handleUpload"
              :disabled="!selectedFile || isUploading"
              class="w-full py-3 rounded-xl font-bold text-white shadow-md transition-all flex items-center justify-center gap-2"
              :class="(!selectedFile || isUploading) ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-lg hover:scale-[1.01]'"
          >
            <i v-if="isUploading" class="fa fa-circle-o-notch fa-spin"></i>
            <i v-else class="fa fa-upload"></i>
            {{ isUploading ? '正在上传并解析...' : '开始上传' }}
          </button>
        </div>
      </div>

      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg text-sm flex items-start gap-3">
        <i class="fa fa-info-circle mt-0.5"></i>
        <div>
          <p class="font-bold">关于 RAG 知识库</p>
          <p class="opacity-90 mt-1">上传完成后，系统会自动将文档切片并向量化。之后在聊天室中提问时，AI 会自动检索这些文档的内容来回答你。</p>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadKnowledgeFile } from '@/api/knowledge';

const fileInput = ref(null);
const selectedFile = ref(null);
const description = ref('');
const isUploading = ref(false);

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleUpload = async () => {
  if (!selectedFile.value) return;

  isUploading.value = true;

  // 构建 FormData
  const formData = new FormData();
  formData.append('file', selectedFile.value);
  formData.append('description', description.value);

  try {
    await uploadKnowledgeFile(formData);
    alert('上传成功！AI 正在学习该文档...');
    // 重置表单
    selectedFile.value = null;
    description.value = '';
  } catch (error) {
    console.error(error);
    alert('上传失败，请检查网络或文件格式。');
  } finally {
    isUploading.value = false;
  }
};
</script>
