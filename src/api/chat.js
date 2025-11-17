export async function chat(request) {
    const token = localStorage.getItem('USER_TOKEN');
    return await fetch(
        `http://localhost:8081/question/stream/chat`, // 注意编码参数避免特殊字符问题
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + token
            },
            body: request
        }
    );
}
