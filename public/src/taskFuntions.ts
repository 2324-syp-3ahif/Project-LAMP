import {Tasklist} from "./model/Tasklist";
import {baseURL, send} from "./sendUtils";
import {Task} from "./model/Task";
import {extendTasklist} from "./tasklistFunctions";
import {taskListSocket} from "./tasklistFunctions";
import * as punycode from "node:punycode";

const taskUrl: string = baseURL + '/api/task/';
const taskContainer = document.getElementById('task-container') as HTMLDivElement;
const createTaskBtn = document.getElementById('submit-task-btn');
const popupBackdrop = document.getElementById("popupBackdrop") as HTMLDivElement;
export let checkBoxes: HTMLInputElement[] = [];

// taskOverlay.className = "TaskOverlay"
// taskOverlay.style.display = "none";
// document.appendChild(taskOverlay);

taskListSocket.on('onNewTask', async (taskListID: number, task: Task) => {
    const taskContainer = document.getElementById(`taskListTasks-${taskListID}`) as HTMLDivElement;
    await createTaskHTMLElement(task, taskContainer);
});
taskListSocket.on('onUpdateTask', async (updatedTask: Task) => {
    // Find the task element
    const taskElement = document.getElementById(`task-${updatedTask.taskID}`) as HTMLElement;

    // Update the task title
    const taskTitle = taskElement.querySelector('.task-title') as HTMLHeadingElement;
    taskTitle.textContent = updatedTask.title;

    // Update the task description
    const taskDescription = taskElement.querySelector('#task-description') as HTMLTextAreaElement;
    taskDescription.textContent = updatedTask.description;

    // Update the task priority
    const taskPriority = taskElement.querySelector('#priority-btn') as HTMLButtonElement;
    taskPriority.textContent = 'Priority: ' + updatedTask.priority;

    // Update the task completion status
    const taskCheckbox = taskElement.querySelector('.task-checkbox') as HTMLInputElement;
    taskCheckbox.checked = updatedTask.isComplete !== 0;
});

export async function loadTasks(taskList: Tasklist, taskContainer: HTMLDivElement){
    const data = await send(baseURL + '/api/task/tasklistID/' + taskList.tasklistID, 'GET');
    if(!data.ok){
        return;
    }
    const tasks: Task[] = await data.json();

    tasks.forEach((task: Task) => {
        createTaskHTMLElement(task, taskContainer);
    });
    return;
}
export async function createTaskHTMLElement(task: Task, taskContainer: HTMLDivElement){
    const taskElement = document.createElement('div');
    taskElement.id = 'task-' + task.taskID;
    //Task Header
    const taskHeader = document.createElement('div');
    taskHeader.classList.add('d-flex', 'flex-row', 'task-header');

    const taskBody = document.createElement('div');
    taskBody.classList.add('task-body', 'd-flex', 'flex-column', 'hidden');

    const checkBox_title_div = document.createElement('div');
    checkBox_title_div.classList.add('checkBox_title_div', 'd-flex', 'flex-row');

    const date_div = document.createElement('div');
    date_div.classList.add('date_div', 'd-flex', 'flex-row');

    const checkBox = document.createElement('input');
    checkBox.type = 'checkbox';
    checkBox.classList.add('task-checkbox');
    checkBoxes.push(checkBox);
    checkBox.checked = task.isComplete !== 0;

    if (checkBox.checked){
        taskHeader.classList.add('checked');
        taskBody.classList.add('checked');
    } else {
        taskHeader.classList.remove('checked');
        taskBody.classList.remove('checked');
    }

    checkBox.addEventListener('click', async (event) => {
        event.stopPropagation();
        if (checkBox.checked){
            taskHeader.classList.add('checked');
            taskBody.classList.add('checked');
        } else {
            taskHeader.classList.remove('checked');
            taskBody.classList.remove('checked');
        }
        await processCheckBox(checkBox, task);
    });

    const taskTitle = document.createElement('h5');
    taskTitle.classList.add('task-title');
    taskTitle.textContent = task.title;
    taskTitle.setAttribute('contenteditable', 'true');

    taskTitle.addEventListener('input', async () =>{
        if(taskTitle.innerText != "") {
            task.title = taskTitle.innerText;
            await send(taskUrl + task.taskID, 'PUT', task);
        }
    });

    const taskDate = document.createElement('h5');
    taskDate.classList.add('task-date');
    taskDate.setAttribute('contenteditable', 'true');
    taskDate.textContent = formatDate(new Date(task.dueDate));

    taskDate.addEventListener('input', async () =>{
        if(taskDate.innerText.length == 10) {
            task.dueDate = Date.parse(taskDate.innerText);
            await send(taskUrl + task.taskID, 'PUT', task);
        }
    });

    checkBox_title_div.appendChild(checkBox);
    checkBox_title_div.appendChild(taskTitle);

    taskHeader.appendChild(checkBox_title_div);
    taskHeader.appendChild(date_div);

    const taskDescriptionLabel = document.createElement('label');
    taskDescriptionLabel.setAttribute('for', 'task-description');
    taskDescriptionLabel.textContent = 'Description:';

    const taskDescription = document.createElement('textarea');
    taskDescription.setAttribute('id', 'task-description');
    taskDescription.textContent = task.description;

    const dropdownDiv = document.createElement('div');
    dropdownDiv.className = 'dropdown';

    // Create button
    const button = document.createElement('button');
    button.className = 'btn btn-design dropdown-toggle';
    button.setAttribute('role', 'button');
    button.setAttribute('id', 'priority-btn');
    button.setAttribute('data-bs-toggle', 'dropdown');
    button.textContent = 'Priority: ' + task.priority.toString();

    // Create dropdown menu div
    const dropdownMenuDiv = document.createElement('div');
    dropdownMenuDiv.className = 'dropdown-menu';

    // Create dropdown items
    const priority1 = createPriority(1);
    const priority2 = createPriority(2);
    const priority3 = createPriority(3);

    priority1.addEventListener('click', async (event) => {
        event.stopPropagation();
        await processPriority(1, task);
        button.textContent = 'Priority: ' + 1;
        button.click();
    });

    priority2.addEventListener('click', async (event) => {
        event.stopPropagation();
        await processPriority(2, task);
        button.textContent = 'Priority: ' + 2;
        button.click();
    });

    priority3.addEventListener('click', async (event) => {
        event.stopPropagation();
        await processPriority(3, task);
        button.textContent = 'Priority: ' + 3;
        button.click();
    });

    // Append items to dropdown menu
    dropdownMenuDiv.appendChild(priority1);
    dropdownMenuDiv.appendChild(priority2);
    dropdownMenuDiv.appendChild(priority3);

    // Append button and dropdown menu to dropdown div
    dropdownDiv.appendChild(button);
    dropdownDiv.appendChild(dropdownMenuDiv);

    taskBody.appendChild(taskDescription);
    taskBody.appendChild(dropdownDiv);

    taskElement.addEventListener('click', async (event) => {
        event.stopPropagation();
        taskBody.classList.remove('hidden');
        taskHeader.classList.add('task-header-extended');
    });
    taskElement.appendChild(taskHeader);
    taskElement.appendChild(taskBody);
    taskContainer.appendChild(taskElement);

    taskDescription.addEventListener('blur', (event) => {
        // Handle the change
        const target = event.target as HTMLTextAreaElement;
        if (task.description !== target.value){
            task.description = target.value;
            processDescription(task);
        }
    });

    window.addEventListener("click", (event) => {
        if (event.target !== taskBody) {
            taskBody.classList.add('hidden');
            taskHeader.classList.remove('task-header-extended');
        }
    });
}

function createPriority(priorityNr: number): HTMLElement {
    const priority = document.createElement('a');
    priority.className = 'dropdown-item';
    priority.setAttribute('id', 'priority-' + priorityNr);
    priority.textContent = priorityNr.toString();
    return priority;
}

export async function createNewTask(tasklistID: number){
    taskContainer.classList.remove('hidden');
    popupBackdrop.classList.remove("hidden");

    createTaskBtn!.addEventListener('click', async () =>{
        await processTask(tasklistID);
        taskContainer.classList.add('hidden');
        popupBackdrop.classList.add("hidden");
    });
}

popupBackdrop.addEventListener('click', () => {
    popupBackdrop.classList.add("hidden");
    taskContainer.classList.add('hidden');
});

async function processTask(tasklistID: number){
    const title = (document.getElementById('name-input-task') as HTMLInputElement).value;
    const description = (document.getElementById('description-input-task') as HTMLInputElement).value;
    const date = (document.getElementById('date-input-task') as HTMLInputElement).value;
    const priority = (document.getElementById('priority-input-task') as HTMLSelectElement).value;

    const obj: Object = {
        title: title,
        description: description,
        dueDate: (new Date(date)).toUTCString(),
        priority: parseInt(priority),
        email: localStorage.getItem('mail'),
    }
    const newTask = await send(taskUrl + tasklistID, 'POST', obj) as Task;
    taskListSocket.emit('new-task', tasklistID, newTask);
    return;
}

async function processPriority(priority: number, task: Task) {
    task.priority = priority;
    await send(taskUrl + task.taskID, 'PUT', task);
    taskListSocket.emit('update-task', task);
}

async function processCheckBox(checkBox: HTMLInputElement, task: Task){
    task.isComplete = checkBox.checked ? 1 : 0;
    await send(taskUrl + task.taskID, 'PUT', task)
    console.log(task.tasklistID);
    taskListSocket.emit('update-task', task);
}

async function processDescription(task: Task){
    await send(taskUrl + task.taskID, 'PUT', task);
    taskListSocket.emit('update-task', task);
}

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}


function stringToDateAsNumber(timeString: string, dateString: string) {
    const time = timeString.split(":").map((x) => parseInt(x)).reduce((x, y) => (x * 60 + y) * 60000);
    const dateArray = dateString.split(".").map((x) => parseInt(x));
    if (dateArray.length !== 3) {
        throw new Error("Invalid date format");
    }
    const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
    return time + date.valueOf();
}

