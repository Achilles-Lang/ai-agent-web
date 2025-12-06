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
