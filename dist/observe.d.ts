import { Views } from "./types";
export default function observe({ prefix, scope, views }: {
    prefix: string;
    scope: HTMLElement;
    views: Views;
}): MutationObserver;
