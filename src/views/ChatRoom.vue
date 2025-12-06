<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
    <quiz-header></quiz-header>

    <main class="flex-grow container mx-auto px-4 py-6 h-[calc(100vh-64px)]">
      <div class="flex h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">

        <div class="w-64 bg-slate-100 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
            <button @click="handleCreateRoom" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
              <i class="fa fa-plus"></i> 新建房间
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <div v-for="room in rooms" :key="room.id" @click="selectRoom(room)"
                 class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                 :class="currentRoom?.id === room.id ? 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'">
              <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {{ room.roomName ? room.roomName.charAt(0) : '#' }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium truncate">{{ room.roomName }}</h4>
                <p class="text-xs text-slate-500 truncate">ID: {{ room.id }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="flex-1 flex flex-col bg-white dark:bg-slate-800 min-w-0">
          <div class="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <div v-if="currentRoom" class="flex-1 min-w-0 mr-4">
              <h2 class="text-lg font-bold truncate">{{ currentRoom.roomName }}</h2>
              <p class="text-xs text-slate-500 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-green-500"></span>
                {{ activeAiList.length }} 位 AI 在线
              </p>
            </div>
            <div v-else class="text-slate-500">请选择一个房间开始聊天</div>

            <div v-if="currentRoom" class="flex items-center gap-3">
              <button @click="handleAddAi" class="px-3 py-1.5 text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors font-medium flex items-center gap-1 whitespace-nowrap">
                <i class="fa fa-plus-circle"></i> 邀请AI
              </button>
              <button @click="showRightSidebar = !showRightSidebar"
                      class="w-9 h-9 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                      :class="showRightSidebar ? 'bg-slate-100 dark:bg-slate-700 text-indigo-600' : ''">
                <i class="fa fa-columns"></i>
              </button>
            </div>
          </div>

          <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/20">
            <div v-if="!currentRoom" class="h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fa fa-comments-o text-6xl mb-4"></i>
              <p>选择左侧房间加入群聊</p>
            </div>
            <template v-else>
              <div v-for="msg in messages" :key="msg.id" class="flex gap-4" :class="msg.senderId == myUserId ? 'flex-row-reverse' : ''">
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md" :class="getAvatarColor(msg.senderName)">
                  {{ msg.senderName ? msg.senderName.charAt(0) : '?' }}
                </div>
                <div class="max-w-[80%] sm:max-w-[70%]">
                  <div class="text-xs text-slate-500 mb-1" :class="msg.senderId == myUserId ? 'text-right' : ''">{{ msg.senderName }}</div>
                  <div class="p-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words" :class="msg.senderId == myUserId ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-tl-none'">
                    {{ msg.content }}
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div class="flex gap-4 max-w-4xl mx-auto">
              <input v-model="inputContent" @keyup.enter="handleSend" :disabled="!currentRoom" type="text" placeholder="输入消息... (Enter发送)" class="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              <button @click="handleSend" :disabled="!currentRoom || !inputContent.trim()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <span>发送</span> <i class="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="showRightSidebar && currentRoom" class="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col transition-all animate-slideInRight">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 class="font-bold text-slate-700 dark:text-slate-200">群成员</h3>
          </div>
          <div class="flex-1 overflow-y-auto p-3">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50">
              <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {{ userInfo.nickname?.charAt(0) || '我' }}
              </div>
              <div>
                <p class="text-sm font-medium">我 (Host)</p>
                <p class="text-xs text-green-500">● 在线</p>
              </div>
            </div>

            <div class="my-3 border-t border-slate-100 dark:border-slate-700"></div>
            <p class="text-xs text-slate-400 mb-2 px-2">AI 智能体 ({{ activeAiList.length }})</p>

            <div v-for="ai in activeAiList" :key="ai.id" class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group cursor-pointer relative">
              <div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                   :class="getAvatarColor(ai.aiName)">
                {{ ai.aiName.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex justify-between items-center">
                  <p class="text-sm font-medium truncate">{{ ai.aiName }}</p>
                  <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-300">
                    {{ ai.modelName || 'qwen' }}
                  </span>
                </div>
                <p class="text-xs text-slate-500 truncate" :title="ai.systemPrompt">{{ ai.systemPrompt }}</p>
              </div>

              <div class="absolute left-0 top-full mt-2 w-64 p-3 bg-black/80 text-white text-xs rounded-lg z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl backdrop-blur-sm">
                <p class="font-bold mb-1">人设：</p>
                {{ ai.systemPrompt }}
              </div>
            </div>

            <div v-if="activeAiList.length === 0" class="text-center py-8 text-slate-400 text-sm">
              <p>暂无 AI 加入</p>
              <button @click="handleAddAi" class="text-indigo-500 hover:underline mt-2">去邀请一个？</button>
            </div>
          </div>
        </div>

      </div>
    </main>

    <div v-if="showAiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">

        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm">
              <i class="fa fa-magic"></i>
            </span>
            召唤 AI 助手
          </h3>
          <button @click="closeAiModal" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <i class="fa fa-times text-lg"></i>
          </button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">AI 名字 <span class="text-red-500">*</span></label>
            <input v-model="aiForm.aiName" type="text" placeholder="例如：诸葛亮、DeepSeek大神"
                   class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">人设 (Prompt) <span class="text-red-500">*</span></label>
            <textarea v-model="aiForm.systemPrompt" rows="3" placeholder="例如：你是一个严谨的程序员，说话喜欢用代码举例..."
                      class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">模型选择</label>
              <select v-model="aiForm.modelName" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="qwen-plus">通义千问 (默认)</option>
                <option value="deepseek-v3">DeepSeek-V3</option>
                <option value="deepseek-r1">DeepSeek-R1</option>
                <option value="llama3.1">Llama 3.1</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key</label>
              <input v-model="aiForm.apiKey" type="password" placeholder="选填，默认用系统Key"
                     class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none"
              >
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="closeAiModal" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors">
            取消
          </button>
          <button @click="submitAiForm" :disabled="!isFormValid"
                  class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm shadow-purple-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <i class="fa fa-check"></i> 立即召唤
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import {ref, onMounted, onUnmounted, nextTick, computed} from 'vue';
import QuizHeader from "@/components/QuizHeader.vue";
// 引入了 addAiToRoom
import { createRoom, getRoomList, sendMessage, getHistoryMessages, addAiToRoom ,getRoomAiList} from "@/api/room.js";
const showRightSidebar = ref(true); // 控制侧边栏显示
const activeAiList = ref([]); // 当前房间的 AI 列表

const rooms = ref([]);
const currentRoom = ref(null);
const messages = ref([]);
const inputContent = ref("");
// --- AI 弹窗相关状态 ---
const showAiModal = ref(false);
const aiForm = ref({
  aiName: '',
  systemPrompt: '',
  apiKey: '',
  modelName: 'qwen-plus'
});
const myUserId = localStorage.getItem('USER_ID');
const userInfo = JSON.parse(localStorage.getItem('USER_INFO') || '{}');
const msgContainer = ref(null);
let pollTimer = null;

const loadRooms = async () => {
  try {
    const res = await getRoomList();
    if (res.code === 200) {
      rooms.value = res.data;
    }
  } catch (e) {
    console.error("加载房间失败", e);
  }
};

const handleCreateRoom = async () => {
  const name = prompt("请输入新房间的名字：");
  if (name) {
    await createRoom(name);
    await loadRooms();
  }
};

// 点击顶部按钮，只负责打开弹窗
const handleAddAi = () => {
  if (!currentRoom.value) return;
  // 重置表单
  aiForm.value = {
    aiName: '',
    systemPrompt: '',
    apiKey: '',
    modelName: 'qwen-plus'
  };
  showAiModal.value = true;
};

// 关闭弹窗
const closeAiModal = () => {
  showAiModal.value = false;
};
// 提交表单
const submitAiForm = async () => {
  if (!currentRoom.value) return;

  try {
    await addAiToRoom({
      roomId: currentRoom.value.id,
      aiName: aiForm.value.aiName,
      systemPrompt: aiForm.value.systemPrompt,
      apiKey: aiForm.value.apiKey,
      modelName: aiForm.value.modelName
    });

    alert(`成功召唤了 ${aiForm.value.aiName}！`);
    closeAiModal(); // 关闭弹窗
    await loadRooms();
  } catch (e) {
    console.error(e);
    alert("召唤失败，请检查网络");
  }
};

const selectRoom = async (room) => {
  currentRoom.value = room;
  messages.value = [];
  loadRoomAis();
  await  Promise.all([
      loadMessages(),
      loadRooms()
  ]);

  scrollToBottom();
  if(pollTimer) clearTimeout(pollTimer);
  pollTimer = setInterval(loadRooms, 1000);
};
// 3. 新增：加载 AI 列表的函数
const loadRoomAis = async () => {
  if (!currentRoom.value) return;
  try {
    const res = await getRoomAiList(currentRoom.value.id);
    if (res.code === 200) {
      activeAiList.value = res.data;
    }
  } catch (e) {
    console.error("加载AI成员失败", e);
  }
}
const loadMessages = async () => {
  if (!currentRoom.value) return;
  try {
    const res = await getHistoryMessages(currentRoom.value.id);
    if (res.code === 200) {
      const newMessages = res.data;
      if (newMessages.length > messages.value.length) {
        messages.value = newMessages;
        scrollToBottom();
      } else {
        messages.value = newMessages;
      }
    }
  } catch (e) {
    console.error(e);
  }
};

const handleSend = async () => {
  const content = inputContent.value.trim();
  if (!content || !currentRoom.value) return;

  const msgData = {
    roomId: currentRoom.value.id,
    senderId: myUserId,
    senderName: userInfo.nickname || 'User' + myUserId,
    content: content
  };

  inputContent.value = "";

  try {
    await sendMessage(msgData);
    await loadMessages();
    scrollToBottom();
  } catch (e) {
    alert("发送失败");
  }
};

// 简单的头像颜色生成器
const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-400';
  if (name === '我' || name === userInfo.nickname) return 'bg-indigo-500';
  if (name.includes('AI')) return 'bg-purple-500';
  if (name.includes('DeepSeek')) return 'bg-blue-600';
  if (name.includes('元宝')) return 'bg-green-500';
  if (name.includes('豆包')) return 'bg-orange-500';
  return 'bg-indigo-400'; // 默认
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) {
      msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
    }
  });
};

const isScrollAtBottom = () => {
  if (!msgContainer.value) return true;
  const { scrollTop, scrollHeight, clientHeight } = msgContainer.value;
  return scrollHeight - scrollTop - clientHeight < 100;
}

onMounted(() => {
  loadRooms();
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});
const isFormValid = computed(() => {
  return aiForm.value.aiName.trim() && aiForm.value.systemPrompt.trim();
});
</script>
