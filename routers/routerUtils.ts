export function checkIfFalseTitle(title: string): boolean {
    return title === undefined || title.length < 1;
}
export function checkIfFalseSortingOrder(sortingOrder: number): boolean {
    return sortingOrder === undefined || isNaN(sortingOrder) || sortingOrder < 1;

}
export function checkIfFalsePriority(priority: number): boolean {
    return priority === undefined || isNaN(priority) || priority < 1;
}