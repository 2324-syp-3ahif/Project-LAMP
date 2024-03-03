export async function send(URL: string, TYPE: string, json: string): Promise<any> {
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
            generateWarningPopUp(response.statusText, response.status);
        } else {
            console.log('Success:', response.status);
            return response;
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function generateWarningPopUp(message: string, errorCode: number): void{
    alert("Error " + errorCode + ": " + message);
}
