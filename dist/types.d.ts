export interface DefoHTMLElement extends HTMLElement {
    _defoDestroy: Views;
    _defoUpdate: Views;
}
export declare type Views = {
    [key: string]: Function;
};
