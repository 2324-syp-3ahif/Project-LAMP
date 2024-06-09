import {baseURL, generateWarningPopUp, send} from "./sendUtils";

const ELEMENTS = {
    switchModeToLogin: document.getElementById("switch-to-login") as HTMLElement,
    switchModeToSignUp: document.getElementById("switch-to-signup") as HTMLElement,
    loginWrapper: document.getElementById("login-wrapper") as HTMLElement,
    signupWrapper: document.getElementById("signup-wrapper") as HTMLElement,
    loginEmailInput: document.getElementById("login-email") as HTMLInputElement,
    loginPasswordInput: document.getElementById("login-password") as HTMLInputElement,
    signUpButton: document.getElementById("sign-up-button") as HTMLInputElement,
    loginButton: document.getElementById("login-button") as HTMLInputElement,
    signUpEmailInput: document.getElementById("signup-email") as HTMLInputElement,
    signUpPasswordInput: document.getElementById("signup-password") as HTMLInputElement,
    signUpUsernameInput: document.getElementById("signup-username") as HTMLInputElement,
    logoutButton: document.getElementById("logout-button") as HTMLElement
};
const overlay = document.createElement("div");
overlay.className = "overlay";

ELEMENTS.switchModeToLogin.addEventListener("click", switchToLogin);
ELEMENTS.switchModeToSignUp.addEventListener("click", switchToSignUp);
ELEMENTS.signUpButton.addEventListener("click", handleSignUp);
ELEMENTS.loginButton.addEventListener("click", handleLogin);
ELEMENTS.loginWrapper.addEventListener("keydown", event => event.key === "Enter" && handleLogin());
ELEMENTS.signupWrapper.addEventListener("keydown", event => event.key === "Enter" && handleSignUp());

let load = async function (mail: string): Promise<void> {

}

export async function handlePageLoad(func: (mail: string) => Promise<void>) {
    load = func;
    const token = localStorage.getItem('jwt');
    const timestamp = localStorage.getItem('timestamp');
    if (token && timestamp) {
        const currentTime = new Date().getTime();
        const sessionTime = Number(timestamp) + 45 * 60 * 1000; // 30 minutes
        if (currentTime < sessionTime) {
            const isTokenValid = await verifyToken();
            if (isTokenValid) {
                await setLogoutDetails(localStorage.getItem('mail') as string, localStorage.getItem('username') as string);
                await func(localStorage.getItem('mail') as string);
                return;
            }
        } else {
            // Session expired
            localStorage.removeItem('jwt');
            localStorage.removeItem('timestamp');
            localStorage.removeItem('mail');
        }
    }
    displayLogin();
}

async function verifyToken(): Promise<boolean> {
    const res = await send(baseURL + "/api/token/verify", "GET");
    return res.ok;
}

function displayLogin() {
    ELEMENTS.loginWrapper.style.display = "block";
    document.body.appendChild(overlay);
}

function switchToLogin() {
    ELEMENTS.signupWrapper.style.display = "none";
    ELEMENTS.loginWrapper.style.display = "block";
}

function switchToSignUp() {
    ELEMENTS.loginWrapper.style.display = "none";
    ELEMENTS.signupWrapper.style.display = "block";
}

async function handleLogin(){
    const response = await send(baseURL + "/api/login", "POST", {
        email: ELEMENTS.loginEmailInput.value,
        password: ELEMENTS.loginPasswordInput.value
    });
    if (response.ok) {
        const { accessToken } = await response.json();
        if (accessToken) {
            localStorage.setItem('jwt', accessToken);
            localStorage.setItem('mail', ELEMENTS.loginEmailInput.value);
            localStorage.setItem('username', await send(baseURL + "/api/user/" + ELEMENTS.loginEmailInput.value, "GET").then(res => res.json()).then(data => data.username) as string);
            localStorage.setItem('timestamp', new Date().getTime().toString());
            ELEMENTS.loginWrapper.style.display = "none";
            overlay.style.display = "none";
            await setLogoutDetails(localStorage.getItem('mail') as string, localStorage.getItem('username') as string);
            await load(localStorage.getItem('mail') as string);
        }
    }
}

async function handleSignUp(){
    const response = await send(baseURL + "/api/register", "POST", {
        username: ELEMENTS.signUpUsernameInput.value,
        email: ELEMENTS.signUpEmailInput.value,
        password: ELEMENTS.signUpPasswordInput.value
    });
    if (response.ok) {
        const { accessToken } = await response.json();
        if (accessToken) {
            localStorage.setItem('jwt', accessToken);
            localStorage.setItem('mail', ELEMENTS.signUpEmailInput.value);
            localStorage.setItem('timestamp', new Date().getTime().toString());
            ELEMENTS.signupWrapper.style.display = "none";
            ELEMENTS.loginWrapper.style.display = "block";
        }
    }
}

async function setLogoutDetails(email: string, username: string) {
    const logoutEmail = document.getElementById("logout-email") as HTMLElement;
    const logoutUsername = document.getElementById("logout-username") as HTMLElement;
    ELEMENTS.logoutButton = document.getElementById("logout-button") as HTMLElement;
    if (logoutEmail && logoutUsername && ELEMENTS.logoutButton) {
        logoutEmail.innerHTML = email;
        logoutUsername.innerHTML = username;
        ELEMENTS.logoutButton.addEventListener("click", logout);
    } else {
        console.error("Could not find logoutEmail or logoutUsername elements");
    }
}

function logout(){
    localStorage.removeItem("jwt");
    localStorage.removeItem("mail");
    localStorage.removeItem("timestamp");
    localStorage.removeItem("username");
    window.location.href = "/";
}

