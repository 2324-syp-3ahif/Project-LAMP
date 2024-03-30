import { send } from './sendUtils';
import { Tasklist } from './model/Tasklist';
import { Tag } from './model/Tag';

window.onload = async() => {
    /* TODO: URLs */
    const url = 'http://localhost:2000/testTasklist/';
    const tagUrl = 'http://localhost:2000/testTags/';

    console.log('onload');

    const taskLists = document.getElementById('tasklists') as HTMLElement;
    const createTasklistButton = document.getElementById('create-tasklist-btn') as HTMLButtonElement;
    const orderPriorityButton = document.getElementById('order-priority') as HTMLButtonElement;
    const orderViewButton = document.getElementById('order-view') as HTMLButtonElement;
    const orderCreateButton = document.getElementById('order-creation') as HTMLButtonElement;
    const filterButton = document.getElementById('filter-btn') as HTMLButtonElement;
    const filterTagsModal = document.getElementById('filter-tags-modal') as HTMLElement;
    const createForm = document.getElementById('create-form') as HTMLFormElement;
    const submitButton = document.getElementById('submit-btn') as HTMLButtonElement;
    const lists: Tasklist[] = await send(url, 'GET');
    const tags: Tag[] = await send(tagUrl, 'GET');

    await showAllTasklists(lists);

    createTasklistButton.addEventListener('click', async () => {
        createForm.style.display = 'flex';
    });

    submitButton.addEventListener('click', async () => {
        const title = (document.getElementById('name-input') as HTMLInputElement).value;
        const description = (document.getElementById('description-input') as HTMLInputElement).value;
        const inviteButton = document.getElementById('invite-btn') as HTMLButtonElement;
        inviteButton.addEventListener('click', async () => {
            // invite user to tasklist, show as modal?
        });
        const priority = (document.getElementById('priority-input') as HTMLInputElement).value;
        const sortingOrder = (document.getElementById('sorting-order-input') as HTMLInputElement).value;

        const tasklist: Tasklist = {
            title: title,
            description: description,
            priority: parseInt(priority),
            isLocked: false,
            sortingOrder: sortingOrder,
            lastView: new Date(),
            ownerID: 0, // TODO
            tasklistID: 0, // let server handle this
        };
        await send(url, 'POST', tasklist);
        await showAllTasklists(lists);
    });

    orderPriorityButton.addEventListener('click', async () => {
        lists.sort((a: Tasklist, b: Tasklist) => {
            return b.priority - a.priority;
        });
        await showAllTasklists(lists);
    });

    orderViewButton.addEventListener('click', async () => {
        lists.sort((a: Tasklist, b: Tasklist) => {
            return b.lastView.getTime() - a.lastView.getTime();
        });
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
                    // remove filter
                } else {
                    tagElement.classList.add('active');
                    // add filter
                }
                // filter by tag -> show only tasklists with this tag, can only work with tag router
            });
            filterTagsModal.appendChild(tagElement);
        }
    });

    async function showAllTasklists(lists: Tasklist[]) {
        taskLists.innerHTML = "";
        console.log(lists);

        taskLists.innerHTML = "";

        for (const list of lists) {
            const listEl: HTMLElement = await showTasklist(list);
            taskLists.appendChild(listEl);
        }
    }

    function noAccessPopUp(): void {

    }

    function extendTasklist(listEl: HTMLElement, list: Tasklist): void {
        if (list.isLocked) {
            noAccessPopUp();
        } else {
            // show all tasks
            // close button to un-expand?
        }
    }

    function getTags(listID: number): Tag[] {
        // can't implement this function without tag router
        return [];
    }

    async function editTitle(listID: number, newTitle: string){
        const resp = send(url + listID, 'GET', );
        const list: Tasklist = await resp;
        list.title = newTitle;
        await send(url + listID, 'PUT', list);
        await showAllTasklists(lists);
    }

    async function showTasklist(list: Tasklist): Promise<HTMLElement> {
        console.log('showTasklist');
        const listElement: HTMLElement = document.createElement('div');
        listElement.classList.add('tasklist');
        listElement.classList.add('card-body');
        listElement.classList.add('card');
        //listElement.classList.add('w-50');

        const title = document.createElement('h2');
        title.innerHTML = list.title;
        title.addEventListener('input', () => {
            editTitle(list.tasklistID, title.innerHTML);
        });
        title.classList.add("card-title");

        const tags = document.createElement('div');
        tags.classList.add('tags');
        const allTags: Tag[] = getTags(list.tasklistID);
        allTags.forEach((tag: Tag) => {
            const tagElement = document.createElement('span');
            tagElement.innerHTML = tag.name;
            tags.appendChild(tagElement);
        });


        const description = document.createElement('p');
        description.innerHTML = list.description;
        description.classList.add("card-text");

        listElement.appendChild(title);
        listElement.appendChild(description);
        listElement.appendChild(tags);

        console.log(listElement);

        listElement.addEventListener('click', () => {

            extendTasklist(listElement, list);
        });

        return listElement;
    }
}
