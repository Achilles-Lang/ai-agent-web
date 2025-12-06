<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
    <quiz-header></quiz-header>

    <main class="flex-grow container mx-auto px-4 py-6 h-[calc(100vh-64px)]">
      <div class="flex h-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700">

        <div class="w-64 bg-slate-100 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
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
                @contextmenu.prevent="openContextMenu($event, room)"
                class="p-3 rounded-lg cursor-pointer transition-colors flex items-center gap-3 relative"
                :class="currentRoom?.id === room.id ? 'bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600' : 'hover:bg-slate-200 dark:hover:bg-slate-700/50'"
            >
              <div class="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                {{ room.roomName ? room.roomName.charAt(0) : '#' }}
              </div>
              <div class="flex-1 min-w-0">
                <h4 class="font-medium truncate flex items-center gap-2">
                  {{ room.roomName }}
                  <i v-if="room.isPinned" class="fa fa-thumb-tack text-xs text-indigo-500 rotate-45"></i>
                </h4>
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
                <div
                    class="p-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words"

                    :class="msg.senderId == myUserId ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-tl-none'"
                >
                  <div v-if="msg.type === 'THINKING'" class="typing-indicator">
                    <span class="text-xs text-slate-400 mr-2">思考中</span>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                  </div>

                  <div v-else class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
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

        <div
            class="bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden"
            :class="showRightSidebar ? 'w-72 opacity-100' : 'w-0 opacity-0 border-l-0'"
        >
          <div class="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center text-center">
            <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
              {{ currentRoom?.avatar ? '' : (currentRoom?.roomName?.charAt(0) || '#') }}
              <img v-if="currentRoom?.avatar" :src="currentRoom.avatar" class="w-full h-full object-cover rounded-2xl">
            </div>

            <h3 class="text-lg font-bold text-slate-800 dark:text-white mb-1">{{ currentRoom?.roomName }}</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 px-2 line-clamp-2">
              {{ currentRoom?.description || '暂无群简介...' }}
            </p>
          </div>

          <div class="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">群成员 ({{ activeAiList.length + 1 }})</span>
          </div>

          <div class="flex-1 overflow-y-auto p-3 space-y-2">
            <div class="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div class="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {{ userInfo.nickname?.charAt(0) || '我' }}
              </div>
              <div>
                <p class="text-sm font-medium">我 (Host)</p>
                <p class="text-xs text-green-500 flex items-center gap-1"><span class="w-1.5 h-1.5 rounded-full bg-green-500"></span>在线</p>
              </div>
            </div>

            <div v-for="ai in activeAiList" :key="ai.id"
                 class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group cursor-pointer relative transition-colors">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                     :class="getAvatarColor(ai.aiName)">
                  {{ ai.aiName.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate">{{ ai.aiName }}</p>
                  <p class="text-xs text-slate-500 truncate opacity-80">{{ ai.modelName || 'qwen' }}</p>
                </div>
              </div>
              <button @click.stop="openDeleteModal(ai)" class="ml-2 w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-all opacity-0 group-hover:opacity-100">
                <i class="fa fa-trash"></i>
              </button>
            </div>
          </div>
        </div>

      </div>
    </main>

    <div v-if="showAiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span class="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-sm"><i class="fa fa-magic"></i></span>
            召唤 AI 助手
          </h3>
          <button @click="showAiModal = false" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><i class="fa fa-times text-lg"></i></button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">AI 名字 <span class="text-red-500">*</span></label>
            <input v-model="aiForm.aiName" type="text" placeholder="例如：诸葛亮" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">人设 (Prompt) <span class="text-red-500">*</span></label>
            <textarea v-model="aiForm.systemPrompt" rows="3" placeholder="例如：你是一个严谨的程序员..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all resize-none"></textarea>
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
              <input v-model="aiForm.apiKey" type="password" placeholder="选填，默认用系统Key" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-purple-500 outline-none">
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="showAiModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">取消</button>
          <button @click="submitAiForm" :disabled="!isFormValid" class="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-2 disabled:opacity-50">
            <i class="fa fa-check"></i> 立即召唤
          </button>
        </div>
      </div>
    </div>

    <div v-if="showDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden transform transition-all scale-100">
        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa fa-exclamation-triangle"></i>
          </div>
          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">确认移除？</h3>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">
            你确定要将 <span class="font-bold text-slate-800 dark:text-slate-200">"{{ aiToDelete?.aiName }}"</span> 踢出群聊吗？此操作无法撤销。
          </p>
          <div class="flex gap-3 justify-center">
            <button @click="showDeleteModal = false" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors">
              再想想
            </button>
            <button @click="confirmDeleteAi" class="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md shadow-red-200 dark:shadow-none transition-colors">
              确认踢出
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="contextMenu.visible"
         class="fixed z-50 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1 animate-fadeIn"
         :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }">

      <button @click="handlePinRoom" class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
        <i class="fa" :class="contextMenu.room?.isPinned ? 'fa-thumb-tack text-indigo-500' : 'fa-thumb-tack'"></i>
        {{ contextMenu.room?.isPinned ? '取消置顶' : '置顶房间' }}
      </button>

      <button @click="handleEditRoom" class="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 transition-colors">
        <i class="fa fa-cog"></i> 房间设置
      </button>

      <div class="my-1 border-t border-slate-200 dark:border-slate-600"></div>

      <button @click="handleDeleteRoom" class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2 transition-colors">
        <i class="fa fa-trash-o"></i> 删除房间
      </button>
    </div>


    <div v-if="showEditRoomModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">

        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white">房间设置</h3>
          <button @click="showEditRoomModal = false" class="text-slate-400 hover:text-slate-600"><i class="fa fa-times text-lg"></i></button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">房间名称</label>
            <input v-model="editRoomForm.roomName" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">群简介</label>
            <textarea v-model="editRoomForm.description" rows="3" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="介绍一下这个群是干嘛的..."></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">群头像 (URL)</label>
            <input v-model="editRoomForm.avatar" type="text" placeholder="http://..." class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
            <p class="text-xs text-slate-400 mt-1">贴入图片链接，留空则显示默认文字头像</p>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="showEditRoomModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
          <button @click="submitEditRoom" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-colors">保存设置</button>
        </div>

      </div>
    </div>
    <div v-if="showDeleteRoomModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-sm mx-4 overflow-hidden transform transition-all scale-100">

        <div class="p-6 text-center">
          <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            <i class="fa fa-exclamation-triangle"></i>
          </div>

          <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">解散房间？</h3>

          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6 leading-relaxed">
            你确定要删除房间 <span class="font-bold text-slate-800 dark:text-slate-200">"{{ roomToDelete?.roomName }}"</span> 吗？<br>
            <span class="text-xs text-red-400">注意：所有的聊天记录都将无法恢复。</span>
          </p>

          <div class="flex gap-3 justify-center">
            <button
                @click="showDeleteRoomModal = false"
                class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              取消
            </button>
            <button
                @click="confirmDeleteRoom"
                class="px-5 py-2.5 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-md shadow-red-200 dark:shadow-none transition-colors"
            >
              确认解散
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import QuizHeader from "@/components/QuizHeader.vue";
import { createRoom, getRoomList, sendMessage, getHistoryMessages, addAiToRoom, getRoomAiList, deleteRoomAi, deleteRoom, pinRoom, renameRoom, updateRoom } from "@/api/room.js";
import MarkdownIt from 'markdown-it';
// --- 右键菜单状态 ---
const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  room: null // 记录当前右键点击的是哪个房间
});
// 2. 打开右键菜单
const openContextMenu = (e, room) => {
  // 记录坐标
  contextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    room: room
  };
};
// 3. 关闭右键菜单 (点击别处时触发)
const closeContextMenu = () => {
  contextMenu.value.visible = false;
};
// 4. 执行删除房间
// const handleDeleteRoom = async () => {
//   const roomToDelete = contextMenu.value.room;
//   if (!roomToDelete) return;
//
//   if (!confirm(`确定要解散房间【${roomToDelete.roomName}】吗？所有聊天记录将被清除。`)) {
//     closeContextMenu();
//     return;
//   }
//
//   try {
//     const res = await deleteRoom(roomToDelete.id);
//     if (res.code === 200) {
//       // alert("房间已解散");
//       // 如果删的是当前正在聊的房间，清空当前选中状态
//       if (currentRoom.value && currentRoom.value.id === roomToDelete.id) {
//         currentRoom.value = null;
//         activeAiList.value = [];
//         messages.value = [];
//       }
//       await loadRooms(); // 刷新列表
//     }
//   } catch (e) {
//     console.error(e);
//     alert("删除失败");
//   } finally {
//     closeContextMenu();
//   }
// };
// 点击右键菜单的“删除”：只负责打开弹窗
const handleDeleteRoom = () => {
  const room = contextMenu.value.room;
  if (!room) return;

  closeContextMenu(); // 关掉右键菜单

  roomToDelete.value = room; // 记住要删哪个房间
  showDeleteRoomModal.value = true; // 显示警告弹窗
};
// 确认删除房间
const confirmDeleteRoom = async () => {
  if (!roomToDelete.value) return;

  try {
    const res = await deleteRoom(roomToDelete.value.id);
    if (res.code === 200) {
      // 如果删的是当前正在聊的房间，清空选中状态
      if (currentRoom.value && currentRoom.value.id === roomToDelete.value.id) {
        currentRoom.value = null;
        activeAiList.value = [];
        messages.value = [];
      }
      await loadRooms(); // 刷新列表
      showDeleteRoomModal.value = false; // 关闭弹窗
    }
  } catch (e) {
    console.error(e);
    alert("删除失败");
  }
};
// 5. 监听全局点击，以便关闭菜单
onMounted(() => {
  loadRooms();
  window.addEventListener('click', closeContextMenu); // 注册点击监听
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
  window.removeEventListener('click', closeContextMenu); // 销毁监听
});
// --- Markdown 配置 ---
const md = new MarkdownIt({ html: false, linkify: true, breaks: true });
const renderMarkdown = (text) => md.render(text || '');

// --- 状态变量 ---
const rooms = ref([]);
const currentRoom = ref(null);
const messages = ref([]);
const inputContent = ref("");
const myUserId = localStorage.getItem('USER_ID');
const userInfo = JSON.parse(localStorage.getItem('USER_INFO') || '{}');
const msgContainer = ref(null);
const showRightSidebar = ref(true);
const activeAiList = ref([]);
let pollTimer = null;

// --- 弹窗状态 ---
const showAiModal = ref(false);
const showDeleteModal = ref(false); // 新增删除弹窗控制
// --- 删除房间弹窗状态 ---
const showDeleteRoomModal = ref(false);
const roomToDelete = ref(null); // 暂存要删除的房间对象
// --- 重命名弹窗状态 ---
const showEditRoomModal = ref(false);
const editRoomForm = ref({ id: null, roomName: '', description: '', avatar: '' });

const renameForm = ref({ roomId: null, oldName: '', newName: '' });
const aiToDelete = ref(null);       // 暂存要删除的 AI
const aiForm = ref({ aiName: '', systemPrompt: '', apiKey: '', modelName: 'qwen-plus' });

const isFormValid = computed(() => aiForm.value.aiName.trim() && aiForm.value.systemPrompt.trim());

// --- 基础逻辑 ---
const loadRooms = async () => {
  try {
    const res = await getRoomList();
    if (res.code === 200) rooms.value = res.data;
  } catch (e) { console.error(e); }
};

const handleEditRoom = () => {
  const room = contextMenu.value.room; // 从右键菜单获取当前房间
  if (!room) return;
  closeContextMenu();

  // 填充表单
  editRoomForm.value = {
    id: room.id,
    roomName: room.roomName,
    description: room.description || '',
    avatar: room.avatar || ''
  };
  showEditRoomModal.value = true;
};

// 4. 提交保存
const submitEditRoom = async () => {
  if (!editRoomForm.value.roomName.trim()) return alert("房间名不能为空");

  try {
    await updateRoom(editRoomForm.value); // 调用后端新接口

    // 更新本地列表，不用刷新整个页面
    const room = rooms.value.find(r => r.id === editRoomForm.value.id);
    if (room) {
      room.roomName = editRoomForm.value.roomName;
      room.description = editRoomForm.value.description;
      room.avatar = editRoomForm.value.avatar;
    }

    // 如果改的是当前正在聊的房间，也要更新当前房间的信息
    if (currentRoom.value && currentRoom.value.id === editRoomForm.value.id) {
      currentRoom.value.roomName = editRoomForm.value.roomName;
      currentRoom.value.description = editRoomForm.value.description;
      currentRoom.value.avatar = editRoomForm.value.avatar;
    }

    showEditRoomModal.value = false;
    alert("保存成功");
  } catch (e) {
    console.error(e);
    alert("保存失败");
  }
};
// 确认修改
const confirmRename = async () => {
  const { roomId, oldName, newName } = renameForm.value;

  if (!newName || !newName.trim()) {
    alert("房间名不能为空");
    return;
  }

  if (newName === oldName) {
    showRenameModal.value = false; // 没改动，直接关
    return;
  }

  try {
    await renameRoom(roomId, newName);
    showRenameModal.value = false;
    await loadRooms(); // 刷新列表
  } catch (e) {
    console.error(e);
    alert("修改失败，请重试");
  }
};
const handleCreateRoom = async () => {
  const name = prompt("请输入新房间的名字：");
  if (name) { await createRoom(name); await loadRooms(); }
};

const selectRoom = async (room) => {
  currentRoom.value = room;
  messages.value = [];
  loadRoomAis();
  await loadMessages();
  scrollToBottom();
  if (pollTimer) clearInterval(pollTimer);
  pollTimer = setInterval(loadMessages, 1000);
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
  } catch (e) { console.error(e); }
};

const loadRoomAis = async () => {
  if (!currentRoom.value) return;
  try {
    const res = await getRoomAiList(currentRoom.value.id);
    if (res.code === 200) activeAiList.value = res.data;
  } catch (e) { console.error(e); }
}

const handleSend = async () => {
  const content = inputContent.value.trim();
  if (!content || !currentRoom.value) return;
  inputContent.value = "";
  try {
    await sendMessage({
      roomId: currentRoom.value.id,
      senderId: myUserId,
      senderName: userInfo.nickname || 'User' + myUserId,
      content: content
    });
    await loadMessages();
    scrollToBottom();
  } catch (e) { alert("发送失败"); }
};

// --- 召唤 AI 逻辑 ---
const handleAddAi = () => {
  if (!currentRoom.value) return;
  aiForm.value = { aiName: '', systemPrompt: '', apiKey: '', modelName: 'qwen-plus' };
  showAiModal.value = true;
};

const submitAiForm = async () => {
  try {
    await addAiToRoom({
      roomId: currentRoom.value.id,
      aiName: aiForm.value.aiName,
      systemPrompt: aiForm.value.systemPrompt,
      apiKey: aiForm.value.apiKey,
      modelName: aiForm.value.modelName
    });
    alert(`成功召唤了 ${aiForm.value.aiName}！`);
    showAiModal.value = false;
    await loadRoomAis();
  } catch (e) {
    console.error(e);
    alert("召唤失败");
  }
};

// --- 删除 AI 逻辑 (修复网络错误) ---
const openDeleteModal = (ai) => {
  aiToDelete.value = ai;
  showDeleteModal.value = true;
}

const confirmDeleteAi = async () => {
  if (!aiToDelete.value) return;
  try {
    // 关键修正：这里不需要传对象，deleteRoomAi 在 api/room.js 里定义的是传 ID
    const res = await deleteRoomAi(aiToDelete.value.id);

    if (res.code === 200) {
      // alert("已移除"); // 嫌烦可以注释掉
      showDeleteModal.value = false;
      await loadRoomAis(); // 刷新列表
    } else {
      alert(res.message || "删除失败");
    }
  } catch (e) {
    console.error("删除出错:", e);
    alert("网络错误，请检查后端日志");
  }
};

// --- 工具函数 ---
const getAvatarColor = (name) => {
  if (!name) return 'bg-gray-400';
  if (name === '我' || name === userInfo.nickname) return 'bg-indigo-500';
  if (name.includes('AI')) return 'bg-purple-500';
  if (name.includes('DeepSeek')) return 'bg-blue-600';
  if (name.includes('元宝')) return 'bg-green-500';
  if (name.includes('豆包')) return 'bg-orange-500';
  return 'bg-indigo-400';
}

const scrollToBottom = () => {
  nextTick(() => {
    if (msgContainer.value) msgContainer.value.scrollTop = msgContainer.value.scrollHeight;
  });
};

onMounted(() => { loadRooms(); });
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer); });
// 房间置顶
const handlePinRoom = async () => {
  const room = contextMenu.value.room;
  if (!room) return;

  closeContextMenu();

  try {
    await pinRoom(room.id);
    await loadRooms(); // 刷新列表（后端会重新排序，置顶的会跑上去）
  } catch (e) {
    alert("操作失败");
  }
};
</script>

<style>
/* Markdown 样式 */
.markdown-body ul { list-style-type: disc; margin-left: 1.5em; }
.markdown-body ol { list-style-type: decimal; margin-left: 1.5em; }
.markdown-body p { margin-bottom: 0.5em; }
.markdown-body pre {
  background-color: #1e293b; color: #e2e8f0; padding: 0.75rem;
  border-radius: 0.5rem; overflow-x: auto; margin: 0.5rem 0; font-size: 0.85em;
}
.markdown-body code {
  background-color: rgba(100, 100, 100, 0.2); padding: 0.1rem 0.3rem;
  border-radius: 0.2rem; font-family: monospace; font-size: 0.9em;
}
.bg-indigo-600 .markdown-body pre { background-color: rgba(0, 0, 0, 0.3); }
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.1s ease-out forwards;
}
/* 思考中动画 */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
}
.typing-dot {
  width: 6px;
  height: 6px;
  background-color: #8b5cf6; /* 紫色 */
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}
.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}
</style>
