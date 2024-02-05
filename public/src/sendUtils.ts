export function send(URL: string, TYPE: string, json: string): string | any{
    const request = new XMLHttpRequest();
    request.open(TYPE, URL,true);
    if (TYPE === 'POST' || TYPE === 'DELETE' ||TYPE === 'PUT' || TYPE === 'PATCH'){
        request.setRequestHeader('Content-Type', 'application/json');
    }
    request.send(json);
    request.onload = () => {
        const element = document.getElementById(`${TYPE}-response`);
        if (element != null){
            element.innerHTML = request.response;
        }
    }
}
