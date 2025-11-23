<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
    <quiz-header></quiz-header>

    <main class="flex-grow container mx-auto px-4 py-6 h-[calc(100vh-64px)]">
      <div class="flex h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">

        <div class="w-64 bg-slate-100 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col">
          <div class="p-4 border-b border-slate-200 dark:border-slate-700">
            <button
                @click="handleCreateRoom"
                class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-2 transition-colors">
              <i class="fa fa-plus"></i> 新建房间
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-2 space-y-1">
            <div
                v-for="room in rooms"
                :key="room.id"
                @click="selectRoom(room)"
                class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3"
                :class="currentRoom?.id === room.id ? 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'"
            >
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

        <div class="flex-1 flex flex-col bg-white dark:bg-slate-800">
          <div class="h-16 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
            <div v-if="currentRoom">
              <h2 class="text-lg font-bold">{{ currentRoom.roomName }}</h2>
              <p class="text-xs text-slate-500 flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-green-500"></span> 在线聊天中
              </p>
            </div>
            <div v-else class="text-slate-500">请选择一个房间开始聊天</div>

            <button
                v-if="currentRoom"
                @click="handleAddAi"
                class="px-3 py-1.5 text-sm bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors font-medium flex items-center gap-1"
            >
              <i class="fa fa-magic"></i> 召唤AI
            </button>
          </div>

          <div ref="msgContainer" class="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-900/20">
            <div v-if="!currentRoom" class="h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fa fa-comments-o text-6xl mb-4"></i>
              <p>选择左侧房间加入群聊</p>
            </div>

            <template v-else>
              <div
                  v-for="msg in messages"
                  :key="msg.id"
                  class="flex gap-4"
                  :class="msg.senderId == myUserId ? 'flex-row-reverse' : ''"
              >
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md"
                     :class="getAvatarColor(msg.senderName)">
                  {{ msg.senderName ? msg.senderName.charAt(0) : '?' }}
                </div>

                <div class="max-w-[70%]">
                  <div class="text-xs text-slate-500 mb-1" :class="msg.senderId == myUserId ? 'text-right' : ''">
                    {{ msg.senderName }}
                  </div>
                  <div
                      class="p-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words"
                      :class="msg.senderId == myUserId
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-tl-none'"
                  >
                    {{ msg.content }}
                  </div>
                </div>
              </div>
            </template>
          </div>

          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div class="flex gap-4 max-w-4xl mx-auto">
              <input
                  v-model="inputContent"
                  @keyup.enter="handleSend"
                  :disabled="!currentRoom"
                  type="text"
                  placeholder="输入消息... (Enter发送)"
                  class="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <button
                  @click="handleSend"
                  :disabled="!currentRoom || !inputContent.trim()"
                  class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <span>发送</span>
                <i class="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import QuizHeader from "@/components/QuizHeader.vue";
// 引入了 addAiToRoom
import { createRoom, getRoomList, sendMessage, getHistoryMessages, addAiToRoom } from "@/api/room.js";

const rooms = ref([]);
const currentRoom = ref(null);
const messages = ref([]);
const inputContent = ref("");
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

// 【新增】处理添加 AI 的逻辑
const handleAddAi = async () => {
  if (!currentRoom.value) return;

  const name = prompt("1. 给 AI 起个名字（如：DeepSeek大神）：");
  if (!name) return;

  const promptText = prompt("2. 设定人设（如：你是一个严谨的程序员）：");
  if (!promptText) return;

  const userKey = prompt("3. [可选] 输入你的阿里云 API Key (不填则用系统默认)：");
  const model = prompt("4. [可选] 输入模型名称 (如 deepseek-v3, deepseek-r1, qwen-max)：", "qwen-plus");

  try {
    await addAiToRoom({
      roomId: currentRoom.value.id,
      aiName: name,
      systemPrompt: promptText,
      apiKey: userKey,
      modelName: model
    });
    alert(`成功召唤了 ${name}！`);
  } catch (e) {
    console.error(e);
    alert("召唤失败");
  }
};

const selectRoom = async (room) => {
  currentRoom.value = room;
  messages.value = [];
  await loadMessages();
  scrollToBottom();

  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(loadMessages, 1000); // 1秒轮询
};

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
</script>
