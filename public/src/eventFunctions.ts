import {baseURL, send} from "./sendUtils";
import {Event} from "./model/Event";
import { handlePageLoad } from "./loginFunctions";

const events: Event[] = [];

console.log(Date.now() + 2 * 24 * 60* 60*1000);

//TODO: Remove the offset at startdate
function getWeekstart() {
    let caldate = new Date(Date.now() + 2 * 24 * 60* 60*1000);
    let offset = caldate.getDay();
    if (offset === 0) {
        offset = 7;
    }

    return new Date(caldate.valueOf() - (offset - 1) * 24 * 60 * 60 * 1000);
}
let caldate = getWeekstart();

window.onload = async function onload() {
    await handlePageLoad(handleEventPageLoad);
}

const addEventBtn = document.getElementById("add-event-btn") as HTMLButtonElement
const addTaskBtn = document.getElementById("add-task-btn") as HTMLButtonElement;
const createEventContainer = document.getElementById("create-event-container") as HTMLDivElement;
const createTaskContainer = document.getElementById("create-task-container") as HTMLDivElement;
const popupBackdrop = document.getElementById("popupBackdrop") as HTMLDivElement;
const submitEventBtn = document.getElementById("submit-event-btn") as HTMLButtonElement;
const date = document.getElementById("date-event-input") as HTMLInputElement;
const createStartTime = document.getElementById("event-start-time-input") as HTMLInputElement;
const createEndTime = document.getElementById("event-end-time-input") as HTMLInputElement;


async function handleEventPageLoad() {
    if (addEventBtn && createEventContainer && popupBackdrop && submitEventBtn && addTaskBtn && createTaskContainer) {
        addEventBtn.addEventListener("click", () => {
            (document.getElementById("add-event-header") as HTMLParagraphElement).innerText = "Create Event";
            submitEventBtn.innerText = "Create Event";
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
            let method = (document.getElementById("add-event-header") as HTMLParagraphElement).innerText == "Create Event" ? "POST" : "PUT";
            const event: Event = {
                eventID: 0,
                name: (document.getElementById("name-event-input") as HTMLInputElement).value,
                description: (document.getElementById("description-event-input") as HTMLInputElement).value,
                startTime: stringToDateAsNumber(createStartTime.value, date.value),
                endTime: stringToDateAsNumber(createEndTime.value, date.value),
                fullDay: (document.getElementById("fullday-event-input") as HTMLInputElement).checked,
                userID: 0,
            } as Event
            await send(baseURL + "/api/event/" + localStorage.getItem('mail') as string, "POST", event);
            addEvent(event);
        });

        await loadEvents(localStorage.getItem('mail') as string);
    }
}

async function loadEvents(mail: string) {
    const resp = await send(baseURL + "/api/event/" + mail, "GET");
    if (!resp.ok) {
        alert("Error loading events");
        return;
    }
    const events: Event[] = await resp.json();
    events.forEach((event) => {
        addEvent(event);
    });

}

async function removeEvent(eventID: number) {
    const resp = await send(baseURL + "/api/event/" + eventID, "DELETE");
    if (resp.ok) {
        const event = document.getElementById("calendar-entity-" + eventID);
        if (event) {
            event.remove();
        }
        const index = events.findIndex((event) => event.eventID === eventID);
        if (index >= 0) {
            events.splice(index, 1);
        }
    } else {
        throw new Error("Error deleting event");
    }
}

function addEvent(event: Event) {
    if (event.startTime < caldate.valueOf() || event.endTime > caldate.valueOf() + 6 * 24 * 60 * 60 * 1000) {
        console.log(`Event not in current week: ${event.eventID}`);
        return;
    }

    const calendarEntity = document.createElement("div");
    calendarEntity.className = "calendar-entity event-container";
    calendarEntity.id = "calendar-entity-" + event.eventID;

    const name = document.createElement("p");
    name.className = "calendar-entity-data";
    name.innerText = event.name;

    const partingLine = document.createElement("hr");
    partingLine.className = "parting-line";

    const time = document.createElement("p");
    time.className = "calendar-entity-data";
    const startTime = new Date(event.startTime);
    console.log(startTime.getDay());
    const endTime = new Date(event.endTime);
    time.innerText = `Start: ${startTime.getHours()}:${startTime.getMinutes()} End: ${endTime.getHours()}:${endTime.getMinutes()}`;

    calendarEntity.appendChild(name);
    calendarEntity.appendChild(partingLine);
    calendarEntity.appendChild(time);

    const calendar = document.getElementById("calendar-entities-" + startTime.getDay());
    if (calendar) {
        calendar.appendChild(calendarEntity);
    }
    console.log(`Event loaded: ${event.eventID}`);
    events.push(event);
    calendarEntity.addEventListener("click", async () => {
        (document.getElementById("add-event-header") as HTMLParagraphElement).innerText = "Edit Event";
        submitEventBtn.innerText = "Edit Event";
        createEventContainer.classList.remove("hidden");
        popupBackdrop.classList.remove("hidden");
    });
    //window.location.reload();
}

function stringToDateAsNumber(timeString: string, dateString: string) {
    const time = timeString.split(":").map((x) => parseInt(x)).reduce((x, y) => (x * 60 + y) * 60000);
    const dateArray = dateString.split(".").map((x) => parseInt(x));
    if (dateArray.length !== 3) {
        throw new Error("Invalid date format");
    }
    console.log(dateArray[2], dateArray[1], dateArray[0]);
    const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
    console.log(time);
    console.log(time + date.valueOf());
    return time + date.valueOf();
}
