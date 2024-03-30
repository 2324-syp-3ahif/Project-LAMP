export interface Tasklist {
    title: string,
    description: string,
    sortingOrder: string,
    priority: number,
    isLocked: boolean,
    ownerID: number,
    tasklistID: number,
    lastView: Date,
}
