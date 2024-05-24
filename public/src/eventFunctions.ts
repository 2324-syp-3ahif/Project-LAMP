import {send} from "./sendUtils";
import {Event} from "./model/Event";
import { handlePageLoad } from "./loginFunctions";

window.onload = async function onload() {
    await handlePageLoad(handleEventPageLoad);
}


async function handleEventPageLoad() {
    const addEventBtn = document.getElementById("add-event-btn");
    const addTaskBtn = document.getElementById("add-task-btn");
    const createEventContainer = document.getElementById("create-event-container");
    const createTaskContainer = document.getElementById("create-task-container");
    const popupBackdrop = document.getElementById("popupBackdrop");
    const submitEventBtn = document.getElementById("submit-event-btn");

    if (addEventBtn && createEventContainer && popupBackdrop && submitEventBtn && addTaskBtn && createTaskContainer) {
        addEventBtn.addEventListener("click", () => {
            createEventContainer.classList.remove("hidden");
            popupBackdrop.classList.remove("hidden");
        });

        addTaskBtn.addEventListener("click", () => {
            createTaskContainer.classList.remove("hidden");
            popupBackdrop.classList.remove("hidden");
        });

        window.addEventListener("click", (event) => {
            if (event.target === popupBackdrop) {
                createEventContainer.classList.add("hidden");
                createTaskContainer.classList.add("hidden");
                popupBackdrop.classList.add("hidden");
            }
        });

        createTaskContainer.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        createEventContainer.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        submitEventBtn.addEventListener("click", async () => {
            const result = await send("http://localhost:2000/api/event/" + localStorage.getItem('mail') as string, "POST", {
                eventID: 0,
                name: (document.getElementById("name-event-input") as HTMLInputElement).value,
                description: (document.getElementById("description-event-input") as HTMLInputElement).value,
                startTime: Date.now() + 10000000000000,
                endTime: Date.now() + 200000000000000,
                fullDay: (document.getElementById("fullday-event-input") as HTMLInputElement).checked,
                userID: 0,
            } as Event);
        });
    }
}
