import {logout} from "./loginFunctions";

export const baseURL = "http://localhost:2000";
let retryCount = 0;
export function generateWarningPopUp(errorCode: number, errorName: string, errorMessage: string): void {
    alert("Error " + errorCode + ": " + errorName + "\n" + errorMessage);
}

export const LOGIN_ROUTE = baseURL + "/api/login";
export async function send(route: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): Promise<any> {
    let options: RequestInit = setupOptions(method, data);
    const res = await fetch(route, options);
    return handleResponse(res, route, method, data);
}


function setupOptions(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): RequestInit {
    let options: RequestInit = {method};
    options.headers = {"Content-Type": "application/json"};
    const jwt = localStorage.getItem('jwt');
    if (jwt !== null) {
        options.headers['Authorization'] = `Bearer ${jwt}`;
    }
    if (data) {
        options.body = JSON.stringify(data);
    }
    return options;
}

async function handleResponse(res: Response, route: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): Promise<any> {
    if (res.status === 401 && route !== LOGIN_ROUTE) {
        return handleUnauthorized(res, route, method, data);
    } else if (!res.ok) {
        return handleUnsuccessfulResponse(res);
    }
    retryCount = 0;
    return res;
}

async function handleUnauthorized(res: Response, route: string, method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", data?: object): Promise<any> {
    retryCount = 0;
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
        const errorMessage = await refreshTokenRes.text();
        console.error('Error:', errorMessage);
        logout();
        // Redirect the user to the login page
        window.location.href = "/";
        return refreshTokenRes;
    }
}

async function handleUnsuccessfulResponse(res: Response): Promise<any> {
    retryCount = 0;
    console.log(res.statusText);
    generateWarningPopUp(res.status, res.statusText, await res.text());
}