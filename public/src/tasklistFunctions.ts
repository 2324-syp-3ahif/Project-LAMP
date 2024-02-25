import * as sendUtils from './sendUtils';
import { Tasklist } from '../../backend/interfaces/model/Tasklist';
import {Tag} from "../../backend/interfaces/model/Tag";

/* TODO: URL */
const url = 'http://localhost:3000/user/tasklists/';

export async function showAllTasklists(): Promise<void> {
    const response = await sendUtils.send(url, 'GET', '');
    const lists = await response.json();
    const taskLists = document.getElementById('taskLists');

    if (taskLists) {
        taskLists.innerHTML = "";
        lists.map(async (listID: number) => {
            const list: HTMLElement = await showTasklist(listID);
            taskLists.appendChild(list);
        });
    }
}

export function noAccessPopUp(): void {

}


export function extendTasklist(listID: number): void {

}

function getTags(listID: number): Tag[] {
    return [];
}

async function editTitle(listID: number, newTitle: string): void {
    const resp = sendUtils.send(url + listID, 'GET', '');
    const list: Tasklist = await resp.json();
    list.title = newTitle;
    await sendUtils.send(url + listID, 'PUT', JSON.stringify(list));

    await showAllTasklists();
}

async function showTasklist(listID: number): Promise<HTMLElement> {
    const list = await sendUtils.send(url + listID, 'GET', '');

    const listElement: HTMLElement = document.createElement('div');

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

    return listElement;
}