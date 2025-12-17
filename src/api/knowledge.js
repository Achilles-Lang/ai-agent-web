import request from '@/utils/request'

// 上传知识库文件
export function uploadKnowledgeFile(formData) {
    return request({
        url: '/knowledge/upload', // 对应网关转发后的路径
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data' // 必须指定，否则传不了文件
        }
    })
}
