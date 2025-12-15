export async function chat(request) {
    const token = localStorage.getItem('USER_TOKEN');
    return await fetch(
        `http://localhost:8081/question/stream/chat`,
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
