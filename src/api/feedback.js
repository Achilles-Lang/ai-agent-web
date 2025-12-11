import request from '@/utils/request'

// 提交反馈
export function submitFeedback(data) {
    return request({
        url: '/feedback/submit',
        method: 'post',
        data: data
    })
}
