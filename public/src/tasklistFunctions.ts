import { send } from './sendUtils';
import { Tasklist } from './model/Tasklist';
import { Tag } from './model/Tag';
import { checkMailFormat} from "./utils";

export async function load(mail: string) {
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

    const listResp = await send(tasklistUrl + mail, 'GET');
    const tagsResp = await send(tagUrl + mail, 'GET');

    if (listResp.ok && tagsResp.ok) {
        const lists: Tasklist[] = await listResp.json();
        const tags: Tag[] = await tagsResp.json();

        createTasklistButton.addEventListener('click', async () => {
            console.log('create tasklist');
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
                tasklistID: 0, // let server handle this
            };
            console.log(lists);
            console.log("sending");
            await send(tasklistUrl + mail, 'POST', tasklist);
            console.log("sended");
            console.log(typeof tasklist);
            console.log("tasklist");
            //lists.push(tasklist);
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
            for (const tag of tags) {
                const tagElement = document.createElement('button');
                tagElement.classList.add('tag-btn');
                tagElement.classList.add('btn');
                tagElement.innerHTML = tag.name;
                tagElement.addEventListener('click', () => {
                    if (tagElement.classList.contains('active')) {
                        tagElement.classList.remove('active');
                        // TODO remove filter
                    } else {
                        tagElement.classList.add('active');
                        // TODO add filter
                    }
                    // TODO filter by tag -> show only tasklists with this tag, can only work with tag router
                });
                filterTagsModal.appendChild(tagElement);
            }
        });

        async function showAllTasklists(lists: Tasklist[]) {
            taskLists.innerHTML = "";
            console.log(lists);
            for (const list of lists) {
                const listEl: HTMLElement = await showTasklist(list);
                taskLists.appendChild(listEl);
            }
        }

        async function extendTasklist(listEl: HTMLElement, list: Tasklist) {
            if (list.isLocked) {
                alert('This tasklist is locked');
            } else {
                const tasksEl = document.createElement('div');
                tasksEl.classList.add('tasks');
                const tasks = await send(taskUrl + "tasklistID/" + list.tasklistID, 'GET');
                for (const task of tasks) {
                    const taskEl = document.createElement('div');
                    taskEl.innerHTML = task.title;
                    tasks.appendChild(taskEl);
                    console.log("added task!");
                }
                listEl.appendChild(tasksEl);
                // TODO close button to un-expand?
            }
        }

        async function editTitle(listID: number, newTitle: string){
            const resp = send(tasklistUrl + listID, 'GET', );
            const list: Tasklist = await resp;
            list.title = newTitle;
            await send(tasklistUrl + listID, 'PUT', list);
            await showAllTasklists(lists);
        }

        async function showTasklist(list: Tasklist): Promise<HTMLElement> {
            const listElement: HTMLElement = document.createElement('div');
            listElement.classList.add('tasklist');
            listElement.classList.add('card-body');
            listElement.classList.add('card');

            const title = document.createElement('h2');
            title.innerHTML = list.title;
            title.addEventListener('input', () => {
                editTitle(list.tasklistID, title.innerHTML);
            });
            title.classList.add("card-title");

            const tags = document.createElement('div');
            tags.classList.add('tags');
            /*
            const allTags: Tag[] = await send(tagUrl + "tasklistID/" + list.tasklistID, 'GET');
            allTags.forEach((tag: Tag) => {
                const tagElement = document.createElement('span');
                tagElement.innerHTML = tag.name;
                tags.appendChild(tagElement);
            });
            */
            const description = document.createElement('p');
            description.innerHTML = list.description;
            description.classList.add("card-text");

            listElement.appendChild(title);
            listElement.appendChild(description);
            listElement.appendChild(tags);

            listElement.addEventListener('click', () => {
                extendTasklist(listElement, list);
            });

            return listElement;
        }
    }
}
