import { Views } from "./types";
import observe from "./observe";

export default function defo({
  prefix = "defo",
  scope = document.documentElement,
  views = {},
}: {
  prefix?: string;
  scope?: HTMLElement;
  views?: Views;
} = {}) {
  const observer = observe({ prefix, scope, views });

  return {
    destroy: (): void => {
      observer.disconnect();
    },
  };
}
