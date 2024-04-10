import {send} from './sendUtils';
import {Tasklist} from './model/Tasklist';
import {Tag} from './model/Tag';
import {checkMailFormat} from "./utils";
const tasklistUrl: string = 'http://localhost:2000/api/tasklist/';
const tagUrl: string = 'http://localhost:2000/api/tag/';
const taskUrl: string = 'http://localhost:2000/api/task/';

const taskLists = document.getElementById('tasklists') as HTMLElement;
const createTasklistButton = document.getElementById('create-tasklist-btn') as HTMLButtonElement;
const orderPriorityButton = document.getElementById('order-priority') as HTMLButtonElement;
const orderViewButton = document.getElementById('order-view') as HTMLButtonElement;
const orderCreateButton = document.getElementById('order-creation') as HTMLButtonElement;
const filterButton = document.getElementById('filter-btn') as HTMLButtonElement;
const filterTagsModal = document.getElementById('filter-tags-modal') as HTMLElement;
const createForm = document.getElementById('create-form') as HTMLFormElement;
const submitButton = document.getElementById('submit-btn') as HTMLButtonElement;
const inviteUserBtn = document.getElementById('invite-user-btn') as HTMLButtonElement;
const deleteTasklistBtn = document.getElementById('delete-tasklist-btn') as HTMLButtonElement;
const deleteModal = document.getElementById('delete-modal') as HTMLElement;


let deleteTasklistID = -1;

export async function load(mail: string) {
    console.log("try load");

    const listResp = await send(tasklistUrl + mail, 'GET');
    const tagsResp = await send(tagUrl + mail, 'GET');

    if (listResp.ok && tagsResp.ok) {
        const lists: Tasklist[] = await listResp.json();
        const tags: Tag[] = await tagsResp.json();

        await showAllTasklists(lists);

        deleteTasklistBtn.addEventListener('click', async () => {
            if (deleteTasklistID !== -1) {
                lists.splice(lists.findIndex((list: Tasklist) => list.tasklistID === deleteTasklistID), 1);
                await send(tasklistUrl + deleteTasklistID, 'DELETE');
                deleteTasklistID = -1;
                deleteModal.style.display = "hide";
                await showAllTasklists(lists);
            }
        });

        createTasklistButton.addEventListener('click', async () => {
            createForm.style.display = 'flex';
        });

        submitButton.addEventListener('click', async () => {
            const title = (document.getElementById('name-input') as HTMLInputElement).value;
            const description = (document.getElementById('description-input') as HTMLInputElement).value;
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
                email: mail,
                //lastView: new Date(),
                tasklistID: await (await send(tasklistUrl + "next/ID", "GET")).json(), // let server handle this
            };
            await send(tasklistUrl + mail, 'POST', tasklist);
            lists.push(tasklist);
            createForm.style.display = 'none';
            await showAllTasklists(lists);
        });

        inviteUserBtn.addEventListener('click', async () => {
            const email = document.getElementById('email-input') as HTMLInputElement;
            const emailText = email.value;
            email.value = "";
            if (checkMailFormat(emailText)) {
                const nextId = await send(tasklistUrl + mail, 'GET');
                // TODO get next tasklistID from server with GET request
                await send("http://localhost:2000/api/mail/invite/" + emailText, 'POST', {email: email});
            } else {
                alert('Invalid email address');
            }
        });

        orderPriorityButton.addEventListener('click', async () => {
            lists.sort((a: Tasklist, b: Tasklist) => {
                return b.priority - a.priority;
            });
            await showAllTasklists(lists);
        });

        orderViewButton.addEventListener('click', async () => {
            /*lists.sort((a: Tasklist, b: Tasklist) => {
                //return b.lastView.getTime() - a.lastView.getTime();
            });*/
            await showAllTasklists(lists);
        });

        orderCreateButton.addEventListener('click', async () => {
            lists.sort((a: Tasklist, b: Tasklist) => {
                return a.tasklistID - b.tasklistID;
            });
            await showAllTasklists(lists);
        });

        filterButton.addEventListener('click', async () => {
            console.log('filter');
            const activeFilters: Tag[] = [];
            for (const tag of tags) {
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
                    for (const list of lists) {
                        taskLists.innerHTML = "";
                        const tagsOfList: Tag[] = (await send(tagUrl + list.tasklistID, 'GET')).json;
                        if (activeFilters.length === 0) {
                            await showAllTasklists(lists);
                        } else if (activeFilters.every((tag: Tag) => tagsOfList.includes(tag))) {
                            await showTasklist(list);
                        }
                    }
                });
                filterTagsModal.appendChild(tagElement);
            }
        });
    }

    async function showAllTasklists(lists: Tasklist[]) {
        taskLists.innerHTML = "";
        for (const list of lists) {
            const listEl: HTMLElement = await showTasklist(list);
            taskLists.appendChild(listEl);
        }
    }

    async function extendTasklist(listEl: HTMLElement, list: Tasklist) {
        if (list.isLocked) {
            list.isLocked = false; // just for testing purposes
            await send(tasklistUrl + mail + "/" + list.tasklistID, 'PUT', list);
            alert('This tasklist is locked');
        } else {
            list.isLocked = true;
            await send(tasklistUrl + mail + "/" + list.tasklistID, 'PUT', list);

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
            /* // TODO: fix
            tasksEl.classList.add('tasks');
            const tasksResp = await send(taskUrl + 'tasklistID/' +  list.tasklistID, 'GET');
            if (tasksResp.ok)
            const tasks: Task[] = await tasksResp.json();
            *//*
                for (const task of tasks) {
                    const taskEl = document.createElement('div');
                    // TODO show all tasks like in GUI mockups (with extended version)
                    console.log("added task!");
                }
                 */
            const newTaskButton = document.createElement('button');
            // TODO: add task element like in GUI mockups

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
                console.log("delete here");
                deleteTasklistID = list.tasklistID;
            });

            listEl.appendChild(tagsEl);
            listEl.appendChild(tasksEl);
            listEl.appendChild(deleteButton);

            listEl.addEventListener('click', (e) => {
                if (e.target !== listEl) {
                    return;
                }
                closeTasklist(list, listEl, tagsEl, tasksEl, deleteButton);
            });

            setTimeout(() => {
                closeTasklist(list, listEl, tagsEl, tasksEl, deleteButton)
            }, 120000); // close automatically after 2 minutes
        }
    }

    async function closeTasklist(list: Tasklist, listEl: HTMLElement, tagsEl: HTMLElement, tasksEl: HTMLElement, deleteButton: HTMLElement) {
        // close again
        listEl.removeChild(tagsEl);
        listEl.removeChild(tasksEl);
        listEl.removeChild(deleteButton);
        list.isLocked = false;
        await send(tasklistUrl + mail + "/" + list.tasklistID, 'PUT', list);
    }

    async function showTasklist(list: Tasklist): Promise<HTMLElement> {
        const listElement: HTMLElement = document.createElement('div');
        listElement.classList.add('tasklist');
        listElement.classList.add('card-body');
        listElement.classList.add('card');

        const title = document.createElement('h2');
        title.innerHTML = list.title;
        title.addEventListener('input', async () => {
            list.title = title.innerHTML;
            await send(tasklistUrl + list.tasklistID, 'PUT', list);
            await showTasklist(list);
        });
        title.classList.add("card-title");

        const tags = document.createElement('div');
        tags.classList.add('tags');

        const description = document.createElement('p');
        description.innerHTML = list.description;
        description.classList.add("card-text");

        listElement.appendChild(title);
        listElement.appendChild(description);
        listElement.appendChild(tags);

        listElement.addEventListener('click', () => {
            if (deleteTasklistID !== -1) {
                return;
            }
            extendTasklist(listElement, list);
        });

        return listElement;
    }
}
