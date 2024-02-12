import * as utils from '../../backend/utils';

export async function send(URL: string, TYPE: string, json: string): Promise<any> { //Promise<Response | undefined>
    const requestOptions: RequestInit = {
        method: TYPE,
        headers: {
            'Content-Type': 'application/json',
        },
        body: TYPE === 'GET' ? undefined : json,
    };
    try {
        const response = await fetch(URL, requestOptions);
        if (response.status !== 200) {
            console.error('Error:', response.status);
            utils.generateWarningPopUp(response.statusText, response.status);
        } else {
            console.log('Success:', response.status);
            return response;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
