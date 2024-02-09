import * as utils from './utils';

export async function send(URL: string, TYPE: string, json: string): Promise<void> { //Promise<Response | undefined>
    const requestOptions: RequestInit = {
        method: TYPE,
        headers: {
            'Content-Type': 'application/json',
        },
        body: TYPE === 'GET' ? undefined : json,
    };
    try {
        const response = await fetch(URL, requestOptions);
        /* get with response.status */
        if (response.status !== 200) {
            console.error('Error:', response.status);

            //return undefined;
        }
        //return await fetch(URL, requestOptions);

        /*
        const element = document.getElementById(`${TYPE}-response`);
        if (element !== null) {
            element.innerHTML = await response.text();
        }
        */
    } catch (error) {
        console.error('Error:', error);
    }
}
