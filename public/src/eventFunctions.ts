import {send} from "./sendUtils";
import {Event} from "./model/Event";
import { handlePageLoad } from "./loginFunctions";
import {Task} from "./model/Task";

let events: Event[] = [];
let helperEvents: Event[] = [];
const mappedEntities: Map<HTMLElement, Event> = new Map();
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
    const eve = mappedEntities.keys();
    for (const value of eve) {
        value.remove();
        mappedEntities.delete(value);
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
    let [hours, minutes] = ELEMENTS.eventStartTimeInput.value.split(':').map(x => parseInt(x));
    const startDate = new Date(ELEMENTS.eventDateInput.value).setHours(hours, minutes);

    [hours, minutes] = ELEMENTS.eventEndTimeInput.value.split(':').map(x => parseInt(x));
    const endDate = new Date(ELEMENTS.eventDateInput.value).setHours(hours, minutes);
   if (ELEMENTS.eventHeader.innerText === "Create Event") {

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
           startTime: startDate,
           endTime: endDate,
           fullDay: ELEMENTS.eventFullDayInput.checked,
           userID: undefined!,
       };
       const res = await send("http://localhost:2000/api/event/" + localStorage.getItem('mail'), "PUT", event);
       event = await res.json() as Event;
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

});

window.onload = async function onload() {
    await handlePageLoad(handleEventPageLoad);
}

async function handleEventPageLoad() {
    await getEvents();
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
}

async function getEvents() {
    const res = await send("http://localhost:2000/api/event/" + localStorage.getItem('mail'), "GET");
    if (res.ok) {
        const data = await res.json();
        await loadEvents(data);
    } else {
        alert("Error loading events");
    }
}

async function getTasks() {
    const res = await send("http://localhost:2000/api/task/" + localStorage.getItem('mail'), "GET");
    if (res.ok) {
        const data = await res.json();
        await loadTasks(data);
    } else {
        alert("Error loading tasks");
    }
}
function addTask(task: Task) {
    const divToAddTo = document.getElementById("task-container") as HTMLDivElement;
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-container";
    const dueDate = new Date(task.dueDate);
    taskDiv.innerHTML += `
            <p class="task-data">${task.title}</p>
            <hr class="parting-line">
            <p class="task-data">${dueDate.getHours()}:${dueDate.getMinutes()}</p>
        `;
    divToAddTo.appendChild(taskDiv);

}

async function loadTasks(tasks: Task[]) {
    tasks.forEach(task => {
        addTask(task);
    });
}

function addEvent(event: Event) {
    events.push(event);
    events.sort((a, b) => a.startTime - b.startTime);
    if (event.startTime > caldate.getTime() && event.startTime < caldate.getTime() + 6 * 24 * 60 * 60 * 1000) {
        const startDate = new Date(event.startTime);
        const endDate = new Date(event.endTime);
        const divToAddTo = document.getElementById(`calendar-entities-${startDate.getDay()}`) as HTMLDivElement;
        const eventDiv = document.createElement("div");
        eventDiv.className = "calendar-entity event-container";
        eventDiv.innerHTML += `
                <p class="calendar-entity-data">${event.name}</p>
                <hr class="parting-line">
                <p class="calendar-entity-data">Start: ${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}<br>End: ${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}</p>           
            `;
        mappedEntities.set(eventDiv, event);
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
            selectedEvent = mappedEntities.get(target);
            ELEMENTS.eventHeader.innerText = "Edit Event";
            ELEMENTS.eventSubmitButton.innerText = "Edit Event";

            ELEMENTS.eventNameInput.value = selectedEvent?.name as string;
            ELEMENTS.eventDescriptionInput.value = selectedEvent?.description as string;
            const startTime = new Date(selectedEvent?.startTime as number);
            ELEMENTS.eventStartTimeInput.value = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
            const endTime = new Date(selectedEvent?.endTime as number);
            ELEMENTS.eventEndTimeInput.value = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
            ELEMENTS.eventFullDayInput.checked = !!selectedEvent?.fullDay;
            console.log(`${startTime.getDate().toString().padStart(2, '0')}.${(startTime.getMonth() + 1).toString().padStart(2, '0')}.${startTime.getFullYear()}`);
            ELEMENTS.eventDateInput.value = `${startTime.getFullYear()}-${(startTime.getMonth() + 1).toString().padStart(2, '0')}-${startTime.getDate().toString().padStart(2, '0')}`;
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
    for (let [key, val] of mappedEntities.entries()) {
        if (val.eventID === event.eventID) {
            key.remove();
            mappedEntities.delete(key);
            events.splice(events.indexOf(event), 1);
        }
    }
}

async function loadEvents(eventsLocal: Event[]) {
    eventsLocal.forEach(event => {
        addEvent(event);
    });
}