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
    if (res.status === 401) {
        sessionStorage.removeItem('jwt');
        generateWarningPopUp("Please authenticate!", res.status);
        window.location.href = "/";
    } else if (!res.ok) {
        console.log(res.body);
        generateWarningPopUp(await res.text(), res.status);
        console.error('Error:', res.text());
    }
    return res;
}
