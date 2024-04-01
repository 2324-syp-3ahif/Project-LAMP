export interface Task {
    taskID: number,
    title: string,
    dueDate: Date,
    priority: number,
    description: string,
    isComplete: boolean,
    tasklistID: number,
}
