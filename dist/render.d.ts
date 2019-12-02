import { DefoHTMLElement, Views } from "./types";
export default function renderTree({ prefix, scope, views }: {
    prefix: string;
    views: Views;
    scope: HTMLElement;
}): void;
export declare function renderViewForNode(node: DefoHTMLElement, prefix: string, views: Views, viewName: string): void;
