import {send} from "./sendUtils";
import {load} from "./tasklistFunctions";

const switchModeToLogin = document.getElementById("switch-to-login") as HTMLElement;
const switchModeToSignUp = document.getElementById("switch-to-signup") as HTMLElement;
const loginWrapper = document.getElementById("login-wrapper") as HTMLElement;
const signupWrapper = document.getElementById("signup-wrapper") as HTMLElement;
const overlay = document.createElement("div");
const footer = document.querySelector("footer") as HTMLElement;
const loginEmailInput = document.getElementById("login-email") as HTMLInputElement;
const loginPasswordInput = document.getElementById("login-password") as HTMLInputElement;
const signUpButton = document.getElementById("sign-up-button") as HTMLInputElement;
const loginButton = document.getElementById("login-button") as HTMLInputElement;
let loggedIn: boolean = false;
let mail: string = "";

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

signUpButton.addEventListener("click", async () => {
    const username = (document.getElementById("signup-username") as HTMLInputElement).value;
    const email = (document.getElementById("signup-email") as HTMLInputElement).value;
    const password = (document.getElementById("signup-password") as HTMLInputElement).value;

    const response = await send("http://localhost:2000/api/register", "POST", {
        username: username,
        email: email,
        password: password
    });
    console.log(response);
    if (response.ok) {
        mail = (document.getElementById("signup-email") as HTMLInputElement).value;
        signupWrapper.style.display = "none";
        loginWrapper.style.display = "inline-block";
        await load(mail);
    }
    else {
        alert("Failed to create user");
    }
});
loginButton.addEventListener("click", async () => {
    const response = await send("http://localhost:2000/api/login", "POST", {
        email: loginEmailInput.value,
        password: loginPasswordInput.value
    });
    console.log(response);
    if (response.ok) {
        mail = loginEmailInput.value;
        loggedIn = true;
        footer.style.display = "block";
        loginWrapper.style.display = "none";
        overlay.style.display = "none";
        await load(mail);
    }
    else {
        alert("Failed to log in");
    }
});
