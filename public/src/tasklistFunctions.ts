import {baseURL, send} from './sendUtils';
import {Tasklist} from './model/Tasklist';
import {Tag} from './model/Tag';
import {handlePageLoad} from "./loginFunctions";
import {checkBoxes, closePLS, createNewTask, loadTasks, setClosePLS} from "./taskFuntions";
import {User} from "./model/User";
const tasklistUrl: string = baseURL + '/api/tasklist/';
const tagUrl: string = baseURL + '/api/tag/';

const taskLists = document.getElementById('tasklists') as HTMLElement;
const createTasklistButton = document.getElementById('create-tasklist-btn') as HTMLButtonElement;
const createForm = document.getElementById('create-tasklist-form') as HTMLFormElement;

export let listElements: HTMLInputElement[] = [];
let globalDeleteTasklistID = -1;
let globalTasklists: Tasklist[] = [];
let globalTags: Tag[] = [];
let globalMail: string = "";
const globalUsersToInvite: User[] = [];
const globalActiveFilters: Tag[] = [];

window.onload = async function() {
    await handlePageLoad(load);
}

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

    const orderPriorityButton = document.getElementById('order-priority') as HTMLButtonElement;
    orderPriorityButton.addEventListener('click', async () => {
        globalTasklists.sort((a: Tasklist, b: Tasklist) => {
            return b.priority - a.priority;
        });
        await showAllTasklists();
    });

    const orderViewButton = document.getElementById('order-view') as HTMLButtonElement;
    orderViewButton.addEventListener('click', async () => {
        globalTasklists.sort((a: Tasklist, b: Tasklist) => {
            return b.lastViewed - a.lastViewed;
        });
        await showAllTasklists();
    });

    const orderCreateButton = document.getElementById('order-creation') as HTMLButtonElement;
    orderCreateButton.addEventListener('click', async () => {
        globalTasklists.sort((a: Tasklist, b: Tasklist) => {
            return a.tasklistID - b.tasklistID;
        });
        await showAllTasklists();
    });

    addListeners();
}

function addListeners() {
    const globalTagsButton = document.getElementById('show-global-tags-btn') as HTMLButtonElement;
    globalTagsButton.addEventListener('click', showEditGlobalTags);

    const filterButton = document.getElementById('filter-btn') as HTMLButtonElement;
    filterButton.addEventListener('click', filterTasklists);

    const submitButton = document.getElementById('submit-tasklist-btn') as HTMLButtonElement;
    submitButton.addEventListener('click', createTasklist);

    const inviteUserBtn = document.getElementById('invite-user-btn') as HTMLButtonElement;
    inviteUserBtn.addEventListener('click', invite);

    const deleteTasklistBtn = document.getElementById('delete-tasklist-btn') as HTMLButtonElement;
    deleteTasklistBtn.addEventListener('click', deleteTaskList);

    const addTagBtn = document.getElementById('add-tag-btn') as HTMLButtonElement;
    addTagBtn.addEventListener('click', addTag);
}


async function showAllTasklists() {
    taskLists.innerHTML = "";
    for (const list of globalTasklists) {
        const listEl: HTMLElement = await showTasklist(list);
        taskLists.appendChild(listEl);
    }
}

async function showTasklist(list: Tasklist): Promise<HTMLElement> {
    const listElement: HTMLElement = document.createElement('div');
    listElement.classList.add('tasklist');
    listElement.classList.add('card-body');
    listElement.classList.add('card');
    const titleButtonElement = document.createElement('div');
    titleButtonElement.classList.add('d-flex')
    titleButtonElement.classList.add('flex-row')
    titleButtonElement.classList.add('title-newTaskButton-Div')

    const title = document.createElement('h2');
    title.innerHTML = list.title;
    title.addEventListener('input', async () => {
        list.title = title.innerHTML;
        await send(tasklistUrl + list.tasklistID, 'PUT', list);
        await showTasklist(list);
    });
    title.classList.add("card-title");

    const newTaskButton = document.createElement('button');
    newTaskButton.classList.add('round-Button')
    newTaskButton.addEventListener('click', async () => {
        await createNewTask(list.tasklistID);
    });
    const tags = document.createElement('div');
    tags.classList.add('tags');

    const description = document.createElement('p');
    description.innerHTML = list.description;
    description.classList.add("card-text");
    titleButtonElement.appendChild(title);
    titleButtonElement.appendChild(newTaskButton);

    listElement.appendChild(titleButtonElement);
    listElement.appendChild(description);
    listElement.appendChild(tags);
    listElement.addEventListener('click', (e) => {
        if (listElement.classList.contains("extended")){
            return;
        }
        checkBoxes.forEach(checkbox => {
            if(e.target === checkbox) {
                return;
            }
        });
        extendTasklist(listElement, list);
    });
    return listElement;
}

export async function extendTasklist(listEl: HTMLElement, list: Tasklist) {
    if (list.isLocked) {
        list.isLocked = 0; // just for testing purposes
        await send(tasklistUrl + globalMail + "/" + list.tasklistID, 'PUT', list);
        alert('This tasklist is locked');
    } else {
        list.isLocked = 1;
        list.lastViewed = Date.now();

        await send(tasklistUrl + globalMail + "/" + list.tasklistID, 'PUT', list);
        listEl.classList.add("extended");

        const tasksEl = document.createElement('div');
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

        const tagButton = document.createElement('button');
        tagButton.id = "tag-button";
        tagButton.innerHTML = "Tags";

        tagButton.classList.add('btn');
        tagButton.setAttribute('data-bs-toggle', 'modal');
        tagButton.setAttribute('data-bs-target', '#tasklist-tags-modal');
        tagButton.addEventListener('click', async () => {
            await showTasklistTags(list);
        });

        const buttonDiv = document.createElement('div');
        buttonDiv.classList.add('d-flex');
        buttonDiv.classList.add('flex-row');
        buttonDiv.classList.add('justify-content-between');
        buttonDiv.appendChild(deleteButton);
        buttonDiv.appendChild(tagButton);

        listEl.appendChild(tasksEl);
        listEl.appendChild(buttonDiv);

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
            listElements.forEach(listEl => {
                if(e.target === listEl) {
                    return
                }
            });
            closeTasklist(list, listEl, tasksEl, buttonDiv);
        });

        setTimeout(() => {
            closeTasklist(list, listEl, tasksEl, buttonDiv)
        }, 120000); // close automatically after 2 minutes
    }
}

async function showTasklistTags(list: Tasklist) {
    const tasklistTagList = document.getElementById('tags-tasklist-list') as HTMLElement;
    const tagsEl = document.createElement('div');
    tagsEl.classList.add('tags');
    const tasklistTags: Tag[] =  await (await send(tagUrl + list.tasklistID, 'GET')).json();
    tasklistTagList.innerHTML = "";
    globalTags.forEach((tag: Tag) => {
        const tagElement = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = tagInTasklistTags(tag.tagID, tasklistTags);

        checkbox.addEventListener('change', async () => {
            if (checkbox.checked) {
                tagElement.classList.add('active');
                tasklistTags.push(tag);
                await send(tagUrl + "tasklistAdd/" + list.tasklistID + "/" + tag.tagID, 'PUT');
            } else {
                tagElement.classList.remove('active');
                tasklistTags.splice(tasklistTags.indexOf(tag), 1);
                await send(tagUrl + "tasklistRemove/" + list.tasklistID + "/" + tag.tagID, 'PUT');
            }
        });
        tagElement.appendChild(checkbox);
        tagElement.appendChild(document.createTextNode(" " + tag.name));
        tasklistTagList.appendChild(tagElement);
    });
    const tagElement = document.createElement('div');
    tagsEl.appendChild(tagElement);
}

async function addTag() {
    const tagNameEl = document.getElementById('tag-input') as HTMLInputElement;
    for (const tag of globalTags) {
        if (tagNameEl.value === tag.name) {
            alert('This tag name already exists');
            return;
        }
    }
    const tag: Tag = await (await send(tagUrl + globalMail + "/" + tagNameEl.value, 'POST')).json();
    console.log('added tag');
    console.log(tag);
    globalTags.push(tag);
    tagNameEl.value = "";
    await showEditGlobalTags();
}

async function showEditGlobalTags() {
    const globalTagsList = document.getElementById('global-tags-list') as HTMLElement;
    globalTagsList.innerHTML = "";
    globalTags.forEach((tag: Tag) => {
        const tagElement = document.createElement('input');
        tagElement.value = tag.name;
        tagElement.addEventListener('input', async () => {
            globalTags.forEach((tag: Tag) => {
                if (tagElement.value === tag.name) {
                    alert('This tag name already exists');
                    return;
                }
            });
            tag.name = tagElement.value;
            await send(tagUrl + tag.tagID + "/" + tag.name, 'PUT');
        });

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = "Delete";
        deleteButton.classList.add('btn', 'btn-danger');
        deleteButton.addEventListener('click', async () => {
            await send(tagUrl + tag.tagID, 'DELETE');
            globalTags.splice(globalTags.indexOf(tag), 1);
            await showEditGlobalTags();
        });
        globalTagsList.appendChild(tagElement);
        globalTagsList.appendChild(deleteButton);
    });
}

async function closeTasklist(list: Tasklist, listEl: HTMLElement, tasksEl: HTMLElement, buttonDiv: HTMLElement) {
        listEl.removeChild(tasksEl);
        listEl.removeChild(buttonDiv);
        listEl.classList.remove("extended");
        list.isLocked = 0;
        globalTasklists[globalTasklists.findIndex((tasklist: Tasklist) => tasklist.tasklistID === list.tasklistID)] = list;
        await send(tasklistUrl + globalMail + "/" + list.tasklistID, 'PUT', list);
}

async function deleteTaskList(e: Event) {
    e.stopPropagation();
    if (globalDeleteTasklistID !== -1) {
        globalTasklists.splice(globalTasklists.findIndex((list: Tasklist) => list.tasklistID === globalDeleteTasklistID), 1);
        await send(tasklistUrl + globalDeleteTasklistID, 'DELETE');
        globalDeleteTasklistID = -1;
        const deleteModal = document.getElementById('delete-modal') as HTMLElement;
        deleteModal.style.display = "hide";
        await showAllTasklists();
    }
}

async function invite() {
    const email = document.getElementById('email-input') as HTMLInputElement;
    const emailText = email.value;

    if (emailText === globalMail) {
        alert('You cannot invite yourself');
        return;
    }

    const user: User = await (await send(baseURL + "/api/user/" + emailText, 'GET')).json();
    console.log(user);
    globalUsersToInvite.push(user);

    email.placeholder = "add another user";
    email.value = "";

    // add to array of users to invite, invite them when submit button is pushed
    /*
    const nextId = await send(tasklistUrl + "nextID", 'GET');
    await send(baseURL + "/api/mail/invite/" + emailText + "/" + nextId, 'POST', {email: email});

     */

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

    const data = {
        title: title,
        description: description,
        priority: parseInt(priority),
        isLocked: 0,
        sortingOrder: parseInt(sortingOrder),
        email: globalMail
    };

    const tasklist: Tasklist = await (await send(tasklistUrl + globalMail, 'POST', data)).json();
    globalTasklists.push(tasklist);

    for(const user of globalUsersToInvite) {
        await send(baseURL + "/api/mail/invite/" + user.email + "/" + tasklist.tasklistID, 'POST');
    }
    globalUsersToInvite.length = 0;

    createForm.style.display = 'none';
    await showAllTasklists();
}

document.addEventListener('mousedown', handleClickOutside);

function handleClickOutside(event: MouseEvent) {
    if (createForm && !createForm.contains(event.target as Node)) {
        createForm.style.display = "none";
    }
}

async function filterTasklists() {
    const filterTagsList = document.getElementById('filter-tags-list') as HTMLElement;
    filterTagsList.innerHTML = "";

    for (const tag of globalTags) {
        const tagElement = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = globalActiveFilters.some((activeTag: Tag) => activeTag.tagID === tag.tagID);
        checkbox.addEventListener('change', async () => {
            if (checkbox.checked) {
                tagElement.classList.add('active');
                globalActiveFilters.push(tag);
            } else {
                tagElement.classList.remove('active');
                globalActiveFilters.splice(globalActiveFilters.indexOf(tag), 1);
            }
            taskLists.innerHTML = "";
            for (const list of globalTasklists) {
                const tagsOfList: Tag[] = await (await send(tagUrl + list.tasklistID, 'GET')).json();
                if (globalActiveFilters.length === 0) {
                    await showAllTasklists();
                } else {
                    let showCurrent = true;
                    for (const filterTag of globalActiveFilters) {
                        if (!tagInTasklistTags(filterTag.tagID, tagsOfList)) {
                            showCurrent = false;
                        }
                    }
                    if (showCurrent) {
                        const listEl: HTMLElement = await showTasklist(list);
                        taskLists.appendChild(listEl);
                    }
                }
            }
        });
        tagElement.appendChild(checkbox);
        tagElement.appendChild(document.createTextNode(" " + tag.name));
        filterTagsList.appendChild(tagElement);
    }
}

const tagInTasklistTags = (tagID: number, tasklistTags: Tag[]) => tasklistTags.some(tasklistTag => tasklistTag.tagID === tagID);
