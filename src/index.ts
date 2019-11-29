import { Views } from "./types";
import observe from "./observe";

function registerViews(currentViews: Views, viewsToAdd: Views) {
  return {
    ...currentViews,
    ...viewsToAdd
  };
}

function unregisterViews(currentViews: Views, viewsToRemove: Array<string>) {
  const updatedViews: Views = {};
  Object.keys(currentViews).forEach((key: string) => {
    if (viewsToRemove.indexOf(key) === -1) {
      updatedViews[key] = currentViews[key];
    }
  });
  return updatedViews;
}

export default function defo({
  prefix = "defo",
  scope = document.documentElement,
  views = {}
}: {
  prefix?: string;
  scope?: HTMLElement;
  views?: Views;
} = {}) {
  const observer = observe({prefix, scope, views});

  return {
    registerViews: (viewsToAdd: Views) => {
      views = registerViews(views, viewsToAdd);
      return views;
    },
    unregisterViews: (viewsToRemove: Array<string>) => {
      views = unregisterViews(views, viewsToRemove);
      return views;
    }
    // render
  };
}
