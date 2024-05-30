import {send} from "./sendUtils";
import {Event} from "./model/Event";
import { handlePageLoad } from "./loginFunctions";

let events: Event[] = [];
let helperEvents: Event[] = [];
const mappedEvents: Map<HTMLElement, Event> = new Map();
let selectedEvent: Event | undefined;

function getWeekstart() {
    let caldate = new Date(Date.now() + 2 * 24 * 60* 60*1000);
    let offset = caldate.getDay();
    if (offset === 0) {
        offset = 7;
    }

    return new Date(caldate.valueOf() - (offset - 1) * 24 * 60 * 60 * 1000);
}
let caldate = getWeekstart();


const ELEMENTS = {
    eventContainer: document.getElementById("event-container") as HTMLElement,
    eventHeader: document.getElementById("event-header") as HTMLElement,
    eventNameInput: document.getElementById("name-input-event") as HTMLInputElement,
    eventDescriptionInput: document.getElementById("description-input-event") as HTMLInputElement,
    eventDateInput: document.getElementById("date-input-event") as HTMLInputElement,
    eventFullDayInput: document.getElementById("fullday-input-event") as HTMLInputElement,
    eventStartTimeInput: document.getElementById("start-time-input-event") as HTMLInputElement,
    eventEndTimeInput: document.getElementById("end-time-input-event") as HTMLInputElement,
    eventSubmitButton: document.getElementById("submit-event-btn") as HTMLButtonElement,
    addEventBtn: document.getElementById("add-event-btn") as HTMLButtonElement,
    addTaskBtn: document.getElementById("add-task-btn") as HTMLButtonElement,
    backDrop: document.getElementById("popupBackdrop") as HTMLDivElement,
    changeWeekBeforeBtn: document.getElementById("change-viewed-week-before") as HTMLButtonElement,
    changeWeekAfterBtn: document.getElementById("change-viewed-week-after") as HTMLButtonElement,
    weekViewed: document.getElementById("week-viewed") as HTMLElement,
}

ELEMENTS.changeWeekAfterBtn.addEventListener("click", async () => {
   caldate = new Date(caldate.valueOf() + 7 * 24 * 60 * 60 * 1000);
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
    await handleWeekChange();
});

ELEMENTS.changeWeekBeforeBtn.addEventListener("click", async () => {
    console.log("Hallo");
    caldate = new Date(caldate.valueOf() - 7 * 24 * 60 * 60 * 1000);
    await handleWeekChange();
});

async function handleWeekChange() {
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
    const eve = mappedEvents.keys();
    for (const value of eve) {
        value.remove();
        mappedEvents.delete(value);
    }
    helperEvents = Array.from(events);
    await loadEvents(helperEvents);
    events = Array.from(helperEvents);
}


ELEMENTS.addEventBtn.addEventListener("click", () => {
    clearEventInput();
    ELEMENTS.eventHeader.innerText = "Create Event";
    ELEMENTS.eventSubmitButton.innerText = "Create Event";
    ELEMENTS.eventContainer.classList.remove("hidden");
    ELEMENTS.backDrop.classList.remove("hidden");
});

ELEMENTS.backDrop.addEventListener("click", () => {
   ELEMENTS.eventContainer.classList.add("hidden");
   ELEMENTS.backDrop.classList.add("hidden");
});

ELEMENTS.eventSubmitButton.addEventListener("click", async () => {
   if (ELEMENTS.eventHeader.innerText === "Create Event") {
       let [hours, minutes, seconds] = ELEMENTS.eventStartTimeInput.value.split(':').map(Number);
       const startDate = new Date(ELEMENTS.eventDateInput.value).setHours(hours, minutes, seconds);
       [hours, minutes, seconds] = ELEMENTS.eventEndTimeInput.value.split(':').map(Number);
       const endDate = new Date(ELEMENTS.eventDateInput.value).setHours(hours, minutes, seconds);
       let event: Event = {
           eventID: 0,
           name: ELEMENTS.eventNameInput.value,
           description: ELEMENTS.eventDescriptionInput.value,
           startTime: startDate,
           endTime: endDate,
           fullDay: ELEMENTS.eventFullDayInput.checked,
           userID: 0,
       };
       const res = await send("http://localhost:2000/api/event/" + localStorage.getItem('mail'), "POST", event);
       event = await res.json() as Event;
       addEvent(event);
       window.location.reload();
   } else {
       let event: Event = {
           eventID: selectedEvent?.eventID as number,
           name: ELEMENTS.eventNameInput.value !== "" ? ELEMENTS.eventNameInput.value : undefined!,
           description: ELEMENTS.eventDescriptionInput.value !== "" ? ELEMENTS.eventDescriptionInput.value : undefined!,
           startTime: stringToDateAsNumber(ELEMENTS.eventStartTimeInput.value, ELEMENTS.eventDateInput.value)!,
           endTime: stringToDateAsNumber(ELEMENTS.eventEndTimeInput.value, ELEMENTS.eventDateInput.value)!,
           fullDay: ELEMENTS.eventFullDayInput.checked,
           userID: undefined!,
       };
       const res = await send("http://localhost:2000/api/event/" + localStorage.getItem('mail'), "PUT", event);
       event = await res.json() as Event;
       console.log(event);
       updateEvent(event);
       window.location.reload();
   }
});

function clearEventInput() {
    console.log("Hallo");
    ELEMENTS.eventNameInput.value = "";
    ELEMENTS.eventDescriptionInput.value = "";
    ELEMENTS.eventDateInput.value = "";
    ELEMENTS.eventFullDayInput.checked = false;
    ELEMENTS.eventStartTimeInput.value = "";
    ELEMENTS.eventEndTimeInput.value = "";
}

ELEMENTS.addTaskBtn.addEventListener("click", () => {
    events.forEach(event => {
        if (event.name === "Luca Haas") {
            event.name = "Hallo123";
            updateEvent(event);
        }
    })
});

window.onload = async function onload() {
    await handlePageLoad(handleEventPageLoad);
}

async function handleEventPageLoad() {
    const res = await send("http://localhost:2000/api/event/" + localStorage.getItem('mail'), "GET");
    if (res.ok) {
        const data = await res.json();
        await loadEvents(data);
    } else {
        alert("Error loading events");
    }
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
}

function addEvent(event: Event) {
    events.push(event);
    if (event.startTime > caldate.getTime() && event.startTime < caldate.getTime() + 6 * 24 * 60 * 60 * 1000) {
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);
        const divToAddTo = document.getElementById(`calendar-entities-${startDate.getDay()}`) as HTMLDivElement;
        const eventDiv = document.createElement("div");
        eventDiv.className = "calendar-entity event-container";
        eventDiv.innerHTML += `
                <p class="calendar-entity-data">${event.name}</p>
                <hr class="parting-line">
                <p class="calendar-entity-data">Start: ${startDate.getHours()}:${startDate.getMinutes()}<br>End: ${endDate.getHours()}:${endDate.getMinutes()}</p>           
            `;
        mappedEvents.set(eventDiv, event);
        divToAddTo.appendChild(eventDiv);
        divToAddTo.addEventListener("click", (sender) => {
            sender.stopPropagation();
            let target = sender.target as HTMLElement;
            if (target === undefined) return;
            while(!((target) as HTMLElement).classList.contains("event-container")) {
                if (target) {
                    target = target.parentElement!;
                }
            }
            const event = mappedEvents.get(target);
            selectedEvent = event;
            ELEMENTS.eventHeader.innerText = "Edit Event";
            ELEMENTS.eventSubmitButton.innerText = "Edit Event";

            ELEMENTS.eventNameInput.value = selectedEvent?.name as string;
            ELEMENTS.eventDescriptionInput.value = selectedEvent?.description as string;
            const startTime = new Date(selectedEvent?.startTime as number);
            ELEMENTS.eventStartTimeInput.value = `${startTime.getHours()}:${startTime.getMinutes()}`;
            const endTime = new Date(selectedEvent?.endTime as number);
            ELEMENTS.eventEndTimeInput.value = `${endTime.getHours()}:${endTime.getMinutes()}`;
            ELEMENTS.eventFullDayInput.checked = !!selectedEvent?.fullDay;
            ELEMENTS.eventDateInput.value = `${startTime.getDate()}.${startTime.getMonth() + 1}.${startTime.getFullYear()}`;
            ELEMENTS.backDrop.classList.remove("hidden");
            ELEMENTS.eventContainer.classList.remove("hidden");

        });
    }
}

function updateEvent(event: Event) {
    deleteEvent(event);
    addEvent(event);
}

function deleteEvent(event: Event) {
    for (let [key, val] of mappedEvents.entries()) {
        if (val.eventID === event.eventID) {
            key.remove();
            mappedEvents.delete(key);
            events.splice(events.indexOf(event), 1);
        }
    }
}

async function loadEvents(eventsLocal: Event[]) {
    eventsLocal.forEach(event => {
        addEvent(event);
    });
}

function stringToDateAsNumber(timeString: string, dateString: string) {
    try {
        const time = timeString.split(":").map((x) => parseInt(x)).reduce((x, y) => (x * 60 + y) * 60000);
        const dateArray = dateString.split(".").map((x) => parseInt(x));
        if (dateArray.length !== 3) {
            throw new Error("Invalid date format");
        }
        const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
        return time + date.valueOf();
    } catch (e) {
        alert("Invalid time format");
    }
}