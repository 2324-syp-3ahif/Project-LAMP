import {send} from "./sendUtils";

const switchModeToLogin = document.getElementById("switch-to-login") as HTMLElement;
const switchModeToSignUp = document.getElementById("switch-to-signup") as HTMLElement;
const loginWrapper = document.getElementById("login-wrapper") as HTMLElement;
const signupWrapper = document.getElementById("signup-wrapper") as HTMLElement;
const overlay = document.createElement("div");
const footer = document.querySelector("footer") as HTMLElement;
const loginEmailInput = document.getElementById("login-email") as HTMLInputElement;
const loginPasswordInput = document.getElementById("login-password") as HTMLInputElement;
let loggedIn: boolean = false;
overlay.className = "overlay";
switchModeToLogin.addEventListener("click", () => {
    signupWrapper.style.display = "none";
    loginWrapper.style.display = "inline-block";
});
switchModeToSignUp.addEventListener("click", () => {
    loginWrapper.style.display = "none";
    signupWrapper.style.display = "inline-block";
});
window.onload = () => {
    if (!loggedIn) {
        footer.style.display = "none";
        loginWrapper.style.display = "inline-block";
        document.body.appendChild(overlay);
    }
}

document.getElementById("sign-up-button")?.addEventListener("click", async () => {
    const response = await send("http://localhost:2000/api/register", "POST", JSON.stringify({
        username: (document.getElementById("username") as HTMLInputElement).value,
        email: (document.getElementById("email") as HTMLInputElement).value,
        password: (document.getElementById("password") as HTMLInputElement).value
    }));
    if (response.status === 200) {
        window.location.href = "http://localhost:2000/";
        signupWrapper.style.display = "none";
        loginWrapper.style.display = "inline-block";
    }
    else {
        alert("Failed to create user");
    }
});
document.getElementById("login-button")?.addEventListener("click", async () => {
    console.log(loginEmailInput.value);
    const response = await send("http://localhost:2000/api/login", "POST", JSON.stringify({
        email: loginEmailInput.value,
        password: loginPasswordInput.value
    }));
    if (response.status === 200) {
        loggedIn = true;
        window.location.href = "http://localhost:2000/";
        footer.style.display = "block";
        loginWrapper.style.display = "none";
        overlay.style.display = "none";
    }
    else {
        alert("Failed to log in");
    }
});