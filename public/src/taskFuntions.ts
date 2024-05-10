import {Tasklist} from "./model/Tasklist";
import {send} from "./sendUtils";
import {Task} from "./model/Task";
import {extendTasklist} from "./tasklistFunctions";

const taskUrl: string = 'http://localhost:2000/api/task/';
const createForm = document.getElementById('create-task-form') as HTMLFormElement;
const createTaskBtn = document.getElementById('submit-task-btn')
const taskOverlay = document.createElement('div')
export let checkBoxes: HTMLInputElement[] = [];
export let closePLS: boolean = true

export function setClosePLS(bool: boolean){
    closePLS = bool;
}
// taskOverlay.className = "TaskOverlay"
// taskOverlay.style.display = "none";
// document.appendChild(taskOverlay);

export async function loadTasks(taskList: Tasklist, taskContainer: HTMLDivElement){
    const data= await send('http://localhost:2000/api/task/tasklistID/' + taskList.tasklistID, 'GET');
    if(!data.ok){
        return;
    }
    const tasks: Task[] = await data.json();

    tasks.forEach((task: Task) => {
        const taskElement = document.createElement('div');
        const taskHeader = document.createElement('div');
        taskHeader.classList.add('d-flex');
        taskHeader.classList.add('flex-row');
        taskHeader.classList.add('task-header');

        const checkBox_title_div = document.createElement('div');
        checkBox_title_div.classList.add('checkBox_title_div');
        checkBox_title_div.classList.add('d-flex');
        checkBox_title_div.classList.add('flex-row');
        const date_div = document.createElement('div');
        date_div.classList.add('date_div')
        date_div.classList.add('d-flex');
        date_div.classList.add('flex-row');

        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.classList.add('task-checkbox');
        checkBoxes.push(checkBox);
        checkBox.checked = task.isComplete;
        styleTaskForIsCompleted(checkBox.checked, taskHeader);
        checkBox.addEventListener('click', async (event) => {
            event.stopPropagation();
            styleTaskForIsCompleted(checkBox.checked, taskHeader);
            await prozessCheckBox(checkBox, task);
        });
        const taskTitle = document.createElement('h5');
        taskTitle.classList.add('task-title');
        taskTitle.textContent = task.title;
        const taskDate = document.createElement('h5');
        taskDate.classList.add('task-date');
        taskDate.textContent = formatDate(new Date(task.dueDate));

        checkBox_title_div.appendChild(checkBox)
        checkBox_title_div.appendChild(taskTitle)

        date_div.appendChild(taskDate);

        taskHeader.appendChild(checkBox_title_div);
        taskHeader.appendChild(date_div);

        // const taskBody = document.createElement('div');
        // taskBody.classList.add('task-body');
        // taskBody.classList.add('d-flex');
        // taskBody.classList.add('flex-row');
        // taskBody.style.display = 'none';
        taskElement.appendChild(taskHeader);
        //taskElement.appendChild(taskBody);
        taskContainer.appendChild(taskElement);
    });

    return;
}

export async function createNewTask(tasklistID: number){
    createForm.style.display = 'block';
    // taskOverlay.style.display = 'block'
    createTaskBtn!.addEventListener('click', async () =>{
        await processTask(tasklistID);
        // taskOverlay.style.display = 'none';
        createForm.style.display = 'none';
    });
}

async function processTask(tasklistID: number){

    const title = (document.getElementById('name-task-input') as HTMLInputElement).value;
    const description = (document.getElementById('description-task-input') as HTMLInputElement).value;
    const priority = (document.getElementById('priority-task-input') as HTMLInputElement).value;
    const date = (document.getElementById('date-task-input') as HTMLInputElement).value;
    //const time = (document.getElementById('time-task-input') as HTMLInputElement).value;

    if (title.length > 50) {
        alert('Title is too long, must be less than 50 characters');
        return;
    } else if (description.length > 255) {
        alert('Description is too long, must be less than 255 characters');
        return;
    }
    // else if(!checkTimeString(time)){
    //     alert('Time has wrong format')
    //     return;
    // }
    console.log(`date: ${date}`);
    const task: object = {
        title: title,
        date: date,
        //time: time,
        description: description,
        priority: priority
    }
    await send(taskUrl + tasklistID, 'POST', task);
    return;
}

async function prozessCheckBox(checkBox: HTMLInputElement, task: Task){
    task.isComplete = checkBox.checked;
    await send(taskUrl + task.taskID, 'PUT', task)
}
function styleTaskForIsCompleted(isCompleted:boolean, taskElement: HTMLDivElement){
    if (isCompleted){
        taskElement.classList.add('checked');
    } else {
        taskElement.classList.remove('checked')
    }
}
function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

