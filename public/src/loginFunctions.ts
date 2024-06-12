import {baseURL, generateWarningPopUp, send} from "./sendUtils";

const ELEMENTS = {
    switchModeToLogin: document.getElementById("switch-to-login") as HTMLElement,
    switchModeToSignUp: document.getElementById("switch-to-signup") as HTMLElement,
    switchModeToResetPassword: document.getElementById("switch-to-reset-password") as HTMLElement,
    loginWrapper: document.getElementById("login-wrapper") as HTMLElement,
    signupWrapper: document.getElementById("signup-wrapper") as HTMLElement,
    loginEmailInput: document.getElementById("login-email") as HTMLInputElement,
    loginPasswordInput: document.getElementById("login-password") as HTMLInputElement,
    signUpButton: document.getElementById("sign-up-button") as HTMLInputElement,
    loginButton: document.getElementById("login-button") as HTMLInputElement,
    signUpEmailInput: document.getElementById("signup-email") as HTMLInputElement,
    signUpPasswordInput: document.getElementById("signup-password") as HTMLInputElement,
    signUpUsernameInput: document.getElementById("signup-username") as HTMLInputElement,
    logoutButton: document.getElementById("logout-button") as HTMLElement,
    resetPasswordWrapper: document.getElementById("reset-password-wrapper") as HTMLElement,
    resetPasswordButton: document.getElementById("reset-password-button") as HTMLInputElement,
    verificationCodeWrapper: document.getElementById("verification-code-wrapper") as HTMLElement,
    verificationCodeInput: document.getElementById("verification-code") as HTMLInputElement,
    verificationCodeButton: document.getElementById("verification-code-button") as HTMLInputElement,
    newPasswordWrapper: document.getElementById("new-password-wrapper") as HTMLElement,
    newPasswordInput: document.getElementById("new-password") as HTMLInputElement,
    newPasswordButton: document.getElementById("new-password-button") as HTMLInputElement,
    backButtonLogin: document.getElementById("back-button-login") as HTMLElement,
    backButtonResetPassword: document.getElementById("back-button-reset-pass") as HTMLElement,
    backButtonVerificationCode: document.getElementById("back-button-verification-code") as HTMLElement
};
const overlay = document.createElement("div");
overlay.className = "overlay";

ELEMENTS.switchModeToLogin.addEventListener("click", switchToLogin);
ELEMENTS.switchModeToSignUp.addEventListener("click", switchToSignUp);
ELEMENTS.switchModeToResetPassword.addEventListener("click", switchToResetPassword);
ELEMENTS.signUpButton.addEventListener("click", handleSignUp);
ELEMENTS.loginButton.addEventListener("click", handleLogin);
ELEMENTS.loginWrapper.addEventListener("keydown", event => event.key === "Enter" && handleLogin());
ELEMENTS.signupWrapper.addEventListener("keydown", event => event.key === "Enter" && handleSignUp());
ELEMENTS.resetPasswordButton.addEventListener("click", handleResetPassword);
ELEMENTS.verificationCodeButton.addEventListener("click", handleVerificationCode);
ELEMENTS.newPasswordButton.addEventListener("click", handleNewPassword);
ELEMENTS.backButtonLogin.addEventListener("click", e => window.location.href = "/");
ELEMENTS.backButtonResetPassword.addEventListener("click", e => {
    ELEMENTS.verificationCodeWrapper.style.display = "none";
    switchToResetPassword();
});
ELEMENTS.backButtonVerificationCode.addEventListener("click", async e => {
    ELEMENTS.newPasswordWrapper.style.display = "none";
    await handleResetPassword();
});
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
function switchToResetPassword() {
    ELEMENTS.loginWrapper.style.display = "none";
    ELEMENTS.signupWrapper.style.display = "none";
    ELEMENTS.resetPasswordWrapper.style.display = "block";
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

async function handleResetPassword(){
    const email = (document.getElementById("reset-password-email") as HTMLInputElement).value;
    const res = await send("http://localhost:2000/api/resetPassword/mail", "PUT", {email});
    if (res.ok) {
        localStorage.setItem('resetMail', email);
        ELEMENTS.resetPasswordWrapper.style.display = "none";
        ELEMENTS.verificationCodeWrapper.style.display = "block";
    } else {
        generateWarningPopUp(res.status, "Reset password failed", res.statusText)
    }
}
async function handleVerificationCode(){
    const code = ELEMENTS.verificationCodeInput.value;
    const res = await send("http://localhost:2000/api/resetPassword/code/" + localStorage.getItem("resetMail") as string, "GET")
    const resetCode = await res.text();
    if (code === resetCode) {
        ELEMENTS.verificationCodeWrapper.style.display = "none";
        ELEMENTS.newPasswordWrapper.style.display = "block";
        await send("http://localhost:2000/api/resetPassword/mail", "DELETE", {email: localStorage.getItem("resetMail") as string});
    }
    else {
        generateWarningPopUp(401, "Invalid code", "The code you entered is invalid");
    }
}
function handleNewPassword(){
    const newPassword = ELEMENTS.newPasswordInput.value;
    const email = localStorage.getItem('resetMail');
    send("http://localhost:2000/api/user/resetPassword", "PATCH", {email: email, password: newPassword}).then(res => {
        if (res.ok) {
            ELEMENTS.newPasswordWrapper.style.display = "none";
            ELEMENTS.loginWrapper.style.display = "block";
        } else {
            generateWarningPopUp(res.status, "Password reset failed", res.stautsText)
        }
    });
}

export function logout(){
    localStorage.removeItem("jwt");
    localStorage.removeItem("mail");
    localStorage.removeItem("timestamp");
    localStorage.removeItem("username");
    window.location.href = "/";
}