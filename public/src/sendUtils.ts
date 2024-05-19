export function generateWarningPopUp(message: string, errorCode: number): void{
    alert("Error " + errorCode + ": " + message);
}
export async function send(route: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): Promise<any> {
    let options: RequestInit = {method};
    options.headers = {"Content-Type": "application/json"};
    const jwt = localStorage.getItem('jwt');
    if (jwt !== null) {
        options.headers['Authorization'] = `Bearer ${jwt}`;
    }
    if (data) {
        options.body = JSON.stringify(data);
    }
    const res = await fetch(route, options);
    if (res.status === 401) {
        const refreshTokenRes = await fetch("http://localhost:2000/api/token/refresh", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            credentials: 'include' // Include cookies in the request
        });
        if (refreshTokenRes.ok) {
            const newToken = await refreshTokenRes.json();
            localStorage.setItem('jwt', newToken.accessToken);
            return send(route, method, data);
        } else {
            console.error('Error:', await refreshTokenRes.text());
            generateWarningPopUp(await refreshTokenRes.text(), refreshTokenRes.status);
            // Redirect the user to the login page
            window.location.href = "/";
            return refreshTokenRes;
        }
    } else if (!res.ok) {
        const error = await res.text();
        console.log(res.body);
        console.error("Error: " + error);
        generateWarningPopUp(error, res.status);
    }
    return res;
}