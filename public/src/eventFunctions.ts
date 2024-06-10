import {send} from "./sendUtils";
import {Event} from "./model/Event";
import {handlePageLoad} from "./loginFunctions";
import {Task} from "./model/Task";
import {Tasklist} from "./model/Tasklist";

let events: Event[] = [];
let tasks: Task[] = [];
let helperEvents: Event[] = [];
let helperTasks: Task[] = [];
const mappedEvents: Map<HTMLElement, Event> = new Map();
const mappedTasks: Map<HTMLElement, Task> = new Map();
let selectedEvent: Event | undefined;
let selectedTask: Task | undefined;
let mode: "event" | "task" = "event";

const ELEMENTS = {
    eventContainer: document.getElementById("event-container") as HTMLElement,
    taskContainer: document.getElementById("task-container") as HTMLElement,
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
    taskHeader: document.getElementById("task-header") as HTMLElement,
    taskNameInput: document.getElementById("name-input-task") as HTMLInputElement,
    taskDescriptionInput: document.getElementById("description-input-task") as HTMLInputElement,
    taskDateInput: document.getElementById("date-input-task") as HTMLInputElement,
    taskPriorityInput: document.getElementById("priority-input-task") as HTMLInputElement,
    taskTimeInput: document.getElementById("time-input-task") as HTMLInputElement,
    taskSubmitButton: document.getElementById("submit-task-btn") as HTMLButtonElement,
    tasklistSelect: document.getElementById("tasklist-input-task") as HTMLSelectElement,
    backDrop: document.getElementById("popupBackdrop") as HTMLDivElement,
    changeWeekBeforeBtn: document.getElementById("change-viewed-week-before") as HTMLButtonElement,
    changeWeekAfterBtn: document.getElementById("change-viewed-week-after") as HTMLButtonElement,
    weekViewed: document.getElementById("week-viewed") as HTMLElement,

}

function getWeekstart() {
    let caldate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    let offset = caldate.getDay();
    if (offset === 0) {
        offset = 7;
    }
    return new Date(caldate.valueOf() - (offset - 1) * 24 * 60 * 60 * 1000);
}

let caldate = getWeekstart();
ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
console.log(caldate.valueOf());
ELEMENTS.changeWeekAfterBtn.addEventListener("click", async () => {
    caldate = new Date(caldate.valueOf() + 7 * 24 * 60 * 60 * 1000);
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
    await handleWeekChange();
});

ELEMENTS.changeWeekBeforeBtn.addEventListener("click", async () => {
    caldate = new Date(caldate.valueOf() - 7 * 24 * 60 * 60 * 1000);
    await handleWeekChange();
});

async function handleWeekChange() {
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
    const eve = mappedEvents.keys();
    const tas = mappedTasks.keys();
    for (const value of eve) {
        value.remove();
        mappedEvents.delete(value);
    }
    for (const value of tas) {
        value.remove();
        mappedTasks.delete(value);
    }
    helperEvents = Array.from(events);
    helperTasks = Array.from(tasks);
    await loadEvents(helperEvents);
    await loadTasks(helperTasks);
    events = Array.from(helperEvents);
    tasks = Array.from(helperTasks);
}


ELEMENTS.addEventBtn.addEventListener("click", () => {
    mode = "event";
    clearEventInput();
    ELEMENTS.eventHeader.innerText = "Create Event";
    ELEMENTS.eventSubmitButton.innerText = "Create Event";
    ELEMENTS.eventContainer.classList.remove("hidden");
    ELEMENTS.backDrop.classList.remove("hidden");
});

ELEMENTS.backDrop.addEventListener("click", () => {
    if (mode === "event") {
        ELEMENTS.eventContainer.classList.add("hidden");
    } else {
        ELEMENTS.taskContainer.classList.add("hidden");
    }
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
    }
    ELEMENTS.backDrop.classList.add("hidden");
    ELEMENTS.eventContainer.classList.add("hidden");
});

ELEMENTS.taskSubmitButton.addEventListener("click", async () => {
    let [hours, minutes] = ELEMENTS.taskTimeInput.value.split(':').map(x => parseInt(x));
    const date = new Date(ELEMENTS.taskDateInput.value).setHours(hours, minutes);
    console.log(selectedTask?.taskID);
    let task: Task = {
        taskID: selectedTask?.taskID!,
        title: ELEMENTS.taskNameInput.value === "" ? undefined! : ELEMENTS.taskNameInput.value,
        description: ELEMENTS.eventDescriptionInput.value,
        dueDate: date,
        isComplete: 0,
        priority: parseInt(ELEMENTS.taskPriorityInput.value),
        tasklistID: parseInt(ELEMENTS.tasklistSelect.value),
    };
    const data = {
        taskID: task.taskID,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        tasklistID: task.tasklistID,
        email: localStorage.getItem("mail")
    }
    console.log(data.email);

    if (ELEMENTS.taskHeader.innerText === "Create Task") {
        const res = await send("http://localhost:2000/api/task/" + task.tasklistID, "POST", data);
        task = await res.json() as Task;
        addTask(task);
    } else {
        const res = await send("http://localhost:2000/api/task/" + task.taskID, "PUT", data);
        task = await res.json() as Task;
        updateTask(task);
    }
    ELEMENTS.backDrop.classList.add("hidden");
    ELEMENTS.taskContainer.classList.add("hidden");
});

async function getTasklistIDs(): Promise<number[]> {
    const result = await send("http://localhost:2000/api/tasklist/email/" + localStorage.getItem('mail'), "GET");
    console.log(result);
    const tasklists = await result.json();
    return tasklists.map((tasklist: Tasklist) => tasklist.tasklistID);
}

function clearEventInput() {
    ELEMENTS.eventNameInput.value = "";
    ELEMENTS.eventDescriptionInput.value = "";
    ELEMENTS.eventDateInput.value = "";
    ELEMENTS.eventFullDayInput.checked = false;
    ELEMENTS.eventStartTimeInput.value = "";
    ELEMENTS.eventEndTimeInput.value = "";
}

function clearTaskInput() {
    ELEMENTS.taskNameInput.value = "";
    ELEMENTS.taskDescriptionInput.value = "";
    ELEMENTS.taskDateInput.value = "";
    ELEMENTS.taskTimeInput.value = "";
}

ELEMENTS.addTaskBtn.addEventListener("click", () => {
    mode = "task";
    clearTaskInput();
    ELEMENTS.taskHeader.innerText = "Create Task";
    ELEMENTS.taskSubmitButton.innerText = "Create Task";
    ELEMENTS.taskContainer.classList.remove("hidden");
    ELEMENTS.backDrop.classList.remove("hidden");
});

window.onload = async function onload() {
    await handlePageLoad(handleEventPageLoad);
}

async function handleEventPageLoad() {
    await getEvents();
    await getTasks();
    await setTasklistOptions();
    ELEMENTS.weekViewed.innerText = `${caldate.getDate()}.${caldate.getMonth() + 1}.${caldate.getFullYear()} - ${caldate.getDate() + 6}.${caldate.getMonth() + 1}.${caldate.getFullYear()}`
}

async function setTasklistOptions() {
    ELEMENTS.tasklistSelect.innerHTML = "";
    const tasklistIDs = await getTasklistIDs();
    tasklistIDs.forEach(id => {
        const option = document.createElement("option");
        option.value = id.toString();
        option.innerText = id.toString();
        ELEMENTS.tasklistSelect.appendChild(option);
    });
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
        console.error("Error loading tasks");
    }
}

async function loadTasks(tasksLocal: Task[]) {
    tasksLocal.forEach(task => {
        addTask(task);
    });
}

async function loadEvents(eventsLocal: Event[]) {
    eventsLocal.forEach(event => {
        addEvent(event);
    });
}

function addTask(task: Task) {
    if (task.dueDate >= caldate.getTime() && task.dueDate < caldate.getTime() + 6 * 24 * 60 * 60 * 1000) {
        const time: Date = new Date(task.dueDate);
        const divToAddTo = document.getElementById(`calendar-entities-${time.getDay()}`) as HTMLDivElement;
        const taskDiv = document.createElement("div");
        taskDiv.className = "calendar-entity task-container";
        const dueDate = new Date(task.dueDate);
        taskDiv.innerHTML += `
                <p class="task-data">${task.title}</p>
                <hr class="parting-line">
                <p class="task-data">${dueDate.getHours()}:${dueDate.getMinutes()}</p>
            `;
        divToAddTo.appendChild(taskDiv);
        mappedTasks.set(taskDiv, task);
        tasks.push(task);
        divToAddTo.addEventListener("click", (sender) => {
            mode = "task";
            sender.stopPropagation();
            let target = sender.target as HTMLElement;
            if (target === undefined) return;
            while (!((target) as HTMLElement).classList.contains("task-container")) {
                if (target) {
                    target = target.parentElement!;
                }
            }
            selectedTask = mappedTasks.get(target);
            ELEMENTS.taskHeader.innerText = "Edit Event";
            ELEMENTS.taskSubmitButton.innerText = "Edit Event";

            ELEMENTS.taskNameInput.value = selectedTask?.title as string;
            ELEMENTS.taskDescriptionInput.value = selectedTask?.description as string;
            const time = new Date(selectedTask?.dueDate as number);
            ELEMENTS.taskTimeInput.value = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
            ELEMENTS.taskDateInput.value = `${time.getFullYear()}-${(time.getMonth() + 1).toString().padStart(2, '0')}-${time.getDate().toString().padStart(2, '0')}`;
            ELEMENTS.backDrop.classList.remove("hidden");
            ELEMENTS.taskContainer.classList.remove("hidden");
        });
    }
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
        mappedEvents.set(eventDiv, event);
        divToAddTo.appendChild(eventDiv);
        divToAddTo.addEventListener("click", (sender) => {
            mode = "event";
            sender.stopPropagation();
            let target = sender.target as HTMLElement;
            if (target === undefined) return;
            while (!((target) as HTMLElement).classList.contains("event-container")) {
                if (target) {
                    target = target.parentElement!;
                }
            }
            selectedEvent = mappedEvents.get(target);
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

function updateTask(task: Task) {
    deleteTask(task);
    addTask(task);
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

function deleteTask(task: Task) {
    for (let [key, val] of mappedTasks.entries()) {
        if (val.taskID === task.taskID) {
            key.remove();
            mappedTasks.delete(key);
            tasks.splice(tasks.indexOf(task), 1);
        }
    }
}

