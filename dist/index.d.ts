import { Views } from "./types";
export default function defo({ prefix, scope, views }?: {
    prefix?: string;
    scope?: HTMLElement;
    views?: Views;
}): {
    destroy: () => void;
};
