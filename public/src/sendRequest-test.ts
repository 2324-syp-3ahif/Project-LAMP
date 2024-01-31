import dotenv from 'dotenv';
dotenv.config();

function sendRequest(): void {
    const request = new XMLHttpRequest();
    const URL = `http://localhost:2000/task`;
    request.open('POST', URL, true);
    request.setRequestHeader('Content-Type', 'application/json');

    const jsonData = {
        text: 'value1',
        priority: 1
    };
    const jsonDataString = JSON.stringify(jsonData);
    request.send(jsonDataString);
    request.onload = () => {
        const element = document.getElementById('response');
        if (element != null) {
            element.innerHTML = request.response;
        }
    };
}
