import {Tasklist} from "./model/Tasklist";
import {baseURL, send} from "./sendUtils";
import {Task} from "./model/Task";
import {extendTasklist} from "./tasklistFunctions";

const taskUrl: string = baseURL + '/api/task/';
const createForm = document.getElementById('create-task-form') as HTMLFormElement;
const createTaskBtn = document.getElementById('submit-task-btn')
const popupBackdrop = document.getElementById("popupBackdrop") as HTMLDivElement;
export let checkBoxes: HTMLInputElement[] = [];
export let closePLS: boolean = true

export function setClosePLS(bool: boolean){
    closePLS = bool;
}
// taskOverlay.className = "TaskOverlay"
// taskOverlay.style.display = "none";
// document.appendChild(taskOverlay);



export async function loadTasks(taskList: Tasklist, taskContainer: HTMLDivElement){
    const data= await send(baseURL + '/api/task/tasklistID/' + taskList.tasklistID, 'GET');
    if(!data.ok){
        return;
    }
    const tasks: Task[] = await data.json();

    tasks.forEach((task: Task) => {
        const taskElement = document.createElement('div');

        //Task Header
        const taskHeader = document.createElement('div');
        taskHeader.classList.add('d-flex');
        taskHeader.classList.add('flex-row');
        taskHeader.classList.add('task-header');

        const taskBody = document.createElement('div');
        taskBody.classList.add('task-body');
        taskBody.classList.add('d-flex');
        taskBody.classList.add('flex-row');
        taskBody.classList.add('hidden');

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
        checkBox.checked = task.isComplete !== 0;
        if (checkBox.checked){
            taskHeader.classList.add('checked');
            taskBody.classList.add('checked');
        } else {
            taskHeader.classList.remove('checked')
            taskBody.classList.remove('checked')
        }

        checkBox.addEventListener('click', async (event) => {
            event.stopPropagation();
            if (checkBox.checked){
                taskHeader.classList.add('checked');
                taskBody.classList.add('checked');
            } else {
                taskHeader.classList.remove('checked')
                taskBody.classList.remove('checked')
            }
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
        const priority1 = document.createElement('a');
        priority1.className = 'dropdown-item';
        priority1.setAttribute('id', 'priority-1');
        priority1.textContent = '1';

        const priority2 = document.createElement('a');
        priority2.className = 'dropdown-item';
        priority2.setAttribute('id', 'priority-2');
        priority2.textContent = '2';

        const priority3 = document.createElement('a');
        priority3.className = 'dropdown-item';
        priority3.setAttribute('id', 'priority-3');
        priority3.textContent = '3';

        priority1.addEventListener('click', async (event) => {
            event.stopPropagation();
            processPriority(1, task);
            button.textContent = 'Priority: ' + 1;
            button.click();
        });

        priority2.addEventListener('click', async (event) => {
            event.stopPropagation();
            processPriority(2, task);
            button.textContent = 'Priority: ' + 2;
            button.click();
        });

        priority3.addEventListener('click', async (event) => {
            event.stopPropagation();
            processPriority(3, task);
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

        window.addEventListener("click", (event) => {
            if (event.target !== taskBody) {
                taskBody.classList.add('hidden');
                taskHeader.classList.remove('task-header-extended');
            }
        });
    });

    return;
}

export async function createNewTask(tasklistID: number){
    popupBackdrop.classList.remove("hidden");
    createForm.style.display = 'block';

    createTaskBtn!.addEventListener('click', async () =>{
        await processTask(tasklistID);
        createForm.style.display = 'none';
        popupBackdrop.classList.add("hidden");
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

function processPriority(priority: number, task: Task) {
    task.priority = priority;
    send(taskUrl + task.taskID, 'PUT', task);
}

async function prozessCheckBox(checkBox: HTMLInputElement, task: Task){
    task.isComplete = checkBox.checked ? 1 : 0;
    await send(taskUrl + task.taskID, 'PUT', task)
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
    console.log(dateArray[2], dateArray[1], dateArray[0]);
    const date = new Date(dateArray[2], dateArray[1] - 1, dateArray[0]);
    console.log(time);
    console.log(time + date.valueOf());
    return time + date.valueOf();
}

