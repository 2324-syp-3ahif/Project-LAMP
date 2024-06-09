export function checkTitle(title: string): boolean {
    return title !== undefined && title.length > 0 && title.length <= 50;
}
export function checkSortingOrder(sortingOrder: number): boolean {
    return sortingOrder !== undefined && !isNaN(sortingOrder) && sortingOrder >= 0;

}
export function checkPriority(priority: number): boolean {
    return priority !== undefined && !isNaN(priority) && priority >= 0;
}
