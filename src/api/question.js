import request from '@/utils/request'

// 获取单个问题
export function createQuestion(prompt) {
    return request({
        url: 'api/question/create',
        method: 'get',
        params: { "prompt": prompt }
    })
}
