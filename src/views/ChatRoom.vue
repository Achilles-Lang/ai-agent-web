<template>
  <div class="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50">
    <quiz-header></quiz-header>

    <main class="flex-grow flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-white dark:bg-slate-800">
      <div class="flex h-full w-full border-t border-slate-200 dark:border-slate-700">

        <div class="w-64 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-700 flex flex-col flex-shrink-0">
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
              <div v-for="msg in messages" :key="msg.id"
                   class="flex gap-4 group relative mb-6"
                   :class="msg.senderId == myUserId ? 'flex-row-reverse' : ''">

                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                     :class="getAvatarColor(msg.senderName)"
                     @contextmenu.prevent="msg.senderId === 0 ? openAiContextMenu($event, findAiByName(msg.senderName)) : null">
                  {{ msg.senderName ? msg.senderName.charAt(0) : '?' }}
                </div>

                <div class="max-w-[80%] sm:max-w-[70%] flex flex-col relative"
                     :class="msg.senderId == myUserId ? 'items-end' : 'items-start'">

                  <div class="text-xs text-slate-500 mb-1" :class="msg.senderId == myUserId ? 'text-right' : ''">
                    {{ msg.senderName }}
                  </div>

                  <div
                      :id="'msg-' + msg.id"
                      class="p-3 rounded-2xl shadow-sm text-sm leading-relaxed break-words markdown-body transition-all relative overflow-hidden"
                      :class="msg.senderId == myUserId
                        ? 'bg-indigo-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-tl-none'"
                      @contextmenu.prevent="openMsgContextMenu($event, msg)"
                  >

                    <div v-if="msg.replyToMessage"
                         @click.stop="scrollToMessage(msg.replyToId)"
                         class="mb-2 rounded-md cursor-pointer overflow-hidden flex max-w-full select-none transition-colors"
                         :class="msg.senderId == myUserId
                            ? 'bg-white/20 hover:bg-white/30'
                            : 'bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800'"
                    >
                      <div class="w-1 min-w-[4px] self-stretch"
                           :class="msg.senderId == myUserId ? 'bg-white' : 'bg-indigo-500'">
                      </div>

                      <div class="flex-1 flex flex-col py-1 px-2 min-w-0">
                        <span class="text-xs font-bold truncate"
                              :class="msg.senderId == myUserId ? 'text-indigo-50' : 'text-indigo-600 dark:text-indigo-400'">
                          {{ msg.replyToMessage.senderName }}
                        </span>

                        <div class="text-xs opacity-90 line-clamp-2 break-all whitespace-normal"
                             :class="msg.senderId == myUserId ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'">

                          <span v-if="msg.replyToMessage.type === 'IMAGE'" class="flex items-center gap-1">
                            <i class="fa fa-photo"></i> 图片
                          </span>

                          <span v-else>
                            {{ getQuoteText(msg) }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div v-if="msg.type === 'IMAGE'" class="mt-1">
                      <img :src="msg.content" class="rounded-lg max-w-full cursor-pointer hover:opacity-90" @click="previewImage(msg.content)">
                    </div>
                    <div v-else-if="msg.type === 'THINKING'" class="typing-indicator">
                      <span class="text-xs opacity-70 mr-2">思考中</span>
                      <div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>
                    </div>
                    <div v-else v-html="renderMarkdown(msg.content)"></div>

                  </div>

                  <div v-if="msg.reactions && msg.reactions.length > 0"
                       class="flex flex-wrap gap-1.5 mt-1.5 px-1"
                       :class="msg.senderId == myUserId ? 'justify-end' : 'justify-start'">

                    <button
                        v-for="(react, idx) in msg.reactions"
                        :key="idx"
                        @click="handleReaction(react.emoji, msg)"
                        class="group flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-indigo-400 rounded-full shadow-sm transition-all hover:-translate-y-0.5"
                    >
                      <span class="text-base leading-none">{{ react.emoji }}</span>
                      <span class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 leading-none">
                        {{ react.count }}
                      </span>
                    </button>

                  </div>

                </div>
              </div>
            </template>

          </div>

          <div class="p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div v-if="replyingTo"
                 class="mb-3 mx-auto max-w-4xl flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-xl border-l-4 border-indigo-500 animate-fade-in-up shadow-sm">
              <div class="flex flex-col overflow-hidden mr-3">
      <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 mb-0.5">
        <i class="fa fa-reply mr-1"></i> 回复 {{ replyingTo.senderName }}
      </span>
                <span class="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-md">
        {{ replyingTo.content }}
      </span>
              </div>
              <button @click="cancelReply" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-400 hover:text-slate-600 transition-colors">
                <i class="fa fa-times"></i>
              </button>
            </div>
            <div class="flex gap-4 max-w-4xl mx-auto">
              <input
                  type="file"
                  ref="fileInput"
                  accept="image/*"
                  class="hidden"
                  @change="handleFileChange"
              >

              <button
                  @click="triggerFileUpload"
                  :disabled="!currentRoom"
                  class="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
                  title="发送图片"
              >
                <i class="fa fa-picture-o text-xl"></i>
              </button>
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
                 @contextmenu.prevent="openAiContextMenu($event, ai)"
                 class="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 group cursor-pointer relative transition-colors">
              <div class="flex items-center gap-3 min-w-0 flex-1">
                <div class="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-sm shadow-sm"
                     :class="getAvatarColor(ai.aiName)">
                  {{ ai.aiName.charAt(0) }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-medium truncate flex items-center gap-1">
                    {{ ai.aiName }}
                    <i v-if="ai.isPinned" class="fa fa-thumb-tack text-xs text-indigo-500 rotate-45" title="置顶"></i>
                  </p>
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
      <div v-if="msgContextMenu.visible"
           class="fixed z-50 flex flex-col gap-2 animate-scale-in origin-top-left"
           :style="{ top: msgContextMenu.y + 'px', left: msgContextMenu.x + 'px' }">

        <div class="bg-white dark:bg-slate-800 rounded-full shadow-xl border border-slate-200 dark:border-slate-700 p-1.5 flex gap-1 items-center mx-auto">
          <button v-for="emoji in reactionEmojis" :key="emoji"
                  @click.stop="handleReaction(emoji)"
                  class="w-9 h-9 flex items-center justify-center text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-transform hover:scale-125">
            {{ emoji }}
          </button>
        </div>

        <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 min-w-[180px] flex flex-col overflow-hidden text-sm">
          <button @click="handleMenuAction('reply')" class="px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3">
            <i class="fa fa-reply w-4 text-slate-400"></i> 回复 (Reply)
          </button>
          <button @click="handleMenuAction('copy')" class="px-4 py-2.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3">
            <i class="fa fa-clone w-4 text-slate-400"></i> 复制 (Copy)
          </button>
          <div class="my-1 border-t border-slate-100 dark:border-slate-700"></div>
          <button @click="handleMenuAction('delete')" class="px-4 py-2.5 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3">
            <i class="fa fa-trash-o w-4"></i> 删除 (Delete)
          </button>
        </div>
      </div>
      <div v-if="aiContextMenu.visible"
           class="fixed z-50 w-44 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden py-1.5 animate-scale-in origin-top-left"
           :style="{ top: aiContextMenu.y + 'px', left: aiContextMenu.x + 'px' }">

        <button @click="handleAiAction('pin')" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors">
          <i class="fa w-4 text-center" :class="aiContextMenu.ai?.isPinned ? 'fa-thumb-tack text-indigo-500' : 'fa-thumb-tack text-slate-400'"></i>
          {{ aiContextMenu.ai?.isPinned ? '取消置顶' : '置顶成员' }}
        </button>

        <button @click="handleAiAction('edit')" class="w-full text-left px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors">
          <i class="fa fa-cog w-4 text-center text-slate-400"></i>
          查看资料 / 设置
        </button>

        <div class="my-1 border-t border-slate-100 dark:border-slate-700"></div>

        <button @click="handleAiAction('delete')" class="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-3 transition-colors">
          <i class="fa fa-trash-o w-4 text-center"></i>
          移除该 AI
        </button>
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
                <option value="wanx-v1">wanx-v1(绘画专用）</option>
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


    <div v-if="showCreateRoomModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100 animate-scale-in">

        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm"><i class="fa fa-plus"></i></span>
            创建新房间
          </h3>
          <button @click="showCreateRoomModal = false" class="text-slate-400 hover:text-slate-600"><i class="fa fa-times text-lg"></i></button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">房间名称 <span class="text-red-500">*</span></label>
            <input v-model="createRoomForm.roomName" type="text" placeholder="给房间起个响亮的名字" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">房间简介</label>
            <textarea v-model="createRoomForm.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none" placeholder="介绍一下这个群聊的主题..."></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">群头像 (图片URL)</label>
            <div class="flex gap-3">
              <input v-model="createRoomForm.avatar" type="text" placeholder="https://example.com/image.png" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              <div class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <img v-if="createRoomForm.avatar" :src="createRoomForm.avatar" class="w-full h-full object-cover" @error="e=>e.target.style.display='none'">
                <i v-else class="fa fa-image text-slate-400"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="showCreateRoomModal = false" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">取消</button>
          <button @click="confirmCreateRoom" :disabled="!createRoomForm.roomName.trim()" class="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <i class="fa fa-check"></i> 创建
          </button>
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
    <div v-if="showEditRoomModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100 animate-scale-in">

        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="fa fa-cog text-indigo-500"></i> 房间设置
          </h3>
          <button @click="showEditRoomModal = false" class="text-slate-400 hover:text-slate-600"><i class="fa fa-times text-lg"></i></button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">房间名称 <span class="text-red-500">*</span></label>
            <input v-model="editRoomForm.roomName" type="text" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">房间简介</label>
            <textarea v-model="editRoomForm.description" rows="3" class="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"></textarea>
          </div>

          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">群头像 (图片URL)</label>
            <div class="flex gap-3">
              <input v-model="editRoomForm.avatar" type="text" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
              <div class="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                <img v-if="editRoomForm.avatar" :src="editRoomForm.avatar" class="w-full h-full object-cover" @error="e=>e.target.style.display='none'">
                <i v-else class="fa fa-image text-slate-400"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="showEditRoomModal = false" class="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors">取消</button>
          <button @click="submitEditRoom" class="px-5 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-2">
            <i class="fa fa-save"></i> 保存修改
          </button>
        </div>

      </div>
    </div>
    <div v-if="showEditAiModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden transform transition-all scale-100">
        <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h3 class="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <i class="fa fa-cog text-indigo-500"></i> 配置 AI
          </h3>
          <button @click="showEditAiModal = false" class="text-slate-400 hover:text-slate-600"><i class="fa fa-times text-lg"></i></button>
        </div>

        <div class="p-6 space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">AI 昵称</label>
            <input v-model="editAiForm.aiName" type="text" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">核心人设 (System Prompt)</label>
            <textarea v-model="editAiForm.systemPrompt" rows="4" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">模型</label>
              <select v-model="editAiForm.modelName" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="qwen-plus">通义千问</option>
                <option value="deepseek-v3">DeepSeek-V3</option>
                <option value="deepseek-r1">DeepSeek-R1</option>
                <option value="wanx-v1">wanx-v1 (绘画)</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">API Key (可选)</label>
              <input v-model="editAiForm.apiKey" type="password" placeholder="留空则保持原样" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>
        </div>

        <div class="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-3">
          <button @click="showEditAiModal = false" class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">取消</button>
          <button @click="submitEditAi" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md">保存配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue';
import QuizHeader from "@/components/QuizHeader.vue";
import { createRoom, getRoomList, sendMessage, getHistoryMessages, addAiToRoom, getRoomAiList, deleteRoomAi, deleteRoom, pinRoom, renameRoom, updateRoom,pinRoomAi,updateRoomAi } from "@/api/room.js";
import { submitFeedback } from "@/api/feedback.js";
import MarkdownIt from 'markdown-it';
const aiContextMenu = ref({ visible: false, x: 0, y: 0, ai: null });
const showEditAiModal = ref(false);
const editAiForm = ref({}); // 存储编辑数据
const showCreateRoomModal = ref(false);
const findAiByName = (name) => {
  return activeAiList.value.find(ai => ai.aiName === name);
};

// 1. 打开 AI 右键菜单
const openAiContextMenu = (e, ai) => {
  if (!ai) return;
  // 关闭其他菜单
  closeAllMenus();

  aiContextMenu.value = {
    visible: true,
    x: e.clientX,
    y: e.clientY,
    ai: ai
  };
};

// 2. 处理菜单点击
const handleAiAction = async (action) => {
  const ai = aiContextMenu.value.ai;
  if (!ai) return;
  closeAllMenus();

  switch (action) {
    case 'pin':
      try {
        await pinRoomAi(ai.id);
        await loadRoomAis(); // 刷新列表，后端会重新排序
      } catch (e) { alert("操作失败"); }
      break;

    case 'edit':
      // 填充表单
      editAiForm.value = { ...ai }; // 浅拷贝
      showEditAiModal.value = true;
      break;

    case 'delete':
      openDeleteModal(ai); // 复用你已有的删除逻辑
      break;
  }
};

// 3. 提交编辑
const submitEditAi = async () => {
  try {
    await updateRoomAi(editAiForm.value);
    showEditAiModal.value = false;
    alert("配置已更新");
    await loadRoomAis(); // 刷新列表
  } catch (e) {
    console.error(e);
    alert("更新失败");
  }
};

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
// 跳转到指定消息
const scrollToMessage = (msgId) => {
  const targetId = 'msg-' + msgId;
  const element = document.getElementById(targetId);

  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element.classList.add('animate-pulse-highlight');
    setTimeout(() => {
      element.classList.remove('animate-pulse-highlight');
    }, 1500);
  } else {
    // [修改文案] 明确告知用户原因
    alert("无法跳转：原消息太久远，未加载在当前列表中。");
  }
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

// 隐藏文件输入框引用
const fileInput = ref(null);
// 文件选择
const triggerFileUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  } else {
    console.error("找不到文件输入框组件");
  }};
// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 限制一下大小，防止数据库爆炸 (比如限制 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert("图片太大啦，请上传 2MB 以内的图片");
    return;
  }

  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64Content = e.target.result;

    try {
      // 发送图片消息
      await sendMessage({
        roomId: currentRoom.value.id,
        senderId: myUserId,
        senderName: userInfo.nickname || 'User' + myUserId,
        content: base64Content,
        type: 'IMAGE'
      });
      await loadMessages();
      scrollToBottom();
    } catch (err) {
      console.error(err);
      alert("图片发送失败");
    }
  };
  reader.readAsDataURL(file);
  event.target.value = '';
};
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
// 状态
const replyingTo = ref(null);

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
const handleCreateRoom = () => {
  // 重置表单
  createRoomForm.value = { roomName: '', description: '', avatar: '' };
  // 打开弹窗
  showCreateRoomModal.value = true;
};

// --- 添加 confirmCreateRoom 函数 ---
const confirmCreateRoom = async () => {
  if (!createRoomForm.value.roomName.trim()) return;

  try {
    // 调用 API (注意：这里假设您已经更新了 api/room.js 以支持传对象，或者传多个参数)
    // 如果 api/room.js 还没改，需要去改一下
    await createRoom(createRoomForm.value);

    showCreateRoomModal.value = false;
    await loadRooms(); // 刷新列表

    // 自动选中新房间 (可选优化)
    // const newRoom = rooms.value[0]; // 假设新房间在最前面
    // if(newRoom) selectRoom(newRoom);

  } catch (e) {
    console.error(e);
    alert("创建失败，请检查网络");
  }
};
const createRoomForm = ref({
  roomName: '',
  description: '',
  avatar: ''
});
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

      // 【关键修复】保留点赞状态，但不要合并 temp_ 消息
      if (messages.value.length > 0) {
        newMessages.forEach(newMsg => {
          // 只把旧消息里的 reactions (点赞) 拷过来，防止闪烁
          const oldMsg = messages.value.find(m => m.id === newMsg.id);
          if (oldMsg && oldMsg.reactions) {
            newMsg.reactions = oldMsg.reactions;
          }
        });
      }

      // 【核心】直接覆盖！不要做任何拼接。
      // 这样服务器返回的“真消息”会自动替换掉本地的“假消息”，重复消失。
      messages.value = newMessages;

      // 只有第一次加载或消息变多时才滚动
      if (messages.value.length === 0 || newMessages.length > messages.value.length) {
        scrollToBottom();
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
const selectedQuote = ref('');
const handleMenuAction = async (action) => {
  const msg = msgContextMenu.value.message;
  if (!msg) return;
  closeAllMenus(); // 关闭菜单

  switch (action) {
    case 'reply':
      const selection = window.getSelection().toString();
      if (selection && selection.trim().length > 0) {
        selectedQuote.value = selection.trim();
      } else {
        selectedQuote.value = ''; // 没选中则引用全文
      }

      // 设置回复状态
      replyingTo.value = msg;
      // 聚焦输入框
      nextTick(() => {
        const input = document.querySelector('input[type="text"]'); // 确保选择器对
        if (input) input.focus();
      });
      break;

    case 'copy':
      try {
        await navigator.clipboard.writeText(msg.content);
        // 这里可以加个 toast 提示
      } catch (e) { alert("复制失败"); }
      break;

    case 'delete':
      if (confirm("确定删除这条消息吗？")) {
        try {
          // 1. 调用后端删除
          await deleteMessageApi(msg.id);
          // 2. 前端立刻移除 (视觉反馈)
          messages.value = messages.value.filter(m => m.id !== msg.id);
        } catch (e) {
          alert("删除失败");
        }
      }
      break;
  }
};
const handleSend = async () => {
  const content = inputContent.value.trim();
  if (!content || !currentRoom.value) return;

  const replyId = replyingTo.value ? replyingTo.value.id : null;
  inputContent.value = "";
  replyingTo.value = null;

  // ==========================================================
  // 【修复点】乐观更新：不等后端，自己先画一个
  // ==========================================================
  const tempId = 'temp_' + Date.now();
  const optimisticMsg = {
    id: tempId,
    roomId: currentRoom.value.id,
    senderId: myUserId,
    senderName: userInfo.nickname || '我',
    content: content,
    type: 'TEXT', // 必须大写，和后端枚举一致
    createTime: new Date().toISOString(),
    reactions: []
  };
  messages.value.push(optimisticMsg);
  scrollToBottom();
  const extraData = selectedQuote.value ? { quoteContent: selectedQuote.value } : null;
  try {
    await sendMessage({
      roomId: currentRoom.value.id,
      senderId: myUserId,
      senderName: userInfo.nickname || 'User' + myUserId,
      content: content,
      replyToId: replyId,
      extraData: extraData,
    });

    // 发送成功后，立即拉取一次，把 temp_ 消息替换为真消息
    await loadMessages();

  } catch (e) {
    // 失败回滚
    messages.value = messages.value.filter(m => m.id !== tempId);
    alert("发送失败");
  }
};
// --- 取消回复 ---
const cancelReply = () => {
  replyingTo.value = null;
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
// 获取引用文本（优先取截断内容，否则取全文）
const getQuoteText = (msg) => {
  try {
    if (msg.extraData) {
      // 兼容 extraData 已经是对象的情况（axios 自动解析）或 字符串的情况
      const data = typeof msg.extraData === 'string'
          ? JSON.parse(msg.extraData)
          : msg.extraData;

      if (data && data.quoteContent) {
        return data.quoteContent;
      }
    }
  } catch (e) {
    console.error("解析引用内容出错", e);
  }
  // 兜底：返回原消息全文
  return msg.replyToMessage?.content || '';
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
// 图片预览（简单版：新窗口打开）
const previewImage = (url) => {
  window.open(url, '_blank');
};
const handleLike = async (msg) => {
  try {
    await submitFeedback({
      messageId: msg.id,
      userId: myUserId,
      aiName: msg.senderName,
      score: 5,
      comment: "用户点赞"
    });
    alert("感谢您的反馈！");
  } catch (e) {
    console.error(e);
    alert("反馈失败");
  }
};
const msgContextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  message: null
});
const reactionEmojis = ['👍', '👎', '❤️', '🔥', '🥰', '👏', '😂'];
const openMsgContextMenu = (e,msg) => {
  closeContextMenu();

  let x = e.clientX;
  let y = e.clientY;

  msgContextMenu.value = {
    visible: true,
    x: x,
    y: y,
    message: msg
  };
};
const closeAllMenus = () => {
  contextMenu.value.visible = false; // 关闭房间菜单
  msgContextMenu.value.visible = false; // 关闭消息菜单
  aiContextMenu.value.visible = false;
};

// 3. 处理点赞逻辑
const handleReaction = async (emoji, targetMsg = null) => {
  // 确定是对哪条消息操作
  const msg = targetMsg || msgContextMenu.value.message;
  if (!msg) return;

  // 1. 初始化数组
  if (!msg.reactions) msg.reactions = [];

  // 2. 查找是否已经有点赞
  const existingReact = msg.reactions.find(r => r.emoji === emoji);

  if (existingReact) {
    // 如果有，数量+1
    existingReact.count++;
  } else {
    // 如果没有，新增一个
    msg.reactions.push({ emoji: emoji, count: 1 });
  }

  // 3. 关闭菜单
  closeAllMenus();

  // 4. 发送给后端 (虽然只用来统计，不影响前端展示)
  try {
    await submitFeedback({
      messageId: msg.id,
      userId: myUserId,
      aiName: msg.senderName,
      reaction: emoji,
      score: 5
    });
  } catch (e) {
    console.error("点赞保存失败", e);
  }
};

// 修改 onMounted 监听
onMounted(() => {
  loadRooms();
  window.addEventListener('click', closeAllMenus);
  window.addEventListener('contextmenu', (e) => {
    // 这里的逻辑稍微处理一下，防止默认菜单干扰，或者只在特定区域阻止
  });
});
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
/* 简单的弹跳动画 */
@keyframes bounce-in {
  0% { opacity: 0; transform: scale(0.5) translateY(10px); }
  100% { opacity: 1; transform: scale(1) translateY(0); }
}
.animate-bounce-in {
  animation: bounce-in 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.scale-in-center {
  animation: scale-in 0.2s cubic-bezier(0.250, 0.460, 0.450, 0.940) both;
}
@keyframes scale-in {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes highlight {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); filter: brightness(1.1); }
}
.animate-pulse-highlight {
  animation: highlight 0.5s ease-in-out 2; /* 闪烁两次 */
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.5); /* 增加发光效果 */
  z-index: 10;
}
</style>
