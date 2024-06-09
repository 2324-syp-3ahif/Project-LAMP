export const baseURL = "http://localhost:2000";

export function generateWarningPopUp(errorCode: number, errorName: string, errorMessage: string): void {
    alert("Error " + errorCode + ": " + errorName + "\n" + errorMessage);
}

export const LOGIN_ROUTE = baseURL + "/api/login";
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
    if (res.status === 401 && route !== LOGIN_ROUTE) {
        const refreshTokenRes = await fetch( baseURL + "/api/token/refresh", {
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
            generateWarningPopUp(refreshTokenRes.status, refreshTokenRes.statusText, await refreshTokenRes.text());

            // Redirect the user to the login page
            window.location.href = "/";
            return refreshTokenRes;
        }
    } else if (!res.ok) {
        generateWarningPopUp(res.status, res.statusText, await res.text());
    }
    return res;
}