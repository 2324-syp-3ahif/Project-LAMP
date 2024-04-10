export function generateWarningPopUp(message: string, errorCode: number): void{
    alert("Error " + errorCode + ": " + message);
}
export async function send(route: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): Promise<any> {
    let options: RequestInit = { method };
    options.headers = { "Content-Type": "application/json" };
    const jwt = sessionStorage.getItem('jwt');
    if (jwt !== null) {
        options.headers['Authorization'] = `Bearer ${jwt}`;
    }
    if (data) {
        options.body = JSON.stringify(data);
    }
    const res = await fetch(route, options);
    if (!res.ok) {
        const error = new Error(`${method} ${res.url} ${res.status} (${res.statusText})`);
        throw error;
    }
    return res;
}
