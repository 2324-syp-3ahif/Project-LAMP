import * as sendUtils from './sendUtils';

export function showAllTasklists(): void {

    /* TODO: URL */

    sendUtils.send('/hehe', 'GET', '').then(() => {
        console.log('showAllTasklists');
        /* generate code */

    });

}

export function noAccessPopUp(): void {

}


export function extendTasklist(listID: number): void {

}
