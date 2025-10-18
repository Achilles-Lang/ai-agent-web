export async function chat(request) {
    return await fetch(
        `http://localhost:8123/api/chat/stream/chat`, // 注意编码参数避免特殊字符问题
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: request
        }
    );
}
