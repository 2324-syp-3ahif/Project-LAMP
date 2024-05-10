export interface Task {
    taskID: number,
    title: string,
    dueDate: number,
    priority: number,
    description: string,
    isComplete: boolean,
    tasklistID: number,
}