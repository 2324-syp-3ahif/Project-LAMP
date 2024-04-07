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
        console.error('Error:', res.status);
        generateWarningPopUp(res.statusText, res.status);
    }
    if (res.status !== 204 && res.status !== 201 && res.status !== 200) {
        return await res.json();
    }
    return res;
}
