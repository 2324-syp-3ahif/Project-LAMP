import {Tasklist} from "./model/Tasklist";
import {send} from "./sendUtils";
import {dateFormatCheck} from "../../backend/database-functions/insert-data";
import {Task} from "./model/Task";

const taskUrl: string = 'http://localhost:2000/api/task/';
const createForm = document.getElementById('create-task-form') as HTMLFormElement;
const createTaskBtn = document.getElementById('submit-task-btn')
const taskOverlay = document.createElement('div')

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
        const checkBox = document.createElement('input');
        checkBox.type = 'checkbox';
        checkBox.classList.add('task-checkbox');
        const taskTitle = document.createElement('h5');
        taskTitle.classList.add('task-title');
        taskTitle.textContent = task.title;
        const taskDate = document.createElement('h5');
        taskDate.classList.add('task-date');
        taskDate.textContent = formatDate(task.dueDate);
        taskHeader.appendChild(checkBox);
        taskHeader.appendChild(taskTitle);
        taskHeader.appendChild(taskDate);

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
    } else if (!checkDateString(date)){
        alert('Date has wrong format')
        return;
    }
    // else if(!checkTimeString(time)){
    //     alert('Time has wrong format')
    //     return;
    // }
    const task: object = {
        title: title,
        date: date,
        //time: time,
        description: description,
        priority: priority
    }
    await send(taskUrl + tasklistID, 'POST', task)
}

// function checkTimeString(input: string): boolean {
//     const regex = /^(0?[1-9]|1[0-9]|2[0-3])(:|.)[0-5][0-9]$/;
//     return regex.test(input);
// }

function checkDateString(input: string): boolean {
    const regex = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
    return (input === undefined) ? true : regex.test(input);
}

function formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}