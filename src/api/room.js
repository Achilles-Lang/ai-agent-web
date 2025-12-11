import request from '@/utils/request'

// 1. 创建一个新房间
export function createRoom(name) {
    const userId = localStorage.getItem('USER_ID');
    return request({
        url: '/room/create',
        method: 'post',
        params: {
            name: name,
            userId: userId
        }
    })
}

// 2. 获取所有房间列表
export function getRoomList() {
    return request({
        url: '/room/list',
        method: 'get'
    })
}

// 3. 发送一条消息
export function sendMessage(messageData) {
    return request({
        url: '/room/send',
        method: 'post',
        data: messageData
    })
}

// 4. 获取某个房间的历史消息
export function getHistoryMessages(roomId) {
    return request({
        url: '/room/messages',
        method: 'get',
        params: { roomId }
    })
}
// 5.添加AI角色到房间
export function addAiToRoom(data) {
    return request({
        url:'room/addAi',
        method:'post',
        data: data
    })
}
// 6. 获取房间内的 AI 列表
export function getRoomAiList(roomId) {
    return request({
        url: '/room/ai/list',
        method: 'get',
        params: { roomId }
    })
}
// 7. 移除 AI 角色
export function deleteRoomAi(aiId) {
    return request({
        url: '/room/ai/delete',
        method: 'delete',
        params: { aiId }
    })
}
// 8. 删除房间
export function deleteRoom(roomId) {
    return request({
        url: '/room/delete',
        method: 'delete',
        params: { roomId }
    })
}
// 9. 修改房间名
export function renameRoom(roomId, newName) {
    return request({
        url: '/room/rename',
        method: 'put',
        params: { roomId, newName }
    })
}

// 10. 置顶/取消置顶
export function pinRoom(roomId) {
    return request({
        url: '/room/pin',
        method: 'put',
        params: { roomId }
    })
}
// 11. 更新房间信息
export function updateRoom(data) {
    return request({
        url: '/room/update',
        method: 'post',
        data: data
    })
}
// [新增] 删除消息
export function deleteMessageApi(msgId) {
    return request({
        url: '/room/message/delete',
        method: 'delete',
        params: { msgId }
    })
}
