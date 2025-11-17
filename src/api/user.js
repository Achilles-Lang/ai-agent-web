import request from "@/utils/request.js";

export function login(user) {
    return request({
        url: 'user/login',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        data: user
    })
}

export function register(user) {
    return request({
        url: 'user/register',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        data: user
    })
}

export function verify() {
    return request({
        url: 'user/verify',
        method: 'post'
    })
}

export function logout(userId) {
    return request({
        url: 'user/logout',
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'post',
        params: {"userId": userId}
    })
}

export function getUser(userId) {
    return request({
        url: 'user/get',
        method: 'get',
        params: {"userId": userId}
    })
}
