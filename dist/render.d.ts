import { DefoHTMLElement, Views } from "./types";
export default function renderTree({ prefix, scope, views }: {
    prefix: string;
    views: Views;
    scope: HTMLElement;
}): void;
export declare function renderNode(node: DefoHTMLElement, prefix: string, views: Views, viewName: string): void;
/**
 * parseProps
 *
 * Return the value of the data-prefix attribute. Parsing it as JSON if it looks
 * like it is JSON content.
 */
export declare function parseProps(value: string): string;
