import request from '@/utils/request'

export function generateQuestionBank(quizRequest) {
    return request({
        url: 'question/generate',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        data: quizRequest
    })
}

export function queryTaskStatus(taskId) {
    return request({
        url: 'question/task/status',
        method: 'get',
        params: {
            'taskId': taskId
        }
    })
}

export function getQuestionBank(bankId) {
    return request({
        url: `question/${bankId.value}`,
        method: 'get'
    })
}

export function getQuestionBanksByUserId(userId) {
    return request({
        url: 'question/user/banks',
        method: 'get',
        params: {
            'userId': userId
        }
    })
}
