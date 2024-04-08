export function checkMailFormat(mail: string): boolean{
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(mail);
}

export function checkPasswordFormat(password: string): boolean{
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
}

export function checkStringFormat(username: string): boolean{
    const regex = /^[a-zA-Z0-9]{3,}$/;
    return regex.test(username);
}

export function checkDateFormat(date: string): boolean {
    const d = new Date(date);
    return d.toString() != "Invalid Date";
}
