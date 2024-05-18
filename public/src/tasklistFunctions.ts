import {send} from './sendUtils';
import {Tasklist} from './model/Tasklist';
import {Tag} from './model/Tag';
import {checkMailFormat} from "./utils";
import {checkBoxes, closePLS, createNewTask, loadTasks, setClosePLS} from "./taskFuntions";
const tasklistUrl: string = 'http://localhost:2000/api/tasklist/';
const tagUrl: string = 'http://localhost:2000/api/tag/';


const taskLists = document.getElementById('tasklists') as HTMLElement;
const createTasklistButton = document.getElementById('create-tasklist-btn') as HTMLButtonElement;
const orderPriorityButton = document.getElementById('order-priority') as HTMLButtonElement;
const orderViewButton = document.getElementById('order-view') as HTMLButtonElement;
const orderCreateButton = document.getElementById('order-creation') as HTMLButtonElement;
const filterButton = document.getElementById('filter-btn') as HTMLButtonElement;
const filterTagsModal = document.getElementById('filter-tags-modal') as HTMLElement;
const createForm = document.getElementById('create-tasklist-form') as HTMLFormElement;
const submitButton = document.getElementById('submit-tasklist-btn') as HTMLButtonElement;
const inviteUserBtn = document.getElementById('invite-user-btn') as HTMLButtonElement;
const deleteTasklistBtn = document.getElementById('delete-tasklist-btn') as HTMLButtonElement;
const deleteModal = document.getElementById('delete-modal') as HTMLElement;
export let listElements: HTMLInputElement[] = [];
let globalDeleteTasklistID = -1;
let globalTasklists: Tasklist[] = [];
let globalTags: Tag[] = [];
let globalMail: string = "";

export async function load(mail: string) {
    const listResp = await send(tasklistUrl + "email/" + mail, 'GET');
    const tagsResp = await send(tagUrl + mail, 'GET');

    if (!listResp.ok || !tagsResp.ok) {
        return;
    }

    globalTasklists = await listResp.json();
    globalTags = await tagsResp.json();
    globalMail = mail;

    await showAllTasklists();

    createTasklistButton.addEventListener('click', async () => {
        createForm.style.display = 'flex';
    });

    orderPriorityButton.addEventListener('click', async () => {
        globalTasklists.sort((a: Tasklist, b: Tasklist) => {
            return b.priority - a.priority;
        });
        await showAllTasklists();
    });

    orderViewButton.addEventListener('click', async () => {
        /*lists.sort((a: Tasklist, b: Tasklist) => {
            //return b.lastView.getTime() - a.lastView.getTime();
        });*/
        await showAllTasklists();
    });

    orderCreateButton.addEventListener('click', async () => {
        globalTasklists.sort((a: Tasklist, b: Tasklist) => {
            return a.tasklistID - b.tasklistID;
        });
        await showAllTasklists();
    });

    deleteTasklistBtn.addEventListener('click', deleteTaskList);
    submitButton.addEventListener('click', createTasklist);
    inviteUserBtn.addEventListener('click', invite);
    filterButton.addEventListener('click', filterTasklists);
}

async function showAllTasklists() {
    taskLists.innerHTML = "";
    for (const list of globalTasklists) {
        const listEl: HTMLElement = await showTasklist(list);
        taskLists.appendChild(listEl);
    }
}

async function showTasklist(list: Tasklist): Promise<HTMLElement> {
#}

export async function extendTasklist(listEl: HTMLElement, list: Tasklist) {
    if (list.isLocked) {
        list.isLocked = false; // just for testing purposes
        await send(tasklistUrl + globalMail + "/" + list.tasklistID, 'PUT', list);
        alert('This tasklist is locked');
    } else {
        list.isLocked = true;
        await send(tasklistUrl + globalMail + "/" + list.tasklistID, 'PUT', list);
        listEl.classList.add("extended");

        const tagsEl = document.createElement('div');
        tagsEl.classList.add('tags');
        /* tag creation must be implemented for this
        const allTags: Tag[] = await (await send(tagUrl + list.tasklistID, 'GET')).json;
        allTags.forEach((tag: Tag) => {
            const tagElement = document.createElement('span');
            tagElement.innerHTML = tag.name;
            tagsEl.appendChild(tagElement);
        }); */

        const tasksEl = document.createElement('div');

        // TODO: add task element like in GUI mockups
        await loadTasks(list, tasksEl);

        const deleteButton = document.createElement('button');
        deleteButton.id = "delete-button";
        const binImg = document.createElement('img');
        binImg.alt = 'filter img';
        binImg.src = "./img/bin_icon.png";
        binImg.id = 'filter-img';
        deleteButton.appendChild(binImg);

        deleteButton.classList.add('btn');
        deleteButton.setAttribute('data-bs-toggle', 'modal');
        deleteButton.setAttribute('data-bs-target', '#delete-modal');
        deleteButton.addEventListener('click', () => {
            globalDeleteTasklistID = list.tasklistID;
        });

        listEl.appendChild(tagsEl);
        listEl.appendChild(tasksEl);
        listEl.appendChild(deleteButton);

        listEl.addEventListener('click', (e) => {
            if (e.target === deleteButton || !closePLS) {
                setClosePLS(true);
                return;
            }
            checkBoxes.forEach(checkbox => {
               if(e.target === checkbox) {
                   return
               }
            });
            listElements.forEach(listelm => {
                if(e.target === listelm) {
                    return
                }
            });
            closeTasklist(list, listEl, tagsEl, tasksEl, deleteButton);
        });

        setTimeout(() => {
            closeTasklist(list, listEl, tagsEl, tasksEl, deleteButton)
        }, 120000); // close automatically after 2 minutes
    }
}

async function closeTasklist(list: Tasklist, listEl: HTMLElement, tagsEl: HTMLElement, tasksEl: HTMLElement, deleteButton: HTMLElement) {
        listEl.removeChild(tagsEl);
        listEl.removeChild(tasksEl);
        listEl.removeChild(deleteButton);
        listEl.classList.remove("extended");

        list.isLocked = false;
        globalTasklists[globalTasklists.findIndex((tasklist: Tasklist) => tasklist.tasklistID === list.tasklistID)] = list;
        await send(tasklistUrl + globalMail + "/" + list.tasklistID, 'PUT', list);
}

async function deleteTaskList() {
    if (globalDeleteTasklistID !== -1) {
        globalTasklists.splice(globalTasklists.findIndex((list: Tasklist) => list.tasklistID === globalDeleteTasklistID), 1);
        await send(tasklistUrl + globalDeleteTasklistID, 'DELETE');
        globalDeleteTasklistID = -1;
        deleteModal.style.display = "hide";
        await showAllTasklists();
    }
}

async function invite() {
    const email = document.getElementById('email-input') as HTMLInputElement;
    const emailText = email.value;
    email.value = "";
    if (checkMailFormat(emailText)) {
        const nextId = await send(tasklistUrl + "nextID", 'GET');
        await send("http://localhost:2000/api/mail/invite/" + emailText + "/" + nextId, 'POST', {email: email});
    } else {
        alert('Invalid email address');
    }
}

async function createTasklist() {
    const title = (document.getElementById('name-tasklist-input') as HTMLInputElement).value;
    const description = (document.getElementById('description-tasklist-input') as HTMLInputElement).value;
    const priority = (document.getElementById('priority-input') as HTMLInputElement).value;
    const sortingOrder = (document.getElementById('sorting-order-input') as HTMLInputElement).value;

    if (title.length > 50) {
        alert('Title is too long, must be less than 50 characters');
        return;
    } else if (description.length > 255) {
        alert('Description is too long, must be less than 255 characters');
        return;
    }

    const tasklist: Tasklist = {
        title: title,
        description: description,
        priority: parseInt(priority),
        isLocked: false,
        sortingOrder: parseInt(sortingOrder),
        email: globalMail,
        //lastView: new Date(),
        tasklistID: await (await send(tasklistUrl + "nextID", "GET")).json(), // let server handle this
    };

    await send(tasklistUrl + globalMail, 'POST', tasklist);
    globalTasklists.push(tasklist);
    createForm.style.display = 'none';
    await showAllTasklists();
}

async function filterTasklists() {
    console.log('filter');
    const activeFilters: Tag[] = [];
    for (const tag of globalTags) {
        const tagElement = document.createElement('button');
        tagElement.classList.add('tag-btn');
        tagElement.classList.add('btn');
        tagElement.innerHTML = tag.name;
        tagElement.addEventListener('click', async () => {
            if (tagElement.classList.contains('active')) {
                tagElement.classList.remove('active');
                activeFilters.splice(activeFilters.indexOf(tag), 1);
            } else {
                tagElement.classList.add('active');
                activeFilters.push(tag);
            }
            for (const list of globalTasklists) {
                taskLists.innerHTML = "";
                const tagsOfList: Tag[] = (await send(tagUrl + list.tasklistID, 'GET')).json;
                if (activeFilters.length === 0) {
                    await showAllTasklists();
                } else if (activeFilters.every((tag: Tag) => tagsOfList.includes(tag))) {
                    await showTasklist(list);
                }
            }
        });
        filterTagsModal.appendChild(tagElement);
    }
}
