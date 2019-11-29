export interface DefoHTMLElement extends HTMLElement {
  _defoDestroy: Views;
  _defoUpdate: Views;
}

export type Views = {
  [key: string]: Function;
}
