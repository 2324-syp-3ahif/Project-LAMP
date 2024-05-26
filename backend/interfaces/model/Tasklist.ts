export interface Tasklist {
    tasklistID: number,
    title: string,
    description: string,
    sortingOrder: number,
    priority: number,
    isLocked: number,
    userID: number,
    lastViewed: number,
    creationDate: number
}