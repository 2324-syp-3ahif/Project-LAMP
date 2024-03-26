import { send } from './sendUtils';
import { Tasklist } from './model/Tasklist';
import { Tag } from './model/Tag';

/* TODO: URL */
const url = 'http://localhost:2000/testTasklist/';
const taskLists = document.getElementById('tasklists') as HTMLElement;
const createTasklistButton = document.getElementById('create-tasklist') as HTMLButtonElement;
const orderPriorityButton = document.getElementById('order-priority') as HTMLButtonElement;
const orderViewButton = document.getElementById('order-view') as HTMLButtonElement;
const orderCreateButton = document.getElementById('order-creation') as HTMLButtonElement;


const lists: Tasklist[] = Object.values(await (await send(url, 'GET', '')).json());

window.onload = async() => {
    await showAllTasklists();
}

createTasklistButton.addEventListener('click', async () => {
  // show formular -> create tasklist
});

orderPriorityButton.addEventListener('click', async () => {
    lists.sort((a: Tasklist, b: Tasklist) => {
        return b.priority - a.priority;
    });
    await showAllTasklists();
});

orderViewButton.addEventListener('click', async () => {
    // TODO sort by last view
    await showAllTasklists();
});

orderCreateButton.addEventListener('click', async () => {
    lists.sort((a: Tasklist, b: Tasklist) => {
        return a.tasklistID - b.tasklistID;
    });
    await showAllTasklists();
});

async function showAllTasklists() {
    taskLists.innerHTML = "";

    console.log(lists);

    taskLists.innerHTML = "";

    lists.forEach(async (list: Tasklist) => {
        const listEl: HTMLElement = await showTasklist(list);
        taskLists.appendChild(listEl);
    });
}

export function noAccessPopUp(): void {

}


export function extendTasklist(listID: number): void {

}

function getTags(listID: number): Tag[] {
    return [];
}

async function editTitle(listID: number, newTitle: string){
    const resp = send(url + listID, 'GET', '');
    const list: Tasklist = await resp;
    list.title = newTitle;
    await send(url + listID, 'PUT', JSON.stringify(list));
    await showAllTasklists();
}

async function showTasklist(list: Tasklist): Promise<HTMLElement> {
    console.log('showTasklist');
    const listElement: HTMLElement = document.createElement('div');
    listElement.classList.add('tasklist');

    const title = document.createElement('h2');
    title.innerHTML = list.title;
    title.addEventListener('input', () => {
        editTitle(list.tasklistID, title.innerHTML);
    });

    const description = document.createElement('p');
    description.innerHTML = list.description;

    const tags = document.createElement('div');
    tags.classList.add('tags');
    const allTags: Tag[] = getTags(list.tasklistID);
    allTags.forEach((tag: Tag) => {
        const tagElement = document.createElement('span');
        tagElement.innerHTML = tag.name;
        tags.appendChild(tagElement);
    });

    listElement.appendChild(title);
    listElement.appendChild(description);
    listElement.appendChild(tags);

    console.log(listElement);

    listElement.addEventListener('click', () => {
        extendTasklist(list.tasklistID);
    });

    return listElement;
}
