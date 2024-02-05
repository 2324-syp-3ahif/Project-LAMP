export function sendRequest(): void {
    const request = new XMLHttpRequest();
    const URL = `http://localhost:2000/task`;
    request.open('POST', URL, true);
    request.setRequestHeader('Content-Type', 'application/json');

    const jsonData = {
        text: 'new new value',
        priority: 3
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

export function sendGetRequest() {
    const request = new XMLHttpRequest();
    const URL = `http://localhost:2000/task`;
    request.open('GET', URL, true);
    request.send();
    request.onload = () => {
        const element = document.getElementById('get-response');
        if (element != null) {
            element.innerHTML = request.response;
        }
    };
}

function sendDeleteRequest(): void {
    const request = new XMLHttpRequest();
    const URL = `http://localhost:2000/task`
    request.open('DELETE', URL, true);
    request.setRequestHeader('Content-Type', 'application/json');
    const json = {
        id: 1
    };
    const jsonData = JSON.stringify(json);
    request.send(jsonData);
    request.onload = () => {
        const element = document.getElementById('delete-response');
        if (element != null){
            element.innerHTML = request.response;
        }
    }
}
