import request from '@/utils/request'

// 上传知识库文件
export function uploadKnowledgeFile(formData) {
    return request({
        url: '/knowledge/upload',
        method: 'post',
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // [新增] 单独设置这个请求的超时时间为 60秒 (原默认是5秒)
    })
}
