export function generateWarningPopUp(message: string, errorCode: number): void{
    alert("Error " + errorCode + ": " + message);
}
export async function send(route: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): Promise<any> {
    let options: RequestInit = { method };
    if (data) {
        options.headers = { "Content-Type": "application/json" };
        options.body = JSON.stringify(data);
    }
    const res = await fetch(route, options);
    if (!res.ok) {
        throw new Error(`${method} ${res.url} ${res.status} (${res.statusText})`);
    }
    if (res.status !== 204) {
        return await res.json();
    }
}
