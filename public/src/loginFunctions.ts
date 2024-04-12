import {load} from "./tasklistFunctions";
import {generateWarningPopUp, send} from "./sendUtils";
import {response} from "express";
import {StatusCodes} from "http-status-codes";

const switchModeToLogin = document.getElementById("switch-to-login") as HTMLElement;
const switchModeToSignUp = document.getElementById("switch-to-signup") as HTMLElement;
const loginWrapper = document.getElementById("login-wrapper") as HTMLElement;
const signupWrapper = document.getElementById("signup-wrapper") as HTMLElement;
const overlay = document.createElement("div");
const loginEmailInput = document.getElementById("login-email") as HTMLInputElement;
const loginPasswordInput = document.getElementById("login-password") as HTMLInputElement;
const signUpButton = document.getElementById("sign-up-button") as HTMLInputElement;
const loginButton = document.getElementById("login-button") as HTMLInputElement;
const signUpEmailInput = document.getElementById("signup-email") as HTMLInputElement;
const signUpPasswordInput = document.getElementById("signup-password") as HTMLInputElement;
const signUpUsernameInput = document.getElementById("signup-username") as HTMLInputElement;
let mail: string = "";

console.log("in login");

overlay.className = "overlay";

switchModeToLogin.addEventListener("click", () => {
    signupWrapper.style.display = "none";
    loginWrapper.style.display = "block";
});
switchModeToSignUp.addEventListener("click", () => {
    loginWrapper.style.display = "none";
    signupWrapper.style.display = "block";
});
window.onload = () => {
    if (sessionStorage.getItem('jwt') === null) {
        // (document.querySelector("footer") as HTMLElement).style.display = "none";
        loginWrapper.style.display = "block";
        document.body.appendChild(overlay);
    }
}
signUpButton.addEventListener("click", async () => await handleSignUp());
loginButton.addEventListener("click", async () => await handleLogin());

async function handleLogin(){
        const response = await send("http://localhost:2000/api/login", "POST", {
            email: loginEmailInput.value,
            password: loginPasswordInput.value
        });
        if (response.ok) {
            const accessToken = (await response.json()).accessToken;
            if (accessToken !== null) {
                sessionStorage.setItem('jwt', accessToken);
                mail = loginEmailInput.value;
                loginWrapper.style.display = "none";
                overlay.style.display = "none";
                await load(mail);
            }
        }
        else {
            generateWarningPopUp("Login failed", response.status)
        }
}
async function handleSignUp(){
    const response = await send("http://localhost:2000/api/register", "POST", {
            username: signUpUsernameInput.value,
            email: signUpEmailInput.value,
            password: signUpPasswordInput.value
    });
    if (response.ok) {
        signupWrapper.style.display = "none";
        loginWrapper.style.display = "block";
    } else {
        generateWarningPopUp("Sign up failed", response.status)
    }
}
function logout(){
    sessionStorage.removeItem("jwt");
    window.location.href = "/";
}
