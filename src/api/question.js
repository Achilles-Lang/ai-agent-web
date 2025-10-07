import request from '@/utils/request'

// 获取单个问题
export function createQuestion(prompt) {
    return request({
        url: 'api/question/create',
        method: 'get',
        params: {"prompt": prompt}
    })
}

export function generateQuestionBank(quizRequest) {
    return request({
        url: 'api/question-bank/generate',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        data: quizRequest
    })
}

export function queryTaskStatus(taskId) {
    return request({
        url: 'api/question-bank/task/status',
        method: 'get',
        params: {
            'taskId': taskId
        }
    })
}

export function getQuestionBank(bankId) {
    return request({
        url: `/api/question-bank/${bankId.value}`,
        method: 'get'
    })
}
