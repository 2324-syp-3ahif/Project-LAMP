import {send} from "./sendUtils";
import {Event} from "./model/Event";
import { handlePageLoad } from "./loginFunctions";

window.onload = async function onload() {
    await handlePageLoad(handleEventPageLoad);
}


async function handleEventPageLoad() {
    const addEventBtn = document.getElementById("add-event-btn");
    const popup = document.getElementById("create-event-container");
    const popupBackdrop = document.getElementById("popupBackdrop");
    const submitEventBtn = document.getElementById("submit-event-btn");
    if (addEventBtn && popup && popupBackdrop && submitEventBtn) {
        addEventBtn.addEventListener("click", () => {
            popup.classList.remove("hidden");
            popupBackdrop.classList.remove("hidden");
        });

        window.addEventListener("click", (event) => {
            if (event.target === popupBackdrop) {
                popup.classList.add("hidden");
                popupBackdrop.classList.add("hidden");
            }
        });

        // Prevent closing when clicking inside the popup
        popup.addEventListener("click", (event) => {
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
